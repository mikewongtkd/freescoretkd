#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 288;
use FreeScore::Forms::WorldClass;
use FreeScore::Test qw( score_worldclass );
use Data::Dumper;

my $tournament = 'test';
my $ring       = 1;
my $skill      = get_skill_levels();

# ===== LOAD API (2 TESTS)
my $progress   = new FreeScore::Forms::WorldClass( $tournament, $ring );
ok( $progress );

my $division   = $progress->current();
ok( $division );

score( $division, 22 ); # PRELIMINARY, 22 ATHLETES, 1 FORM,  132 TESTS
score( $division, 11 ); # SEMI-FINALS, 11 ATHLETES, 1 FORM,   66 TESTS
score( $division, 8 );  # FINALS,       8 ATHLETES, 2 FORMS,  88 TESTS

# 2 + 132 + 66 + 88 = 288 TOTAL TESTS

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
				my $level = $skill->{ $name };
				my $score = score_worldclass( $level );
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
sub get_skill_levels {
# ============================================================
# The names and skill levels are just for demonstration
# purposes; they have no real or intended value.
# ------------------------------------------------------------
	my $skill = {};
	while( <DATA> ) {
		chomp;
		my ($name, $level) = split /\t+/;
		$skill->{ $name } = $level;
	}
	return $skill;
}

__DATA__
Aditya		good	
Anika		better	
Piper		best	
Alexander	better	
Steven		best	
Sofia		better
Christian	good	
Jamsheed	ok	
Thibault	good	
Yash		ok	
Sean C.		good	
Sean O.		better	
Sujatha		ok	
Jill		ok	
Mike		best	
Carl		good	
Veronika	better	
Giovanni	ok	
Katrina		good	
Cody		better	
Kaylee		ok	
Jonathan	ok	
