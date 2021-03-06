#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 453;
use FreeScore::Forms::WorldClass;
use FreeScore::Test qw( score_worldclass );
use Data::Dumper;

my $tournament = 'test';
my $ring       = 1;

my $progress   = new FreeScore::Forms::WorldClass( $tournament, $ring );
ok( $progress );

my $division   = $progress->current();
ok( $division );

score( $division, 22 ); # PRELIMINARY, 22 ATHLETES
score( $division, 11 ); # SEMI-FINALS, 11 ATHLETES
score( $division, 8 );  # FINALS,       8 ATHLETES

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
		my $athlete = $division->{ athletes }[ $i ]{ scores }{ $r };
		my $name    = $division->{ athletes }[ $i ]{ name };
		ok( $athlete );
		foreach my $form( 0 .. 1 ) {
			foreach my $judge ( 0 .. $j ) {
				my $level = $skill->{ $name };
				my $score = score_worldclass( 'tie' );
				$score->{ $_ } = sprintf( "%.1f", $score->{ $_ }) foreach keys %$score;
				$division->record_score( $judge, $score );
				ok( $athlete->[ $form ]{ judge }[ $judge ]{ major } == $score->{ major } );
				$division->write();
			}
			$division->next_form() if( $form == 0 );
		}
		$division->{ state } = 'display';
		$division->write();
		sleep( 3 );
		$division->next_athlete();
	}

	$division->next_round();
	$division->write();
}
