#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 691;
use FreeScore::Test qw( score_worldclass );
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
	foreach my $judge ( 0 .. ($judges - 1)) {
		my $score = score_worldclass();

		my $judge_score = join( "/", $judge, (map { $_ * 10 } @{ $score }{ qw( major minor rhythm power ki ) }));
		ok( $response = $test->worldclass( $judge_score ) );
		print STDERR Dumper $response if exists $response->{ error };
		ok( sprintf( "%.1f", $response->{ score }{ major }) eq sprintf( "%.1f", $score->{ major }));
	}
	ok( $response = $test->worldclass( "athlete/next" ));
}

# ===== MOVE TO THE SEMIFINAL ROUND
ok( $response = $test->worldclass( "round/next" ));
ok( $response->{ round } eq 'semfin' );

# ===== SCORE THE 11 PLAYERS IN THE SEMIFINAL ROUND
foreach my $athlete ( 0 .. 10 ) { 
	foreach my $judge ( 0 .. ($judges - 1)) {
		my $score = score_worldclass();

		my $judge_score = join( "/", $judge, (map { $_ * 10 } @{ $score }{ qw( major minor rhythm power ki ) }));
		ok( $response = $test->worldclass( $judge_score ) );
		print STDERR Dumper $response if exists $response->{ error };
		print STDERR Dumper $response;
		ok( sprintf( "%.1f", $response->{ score }{ major }) eq sprintf( "%.1f", $score->{ major }));
		exit();
	}
	ok( $response = $test->worldclass( "athlete/next" ));
	print Dumper $response;
}

# ===== MOVE TO THE FINAL ROUND
ok( $response = $test->worldclass( "round/next" ));
ok( $response->{ round } eq 'finals' );

# ===== SCORE THE 8 PLAYERS IN THE FINALS ROUND
foreach my $athlete ( 0 .. 7 ) { 
	foreach my $form ( 0 .. 1 ) {
		foreach my $judge ( 0 .. ($judges - 1)) {
			my $score = score_worldclass();

			my $judge_score = join( "/", $judge, (map { $_ * 10 } @{ $score }{ qw( major minor rhythm power ki ) }));
			ok( $response = $test->worldclass( $judge_score ) );
			print STDERR Dumper $response if exists $response->{ error };
			ok( sprintf( "%.1f", $response->{ score }{ major }) eq sprintf( "%.1f", $score->{ major }));
		}
		ok( $response = $test->worldclass( "form/next" ));
		ok( $response->{ form } == 1 );
	}
	ok( $response = $test->worldclass( "athlete/next" ));
	print Dumper $response, $athlete;
}

