#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 535;
use FreeScore::Test;
use Data::Dumper;

my $test;
my $response;

# ===== GET THE NUMBER OF JUDGES FOR DIVISION 1
ok( $test = new FreeScore::Test());
ok( $response = $test->worldclass( "judges" ));

my $judges = $response->{ judges };
ok( $judges == 5 );

# ===== CHANGE THE DISPLAY (AND WRITE OUT THE DIVISION)
ok( $response = $test->worldclass( "display" ));
ok( $response->{ state } eq 'display' );

# ===== SCORE THE 22 PLAYERS IN THE PRELIMINARY ROUND
foreach my $athlete ( 0 .. 21 ) { 
	foreach my $form ( 0 .. 1 ) {
		foreach my $judge ( 0 .. ($judges - 1)) {
			my $score = score_worldclass();

			my $judge_score = join( "/", $judge, (map { $_ * 10 } @{ $score }{ qw( major minor rhythm power ki ) }));
			ok( $response = $test->worldclass( $judge_score ) );
			ok( sprintf( "%.1f", $response->{ score }{ major }) eq sprintf( "%.1f", $score->{ major }));
		}
		ok( $response = $test->worldclass( "athlete/next" ));
		ok( $response->{ form } == ($form + 1)%2);
	}
}

# ===== MOVE TO THE NEXT ROUND (SEMIFINALS)
ok( $response = $test->worldclass( "division/next" ));
ok( $response->{ round } eq 'semfin' );


