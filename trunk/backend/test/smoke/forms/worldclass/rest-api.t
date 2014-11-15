#! /usr/bin/perl
use lib qw( ./lib ../lib );
use Test::Simple tests => 5;
use FreeScore::Test;
use Data::Dumper;

my $test;
my $response;

# ===== GET THE NUMBER OF JUDGES FOR DIVISION 1
ok( $test = new FreeScore::Test());
ok( $response = $test->worldclass( "judges" ));
ok( $response->{ judges } == 5 );

# ===== CHANGE THE DISPLAY (AND WRITE OUT THE DIVISION)
ok( $response = $test->worldclass( "display" ));
ok( $response->{ state } eq 'display' );
