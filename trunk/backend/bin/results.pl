#! /usr/bin/perl

use lib qw( ./lib );

use FreeScore::Forms::GrassRoots;
use FreeScore::Forms::WorldClass;
use Data::Dumper;

my $tournament = shift;

print <DATA>;

# ===== GRASSROOTS
print "<h1>Traditional and Open Poomsae</h1>";

my $divisions = [];
foreach my $ring ( 1, 2 ) {
	my $grassroots = new FreeScore::Forms::GrassRoots( $tournament, $ring );
	push @$divisions, @{$grassroots->{ divisions }};
}

@$divisions = sort { $a->{ name } cmp $b->{ name } } @$divisions;

foreach my $division (@$divisions) {
	my $name = uc $division->{ name };
	foreach my $i ( 0 .. $#{ $division->{ placements }} ) {
		last if $i > 3;
		my $j = $division->{ placements }[ $i ];
		$division->{ athletes }[ $j ]{ placement } = $i + 1;
	}
	print "<h2>Division $name: $division->{ description }</h2>\n<table border=0 cellpadding=0 cellspacing=0>\n";
	print "<tr><th class=\"name\">Name</th><th class=\"score\">Judge 1</th><th class=\"score\">Judge 2</th><th class=\"score\">Judge 3</th><th class=\"total\">Total</th><th class=\"tiebreakers\">TB</th><th class=\"placement\">Place</th></tr>\n";
	foreach my $athlete (@{ $division->{ athletes }}) {
		print "<tr><td class=\"name\">$athlete->{ name }</td>";
		foreach my $score (@{ $athlete->{ scores }}) {
			printf "<td class=\"score\">%3.1f</td>", $score;
		}
		printf "<td class=\"total\">%4.1f</td>", $athlete->{ score };
		if( grep { defined $_ } @{ $athlete->{ tiebreakers }} ) {
			my $votes = int( grep { $_ == 2; } @{ $athlete->{ tiebreakers }});
			printf "<td class=\"tiebreakers\">%1d</td>", $votes;
		} else {
			printf "<td class=\"tiebreakers\">&nbsp;</td>";
		}
		print "<td class=\"placement\">$athlete->{ placement }</td>";
		print "</tr>\n";
	}
	print "</table>\n";
}

# ===== WORLDCLASS
$divisions = [];
print "<h1>Sport Poomsae</h1>";

foreach my $ring ( 1, 2 ) {
	my $worldclass = new FreeScore::Forms::WorldClass( $tournament, $ring );
	push @$divisions, @{$worldclass->{ divisions }};
}

@$divisions = sort { $a->{ name } cmp $b->{ name } } @$divisions;

foreach my $division (@$divisions) {
	my $name = uc $division->{ name };
	print STDERR Dumper $division->{ placement }{ finals };
	foreach my $i ( 0 .. $#{ $division->{ placement }{ finals }} ) {
		my $j = $division->{ placement }{ finals }[ $i ];
		$division->{ athletes }[ $j ]{ placement } = $i + 1;
	}
	print "<h2>Division $name: $division->{ description }</h2>\n<table border=0 cellpadding=0 cellspacing=0>\n";
	print "<tr><th class=\"name\">Name</th><th class=\"form\">Form</th><th class=\"judge\" colspan=2>Judge 1</th><th class=\"judge\" colspan=2>Judge 2</th><th class=\"judge\" colspan=2>Judge 3</th><th class=\"judge\" colspan=2>Judge 4</th><th class=\"judge\" colspan=2>Judge 5</th><th class=\"total\">F Avg</th><th class=\"total\">R Avg</th><th class=\"placement\">Place</th></tr>\n";
	foreach my $athlete (@{ $division->{ athletes }}) {
		my $mean = 0.0;
		foreach my $form (@{ $athlete->{ scores }{ finals }}) { $mean += $form->{ adjusted_mean }{ total }; }
		$mean /= int( @{ $athlete->{ scores }{ finals }} );
		foreach my $i (0 .. $#{ $athlete->{ scores }{ finals }}) {
			print "<tr>";
			print "<td class=\"name\" rowspan=2>$athlete->{ name }</td>" if $i == 0;
			my $form  = $athlete->{ scores }{ finals }[ $i ];
			my $fname = $division->{ forms }{ finals }[ $i ]{ name };
			print "<td class=\"form\">$fname</td>";
			foreach my $judge (@{ $form->{ judge }}) {
				my $ignore = 0;
				foreach my $preacc (qw( acc pre )) {
					foreach my $minmax (qw( min max )) { 
						my $key = "$minmax$preacc";
						$ignore = 1 if $judge->{ $key }; 
					}
					$ignore = $ignore ? 'ignore' : '';
					my $score = { pre => 'presentation', acc => 'accuracy' }->{ $preacc };
					printf "<td class=\"$score $ignore\">%3.1f</td>", $judge->{ $score };
				}
			}
			printf "<td class=\"total\">%4.2f</td>", $form->{ adjusted_mean }{ total };
			if( $i == 0 ) {
				printf "<td class=\"total\" rowspan=2>%4.2f</td>", $mean;
				print "<td class=\"placement\" rowspan=2>$athlete->{ placement }</td>";
			}
			print "</tr>\n";

		}
	}
	print "</table>\n";
}


print "</body></html>";

__DATA__
<html>
	<head>
		<title>Tournament Results</title>
<style>
body {
	font-family: Optima, arial, sans-serif;
	width: 800px;
}

h2 {
	font-size: 12pt;
	border-bottom: 1px solid #333;
	margin-bottom: 0;
}

th {
	text-align: left;
	font-size: 9pt;
}

th.name         { width: 200px; }
td.name         { width: 200px; }

th.score        { width: 48px; }
td.score        { width: 48px; }

th.total        { width: 48px; }
td.total        { width: 48px; }

th.tiebreakers  { width: 48px; }
td.tiebreakers  { width: 48px; }

th.placement    { width: 48px; }
td.placement    { width: 48px; }

th.form         { width: 100px; }
td.form         { width: 100px; font-size: 9pt; }

th.judge        { width: 64px; }
td.judge        { width: 64px; }

th.accuracy     { width: 32px; }
td.accuracy     { width: 32px; }

th.presentation { width: 32px; }
td.presentation { width: 32px; }

td.ignore       { text-decoration: line-through; }


</style>
	</head>
	<body>
