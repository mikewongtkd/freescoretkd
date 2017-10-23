package FreeScore::Forms::GrassRoots::Division;
use FreeScore;
use FreeScore::Forms::Division;
use JSON::XS;
use base qw( FreeScore::Forms::Division );
use POSIX qw( ceil );
use List::Util qw( sum );
use Data::Dumper;

# ============================================================
sub read {
# ============================================================
	my $self  = shift;

	my $index = 0;
	$self->{ judges } = 3; # Default value
	$self->{ places } = [ { place => 1, medals => 1 }, { place => 2, medals => 1 }, { place => 3, medals => 2 } ];
	$self->{ round }  = 'fin';

	open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			if    ( $key eq 'placements' ) { $self->{ $key } = [ split( /,/, $value ) ]; } 
			elsif ( $key eq 'brackets'   ) { my $json = new JSON::XS(); $self->{ $key } = $json->decode( $value ); }
			elsif ( $key eq 'tied'       ) {} # Do nothing; better to calculate this fresh
			elsif ( $key eq 'places'     ) {
				my $places = [];
				foreach my $entry (split /,/, $value) {
					my ($place, $medals) = split /:/, $entry;
					push @$places, { place => $place, medals => $medals };
				}
				$self->{ $key } = $places;
 
			} else { $self->{ $key } = $value; }
			next;
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns   = split /\t/;
		my $athlete   = shift @columns;
		my $rank      = shift @columns;
		my $n         = $self->{ judges } - 1;
		my @scores    = ();
		my @tb_scores = ();
		foreach ( 0 .. $n ) { push @scores,    shift @columns; }
		foreach ( 0 .. $n ) { push @tb_scores, shift @columns; }
		push @{ $self->{ athletes }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ], tiebreakers => [ @tb_scores ] };
		$index++;
	}
	close FILE;

	$self->calculate_scores();
	$self->calculate_placements();
}

# ============================================================
sub calculate_placements {
# ============================================================
	my $self       = shift;
	my $n          = $self->{ judges };
	my @sorted     = sort { my $x = $self->{ athletes }[ $a ]; my $y = $self->{ athletes }[ $b ]; _compare( $x, $y, $n ); } ( 0 .. $#{ $self->{ athletes }});
	my $tied       = [];
	my $placements = [];
	my $places     = [ @{ $self->{ places }} ];

	# ===== CALCULATE BRACKETS
	if( $self->is_single_elimination() ) {
		if( exists $self->{ brackets } ) {
			$self->update_brackets();
			my $round    = $self->current_round();
			my $final    = @$round == 1;
			my $bracket  = $self->current_bracket();
			my $complete = sum( @{ $bracket->{ blue }{ votes }}, @{ $bracket->{ red }{ votes }} ) == $self->{ judges };
			if( $final && $complete ) {
				@$placements = sort { $self->{ athletes }[ $b ]{ score } <=> $self->{ athletes }[ $a ]{ score } } (0 .. $#{ $self->{ athletes }});
				$self->{ placements } = $placements;
				$self->{ pending }    = [];
				$self->{ complete }   = 1;

			} else {
				$self->{ placements } = [];
				$self->{ pending }    = [ $bracket->{ blue }{ athlete }, $bracket->{ red }{ athlete } ];
			}
		} else {
			my $brackets = [[]];
			_build_brackets( $self->{ judges }, $brackets, [( 0 .. $#{$self->{ athletes }})] );
			$self->{ brackets } = $brackets;
		}
		return;
	}

	# ===== CALCULATE TIES
	for( my $i = 0; $i <= $#sorted; $i++ ) {
		my $a = $sorted[ $i ];
		my $x = $self->{ athletes }[ $a ];

		push @$placements, $a if $x->{ complete };
		my $place_ties = { place => $i + 1, tied => [ $a ] };
		for( my $j = ($i + 1); $j <= $#sorted; $j++ ) {
			my $b = $sorted[ $j ];
			my $y = $self->{ athletes }[ $b ];
			last unless _compare( $x, $y, $n ) == 0;

			push @$placements, $b if $y->{ complete };
			push @{ $place_ties->{ tied }}, $b;
			$i = $j;
		}

		my $ties = $#{ $place_ties->{ tied }};
		push @$tied, $place_ties if($#{ $place_ties->{ tied }});
	}

	# ===== FILTER UNIMPORTANT TIES
	@$tied = grep {
		my $tie = $_;
		my ($place) = grep { $_->{ place } == $tie->{ place } } @$places;
		if( ! defined $place ) { (); }
		elsif( $place->{ medals } < int( @{ $tie->{ tied }} )) { $tie; }
		else { (); }
	} @$tied;

	if( $self->{ complete } ) {
		# Complete, unresolved
		if( @$tied ) { 
			$self->{ tied } = $tied;       
			if( $self->{ round } eq 'fin' ) {
				my $first = $tied->[ 0 ]{ tied }[ 0 ];
				$self->{ current } = $first;
			}
			$self->{ round } = 'tb';

		# Complete, resolved
		} else { 
			$self->{ placements } = $placements; 
		}
	} else {
		$self->{ placements } = $placements; 
		$self->{ pending } = [ grep { ! $self->{ athletes }[ $_ ]{ complete } } ( 0 .. $#{ $self->{ athletes }}) ];
	}
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self     = shift;
	my $judges   = $self->{ judges };
	my $complete = 1;

	foreach my $athlete (@{ $self->{ athletes }}) {
		my $stats    = { min => 0, max => 0, sum => 0.0, tb => 0.0 };
		my $done     = 0;
		my $resolved = 0;

		# ===== CALCULATE SCORES
		foreach my $j (0 .. $#{ $athlete->{ scores }}) {
			my $score = $athlete->{ scores }[ $j ];
			$stats->{ sum } += $score;
			$stats->{ min }  = $score < $athlete->{ scores }[ $stats->{ min }] ? $j : $stats->{ min };
			$stats->{ max }  = $score > $athlete->{ scores }[ $stats->{ max }] ? $j : $stats->{ max };
			$done++ if( $score > 0 );
		}
		$athlete->{ complete } = ($judges == $done);

		# ===== CALCULATE TIEBREAKERS
		foreach my $j ( 0 .. $#{ $athlete->{ tiebreakers }} ) {
			my $score = $athlete->{ tiebreakers }[ $j ];
			$stats->{ tb } += $score;
			$resolved++ if( $score > 0 );
		}
		$athlete->{ tb } = $resolved ? $stats->{ tb } : undef;

		# ===== IF THE SCORES ARE ALL THE SAME, THEN THE MIN WILL EQUAL MAX, SO DIFFERENTIATE THEM
		$stats->{ max }++ if( $stats->{ min } == $stats->{ max });

		if( $judges <= 3 ) { $athlete->{ score } = $stats->{ sum }; } 
		else {
			$athlete->{ min }   = $stats->{ min };
			$athlete->{ max }   = $stats->{ max };
			$athlete->{ score } = $stats->{ sum } - ($athlete->{ scores }[ $stats->{ min }] + $athlete->{ scores }[ $stats->{ max }]);
		}
		$complete &&= $athlete->{ complete };
	}
	$self->{ complete } = $complete;
}

# ============================================================
sub current_bracket {
# ============================================================
	my $self = shift; return undef unless exists $self->{ brackets } && defined $self->{ brackets };
	my $i    = $self->{ current };
	my $j    = 0;
	my $k    = int( @{$self->{ brackets }[ $j ]});

	while( $i >= $k ) {
		$i -= $k;
		$j++;
		$k = int( @{$self->{ brackets }[ $j ]});
	}

	return $self->{ brackets }[ $j ][ $i ];
}

# ============================================================
sub current_round {
# ============================================================
	my $self = shift; return undef unless exists $self->{ brackets } && defined $self->{ brackets };
	my $i    = $self->{ current };
	my $j    = 0;
	my $k    = int( @{$self->{ brackets }[ $j ]});

	while( $i >= $k ) {
		$i -= $k;
		$j++;
		$k = int( @{$self->{ brackets }[ $j ]});
	}

	return $self->{ brackets }[ $j ];
}

# ============================================================
sub is_single_elimination {
# ============================================================
	my $self = shift;
	return exists $self->{ mode } && $self->{ mode } eq 'single-elimination';
}

# ============================================================
sub navigate {
# ============================================================
	my $self  = shift;
	my $index = shift;

	$self->{ current } = $index;
}

# ============================================================
sub next {
# ============================================================
	my $self = shift;
	if( $self->is_single_elimination() ) {
		my $i = $self->{ current };
		my $j = 0;
		my $k = int( @{$self->{ brackets }[ $j ]});

		while( $i >= $k ) {
			$i -= $k;
			$j++;
			$k = int( @{$self->{ brackets }[ $j ]});
		}

		my $last    = $i == ($k - 1);
		my $no_next = ! defined $self->{ brackets }[ $j + 1 ];

		if   ( $k == 1           ) { $self->{ current } = 0; } # Finals round
		elsif( $last && $no_next ) { $self->{ current } = 0; } # No next round, so go to beginning of round
		else                       { $self->{ current }++;   } # Any other round

	} else {
		$self->SUPER::next();
	}
}

# ============================================================
sub previous {
# ============================================================
	my $self = shift;
	if( $self->is_single_elimination() ) {
		my $i   = $self->{ current };
		my $j   = 0;
		my $k   = int( @{$self->{ brackets }[ $j ]});
		my $max = $k;

		while( $i >= $k ) {
			$i -= $k;
			$j++;
			$k = int( @{$self->{ brackets }[ $j ]});
			$max += $k;
		}

		$max += int( @{ $self->{ brackets }[ $j + 1 ]}) if defined $self->{ brackets }[ $j + 1 ];

		my $start = $self->{ current } == 0;
		if( $start ) { $self->{ current } = ($max - 1); }
		else         { $self->{ current }--; }

	} else {
		$self->SUPER::previous();
	}
}

# ============================================================
sub record_vote {
# ============================================================
	my $self   = shift;
	my $judge  = shift;
	my $vote   = shift;
	my $judges = $self->{ judges };

	my $bracket = $self->current_bracket();
	my $blue    = $bracket->{ blue }{ votes };
	my $red     = $bracket->{ red }{ votes };

	if   ( $vote eq 'blue'  ) { $blue->[ $judge ] = 1; $red->[ $judge ] = 0; }
	elsif( $vote eq 'red'   ) { $blue->[ $judge ] = 0; $red->[ $judge ] = 1; }
	elsif( $vote eq 'clear' ) { $blue->[ $judge ] = 0; $red->[ $judge ] = 0; }

	# Score is complete when all judges have voted
	foreach my $i ( 0 .. $judges - 1 ) {
		my $voted = $blue->[ $i ] || $red->[ $i ];
		return 0 unless $voted;
	}
	return 1;
}

# ============================================================
sub record_score {
# ============================================================
	my $self   = shift;
	my $judge  = shift;
	my $score  = shift;
	my $judges = $self->{ judges };

	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	$athlete->{ scores }[ $judge ] = $score;

	# Score is complete when all judges have scored
	foreach my $i ( 0 .. $judges - 1 ) {
		my $scored = $athlete->{ scores }[ $i ] > 0;
		return 0 unless $scored;
	}
	return 1;
}

# ============================================================
sub record_tiebreaker {
# ============================================================
	my $self   = shift;
	my $judge  = shift;
	my $score  = shift;
	my $judges = $self->{ judges };
	my $tie    = $self->{ tied }[ 0 ];

	# Two-way tie
	if( (int( @{ $tie->{ tied }}) == 2) && ($score eq 'red' || $score eq 'blue')) {
		my $blue = $self->{ athletes }[ $tie->{ tied }[ 0 ] ];
		my $red  = $self->{ athletes }[ $tie->{ tied }[ 1 ] ];
		if      ( $score eq 'blue' ) { 
			$blue->{ tiebreakers }[ $judge ] = 1;
			$red->{ tiebreakers }[ $judge ]  = 0;

		} elsif ( $score eq 'red'  ) {
			$blue->{ tiebreakers }[ $judge ] = 0;
			$red->{ tiebreakers }[ $judge ]  = 1;
		}

		# Score is complete when all judges have voted
		foreach my $i ( 0 .. $judges - 1 ) {
			my $voted = $blue->{ tiebreakers }[ $i ] || $red->{ tiebreakers }[ $i ];
			return 0 unless $voted;
		}
		return 1;

	# N-way tie (N > 2)
	} else {
		$score      = sprintf( "%.1f", $score );
		my $i       = $self->{ current };
		my $athlete = $self->{ athletes }[ $i ];
		$athlete->{ tiebreakers }[ $judge ] = $score;

		# Score is complete when all judges have scored
		foreach my $i ( 0 .. $judges - 1 ) {
			my $scored = $athlete->{ tiebreakers }[ $i ] > 0;
			return 0 unless $scored;
		}
		return 1;
	}
}

# ============================================================
sub update_brackets {
# ============================================================
	my $self   = shift;
	my $judges = $self->{ judges };
	my $rounds = $#{ $self->{ brackets }};

	foreach my $athlete ( @{ $self->{ athletes }}) { $athlete->{ score } = 0; }

	foreach my $r ( 0 .. $rounds ) {
		my $round    = $self->{ brackets }[ $r ];
		my $complete = 1;
		my $next     = $r + 1;
		foreach my $bracket (@$round) {
			my $i      = $bracket->{ blue }{ athlete };
			my $j      = $bracket->{ red }{ athlete };
			my $blue   = sum( @{$bracket->{ blue }{ votes }});
			my $red    = sum( @{$bracket->{ red }{ votes }});
			my $winner = undef;
			if( $blue > $red ) { $winner = $i; } elsif( $red > $blue ) { $winner = $j; }

			$self->{ athletes }[ $winner ]{ score }++ if defined $winner; # Give the winner a point

			my $total = sum( @{$bracket->{ blue }{ votes }}, @{$bracket->{ red }{ votes }});
			if( $total < $judges ) { $complete = 0; last; }
		}

		last if( int( @$round ) == 1 ); # If the round only has one match, then that is the final round; there is no next round

		# ===== BUILD OR UPDATE THE NEXT ROUND OF BRACKETS
		my $update    = $rounds >= $next;
		my $new_round = [];
		push @{$self->{ brackets }}, $new_round unless( $update );
		my $next_round = defined $self->{ brackets }[ $next ] ? $self->{ brackets }[ $next ] : [];

		for( my $i = 0; $i < $#$round; $i += 2 ) {
			my $j = $i + 1;
			my $a = $round->[ $i ];
			my $b = $round->[ $j ];

			my $advances = [];
			foreach my $bracket ( $a, $b ) {
				my $blue  = $bracket->{ blue };
				my $red   = $bracket->{ red };
				my $votes = { blue => sum( @{ $blue->{ votes }}), red => sum( @{ $red->{ votes }}) };
				if   ( $votes->{ blue } > $votes->{ red } ) { push @$advances, $blue->{ athlete }; }
				elsif( $votes->{ red } > $votes->{ blue } ) { push @$advances, $red->{ athlete };  }
			}
			my $blue    = { athlete => shift @$advances, votes => [(0) x $judges] };
			my $red     = { athlete => shift @$advances, votes => [(0) x $judges] };
			my $bracket = { blue => $blue, red => $red };

			if( $update ) {
				my $k = int( $i / 2 );
				my $before      = $next_round->[ $k ];
				my $same_blue   = $before->{ blue }{ athlete } == $blue->{ athlete };
				my $same_red    = $before->{ red }{ athlete }  == $red->{ athlete };
				my $dont_update = $same_blue && $same_red; # No changes, don't update

				next if( $dont_update );

				$before->{ blue }{ athlete } = $blue->{ athlete };
				$before->{ red }{ athlete }  = $red->{ athlete };

			} else {
				push @$next_round, $bracket;
			}
		}
	}
}

# ============================================================
sub write {
# ============================================================
	my $self     = shift;

	$self->calculate_scores();
	$self->calculate_placements();

	my $json     = new JSON::XS();
	my $brackets = exists $self->{ brackets } ? $json->canonical->encode( $self->{ brackets } ) : undef;
	my $tied     = join ";", (map { $_->{ place } . ':' . join( ",", @{ $_->{ tied }} ); } @{ $self->{ tied }}) if exists $self->{ tied };
	my $places   = join ",", (map { join( ":", $_->{ place }, $_->{ medals } ); } @{ $self->{ places }}) if exists $self->{ places };
	$self->{ state } = 'tiebreaker' if( exists $self->{ tied } && $self->{ state } eq 'score');

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# round=$self->{ round }\n" if exists $self->{ round };
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n" if exists $self->{ description };
	print FILE "# mode=$self->{ mode }\n" if $self->{ mode };
	print FILE "# places=$places\n" if $places;
	print FILE "# tied=$tied\n" if( exists $self->{ tied } && @{ $self->{ tied }});
	print FILE "# placements=" . join( ",", @{$self->{ placements }}) . "\n" if( exists $self->{ placements } && @{ $self->{ placements }});
	print FILE "# pending=" . join( ",", @{$self->{ pending }}) . "\n" if( exists $self->{ pending } && @{ $self->{ pending }});
	print FILE "# brackets=$brackets\n" if defined $brackets;
	foreach my $athlete (@{ $self->{ athletes }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @{ $athlete->{ scores }}, @{ $athlete->{ tiebreakers }} ), "\n";
	}
	close FILE;
	chmod 0666, $self->{ file };

	return 1;
}

# ============================================================
sub _build_brackets {
# ============================================================
	my $judges       = shift;
	my $brackets     = shift;
	my $athletes     = shift;
	my $byes         = shift || 0;

	my $number       = int( @$athletes );                 # Total number of athletes
	my $total        = $number + $byes;                   # Total number in round (might not be power of 2 for initial call)
	my $depth        = ceil( log( $total ) / log( 2 ));   # Depth of the tree
	my $size         = 2 ** $depth;                       # Size of the division
	my $group_size   = $size / 2;                         # Size of the subdivisions
	my $number_b     = int( $number/ 2 );                 # Number of athletes in Group B
	my $number_a     = $number - $number_b;               # Number of athletes in Group A
	my $byes_a       = $group_size - $number_a;           # Number of byes for Group A
	my $byes_b       = $group_size - $number_b;           # Number of byes for Group B
	my $a            = [];                                # Group A
	my $b            = [];                                # Group B

	@$a = splice @$athletes, 0, $number_a;
	@$b = @$athletes;

	if( $group_size <= 1 ) {
		my $blue = $a->[ 0 ];
		my $bye  = @$b ? undef : 1;
		my $red  = @$b ? $b->[ 0 ] : undef;
		my $bracket = $bye ?
		{
			blue => { athlete => $blue, votes => [ (1) x $judges ] },
			red  => { athlete => undef, votes => [ (0) x $judges ] },
		} : {
			blue => { athlete => $blue, votes => [ (0) x $judges ] },
			red  => { athlete => $red,  votes => [ (0) x $judges ] },
		};

		push @{$brackets->[ 0 ]}, $bracket;

		return;
	}

	_build_brackets( $judges, $brackets, $a, $byes_a);
	_build_brackets( $judges, $brackets, $b, $byes_b);
}

# ============================================================
sub _compare {
# ============================================================
# High-Low tiebreaker: check high scores, then low scores
# Tiebreaker scores: resolve ties by votes or by scores
	my $a      = shift;
	my $b      = shift;
	my $judges = shift;

	my $score = sprintf( "%.1f", $b->{ score } ) <=> sprintf( "%.1f", $a->{ score } );
	my $high  = { a => sprintf( "%.1f", $a->{ scores }[ $a->{ max } ]), b => sprintf( "%.1f", $b->{ scores }[ $b->{ max } ])};
	my $low   = { a => sprintf( "%.1f", $a->{ scores }[ $a->{ min } ]), b => sprintf( "%.1f", $b->{ scores }[ $b->{ min } ])};
	my $hi    = ($score == 0 && $judges > 3) ? $high->{ b } <=> $high->{ a } : 0;
	my $lo    = ($score == 0 && $judges > 3) ? $low->{ b }  <=> $low->{ a }  : 0;
	my $tb    = (defined $a->{ tb } && defined $b->{ tb }) ? sprintf( "%.1f", $b->{ tb } ) <=> sprintf( "%.1f", $a->{ tb } ) : 0; 

	if( $hi > 0 ) { $b->{ notes } = 'H';  } elsif( $hi < 0 ) { $a->{ notes } = 'H';  }
	if( $lo > 0 ) { $b->{ notes } = 'L';  } elsif( $lo < 0 ) { $a->{ notes } = 'L';  }
	if( $tb > 0 ) { $b->{ notes } = 'TB'; } elsif( $tb < 0 ) { $a->{ notes } = 'TB'; }

	return $score || $hi || $lo || $tb;
}

1;
