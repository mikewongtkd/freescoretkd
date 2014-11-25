#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 244;
use FreeScore::Forms::WorldClass;
use FreeScore::Test qw( score_worldclass );
use Data::Dumper;

my $tournament = 'test';
my $ring       = 1;

my $progress   = new FreeScore::Forms::WorldClass( $tournament, $ring );
ok( $progress );

my $division   = $progress->current();
ok( $division );

my $judges = $division->{ judges };

foreach my $i ( 0 .. 21 ) {
	my $athlete = $division->{ athletes }[ $i ]{ scores }{ $division->{ round }};
	ok( $athlete );
	foreach my $form( 0 .. 1 ) {
		foreach my $judge ( 0 .. ($judges - 1)) {
			my $score = score_worldclass();
			$score->{ $_ } = sprintf( "%.1f", $score->{ $_ }) foreach keys %$score;
			$division->record_score( $judge, $score );
			ok( $athlete->[ $form ]{ judge }[ $judge ]{ major } == $score->{ major } );
		}
		$division->next();
	}
}

$division->write();

print Dumper $division->place_athletes();
