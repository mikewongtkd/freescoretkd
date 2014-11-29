#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 93;
use FreeScore::Test qw( score_grassroots );
use Data::Dumper;

my $test;
my $response;

# ===== GET THE NUMBER OF JUDGES FOR DIVISION 1
ok( $test = new FreeScore::Test());
ok( $response = $test->grassroots( "judges" ));

my $judges = $response->{ judges };
ok( $judges == 5 );

# ===== CHANGE THE DISPLAY (AND WRITE OUT THE DIVISION)
ok( $response = $test->grassroots( "display" ));
ok( $response->{ state } eq 'display' );

# ===== SCORE THE 8 PLAYERS
foreach my $athlete ( 0 .. 7 ) { 
	foreach my $judge ( 0 .. ($judges - 1)) {
		my $score = score_grassroots();

		my $judge_score = "$judge/" . ($score * 10);
		ok( $response = $test->grassroots( $judge_score ) );
		ok( sprintf( "%.1f", $response->{ score }) eq sprintf( "%.1f", $score ));
	}
	ok( $response = $test->grassroots( "athlete/next" ));
}

