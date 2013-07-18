#! /usr/bin/perl

use lib qw( ./lib );
use MemberSolutions::Registration;
use AAU::Tournament;
use List::Util qw( shuffle );

my $file = shift;

my @path = split /\//, $file;
pop @path;
my $output = join "/", @path, "freescore.sql";

my $registration     = new MemberSolutions::Registration( $file );
my $tournament       = new AAU::Tournament();

open FILE, ">$output" or die "Can't write to file '$output' $!";
print FILE <DATA>;

print FILE "\nINSERT INTO athletes ( id, fname, lname, gender, belt, age, weight ) VALUES\n";

my @sql = ();
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
print FILE join( ",\n", @sql ), ";\n";

my @divisions_sql     = ();
my @contestants_sql   = ();
my $contestants_id    = 1;
my $divisions         = $tournament->divisions();
foreach my $event (sort keys %$divisions) {
	foreach my $division ( @{ $divisions->{ $event }}) {
		my $id      = $division->{ id };
		my $event   = $division->{ event };
		my $gender  = $division->{ gender };
		my $age     = $division->{ age };
		my $rank    = $division->{ belt };
		my $weight  = $division->{ weight };
		my $rounds  = 0;
		my $time    = 0;
		my $rest    = 0;
		my $contact = '';
		if( $event =~ /sparring/i ) {
			$rounds = 2;
			$rest   = 30;
			$time   = ($rank =~ /black/i) ? 120 : 90;
			if     ( $event =~ /olympic/i ) { 
				$contact = ($rank =~ /black/i && int( $age ) >= 15) || (int( $age ) >= 18) ? 'Full Contact' : 'Junior Safety Rules';
			} elsif( $event =~ /point/i ) {
				$contact = 'Light Head Contact Only';
			}
		}
		push @divisions_sql, sprintf "\t( \"%04d\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\", %d, %d, %d, \"%s\" )", $id, $event, $gender, $age, $rank, $weight, $rounds, $time, $rest, $contact;
		my $sequence = 1;
		foreach my $athlete (shuffle @{ $division->{ athletes }}) {
			push @contestants_sql, sprintf "\t( \"%04d\", \"\%04d\", \"%04d\", \"%d\" )", $contestants_id, $athlete->id(), $id, $sequence;
			$contestants_id++;
			$sequence++;
		}
	}
}
print FILE "\nINSERT INTO divisions ( id, event, gender, age, rank, weight, rounds, time, rest, contact ) VALUES\n";
print FILE join( ",\n", @divisions_sql ), ";\n";

print FILE "\nINSERT INTO contestants ( id, athlete, division, sequence ) VALUES\n";
print FILE join( ",\n", @contestants_sql ), ";\n";

close FILE;

__DATA__
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
	exhibition  INTEGER,
	rounds      INTEGER,
	time        INTEGER,
	rest        INTEGER,
	contact     TEXT,
	note        TEXT,
	replacedBy  INTEGER REFERENCES divisions (id)
);

CREATE TABLE IF NOT EXISTS imports (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	athlete     INTEGER REFERENCES athletes (id),
	previous    INTEGER REFERENCES divisions (id),
	next        INTEGER REFERENCES divisions (id),
	type        TEXT,
	note        TEXT
);

CREATE TABLE IF NOT EXISTS contestants (
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
