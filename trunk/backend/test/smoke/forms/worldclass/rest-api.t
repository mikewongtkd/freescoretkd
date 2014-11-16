#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 533;
use FreeScore::Test;
use Data::Dumper;

my $test;
my $response;

sub roll( $ );
sub highest( $@ );
sub lowest( $@ );
sub sum( @ );

# ===== GET THE NUMBER OF JUDGES FOR DIVISION 1
ok( $test = new FreeScore::Test());
ok( $response = $test->worldclass( "judges" ));

my $judges = $response->{ judges };
ok( $judges == 5 );

# ===== CHANGE THE DISPLAY (AND WRITE OUT THE DIVISION)
ok( $response = $test->worldclass( "display" ));
ok( $response->{ state } eq 'display' );

# ===== SCORE THE 22 PLAYERS
foreach my $athlete ( 0 .. 21 ) { 
	foreach my $form ( 0 .. 1 ) {
		foreach my $judge ( 0 .. ($judges - 1)) {
			my $major  = (sum lowest 1, roll "2d8") - 1;
			my $minor  = (sum lowest 2, roll "3d20") - 2;
			my $rhythm = (sum lowest 5, roll "6d4");
			my $power  = (sum lowest 5, roll "6d4");
			my $ki     = (sum lowest 5, roll "6d4");

			$major = $major * 3;
			$minor = $major + $minor > 40 ? (40 - $major) : $minor;

			$score = join( "/", $judge, $major, $minor, $rhythm, $power, $ki );
			ok( $response = $test->worldclass( $score ) );
			ok( $response->{ score }{ major } == $major/10 );
		}
		ok( $response = $test->worldclass( "athlete/next" ));
		ok( $response->{ form } == ($form + 1)%2);
	}
}

# ============================================================
sub roll( $ ) {
# ============================================================
	my $dice             = shift;
	my ($number, $sides) = split /d/, $dice;
	my @rolls            = ();
	for( 0 .. ($number - 1)) {
		push @rolls, int( rand() * $sides ) + 1;
	}
	return @rolls;
}

# ============================================================
sub highest( $@ ) {
# ============================================================
	my $num = shift;
	my @dice = sort { $b <=> $a } @_;
	return splice( @dice, 0, $num );
}

# ============================================================
sub lowest( $@ ) {
# ============================================================
	my $num = shift;
	my @dice = sort { $a <=> $b } @_;
	return splice( @dice, 0, $num );
}

# ============================================================
sub sum( @ ) {
# ============================================================
	my $sum = 0.0;
	$sum += $_ foreach @_;
	return $sum;
}
