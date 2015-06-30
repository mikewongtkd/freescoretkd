#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 288;
use FreeScore::Forms::WorldClass;
use FreeScore::Test qw( score_worldclass );
use Data::Dumper;

my $tournament = 'test';
my $ring       = 1;
my $scores     = get_scores();

# ===== LOAD API (2 TESTS)
my $progress   = new FreeScore::Forms::WorldClass( $tournament, $ring );
ok( $progress );

my $division   = $progress->current();
ok( $division );


# ============================================================
sub score {
# ============================================================
 	my $division = shift;
	my $athletes = shift;

	my $j = $division->{ judges } - 1;
	my $n = $athletes - 1;
	my $r = $division->{ round };

	foreach ( 0 .. $n ) {
		my $i = $division->{ current };
		my $athlete = $division->{ athletes }[ $i ];
		my $name    = $athlete->{ name };
		my $forms   = $#{$division->{ forms }{ $r }};
		ok( $athlete );
		foreach my $form ( 0 .. $forms ) {
			foreach my $judge ( 0 .. $j ) {
				my $score = scores->{ $name }[ $judge ];
				$score->{ $_ } = sprintf( "%.1f", $score->{ $_ }) foreach keys %$score;
				$division->record_score( $judge, $score );
				ok( $athlete->{ scores }{ $r }[ $form ]{ judge }[ $judge ]{ major } == $score->{ major } );
				$division->write();
			}
			if( $form == 0 && $forms > 0 ) {
				$division->next_form();
				$division->write();
			}
		}
		$division->next_athlete();
		$division->write();
	}

	$division->next_round();
	$division->write();
}

# ============================================================
sub get_scores {
# ============================================================
# The names and scores are just for demonstration
# purposes; they have no real or intended value.
# ------------------------------------------------------------
	my $scores = {};
	while( <DATA> ) {
		chomp;
		my $name = $_;
		foreach ( 0 .. 4 ) {
			local $_ = <DATA>;
			chomp;
			my ($major, $minor, $power, $rhythm, $ki) = split /\t+/;
			push @{$scores->{ $name }}, { major => $major, minor => $minor, power => $power, rhythm => $rhythm, ki => $ki };
		}
	}
	return $scores;
}

__DATA__
Aditya		
	0.0	1.2	0.8	0.8	1.1
	0.6	1.9	0.9	0.9	0.9
	0.9	0.7	1.1	0.8	0.9
	0.0	1.3	1.0	0.9	0.8
	0.0	1.0	0.8	0.9	0.8
Anika		
	0.3	1.1	1.0	1.5	1.1
	0.3	1.0	1.3	1.3	1.3
	0.3	1.5	1.2	1.1	1.4
	0.0	0.7	1.2	1.2	1.4
	0.3	1.5	1.4	1.6	1.3
Piper		
	0.0	2.0	1.5	1.3	1.2
	0.0	0.4	1.4	1.6	1.1
	0.0	0.7	1.7	1.7	1.3
	0.0	1.0	1.2	1.4	1.5
	0.3	1.1	1.6	1.1	1.3
Alexander		
	0.0	0.7	1.2	1.2	1.5
	0.6	1.1	1.0	1.5	1.2
	0.9	1.0	1.6	1.5	1.3
	0.3	0.8	1.5	1.0	1.3
	0.0	1.2	1.2	1.2	1.1
Steven		
	0.3	0.1	1.1	1.5	1.4
	0.0	1.2	1.5	1.5	1.3
	0.3	1.1	1.2	1.4	1.2
	0.0	0.6	1.3	1.5	1.4
	0.3	0.6	1.9	1.5	1.9
Sofia		
	0.6	2.0	1.3	1.4	1.3
	0.3	1.6	1.1	1.1	1.0
	0.0	0.6	1.4	1.0	1.6
	0.0	1.4	1.3	1.0	1.4
	0.0	0.7	1.0	1.4	1.0
Christian		
	0.3	2.7	0.5	0.7	0.9
	2.4	2.7	1.4	0.5	0.6
	1.2	1.9	0.7	1.0	1.1
	1.5	1.7	0.9	1.1	1.0
	0.9	2.3	0.5	1.0	0.5
Jamsheed		
	0.6	1.4	1.1	0.8	1.0
	1.2	0.7	1.0	0.9	0.8
	2.4	0.3	1.0	0.8	1.0
	0.6	1.7	1.1	1.0	0.8
	1.2	1.7	0.8	1.1	0.9
Thibault		
	0.6	3.9	0.9	0.7	0.5
	2.7	1.4	0.7	0.5	1.0
	1.8	2.3	1.0	1.1	0.8
	0.6	3.3	1.0	1.0	0.8
	0.9	1.6	0.8	0.6	1.1
Yash		
	0.6	1.9	1.1	0.8	0.8
	1.5	1.2	1.1	0.8	1.0
	1.2	0.7	0.9	0.9	0.8
	0.3	1.1	0.9	0.9	1.2
	0.6	0.5	1.1	0.8	0.9
Sean C.		
	1.8	1.9	0.7	0.8	1.1
	3.3	2.4	1.2	0.9	0.6
	1.5	1.7	0.6	0.8	0.7
	1.2	2.3	0.8	1.5	0.9
	0.6	2.5	1.2	0.9	1.0
Sean O.		
	0.0	0.9	1.3	1.0	1.2
	1.2	0.6	1.3	1.0	1.3
	0.6	0.6	1.2	1.1	1.0
	0.0	1.2	1.5	1.2	1.4
	0.3	1.6	1.6	1.1	1.4
Sujatha		
	1.2	2.2	0.6	1.6	0.5
	3.0	1.9	1.3	1.1	1.5
	0.9	2.0	1.1	0.6	0.7
	0.3	1.9	0.9	1.2	0.9
	0.9	2.1	0.7	1.0	0.7
Jill		
	1.2	2.0	0.9	1.0	1.0
	1.5	1.5	1.2	0.8	1.1
	0.6	0.7	0.9	0.9	0.8
	0.6	0.9	0.8	0.9	0.8
	0.6	1.6	0.8	0.9	0.8
Mike		
	0.0	0.9	1.5	1.1	0.9
	0.3	0.7	1.5	1.1	1.3
	0.0	0.6	1.2	1.4	1.8
	0.3	0.7	1.0	1.5	1.4
	0.6	0.9	1.4	1.1	1.4
Carl		
	1.8	1.0	0.8	0.9	0.9
	0.6	2.6	0.9	0.8	0.9
	1.2	1.4	0.8	0.9	1.0
	0.6	1.1	1.2	0.9	0.8
	0.6	1.4	1.1	1.0	1.2
Veronika		
	0.0	1.3	1.1	1.3	1.4
	0.6	0.9	1.0	1.4	1.1
	0.3	1.5	1.1	1.5	1.2
	0.6	1.0	1.2	1.3	1.3
	0.9	1.1	1.5	1.0	1.4
Giovanni		
	2.4	1.4	0.6	0.8	0.6
	3.0	3.3	0.7	0.8	0.7
	0.9	1.2	1.6	0.8	0.9
	1.2	3.2	1.0	0.8	1.0
	1.8	1.3	1.0	0.5	0.8
Katrina		
	0.0	0.8	0.8	0.8	0.8
	0.3	0.9	1.0	0.8	1.0
	1.2	0.8	0.8	0.8	0.8
	1.8	0.9	1.2	1.0	1.0
	0.6	1.8	0.8	0.9	0.9
Cody		
	0.6	0.8	1.6	1.5	1.4
	0.6	0.3	1.1	1.2	1.3
	1.5	1.4	1.1	1.4	1.0
	0.0	1.1	1.0	1.0	1.5
	0.3	0.9	1.0	1.6	1.2
Kaylee		
	0.3	1.8	0.9	0.8	0.9
	2.1	1.4	0.9	0.9	1.0
	2.1	1.8	0.8	0.8	0.8
	0.3	1.5	0.9	0.9	1.0
	0.3	1.3	0.9	0.8	0.8
Jonathan		
	2.4	1.3	1.0	0.8	0.9
	1.5	1.0	0.8	0.9	0.8
	0.3	0.5	0.9	1.0	0.8
	0.6	1.4	0.8	0.9	0.8
	0.6	0.8	0.8	1.1	0.8
