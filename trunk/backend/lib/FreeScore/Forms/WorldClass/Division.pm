package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use List::Util qw( all any none first shuffle reduce );
use List::MoreUtils qw( first_index );
use Try::Tiny;
use Data::Dumper;
use base qw( FreeScore::Forms::Division );
use strict;

#**
# Athlete data structure
# - athlete
#   - scores
#     - <round> (hash key string, e.g. prelim, semfin, finals)
#       - Round Object
#
# Round data structure (also see FreeScore::Forms::WorldClass::Division::Round)
# - [ form index ]
#   - complete
#   - penalties
#   - decision
#     - withdrawn
#     - disqualified
#   - judge
#     - [ judge index ]
#       - Score Object
#
# Score data structure (also see FreeScore::Forms::WorldClass::Division::Round::Score)
# - major
# - minor
# - power
# - rhythm
# - ki
#**

# ============================================================
sub assign {
# ============================================================
#** @method ( athlete_index, round )
#   @brief Assigns the athlete to a round
#*
	my $self       = shift;
	my $i          = shift;
	my $round      = shift;
	my $judges     = $self->{ judges };
	my $athlete    = $self->{ athletes }[ $i ];

	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no forms designated for round $!" unless exists $self->{ forms }{ $round };
	my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
	my $forms      = int( @compulsory );
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;

	# Do nothing if athlete is already assigned to the round
	return if( any { $_ == $i } @{ $self->{ order }{ $round }});

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	push @{ $self->{ order }{ $round }}, $i;
}

# ============================================================
sub assign_tiebreaker {
# ============================================================
#** @method ( athlete )
#   @brief Assigns the athlete to a tiebreaker round.
#*
	my $self       = shift;
	my $athlete    = shift;
	my $judges     = $self->{ judges } - 1;
	my $round      = $self->{ round };
	my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
	my $forms      = int( @compulsory );

	if( exists $self->{ forms }{ $round } ) {
		my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
		my $tiebreaker = int( @compulsory ); # Tiebreaker form index is after the last compulsory form
		$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
		$athlete->{ scores }{ $round }->add_tiebreaker( $judges, $tiebreaker );
	}
}

# ============================================================
sub distribute_evenly {
# ============================================================
#** @method ( group_name_array, athlete_array )
#   @brief Uniformly distributes the athletes across the array of groups for bracketed round assignments
#*
	my $self   = shift;
	my $groups = shift;
	my $queue  = shift || [ ( 0 .. $#{ $self->{ athletes }} ) ];
	my $i      = 0;
	my $k      = int( @$groups );
	while( @$queue ) {
		my $j     = shift @$queue;
		my $group = $groups->[ $i ];
		$self->assign( $j, $group );
		$i = ($i + 1) % $k;
	}
}

# ============================================================
sub place_athletes {
# ============================================================
#** @method ()
#   @brief Calculates placements for the current round. Auto-updates score averages.
#*
	my $self      = shift;
	my $round     = $self->{ round };
	my $placement = [];

	# ===== ASSEMBLE THE RELEVANT COMPULSORY AND TIEBREAKER SCORES
	my @athlete_indices = ( 0 .. $#{ $self->{ athletes }} );
	my $scores = [ map {
		my $compulsory = $self->select_compulsory_round_scores( $_, $round );
		my $tiebreaker = $self->select_tiebreaker_round_scores( $_, $round );
		{ compulsory => $compulsory, tiebreaker => $tiebreaker }
	} @athlete_indices ];

	# ===== SORT THE ATHLETES BY COMPULSORY FORM SCORES, THEN TIE BREAKER SCORES
	@$placement = sort { 
		# ===== COMPARE BY COMPULSORY ROUND SCORES
		my $x = $scores->[ $a ]{ compulsory };
		my $y = $scores->[ $b ]{ compulsory };
		my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ); 

		# ===== CALCULATE STATISTICS IN CASE OF TIES
		my $x_stats = { sum => 0, pre => 0, all => 0 };
		$x_stats->{ sum } += $_->{ adjusted_mean }{ total }        foreach @$x;
		$x_stats->{ pre } += $_->{ adjusted_mean }{ presentation } foreach @$x;
		$x_stats->{ all } += $_->{ complete_mean }{ total }        foreach @$x;
		$x_stats->{ $_ } = sprintf( "%5.2f", $x_stats->{ $_ } )    foreach (qw( sum pre all ));

		my $y_stats = { sum => 0, pre => 0, all => 0 };
		$y_stats->{ sum } += $_->{ adjusted_mean }{ total }        foreach @$y;
		$y_stats->{ pre } += $_->{ adjusted_mean }{ presentation } foreach @$y;
		$y_stats->{ all } += $_->{ complete_mean }{ total }        foreach @$y;
		$y_stats->{ $_ } = sprintf( "%5.2f", $y_stats->{ $_ } )    foreach (qw( sum pre all ));

		# ===== DETECT TIES AND APPLY AUTOMATED TIE-RESOLUTION
		# P: Presentation score, HL: High/Low score, TB: Tie-breaker form required
		if( $x_stats->{ sum } == $y_stats->{ sum } ) {
			if    ( $x_stats->{ pre } > $y_stats->{ pre } ) { $self->{ athletes }[ $a ]{ notes } = 'P'; }
			elsif ( $x_stats->{ pre } < $y_stats->{ pre } ) { $self->{ athletes }[ $b ]{ notes } = 'P'; }
			else {
				if    ( $x_stats->{ all } > $y_stats->{ all } ) { $self->{ athletes }[ $a ]{ notes } = 'HL'; }
				elsif ( $x_stats->{ all } < $y_stats->{ all } ) { $self->{ athletes }[ $b ]{ notes } = 'HL'; }
				else {
					$self->{ athletes }[ $a ]{ notes } = 'TB';
					$self->{ athletes }[ $b ]{ notes } = 'TB';
				}
			}
		}

		# ===== COMPARE BY TIE-BREAKERS IF TIED
		if( _is_tie( $comparison )) {
			my $x = $scores->[ $a ]{ tiebreaker };
			my $y = $scores->[ $b ]{ tiebreaker };
			$comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ); 
		}

		$comparison;
	} @athlete_indices;

	# ===== ASSIGN PLACEMENTS
	my $half = int( (int(@{ $self->{ athletes }}) + 1) /2 );
	my $n    = 0;
	if( $self->{ places }{ $round }[ 0 ] eq 'half' ) { $n = $half; }
	else  { $n = reduce { $a + $b } @{ $self->{ places }{ $round }} };
	@$placement = grep { defined $self->{ athletes }[ $_ ]{ scores }{ $round };     } @$placement; # Athlete is assigned to round
	@$placement = grep { $self->{ athletes }[ $_ ]{ scores }{ $round }->complete(); } @$placement; # Athlete's score is complete
	@$placement = splice( @$placement, 0, $n );

	$self->{ placement }{ $round } = $placement;

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$self->{ order }{ $round }} ];
	@$pending   = grep { ! $self->{ athletes }[ $_ ]{ scores }{ $round }->complete(); } @$pending; # Athlete's score is NOT complete

	$self->{ pending }{ $round } = $pending;
}

# ============================================================
sub detect_ties {
# ============================================================
#** @method ()
#   @brief Identifies ties in the current round.
#*
	my $self      = shift;
	my $ties      = [];
	my $round     = $self->{ round };
	my $placement = $self->{ placement }{ $round };

	# ===== DETECT TIES BY LOOKING AT PAIRS OF SCORES
	my $i = 0;
	my $k = int(@{$self->{ athletes }});
	while( $i < $k ) {
		my $a = $placement->[ $i ];
		my $x = $self->select_compulsory_round_scores( $a, $round );

		my $j = $i + 1;
		while( $j < $k ) {
			my $b = $placement->[ $j ];
			my $y = $self->select_compulsory_round_scores( $b, $round );
			my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y );

			# ===== IF TIE DETECTED, GROW THE LIST OF TIED ATHLETES FOR THE GIVEN PLACEMENT
			if( _is_tie( $comparison )) {
				push @{ $ties->[ $i ]}, $j; 
				$j++;

			# ===== OTHERWISE LOOK AT NEXT PLACE
			} else { last; }
		}
		$i = $j;
	}

	# ===== FILTER UNIMPORTANT TIES
	$i = 0;
	my $places   = $self->{ places };
	my $medals   = $places->{ $round }[ $i ];
	my $athletes = 0;
	while( $i < $k && $medals ) {
		if    ( ref( $ties->[ $i ])) { $athletes += int( @{ $ties->[ $i ]}); } 
		elsif ( $athletes == 0     ) { $athletes  = 1; }

		my $gave = $medals >= $athletes ? $athletes : $medals;

		# ===== IF THERE ARE ENOUGH MEDALS, EACH ATHLETE GETS ONE MEDAL
		# No need for a tie breaker
		if( $medals >= $athletes ) {
			$medals -= $athletes;
			$athletes = 0;
			$ties->[ $i ] = undef;

		# ===== OTHERWISE GIVE AWAY ALL MEDALS; SOME ATHLETES WILL STILL NEED MEDALS
		} else {
			$athletes -= $medals;
			$medals = 0;
		}

		$i += $gave;
		$medals += $places->{ $round }[ $i ];
	}

	# ===== IGNORE ALL OTHER TIES
	splice( @$ties, $i);

	return $ties;
}

# ============================================================
sub edit_athletes {
# ============================================================
	my $self  = shift;
	my $edits = shift;
	my $round = shift || $self->{ round };

	my $order       = $self->{ order }{ $round };
	my $reorder     = [];
	
	for my $i ( 0 .. $#$edits ) {
		my $j       = $edits->[ $i ]{ order } - 1; # Get the athlete's previous relative order index
		my $k       = $order->[ $j ]; # If the athlete is already in the round, get the athlete id (original index);
		my $athlete = undef;

		if( defined $k ) {
			$athlete = $self->{ athletes }[ $k ]; # Retrieve the athlete
		} else {
			$athlete = { info => {} };
			push @{ $self->{ athletes }}, $athlete;
			$k = $#{ $self->{ athletes }};
		}
		push @$reorder, $k;

		$athlete->{ name } = $edits->[ $i ]{ name };
	}

	# Create a placeholder athlete if user has deleted all athletest (no athlete has a name)
	if( all { $_->{ name } =~ /^\s*$/; } @$edits ) { $self->{ athletes }[ 0 ] = { name => 'First Athlete', info => {} }; }

	$self->{ order }{ $round } = $reorder;
	$self->normalize();
}

# ============================================================
sub get_only {
# ============================================================
#** @method ( judge_index )
#   @brief Erases all scores except the given judge; used prior to sending updates to a judge
#*
	my $self  = shift;
	my $judge = shift;
	my $round = $self->{ round };

	foreach my $athlete (@{ $self->{ athletes }}) {
		$athlete->{ scores } = { $round => $athlete->{ scores }{ $round } };
		foreach my $form (@{$athlete->{ scores }{ $round }}) {
			next unless exists $form->{ judge };
			$form->{ judge } = [ $form->{ judge }[ $judge ] ];
		}
	}
}

# ============================================================
sub normalize {
# ============================================================
#** @method ()
#   @brief Normalizes the division object.
#*
	my $self   = shift;
	my $judges = $self->{ judges };
	my $round  = $self->{ round };

	# ===== ASSIGN ALL ATHLETES TO THE DEFINED ROUND
	if( defined $round ) {
		die "Division Configuration Error: No forms defined for round '$round' $!" unless defined $self->{ forms }{ $round };
		my $order = $self->{ order }{ $round };
		if( ! (defined $order && int( @$order ))) { $self->assign( $_, $round ) foreach ( 0 .. $#{ $self->{ athletes }} ); } 

	# ===== NO ROUND DEFINED; FIGURE OUT WHICH ROUND TO START WITH, GIVEN THE NUMBER OF ATHLETES
	} else {
		my $n        = int( @{ $self->{ athletes }} );
		my $half     = int( ($n-1)/2 );

		if    ( $n >= 20 ) { $round = 'prelim'; $self->assign( $_, 'prelim' ) foreach ( 0 .. $#{ $self->{ athletes }} ); }
		elsif ( $n >=  8 ) { $round = 'semfin'; $self->assign( $_, 'semfin' ) foreach ( 0 .. $#{ $self->{ athletes }} ); }
		else { 
			# ===== COMBINATION METHOD USES SINGLE ELIMINATION IN FINAL ROUND
			if( $self->{ method } eq 'combination' ) {
				if    ( $n > 4 ) { $round = 'ro8a'; $self->distribute_evenly( [ qw( ro8a ro8d ro8b ro8c ) ] ); } 
				elsif ( $n > 2 ) { $round = 'ro4a'; $self->distribute_evenly( [ qw( ro4a ro4b ) ] ); } 
				else             { $round = 'ro2';  $self->distribute_evenly( [ qw( ro2 ) ] ); }

			# ===== CUTOFF METHOD USES SAME METHODOLOGY AS BEFORE
			} else { $round = 'finals'; $self->assign( $_, 'finals' ) foreach ( 0 .. $#{ $self->{ athletes }} ); }
		}
	}

	# ===== NORMALIZE THE SCORING MATRIX
	my $forms  = int( @{ $self->{ forms }{ $round }});
	my @rounds = grep { my $order = $self->{ order }{ $_ }; defined $order && int( @$order ); } @FreeScore::Forms::WorldClass::Division::round_order;
	foreach my $round (@rounds) {
		foreach my $i (@{ $self->{ order }{ $round }}) {
			my $athlete = $self->{ athletes }[ $i ];
			$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
		}
	}

	$self->{ current } = $self->athletes_in_round( 'first' ) unless defined $self->{ current };
}

# ============================================================
sub record_score {
# ============================================================
#** @method ( judge_index, score_object )
#   @brief Records the given score for the given judge
#*
	my $self    = shift;
	my $judge   = shift;
	my $score   = shift;

	my $athlete = $self->{ athletes }[ $self->{ current } ];
	my $round   = $self->{ round };
	my $form    = $self->{ form };
	my $forms   = int( @{ $self->{ forms }{ $round }});
	my $judges  = $self->{ judges };

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	$athlete->{ scores }{ $round }->record_score( $form, $judge, $score );
}

# ============================================================
sub record_penalties {
# ============================================================
#** @method ( penalty_object )
#   @brief Records the given penalties
#*
	my $self      = shift;
	my $penalties = shift;

	my $athlete   = $self->{ athletes }[ $self->{ current } ];
	my $round     = $self->{ round };
	my $form      = $self->{ form };
	my $forms     = int( @{ $self->{ forms }{ $round }});
	my $judges    = $self->{ judges };

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	$athlete->{ scores }{ $round }->record_penalties( $form, $penalties );
}

# ============================================================
sub record_decision {
# ============================================================
#** @method ( punitive_declaration_text )
#   @brief Records the given punitive decision
#*
	my $self      = shift;
	my $decision    = shift;

	my $athlete   = $self->{ athletes }[ $self->{ current } ];
	my $round     = $self->{ round };
	my $form      = $self->{ form };
	my $forms     = int( @{ $self->{ forms }{ $round }});
	my $judges    = $self->{ judges };

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	$athlete->{ scores }{ $round }->record_decision( $form, $decision );
	$self->next_athlete();
}

# ============================================================
sub remove_from_list {
# ============================================================
#** @method ( list_name, athlete_index )
#   @brief Removes the given athlete from the given list
#*
	my $self = shift;
	my $list = shift;
	my $i    = shift;

	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ $list }{ $round };
		@{$self->{ $list }{ $round }} = map { 
			if    ( $_ == $i ) { ();     }
			elsif ( $_ >  $i ) { $_ - 1; }
			else               { $_;     }
		} @{ $self->{ $list }{ $round }};
	}
}

# ============================================================
sub remove_athlete {
# ============================================================
#** @method ( athlete_index )
#   @brief Removes the given athlete from the division
#*
	my $self = shift;
	my $i    = shift;

	# Remove athlete
	my $athlete = splice( @{ $self->{ athletes }}, $i, 1 );

	# Update round orders, placement, and pending
	$self->remove_from_list( 'order',     $i );
	$self->remove_from_list( 'placement', $i );
	$self->remove_from_list( 'pending',   $i );

	return $athlete;
}

# ============================================================
sub reorder {
# ============================================================
#** @method ( reorder_object )
#   @brief Applies reordering request to the division
#*
	my $self      = shift;
	my $reorder   = shift;
	my $index     = $reorder->{ index };
	my $round     = $reorder->{ round };
	my $move      = $reorder->{ move };
	my $order     = $self->{ order }{ $round };
	my $i         = first_index { $_ == $index; } @$order;

	return if( $i < 0 );

	if      ( $move eq 'up' ) {
		my $j = $i - 1;
		@{$order}[ $j, $i ] = @{$order}[ $i, $j ];

	} elsif ( $move eq 'down' ) {
		my $j = $i + 1;
		@{$order}[ $i, $j ] = @{$order}[ $j, $i ];

	} elsif ( $move eq 'last' ) {
		splice( @$order, $i, 1 );
		push @$order, $index;
	}
}

# ============================================================
sub read {
# ============================================================
#** @method ()
#   @brief Reads the division from the database
#*
	my $self  = shift;

	# ===== DEFAULTS
	$self->{ state }   = 'score';
	$self->{ places }  = _parse_places( 'prelim:half;semfin:8;finals:1,1,2' );

	my $round    = 'autodetect_required';
	my $order    = {};
	my $athletes = {};
	my $athlete  = {};
	open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/; # Skip empty or pure whitespace lines

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			if( /=/ ) {
				s/^#\s+//;
				my ($key, $value) = split /=/;
				if    ( $key eq 'forms'     ) { $self->{ $key } = _parse_forms( $value );     }
				elsif ( $key eq 'places'    ) { $self->{ $key } = _parse_places( $value );    }
				elsif ( $key eq 'placement' ) { $self->{ $key } = _parse_placement( $value ); }
				else                          { $self->{ $key } = $value;                     }

				$round = $self->{ round } if( defined $self->{ round } );

			} elsif( /prelim|semfin|finals|ro8[abcd]|ro4[ab]|ro2/i ) {
				s/^#\s+//;

				# Store the last athlete
				if( $athlete->{ name } ) {
					push @{ $order->{ $round }}, $athlete->{ name } if( $athlete->{ name } );
					$athlete = {};
				}

				# Assign round
				$round = $_;

			}
		# ===== READ ATHLETE INFORMATION
		} elsif( /^\w/ ) {
			die "Division Configuration Error: Number of Judges not defined before athlete information" unless $self->{ judges };
			die "Division Configuration Error: Forms not defined before athlete information"            unless $self->{ forms };

			# Store the current athlete before starting a new athlete
			if( $athlete->{ name } ) {
				push @{ $order->{ $round }}, $athlete->{ name } if( $athlete->{ name } );
				$athlete = {};
			}

			my ($name, @info) = split /\t/;

			# Reload the athlete seen from a previous round or...
			if( exists $athletes->{ $name } ) {
				$athlete = $athletes->{ $name };

			# Start a new athlete
			} else {
				$athlete->{ name }   = $name;
				$athlete->{ info }   = { map { my ($key, $value) = split /=/, $_, 2; ($key => $value); } @info };
				$athlete->{ scores } = {};

				$athletes->{ $athlete->{ name } } = $athlete; 
			}

		# ===== READ ATHLETE SCORES
		} elsif( /^\t\w/ ) {
			s/^\t//;
			my ($score_round, $form, $judge, @score_criteria) = split /\t/;
			$form  =~ s/f//; $form  = int( $form )  - 1; die "Division Configuration Error: Invalid form index '$form' $!"   unless $form  >= 0;

			# Scores are ordered by judge number (ref, 1, 2, etc.)
			if    ( $judge =~ /^[jr]/ ) {
				$judge =~ s/j//; $judge = $judge =~ /^r/ ? 0 : int( $judge ); die "Division Configuration Error: Invalid judge index '$judge' $!" unless $judge >= 0;
				my ($major, $minor, $rhythm, $power, $ki) = @score_criteria;
				$major ||= 0; $minor ||= 0; $rhythm ||= 0; $power ||= 0; $ki ||= 0;
				die "Database Integrity Error: score recorded for $athlete->{ name } for $score_round round does not match context $round round\n" if $round ne $score_round;
				$self->{ rounds }{ $round } = 1; # At least one score for this round has been recorded; therefore this division has the given round

				next unless( $major || $minor || $rhythm || $power || $ki );

				my $score  = { major => $major, minor => $minor, rhythm => $rhythm, power => $power, ki => $ki };
				my $forms  = int( @{ $self->{ forms }{ $round }});
				my $judges = $self->{ judges };
				$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
				$athlete->{ scores }{ $round }->record_score( $form, $judge, $score );

			# Penalties for out-of-bounds (0.3 per error), time limit (0.3 for under or over), or athlete/coach misconduct (prohibited acts, no penalty)
			} elsif ( $judge =~ /^p/ ) {
				my ($bounds, $timelimit, $misconduct, $time) = @score_criteria;

				my $penalties = { bounds => $bounds, timelimit => $timelimit, misconduct => $misconduct, time => $time };
				my $forms     = int( @{ $self->{ forms }{ $round }});
				my $judges    = $self->{ judges };
				$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
				$athlete->{ scores }{ $round }->record_penalties( $form, $penalties );

			# Status notes describe athlete withdraw or disqualification
			} elsif ( $judge =~ /^s/ ) {
				my $decision  = [ (map { my ($key, $value) = split /=/, $_, 2; ($key); } @score_criteria) ];
				my $forms     = int( @{ $self->{ forms }{ $round }});
				my $judges    = $self->{ judges };
				$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
				$athlete->{ scores }{ $round }->record_decision( $form, $_ ) foreach @$decision;
			}

		} else {
			die "Database Read Error: Unknown line type '$_'\n";
		}
	}
	if( $athlete->{ name } ) { push @{ $order->{ $round }}, $athlete->{ name }; } # Store the last athlete.
	close FILE;

	foreach my $i ( 0 .. $#{ $self->{ athletes }} ) {
		next unless $athlete->{ scores }{ prelim };
	}

	# ===== AUTODETECT THE FIRST ROUND
	if( exists $order->{ 'autodetect_required' } ) {
		my $n = int( keys %$athletes );
		if    ( $n ==  0            ) { die "Division Configuration Error: No athletes declared $!"; }
		elsif ( $n >= 20            ) { $round = 'prelim'; $order->{ 'prelim' } = $order->{ 'autodetect_required' }; }
		elsif ( $n <  20 && $n >  8 ) { $round = 'semfin'; $order->{ 'semfin' } = $order->{ 'autodetect_required' }; }
		elsif ( $n <=  8            ) { $round = 'finals'; $order->{ 'finals' } = $order->{ 'autodetect_required' }; }

		delete $order->{ 'autodetect_required' };
	}

	# ===== READ THE ATHLETE ASSIGNATION FOR THE ROUND SUB-HEADER IN THE FILE
	my $initial_order = {};
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $order->{ $round };

		# Establish order by athlete name, based on the earliest round
		if( keys %$initial_order ) {
			foreach my $name (@{ $order->{ $round }}) {
				push @{$self->{ order }{ $round }}, $initial_order->{ $name } if defined $initial_order->{ $name };
			}

		# No initial order set; this must be the earliest round
		} else {
			my $i = 0;
			foreach my $name (@{ $order->{ $round }}) {
				$initial_order->{ $name } = $i;
				push @{$self->{ order }{ $round }}, $i;
				push @{ $self->{ athletes }}, $athletes->{ $name };
				$i++;
			}
		}
	}

	$self->normalize();
	$self->update_status();
}

# ============================================================
sub update_status {
# ============================================================
#** @method ()
#   @brief Determine athlete placements and tie detection
#*
	my $self   = shift;
	my $method = $self->{ method };
	my $round  = $self->{ round };

	# ===== CALCULATE SCORE MEANS FOR ALL ROUNDS
	$self->calculate_means();

	# ===== SORT THE ATHLETES TO THEIR PLACES (1st, 2nd, etc.) AND DETECT TIES
	# Update after every completed score to give real-time audience feedback
	$self->place_athletes(); 
	my $ties = $self->detect_ties();

	# ===== ASSIGN THE TIED ATHLETES TO A TIEBREAKER ROUND
	foreach my $tie (@$ties) {
		next unless ref $tie;
		foreach my $i (@$tie) {
			my $athlete = $self->{ athletes }[ $i ];
			$self->assign_tiebreaker( $athlete );
		}
	}

	# ===== ASSIGN THE WINNING ATHLETES TO THE NEXT ROUND
	my $n = int( @{ $self->{ athletes }} ); # Note: n is the number of registered athletes, not remaining eligible athletes
	if     ( $round eq 'semfin' && $self->round_complete( 'prelim' )) {

		# Skip if athletes have already been assigned to the semi-finals
		my $semfin = $self->{ order }{ semfin };
		return if( defined $semfin && int( @$semfin ) > 0 );

		# Semi-final round goes in random order
		my $half       = int( ($n-1)/2 );
		my @candidates = @{ $self->{ placement }{ prelim }};
		my @eligible   = grep { ! any { _withdrawn_or_disqualified( $_ ); } @{$self->{ athletes }[ $_ ]{ scores }{ prelim }} } @candidates;
		my @order      = shuffle (@eligible[ 0 .. $half ]);
		$self->assign( $_, 'semfin' ) foreach @order;

	} elsif( $method eq 'combination' && $round eq 'ro8a' && $self->round_complete( 'semfin' )) {
		# Skip if athletes have already been assigned to the finals
		my $finals = $self->{ order }{ ro8a };
		return if( defined $finals && int( @$finals ) > 0 );

		# Finals go in reverse placement order of semi-finals
		my $k          = $n > 8 ? 7 : ($n - 1);
		my @candidates = @{ $self->{ placement }{ semfin }};
		my @eligible   = grep { ! any { _withdrawn_or_disqualified( $_ ); } @{$self->{ athletes }[ $_ ]{ scores }{ semfin }} } @candidates;
		my @order      = int( @eligible ) > 4 ? (@eligible[ ( 0 .. 3 ) ], shuffle( @eligible[ 4 .. $k ] )) : @eligible[ ( 0 .. $#eligible ) ];
		$self->distribute_evenly( [ qw( ro8a ro8d ro8b ro8c ) ], \@order );

	} elsif( $method eq 'combination' && $round eq 'ro4a' && $self->round_complete( 'ro8a' ) && $self->round_complete( 'ro8b' ) && $self->round_complete( 'ro8c' ) && $self->round_complete( 'ro8d' )) {
		# Skip if athletes have already been assigned to the finals
		my $finals = $self->{ order }{ ro4a };
		return if( defined $finals && int( @$finals ) > 0 );

		my $goto = { ro8a => 'ro4a', ro8b => 'ro4a', ro8c => 'ro4b', ro8d => 'ro4b' };
		foreach my $match (qw( ro8a ro8b ro8c ro8d )) {
			my @candidates = @{ $self->{ placement }{ $match }};
			my @eligible   = grep { ! any { _withdrawn_or_disqualified( $_ ); } @{$self->{ athletes }[ $_ ]{ scores }{ $match }} } @candidates;
			next unless @eligible >= 1; # Skip the assignment if there isn't any eligible candidates

			my $winner = shift @eligible; # Advance the first place athlete of the previous match
			my $ro4    = $goto->{ $match };
			$self->assign( $winner, $ro4 );
		}

	} elsif( $method eq 'combination' && $round eq 'ro2' && $self->round_complete( 'ro4a' ) && $self->round_complete( 'ro4b' )) {
		# Skip if athletes have already been assigned to the finals
		my $finals = $self->{ order }{ ro2 };
		return if( defined $finals && int( @$finals ) > 0 );

		foreach my $match (qw( ro4a ro4b )) {
			my @candidates = @{ $self->{ placement }{ $match }};
			my @eligible   = grep { ! any { _withdrawn_or_disqualified( $_ ); } @{$self->{ athletes }[ $_ ]{ scores }{ $match }} } @candidates;
			next unless @eligible >= 1; # Skip the assignment if there isn't any eligible candidates

			my $winner = shift @eligible; # Advance the first place athlete of the previous match
			$self->assign( $winner, 'ro2' );
		}

	} elsif( $round eq 'finals' && $self->round_complete( 'semfin' )) { 
		# Skip if athletes have already been assigned to the finals
		my $finals = $self->{ order }{ finals };
		return if( defined $finals && int( @$finals ) > 0 );

		# Finals go in reverse placement order of semi-finals
		my $k          = $n > 8 ? 7 : ($n - 1);
		my @candidates = @{ $self->{ placement }{ semfin }};
		my @eligible   = grep { ! any { _withdrawn_or_disqualified( $_ ); } @{$self->{ athletes }[ $_ ]{ scores }{ semfin }} } @candidates;
		my @order      = reverse (@eligible[ 0 .. $k ]);
		$self->assign( $_, 'finals' ) foreach @order;
	}
}

# ============================================================
sub round_complete {
# ============================================================
	my $self  = shift;
	my $round = shift || $self->{ round };

	my $order = $self->{ order }{ $round };
	return 0 unless( defined $order && int(@$order) > 0 );

	my $forms        = $self->{ forms }{ $round };
	my @form_indices = ( 0 .. $#$forms );
	my @athletes     = $self->athletes_in_round( $round );
	my $complete     = 1;

	return 0 unless @athletes;

	foreach my $i (@athletes) {
		my $athlete = $self->{ athletes }[ $i ];
		$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round } ) unless defined $athlete->{ scores }{ $round };
		$complete &&= $athlete->{ scores }{ $round }->complete();
	}
	return $complete;
}

# ============================================================
sub write {
# ============================================================
#** @method ()
#   @brief Writes the division to the database
#*
	my $self = shift;

	$self->update_status();
	$self->{ current } = $self->athletes_in_round( 'first' ) unless defined $self->{ current };

	my $judges = $self->{ judges };

	# ===== COLLECT THE FORM NAMES TOGETHER PROPERLY
	my @forms = ();
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ forms }{ $round };
		push @forms, "$round:" . join( ",", map { $_->{ type } eq 'tiebreaker' ? "$->{ name } ($_->{ type })" : $_->{ name }; } @{$self->{ forms }{ $round }} );
	}

	# ===== PREPARE THE PLACEMENTS AND PENDING ATHLETES
	$self->{ placement } = {} unless defined $self->{ placement };
	my @places = ();
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		my $placements = $self->{ placement }{ $round };
		next unless defined $placements && int( @$placements );
		next unless grep { /^\d+$/ } @$placements;
		push @places, "$round:" . join( ",", grep { /^\d+$/ } @$placements );
	}

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# form=$self->{ form }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n";
	print FILE "# forms=" . join( ";", @forms ) . "\n" if @forms;
	print FILE "# placement=" . join( ";", @places ) . "\n" if @places;
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		my $order = $self->{ order }{ $round };
		next unless defined $order && int( @$order );
		print FILE "# ------------------------------------------------------------\n";
		print FILE "# $round\n";
		print FILE "# ------------------------------------------------------------\n";
		my $forms = int( @{$self->{ forms }{ $round }});
		foreach my $k (@$order) {
			my $athlete = $self->{ athletes }[ $k ];
			print FILE join( "\t", $athlete->{ name }, exists $athlete->{ info } ? map { "$_=$athlete->{ info }{ $_ }" } sort keys %{ $athlete->{ info }} : () ) . "\n";
			print FILE $athlete->{ scores }{ $round }->string( $round, $forms, $judges );
		}
	}
	close FILE;
}

# ============================================================
sub navigate {
# ============================================================
#** @method ( context, index )
#   @brief Navigates the division to the given context (e.g. round, athlete, form) and index
#*
	my $self   = shift;
	my $object = shift;
	my $value  = shift;

	if    ( $object eq 'round'   ) { $self->{ round }   = $value; }
	elsif ( $object eq 'athlete' ) { $self->{ current } = $value; }
	elsif ( $object eq 'form'    ) { $self->{ form }    = $value; }
}

# ============================================================
sub navigate_to_start {
# ============================================================
#** @method ()
#   @brief Navigates the division to the beginning
#*
	my $self = shift;

	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ rounds }{ $round };
		$self->{ round } = $round;
		last;
	}

	$self->{ current } = 0;
	$self->{ form }    = 0;
}


# ============================================================
sub next_round {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next round
#*
	my $self    = shift;
	my $round   = $self->{ round };
	my @rounds  = @FreeScore::Forms::WorldClass::Division::round_order;
	my @i       = grep { exists $self->{ order }{ $rounds[ $_ ] } } (0 .. $#rounds);
	my $first   = $i[ 0 ];
	my $map     = { map { ($rounds[ $_ ] => $_) } @i };
	my $i       = $map->{ $round };

	if( $self->{ method } eq 'combination' ) {
		if    ( $round eq 'semfin' ) { $i = $map->{ ro8a }; } # semfin goes to ro8a
		elsif ( $round eq 'ro2'    ) { $i = $first;         } # ro2 wraps around to first available round
		else                         { $i++;                }

	} else {
		if    ( $round eq 'finals' ) { $i = $first; }
		else                         { $i++;        }
	}

	# ===== GO TO NEXT ROUND
	$self->{ round } = $rounds[ $i ];

	# ===== GO TO THE FIRST ATHLETE IN THAT ROUND
	$self->{ current } = $self->athletes_in_round( 'first' );
}

# ============================================================
sub previous_round {
# ============================================================
#** @method ()
#   @brief Navigates the division to the previous round
#*
	my $self    = shift;
	my $round   = $self->{ round };
	my @rounds  = @FreeScore::Forms::WorldClass::Division::round_order;
	my @i       = grep { exists $self->{ order }{ $rounds[ $_ ] } } (0 .. $#rounds);
	my $first   = $i[ 0 ];
	my $map     = { map { ($rounds[ $_ ] => $_) } @i };
	my $i       = $map->{ $round };

	if( $self->{ method } eq 'combination' ) {
		if    ( $round eq $rounds[ $first ] ) { $i = $map->{ ro2 };    } # first round wraps around to ro2
		elsif ( $round eq 'ro8a'            ) { $i = $map->{ semfin }; } # ro8a goes to semfin
		else                                  { $i--;                  }

	} else {
		if    ( $round eq $rounds[ $first ] ) { $i = $map->{ finals }; } # first round wraps around to finals
		else                                  { $i--;                  }
	}

	# ===== GO TO PREVIOUS ROUND
	$self->{ round } = $rounds[ $i ];

	# ===== GO TO THE FIRST ATHLETE IN THAT ROUND
	$self->{ current } = $self->athletes_in_round( 'first' );
}

# ============================================================
sub next_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next athlete
#*
	my $self = shift;

	$self->{ state }   = 'score';
	$self->{ current } = $self->athletes_in_round( 'next' );
	$self->{ form }    = 0;
}

# ============================================================
sub next_form {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next form
#*
	my $self = shift;

	$self->{ state } = 'score';
	my $round        = $self->{ round };
	my $form         = $self->{ form };
	my $max_forms    = $#{ $self->{ forms }{ $round }};

	return unless( $form < $max_forms );
	$self->{ form }++;
}

# ============================================================
sub previous_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the previous athlete
#*
	my $self = shift;

	$self->{ state }      = 'score';
	$self->{ current }    = $self->athletes_in_round( 'prev' );
	$self->{ form }       = 0;
}

# ============================================================
sub previous_form {
# ============================================================
#** @method ()
#   @brief Navigates the division to the previous form
#*
	my $self = shift;

	$self->{ state } = 'score';
	my $round        = $self->{ round };
	my $form         = $self->{ form };

	return unless( $form > 0 );
	$self->{ form }--;
}

# ============================================================
sub calculate_means {
# ============================================================
	my $self = shift;

	foreach my $round (keys %{ $self->{ forms }}) {
		my @athletes_in_round = exists $self->{ order }{ $round } ? @{$self->{ order }{ $round }} : ();
		foreach my $i (@athletes_in_round) {
			my $scores = $self->{ athletes }[ $i ]{ scores }{ $round };
			$scores->calculate_means( $self->{ judges } );
		}
	}
}

# ============================================================
sub select_round_scores {
# ============================================================
#** @method ( athlete_index, round, form_type )
#   @brief Returns the scores for the given form types for the given round
#*
	my $self  = shift;
	my $i     = shift;
	my $round = shift;
	my $type  = shift;

	die "Division Object Error: Bad indices when selecting athlete $!" if( $i < 0 || $i > $#{ $self->{ athletes }} );
	die "Division Object Error: Forms not defined for round $round $!" unless( exists $self->{ forms }{ $round } );
	return undef unless( exists $self->{ athletes }[ $i ]{ scores }{ $round } );

	my $scores = $self->{ athletes }[ $i ]{ scores }{ $round };
	my $forms  = $self->{ forms }{ $round };

	my @form_indices = ( 0 .. $#$forms );
	my @selected     = grep { $forms->[ $_ ]{ type } eq $type } @form_indices;
	
	return [ map { $scores->[ $_ ] } @selected   ];
}


# ============================================================
sub select_tiebreaker_round_scores {
# ============================================================
#** @method ( athlete_index, round )
#   @brief Returns the tiebreaker form scores for the given round
#*
	my $self  = shift;
	my $i     = shift;
	my $round = shift;

	return $self->select_round_scores( $i, $round, 'tiebreaker' );
}

# ============================================================
sub select_compulsory_round_scores {
# ============================================================
#** @method ( athlete_index, round )
#   @brief Returns the compulsory form scores for the given round
#*
	my $self    = shift;
	my $i       = shift;
	my $round   = shift;

	return $self->select_round_scores( $i, $round, 'compulsory' );
}

# ============================================================
sub athletes_in_round {
# ============================================================
#** @method ( [criteria] )
#   @brief Returns the requested athlete for the given criteria (round name or position: first, last, next, prev)
#*
	my $self   = shift;
	my $option = shift;

	my $i      = undef;
	my $find   = 0;
	my $round  = $self->{ round };

	if    ( $option eq 'first'   ) { $i     =  0; }
	elsif ( $option eq 'last'    ) { $i     = -1; }
	elsif ( $option eq 'next'    ) { $find  =  1; }
	elsif ( $option eq 'prev'    ) { $find  = -1; }
	elsif ( $option eq 'prelim'  ) { $round = $option; }
	elsif ( $option eq 'semfin'  ) { $round = $option; }
	elsif ( $option eq 'finals'  ) { $round = $option; }

	$self->{ order }{ $round } ||= [];
	my @athletes_in_round = @{$self->{ order }{ $round }};

	if( defined $i ) {
		return $athletes_in_round[ $i ];

	} elsif( $find ) {
		die "Division Configuration Error: While searching for $option athlete in '$round', found no athletes assigned to '$round'" unless( int( @athletes_in_round ));
		my $j = first { $athletes_in_round[ $_ ] == $self->{ current } } ( 0 .. $#athletes_in_round );
		my $k = ($j + $find) < 0 ? $#athletes_in_round : ($j + $find) % int( @athletes_in_round );
		return $athletes_in_round[ $k ];

	} else {
		return @athletes_in_round;
	}
}

# ============================================================
sub _is_tie {
# ============================================================
#** @function ( score_delta )
#   @brief Returns true if the score delta is insignificant
#   @details Smallest difference is 0.1 divided by 7 judges for complete scores, or ~0.014; so we set the tie detection threshold to 0.010 for convenience
#*
	my $comparison = shift;
	return abs( $comparison ) < 0.010;
}

# ============================================================
sub _parse_forms {
# ============================================================
#** @function ( forms_text )
#   @brief Parses serialized form text
#   @details Compulsory forms are optionally labeled. Tiebreaker forms must be labeled.
#*
	my $value = shift;

	my @rounds = map { 
		my ($round, $forms) = split /\s*:\s*/;
		my @forms = map { my ($name, $type) = /^([\w\s]+)(?:\s\((compulsory|tiebreaker)\))?/; { name => $name, type => $type || 'compulsory' }; } split /\s*,\s*/, $forms;
		($round => [ @forms ]);
	} split /\s*;\s*/, $value;
	return { @rounds }; 
}

# ============================================================
sub _parse_places {
# ============================================================
#** @function ( places_text )
#   @brief Parses serialized places (medals) text
#*
	my $value = shift;
	my @rounds = map {
		my ($round, $list) = split /:/;
		my @places = grep { /^(?:\d+|half)$/ } split /,/, $list;
		($round => [ @places ]);
	} split /;/, $value;
	return { @rounds };
}

# ============================================================
sub _parse_placement {
# ============================================================
#** @function ( placement_text )
#   @brief Parses serialized placement text
#*
	my $value = shift;
	my @rounds = map {
		my ($round, $list) = split /:/;
		my @placements = grep { /^\d+$/ } split /,/, $list;
		($round => [ @placements ]);
	} split /;/, $value;
	return { @rounds };
}

# ============================================================
sub _withdrawn_or_disqualified { 
# ============================================================
#** @function ( form_object )
#   @brief Returns true if a form object has a withdrawn or disqualified decision
#*
	my $form = shift; 
	return (exists $form->{ decision } && (exists $form->{ decision }{ withdrawn } || exists $form->{ decision }{ disqualified }));
}

our @round_order = ( qw( prelim semfin finals ro8a ro8b ro8c ro8d ro4a ro4b ro2 ) );

1;
