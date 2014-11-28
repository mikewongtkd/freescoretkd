#! /usr/bin/perl
use lib qw( ./lib ../lib );
use FreeScore::Forms::WorldClass;
use Data::Dumper;

my $tournament = 'test';
my $ring       = 1;

my $progress   = new FreeScore::Forms::WorldClass( $tournament, $ring );
my $division   = $progress->current();
my $round      = 'prelim';

my @placements = @{ $division->{ placement }{ $round }};
my $half       = int((int( @placements )+1)/2);
@placements    = splice( @placements, 0, $half );

printf "%-20s %5s  %4s  %5s\n", "NAME", "SCORE", "PRES", "HLAVG";
foreach my $athlete (map { $division->{ athletes }[ $_ ] } @placements) {
	my $score = $athlete->{ scores }{ $round };
	my $stats = {};
	$stats->{ sum } += $_->{ adjusted_mean }{ total }        foreach @$score;
	$stats->{ pre } += $_->{ adjusted_mean }{ presentation } foreach @$score;
	$stats->{ all } += $_->{ complete_mean }{ total }        foreach @$score;
	printf "%-20s %5.2f  %4.2f  %5.2f\n", $athlete->{ name }, $stats->{ sum }, $stats->{ pre }, $stats->{ all };
}
