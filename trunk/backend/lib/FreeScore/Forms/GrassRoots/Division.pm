package FreeScore::Forms::GrassRoots::Division;
use FreeScore;
use FreeScore::Forms::Division;
use JSON::XS;
use base qw( FreeScore::Forms::Division Clone );
use POSIX qw( ceil );
use List::Util qw( shuffle sum );
use Data::Dumper;

# ============================================================
sub read {
# ============================================================
	my $self  = shift;

	my $index = 0;
	$self->{ judges } = 3; # Default value
	$self->{ places } = [ { place => 1, medals => 1 }, { place => 2, medals => 1 }, { place => 3, medals => 2 } ];
	$self->{ round }  = 'fin';

	my $json = new JSON::XS();

	open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/, $_, 2;
			if    ( $key eq 'placements' ) { $self->{ $key } = [ split( /,/, $value ) ]; }
			elsif ( $key eq 'brackets'   ) { $self->{ $key } = $json->decode( $value ); }
			elsif ( $key eq 'videos'     ) { $self->{ $key } = $json->decode( $value ); }
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
		# First column is the name of the athlete.
		#
		# Second column may be the rank of the athlete.
		#
		# All other columns must be a score, tiebreaker, or key/value pair, where the value can be
		# either plain text or a JSON object
		my @columns     = split /\t/;
		my $name        = shift @columns; # first column is name
		my $rank        = undef;
		my $n           = $self->{ judges } - 1;
		my @scores      = ();
		my @tb_scores   = ();
		my $info        = {};
		my $j           = 0;
		my $have_scores = 0;

		# All other columns may be a score, tiebreaker, or a key/value pair and values may be JSON or text
		foreach my $i ( 0 .. $#columns ) {
			my $value = $columns[ $i ];
			if( $i == 0 && $value =~ /^\w+/ || $value eq '' ) { $rank = $value; next; }
			if( $value =~ /=/ ) {
				my ($key, $val) = split /=/, $value, 2;
				if( $val =~ /^(?:\[|\{)/ ) { $val = $json->decode( $val ); }
				$info->{ $key } = $val;
				next;
			}
			if( $value =~ /^(?:\-|\d+|\d+\.\d+|r)$/ || ($value eq '' && $i > 0) ) {
				if( $have_scores ) {
					$tb_scores[ $j ] = _format_tiebreaker( $value );
				} else {
					$scores[ $j ] = _format_score( $value );
					$j++;
					if( $j >= $self->{ judges }) { $have_scores = 1; $j = 0; }
				}
			}
		}

		my $athlete = { name => $name, rank => $rank, info => $info, 'index' => $index, scores => [ @scores ], tiebreakers => [ @tb_scores ] };
		$athlete->{ info }{ video } = shift @{ $self->{ videos }} if( defined( $self->{ videos }));
		push @{ $self->{ athletes }}, $athlete;
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
		$self->{ pending }    = [ grep { ! $self->{ athletes }[ $_ ]{ complete } } ( 0 .. $#{ $self->{ athletes }}) ];
		$self->{ complete }   = @{$self->{ pending }} == 0;
	}
}

# ============================================================
sub change_display {
# ============================================================
	my $self = shift;
	if( $self->is_score() ) { $self->display() } else { $self->score(); }
	return $self->{ state };
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self     = shift;
	my $judges   = $self->{ judges };
	my $complete = 1;

	foreach my $athlete (@{ $self->{ athletes }}) {
		my $stats     = { min => 0, max => 0, sum => 0.0, tb => 0.0 };
		my $done      = 0;
		my $resolved  = 0;
		my $decision  = _decision( $athlete );
		my $penalties = reduce { $athlete->{ penalty }{ $round } } (qw( timelimit bounds other restart ));

		# ===== CALCULATE SCORES
		foreach my $j (0 .. $#{ $athlete->{ scores }}) {
			my $score = $athlete->{ scores }[ $j ];
			$stats->{ sum } += $score;
			$stats->{ min }  = $score < $athlete->{ scores }[ $stats->{ min }] ? $j : $stats->{ min };
			$stats->{ max }  = $score > $athlete->{ scores }[ $stats->{ max }] ? $j : $stats->{ max };
			$done++ if(( 0.0 + $score ) > 0 );
		}
		$athlete->{ complete } = ($judges == $done) || ($decision eq 'DSQ' || $decision eq 'WDR' );

		# ===== CALCULATE PENALTY DEDUCTIONS
		my $penalty = 0.0;
		$penalty += $penalties->{ $_ } foreach ( sort keys %{ $penalties });

		# ===== CALCULATE TIEBREAKERS
		foreach my $j ( 0 .. $#{ $athlete->{ tiebreakers }} ) {
			my $score = $athlete->{ tiebreakers }[ $j ];
			$stats->{ tb } += $score;
			$resolved++ if( $score > 0 );
		}
		$athlete->{ tb } = $resolved ? $stats->{ tb } : undef;

		# ===== IF THE SCORES ARE ALL THE SAME, THEN THE MIN WILL EQUAL MAX, SO DIFFERENTIATE THEM
		$stats->{ max }++ if( $stats->{ min } == $stats->{ max });

		if( $judges <= 3 ) {
			$athlete->{ score } = $stats->{ sum } - $penalty;
			if( $athlete->{ score } < 0 ) { $athlete->{ score } = 0.0 }
		} else {
			$athlete->{ min }   = $stats->{ min };
			$athlete->{ max }   = $stats->{ max };
			$athlete->{ score } = $stats->{ sum } - ($athlete->{ scores }[ $stats->{ min }] + $athlete->{ scores }[ $stats->{ max }]) - $penalty;
			if( $athlete->{ score } < 0 ) { $athlete->{ score } = 0.0 }
		}
		$complete &&= $athlete->{ complete };
	}
	$self->{ complete } = $complete;
}

# ============================================================
sub current_athlete {
# ============================================================
	my $self    = shift;
	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];
	return $athlete;
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
sub disqualify {
# ============================================================
	my $self   = shift;
	my $judge  = shift;
	my $score  = shift;
	my $judges = $self->{ judges };

	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	$athlete->{ info }{ decision } = 'DSQ';
	$athlete->{ complete } = 1;
}

# ============================================================
sub withdraw {
# ============================================================
	my $self   = shift;
	my $judge  = shift;
	my $score  = shift;
	my $judges = $self->{ judges };

	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	$athlete->{ info }{ decision } = 'WDR';
	$athlete->{ complete } = 1;
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
sub pool_judge_ready {
# ============================================================
#** @method ( size, judge )
#   @brief Indicates that the judge is ready to start scoring accuracy
#*
	my $self    = shift;
	my $size    = shift;
	my $jid     = shift;

	$self->{ poolsize } = $size;
	my $athlete = $self->current_athlete();
	my $want    = $self->{ judges };
	my $pool    = $athlete->{ info }{ pool } || {};

	return if exists $pool->{ $jid };
	$pool->{ $jid } = 'r';
	$athlete->{ info }{ pool } = $pool;

	return $self->pool_status();
}

# ============================================================
sub pool_status {
# ============================================================
#** @method ()
#   @brief Returns the pool status
#*
	my $self      = shift;
	my $athlete   = $self->current_athlete();
	my $size      = $self->{ poolsize };
	my $want      = $self->{ judges };
	my $pool      = $athlete->{ info }{ pool } || {};
	my $ready     = [ grep { $pool->{ $_ } eq 'r'                         } sort keys %$pool ];
	my $scored    = [ grep { $pool->{ $_ } ne 'r' && $pool->{ $_ } ne '-' } sort keys %$pool ];
	my $responded = [ sort ( @$ready, @$scored )];
	my $have      = int( @$scored );
	my $safety    = $size - $want;

	return { have => $have, want => $want, all => $size, safety => $safety, ready => $ready, scored => $scored, responded => $responded };
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
sub record_pool_score {
# ============================================================
#** @method ( score_object )
#   @brief Records the given score within a judge's pool for online tournaments
#*
	my $self    = shift;
	my $jid     = shift;
	my $score   = shift;

	my $athlete = $self->current_athlete();
	my $judges  = $self->{ judges };
	my $size    = $self->{ poolsize };
	my $pool    = $athlete->{ info }{ pool } || {};

	$self->{ state } = 'score'; # Return to the scoring state when any judge scores
	$pool->{ $jid }  = 0.0 + sprintf( "%.1f", $score );
	$athlete->{ info }{ pool } = $pool;

	my $response  = $self->pool_status();
	if( $response->{ have } < $response->{ want }) {
		$response->{ status } = 'in-progress';

	} elsif( $response->{ have } >= $size ) {
		$response->{ status } = 'complete';

	} elsif( $response->{ have } >= $response->{ want }) {
		$response->{ status } = 'ok';

	} else {
		$response->{ status } = 'error';
	}
	return $response;
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
sub record_penalty {
# ============================================================
#** @method ()
#   @brief Updates penalties
#*
	my $self     = shift;
	my $penalty  = shift;
	my $i        = shift;
	my $athletes = $self->{ athletes };
	my $round    = $self->{ round };

	return unless $i >= 0 && $i < @$athletes;
	$athletes->[ $i ]{ penalty }{ $round } = $penalty;
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
sub resolve_pool {
# ============================================================
#** @method ( score_object )
#   @brief Records the given score within a judge's pool for online tournaments
#*
	my $self    = shift;

	my $athlete = $self->current_athlete();
	my $judges  = $self->{ judges };
	my $size    = $self->{ poolsize };
	my $status  = $self->pool_status();
	my $scores  = $athlete->{ scores };
	my $pool    = $athlete->{ info }{ pool };
	my $scored  = int( grep { defined( $_ ) && $_ ne '-' } @$scores );

	$self->{ state } = 'score'; # Return to the scoring state when handling scores

	# ===== CASE 1: SUFFICIENT SCORES TO PROCEED WITH RESOLUTION
	print STDERR Dumper $status; # MW
	if( $status->{ have } >= $status->{ want }) {

		if     ( $scored > $judges ) {
			die "Data integrity error! There are more scores than judges for $athlete->{ name } $!";

		# POOL PREVIOUSLY RESOLVED
		} elsif( $scored == $judges ) {
			return { status => 'success', votes => $status->{ have }};

		# RESOLVE POOL BY RANDOMLY DRAWING SCORES;
		} elsif( $scored == 0 ) {
			my @scores = shuffle grep { $_ ne 'r' && $_ ne '-' && /^\d+(?:\.\d)?$/ } values %$pool; # Shuffle
			@scores = splice @scores, 0, $judges; # Take just enough scores
			$athlete->{ scores } = [ @scores ];
			return { status => 'success', votes => $status->{ have }};

		# SOME WEIRD PARTIAL RESOLUTION STATE
		} elsif( $scored > 0 && $scored < $judges ) {
			die "Data integrity error! $athlete->{ name } has been previously incompletely resolved $!";

		# SHOULD BE IMPOSSIBLE TO GET HERE
		} else {
			die "Data integrity error! $!";
		}
	} else {
		print STDERR "Insufficient judge scores to resolve the athlete score.\n";
	}
}

# ============================================================
sub update_brackets {
# ============================================================
	my $self      = shift;
	my $judges    = $self->{ judges };
	my $rounds    = $#{ $self->{ brackets }};
	my $round_ids = [ qw( finals semfin qtrfin ro16 ro32 ro64 ro128 ro256 )];

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
			my $bracket = { blue => $blue, red => $red, round => $round_ids->[ $rounds - $r ]};

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
	my $j        = int( $self->{ judges }) - 1;
	my $brackets = exists $self->{ brackets } ? $json->canonical->encode( $self->{ brackets } ) : undef;
	my $videos   = $self->{ athletes }[ 0 ]{ video } ? [ map { $_->{ video } } @{ $self->{ athletes }} ] : undef;
	my $tied     = join ";", (map { $_->{ place } . ':' . join( ",", @{ $_->{ tied }} ); } @{ $self->{ tied }}) if exists $self->{ tied };
	my $places   = join ",", (map { join( ":", $_->{ place }, $_->{ medals } ); } @{ $self->{ places }}) if exists $self->{ places };
	$self->{ state } = 'tiebreaker' if( exists $self->{ tied } && $self->{ state } eq 'score');
	$videos = @$videos ? $json->canonical->encode( $videos ) : undef;

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# round=$self->{ round }\n" if exists $self->{ round };
	print FILE "# poolsize=$self->{ poolsize }\n" if exists $self->{ poolsize } && $self->{ poolsize };
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n" if exists $self->{ description };
	print FILE "# mode=$self->{ mode }\n" if $self->{ mode };
	print FILE "# places=$places\n" if $places;
	print FILE "# tied=$tied\n" if( exists $self->{ tied } && @{ $self->{ tied }});
	print FILE "# placements=" . join( ",", @{$self->{ placements }}) . "\n" if( exists $self->{ placements } && @{ $self->{ placements }});
	print FILE "# pending=" . join( ",", @{$self->{ pending }}) . "\n" if( exists $self->{ pending } && @{ $self->{ pending }});
	print FILE "# brackets=$brackets\n" if defined $brackets;
	print FILE "# videos=$videos\n" if defined $videos;
	foreach my $athlete (@{ $self->{ athletes }}) {
		my @scores      = map { _format_score( $athlete->{ scores }[ $_ ])}           ( 0 .. $j );
		my @tiebreakers = map { _format_tiebreaker( $athlete->{ tiebreakers }[ $_ ])} ( 0 .. $j );
		my @info        = map { my $key = $_; my $value = ( ref $athlete->{ info }{ $_ } ? $json->canonical->encode( $athlete->{ info }{ $_ }) : $athlete->{ info }{ $_ }); "$key=$value"; } sort keys %{ $athlete->{ info }};
		print FILE join( "\t", @{$athlete}{qw( name rank )}, @scores, @tiebreakers, @info ), "\n";
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
	my $round_ids    = [ qw( finals semfin qtrfin ro16 ro32 ro64 ro128 ro256 )];

	@$a = splice @$athletes, 0, $number_a;
	@$b = @$athletes;

	if( $group_size <= 1 ) {
		my $blue  = $a->[ 0 ];
		my $bye   = @$b ? undef : 1;
		my $red   = @$b ? $b->[ 0 ] : undef;
		my $round = $round_ids->[ $depth ];
		my $bracket = $bye ?
		{
			round => $round,
			blue => { athlete => $blue, votes => [ (1) x $judges ] },
			red  => { athlete => undef, votes => [ (0) x $judges ] },
		} : {
			round => $round,
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

	my $d     = { a => _decision( $a ), b => _decision( $b )};
	if   ( $d->{ a } eq 'DSQ' && $d->{ b } ne 'DSQ' ) { return  1; }
	elsif( $d->{ a } ne 'DSQ' && $d->{ b } eq 'DSQ' ) { return -1; }
	elsif( $d->{ a } eq 'WDR' && $d->{ b } eq 'DSQ' ) { return -1; }
	elsif( $d->{ a } eq 'DSQ' && $d->{ b } eq 'WDR' ) { return  1; }
	elsif( $d->{ a } eq 'WDR' && $d->{ b } ne 'WDR' ) { return  1; }
	elsif( $d->{ a } ne 'WDR' && $d->{ b } eq 'WDR' ) { return -1; }

	my $score = 0 + sprintf( "%.1f", $b->{ score } ) <=> 0 + sprintf( "%.1f", $a->{ score } );
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

# ============================================================
sub _decision {
# ============================================================
	my $athlete = shift;
	return exists $athlete->{ info }{ decision } && $athlete->{ info }{ decision } ? $athlete->{ info }{ decision } : '';
};

# ============================================================
sub _format_score {
# ============================================================
	my $score = shift;
	if((! defined $score) || $score eq '' || $score eq '-' ) { return '-'; }
	return 0.0 + sprintf( "%.1f", $score );
}

# ============================================================
sub _format_tiebreaker {
# ============================================================
	my $tb = shift;
	if((! defined $tb) || $tb eq '' || $tb eq '-' ) { return '-'; }
	if( $tb == int( $tb )) { return int( $tb ); }
	else                   { return 0.0 + sprintf( "%.1f", $tb ); }
}

1;
