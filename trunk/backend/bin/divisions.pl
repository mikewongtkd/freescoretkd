#! /usr/bin/perl

use lib qw( ./lib );
use MemberSolutions::Registration;
use AAU::Tournament;
use List::Util qw( shuffle );

my $file = shift;

my @path = split /\//, $file;
pop @path;
my $output           = join "/", @path, "freescore.sql";
my $tournament_file  = join( "/", @path, "tournament.yaml" );

my $registration     = new MemberSolutions::Registration( $file );
my $tournament       = new AAU::Tournament( $tournament_file );

open  FILE, ">$output" or die "Can't write to file '$output' $!";
print FILE sql_for_tables();
print FILE sql_for_athletes( $registration );
print FILE sql_for_divisions( $tournament );
close FILE;

# ============================================================
sub sql_for_athletes {
# ============================================================
	my $registration    = shift;

	my $sql = "\nINSERT INTO athletes ( id, fname, lname, gender, belt, age, weight ) VALUES\n";
	my @sql = ();
	push @sql, sprintf "\t( \"%04d\", \"%s\", \"%s\", \"%s\", \"%s\", \"%d\", \"%d\" )", '0', 'Bye', '', '', '', '', ''; # Reserved contestant for BYE
	push @sql, sprintf "\t( \"%04d\", \"%s\", \"%s\", \"%s\", \"%s\", \"%d\", \"%d\" )", '1', '?', '', '', '', '', '';   # Reserved contestant for unknown
	foreach my $athlete ( $registration->entries() ) {
		$tournament->add( $athlete );
		my $id     = $athlete->id();
		my $first  = $athlete->first_name();
		my $last   = $athlete->last_name();
		my $gender = $athlete->gender();
		my $belt   = $athlete->belt();
		my $age    = $athlete->competition_age();
		my $weight = $athlete->weight();

		push @sql, sprintf "\t( \"%04d\", \"%s\", \"%s\", \"%s\", \"%s\", \"%d\", \"%d\" )", $id, $first, $last, $gender, $belt, $age, $weight;
	}
	$sql .= join( ",\n", @sql ) . ";\n";

	return $sql;
}

# ============================================================
sub sql_for_divisions {
# ============================================================
	my $tournament     = shift;

	my $sql           = '';
	my @divisions_sql = ();
	my @staging_sql   = ();
	my $staging_id    = 1;
	my $divisions         = $tournament->divisions();
	foreach my $event (sort keys %$divisions) {
		foreach my $division ( @{ $divisions->{ $event }}) {
			my $id      = $division->{ id };
			my $event   = $division->{ event };
			my $gender  = $division->{ gender };
			my $age     = $division->{ age };
			my $rank    = $division->{ belt };
			my $weight  = $division->{ weight };
			my $vector  = $division->{ vector };
			my $rounds  = 0;
			my $time    = 0;
			my $rest    = 0;
			my $contact = '';
			if( $event =~ /sparring/i ) {
				foreach my $event_info ( @{$tournament->{ events }}) {
					# ===== APPLY EVENT CONDITION
					next unless $event =~ /$event_info->{ name }/i;

					foreach my $rule ( @{ $event_info->{ rules }} ) {
						
						# ===== APPLY AGE CONDITION
						if   ( $rule->{ age } =~ /and over/i )  { next unless $age >= int( $rule->{ age } ); }
						elsif( $rule->{ age } =~ /and under/i ) { next unless $age <= int( $rule->{ age } ); }
						elsif( $rule->{ age } =~ /all/i )       { }
						else                                    { die "Ambiguous age rule in 'tournament.yaml':\n  $rule->{ age }\n $!"; }

						# ===== APPLY BELT CONDITION
						my $black_belt = ($rule->{ belt } =~ /black/i && $rank =~ /black/i);
						my $color_belt = ($rule->{ belt } =~ /color/i && !($rank =~ /black/i));
						next unless( $black_belt || $color_belt );

						$rounds  = $rule->{ rounds };
						$rest    = $rule->{ rest };
						$time    = $rule->{ 'time' };
						$contact = $rule->{ contact };
					}
				}
			}

			push @divisions_sql, sprintf "\t( \"%04d\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\", %d, %d, %d, \"%s\" )", $id, $event, $gender, $age, $rank, $weight, $vector, $rounds, $time, $rest, $contact;
			my $sequence = 1;
			foreach my $athlete (shuffle @{ $division->{ athletes }}) {
				push @staging_sql, sprintf "\t( \"%04d\", \"\%04d\", \"%04d\", \"%d\" )", $staging_id, $athlete->id(), $id, $sequence;
				$staging_id++;
				$sequence++;
			}
		}
	}
	$sql .= "\nINSERT INTO divisions ( id, event, gender, age, rank, weight, vector, rounds, time, rest, contact ) VALUES\n";
	$sql .= join( ",\n", @divisions_sql ) . ";\n";

	$sql .= "\nINSERT INTO staging ( id, athlete, division, sequence ) VALUES\n";
	$sql .= join( ",\n", @staging_sql ) . ";\n";

	return $sql;
}

# ============================================================
sub sql_for_tables {
# ============================================================
	my $sql =<<EOF;
CREATE TABLE IF NOT EXISTS athletes (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	fname       TEXT,
	lname       TEXT,
	gender      TEXT,
	belt        TEXT,
	age         INTEGER,
	weight      INTEGER
);

CREATE TABLE IF NOT EXISTS divisions (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	event       TEXT,
	gender      TEXT,
	age         TEXT,
	rank        TEXT,
	weight      TEXT,
	vector      TEXT,
	exhibition  INTEGER,
	rounds      INTEGER,
	time        INTEGER,
	rest        INTEGER,
	contact     TEXT,
	note        TEXT,
	staged		INTEGER,
	started		INTEGER,
	finished	INTEGER,
	replacedBy  INTEGER REFERENCES divisions (id)
);

CREATE TABLE IF NOT EXISTS staging (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	athlete     INTEGER REFERENCES athletes (id),
	division    INTEGER REFERENCES divisions (id),
	sequence    INTEGER
);

CREATE TABLE IF NOT EXISTS matches (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	division    INTEGER REFERENCES divisions (id),
	next        INTEGER REFERENCES matches (id),
	sequence    INTEGER,
	started		INTEGER,
	finished	INTEGER,
	decision	TEXT
);

CREATE TABLE IF NOT EXISTS results (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	athlete     INTEGER REFERENCES athletes (id),
	match       INTEGER REFERENCES matches (id),
	sequence    INTEGER,
	points      REAL,
	penalties   REAL
);
EOF
	return $sql;
}
