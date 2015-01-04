#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 68;
use FreeScore::Forms::Grassroots;
use FreeScore::Test qw( score_grassroots );
use Data::Dumper;

my $tournament = 'test';
my $ring       = 1;
my $skill      = get_skill_levels();

my $progress   = new FreeScore::Forms::GrassRoots( $tournament, $ring );
ok( $progress );

my @divisions  = qw( p01 p02 );
my $division   = $progress->current();
ok( $division );

foreach my $div ( @divisions ) {
	ok( $division->{ name } eq $div );
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
			ok( $athlete->[ $judge ] == $score );
			$division->write();
		}
		$division->next();
	}
	$division->write();

	if( $div ne $divisions[ -1 ] ) {
		$progress->next();
		$progress->write();
		$division = $progress->current();
	}
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
Shreya	ok	
Skylar	better	
Roshan	ok
Aiden	good
Genevieve	ok
Angelina	better
Ian	best
Suri	good
Fernanda	ok
Annabriza	best
Tejasvini	good
Aditya	better
