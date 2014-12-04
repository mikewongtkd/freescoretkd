#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 50;
use FreeScore::Forms::Grassroots;
use FreeScore::Test qw( score_grassroots );
use Data::Dumper;

my $tournament = 'test';
my $ring       = 1;
my $skill      = get_skill_levels();

my $progress   = new FreeScore::Forms::GrassRoots( $tournament, $ring );
ok( $progress );

my $division   = $progress->current();
ok( $division );

my $j = $division->{ judges } - 1;
my $n = $#{ $division->{ athletes }};

foreach ( 0 .. $n ) {
	my $i = $division->{ current };
	my $athlete = $division->{ athletes }[ $i ]{ scores };
	my $name    = $division->{ athletes }[ $i ]{ name };
	ok( $athlete );
	foreach my $judge ( 0 .. $j ) {
		my $level = $skill->{ $name };
		my $score = score_grassroots( $level );
		$division->record_score( $judge, $score );
		ok( $athlete->[ $form ]{ judge }[ $judge ]{ major } == $score->{ major } );
		$division->write();
	}
	$division->next();
}

$division->write();

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
Shreya	ok	
Skylar	better	
Roshan	ok
Aiden	good
Genevieve	ok
Angelina	better
Ian	best
Suri	good
