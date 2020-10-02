package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use FreeScore::Forms::WorldClass::Division::Round::Pool;
use List::Util qw( all any none first min shuffle reduce );
use List::MoreUtils qw( first_index );
use Math::Round qw( round );
use JSON::XS;
use Try::Tiny;
use Data::Dumper;
use Clone qw( clone );
use base qw( FreeScore::Forms::Division Clone );
use strict;

#**
# Athlete data structure
# - athlete
#   - scores
#     - <round> (hash key string, e.g. prelim, semfin, finals)
#       - Round Object
#
# Round data structure (also see FreeScore::Forms::WorldClass::Division::Round)
# - adjusted
#   - accuracy
#   - presentation
#   - total
# - complete
# - decision
#   - withdraw
#   - disqualify
# - forms
#   - [ form index ]
#     - complete
#     - penalties
#     - decision
#       - withdraw
#       - disqualify
#   - judge
#     - [ judge index ]
#       - Score Object
# - pool
# - started
# - tiebreakers
#   (same substructure as forms)
#
# Score data structure (also see FreeScore::Forms::WorldClass::Division::Round::Score)
# - major
# - minor
# - power
# - rhythm
# - ki
#
# Flight data structure
# - id
# - state (ready, in-progress, complete, merged)
# - group[]: list of all flights for this division
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
	my @compulsory = @{ $self->{ forms }{ $round }};
	my $forms      = int( @compulsory );
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;

	# Do nothing if athlete is already assigned to the round
	return if( any { $_ == $i } @{ $self->{ order }{ $round }});

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	push @{ $self->{ order }{ $round }}, $i;
}

# ============================================================
sub assign_with_bye {
# ============================================================
#** @method ( athlete_index, round )
#   @brief Assigns the athlete to a match round
#*
	my $self       = shift;
	my $i          = shift;
	my $round      = shift;

	$self->{ order }{ $round } = [ $i ];
	$self->{ placement }{ $round } = [ $i ];
	my $athlete = $self->{ athletes }[ $i ];
	$athlete->{ scores }{ $round }{ forms }[ 0 ]{ decision }{ bye } = 1;
	$athlete->{ scores }{ $round }{ complete } = 1; # No need to score if there's only one athlete
	$self->{ pending }{ $round } = [];
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
	my $forms      = $self->{ tiebreakers }{ $round };

	if( exists $self->{ tiebreakers }{ $round } ) {
		$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
		$athlete->{ scores }{ $round }->add_tiebreaker( $judges );
	}
}

# ============================================================
sub autopilot {
# ============================================================
#** @method ( [on|off] )
#   @brief Put division under autopilot control.
#*
	my $self  = shift;
	my $state = shift;

	if( defined $state ) {
		if( $state eq 'off' ) { delete $self->{ autopilot } } else { $self->{ autopilot } = $state; }
	}
	return $self->{ autopilot } if exists $self->{ autopilot };
	return undef;
}

# ============================================================
sub clear_score {
# ============================================================
#** @method ( judge_index, score_object )
#   @brief Clears the score for the given judge
#*
	my $self    = shift;
	my $judge   = shift;

	my $athlete = $self->{ athletes }[ $self->{ current } ];
	my $round   = $self->{ round };
	my $form    = $self->{ form };
	my $forms   = int( @{ $self->{ forms }{ $round }});
	my $judges  = $self->{ judges };

	$self->{ state } = 'score'; # Return to the scoring state when any judge scores
	if( $self->is_flight()) {
		my $started = 0;
		foreach $athlete (@{ $self->{ athletes }}) {
			$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
			$started ||= $athlete->{ scores }{ $round }->started();
		}
		$self->{ flight }{ state } = 'ready' if( ! $started );
	}
	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	$athlete->{ scores }{ $round }->clear_score( $form, $judge );
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
sub from_json {
# ============================================================
#** @method ( json_division_data )
#   @brief  Class method that returns an instance using the given JSON division data
#   Call as my $division = FreeScore::Forms::WorldClass::Division->from_json( $json )
#*
	my $class = shift;
	my $data  = shift;
	my $clone = clone( $data );
	return bless $clone, $class;
}

# ============================================================
sub rank_athletes {
# ============================================================
#** @method ( [ round ] )
#   @brief Calculates athlete rankings for the given (default = current) round. Auto-updates score averages.
#*
	my $self      = shift;
	my $round     = shift || $self->{ round };
	my $method    = $self->{ method };
	my $placement = [];

	# ===== ASSEMBLE THE RELEVANT COMPULSORY AND TIEBREAKER SCORES
	my @athlete_indices = @{$self->{ order }{ $round }};

	# ===== CORNER CASE OF JUST 1 ATHLETE IN A BRACKETED ROUND
	if( $method eq 'aau-single-cutoff' && $round =~ /^(?:ro4b|ro4a|ro2)$/ && int( @athlete_indices ) == 1 ) {
		my $i = $athlete_indices[ 0 ];
		$self->{ placement }{ $round } = [ $i ];
		my $athlete = $self->{ athletes }[ $i ];
		$athlete->{ scores }{ $round }{ complete } = 1; # No need to score if there's only one athlete
		$self->{ pending }{ $round } = [];
		return;
	}

	# ===== SORT THE ATHLETES BY COMPULSORY FORM SCORES, THEN TIE BREAKER SCORES
	@$placement = sort { 
		# ===== COMPARE BY COMPULSORY ROUND SCORES
		my $x = $self->{ athletes }[ $a ]{ scores }{ $round }; # a := first athlete index;  x := first athlete round scores
		my $y = $self->{ athletes }[ $b ]{ scores }{ $round }; # b := second athlete index; y := second athlete round score
		my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ); 

		# ===== ANNOTATE SCORES WITH TIE-RESOLUTION RESULTS
		resolve_ties( $a, $b, $x, $y );

		# ===== COMPARE BY TIE-BREAKERS IF TIED
		if( _is_tie( $comparison )) {
			$comparison = FreeScore::Forms::WorldClass::Division::Round::_tiebreaker( $x, $y ); 
		}

		$comparison;
	} @athlete_indices;

	# ===== ASSIGN PLACEMENTS
	@$placement = grep { defined $self->{ athletes }[ $_ ]{ scores }{ $round };     } @$placement; # Athlete is assigned to round
	@$placement = grep { $self->{ athletes }[ $_ ]{ scores }{ $round }->complete(); } @$placement; # Athlete's score is complete

	$self->{ placement }{ $round } = $placement;

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$self->{ order }{ $round }} ];
	@$pending   = grep { my $scores = $self->{ athletes }[ $_ ]{ scores }{ $round }; ! defined $scores || ! $scores->complete(); } @$pending; # Athlete's score is NOT complete

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
		my $x = $self->{ athletes }[ $i ]{ scores }{ $round };

		my $j = $i + 1;
		while( $j < $k ) {
			my $b = $placement->[ $j ];
			my $y = $self->{ athletes }[ $j ]{ scores }{ $round };
			if( exists $y->{ decision }{ withdraw } || exists $y->{ decision }{ disqualify } ) { $j++; next; } # Skip comparisons to withdrawn or disqualified athletes

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
		my $edit    = $edits->[ $i ];
		my $j       = $edit->{ order } - 1; # Get the athlete's previous relative order index
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

		$athlete->{ name } = $edit->{ name };
	}

	# Create a placeholder athlete if no athlete has a valid name
	if( all { $_->{ name } =~ /^\s*$/; } @$edits ) { $self->{ athletes } = [{ name => 'First Athlete', info => {} }]; }

	$self->{ order }{ $round } = $reorder;
	$self->normalize();
}

# ============================================================
sub eligible_athletes {
# ============================================================
#** @method ( round, athlete_indices )
#   @brief Returns a list of athletes that are eligible to advance to the next round
#   Returns a filtered list of given athlete indices where the athlete has not been disqualified or withdrawn for the given round
#*
	my $self       = shift;
	my $round      = shift;
	my @candidates = @{ $self->{ placement }{ $round }};
	my @eligible   = ();

	foreach my $candidate (@candidates) {
		my $r = $self->{ athletes }[ $candidate ]{ scores }{ $round };
		next if( $r->any_punitive_decision());
		push @eligible, $candidate;
	}

	return @eligible;
}

# ============================================================
sub first_form {
# ============================================================
#** @method ()
#   @brief Navigates the division to the first form
#*
	my $self = shift;

	$self->{ state } = 'score';
	$self->{ form }  = 0;
}


# ============================================================
sub get_only {
# ============================================================
#** @method ( judge_index )
#   @brief Erases all scores except the given judge; used prior to sending updates to a judge
#*
	my $self  = shift;
	my $judge = shift;
	my $clone = $self->clone();
	my $round = $clone->{ round };

	foreach my $athlete (@{ $clone->{ athletes }}) {
		$athlete->{ scores } = { $round => $athlete->{ scores }{ $round } }; # Prune all but the current round
		foreach my $form (@{$athlete->{ scores }{ $round }{ forms }}) {
			next unless exists $form->{ judge };
			$form->{ judge } = [ $form->{ judge }[ $judge ] ]; # Prune all bu the given judge
		}
	}
	return $clone;
}

# ============================================================
sub is_flight {
# ============================================================
#** @is_flight ()
#   @brief Returns true if the division is a flight;
#*
	my $self = shift;
	return exists $self->{ flight } && defined $self->{ flight } && $self->{ flight };
}

# ============================================================
sub is_match_results {
# ============================================================
	my $self = shift;
	return $self->{ state } eq 'match-results';
}

# ============================================================
sub is_summary {
# ============================================================
	my $self = shift;
	return $self->{ state } eq 'summary';
}

# ============================================================
sub match_results {
# ============================================================
	my $self = shift;
	$self->{ state } = 'match-results';
}

# ============================================================
sub normalize {
# ============================================================
#** @method ()
#   @brief Normalizes the division object. 
#   Initializes the first round and maintain each athlete's scoring matrix.
#*
	my $self   = shift;
	my $judges = $self->{ judges };
	my $round  = $self->{ round };
	my $method = $self->{ method };

	$self->{ state } ||= 'score';
	$self->{ form }  ||= 0;

	# ===== ASSIGN ALL ATHLETES TO THE DEFINED ROUND
	if( defined $round ) {
		die "Division Configuration Error: No forms defined for round '$round' $!" unless defined $self->{ forms }{ $round };
		my $order = $self->{ order }{ $round };
		if( ! (defined $order && int( @$order ))) { $self->assign( $_, $round ) foreach ( 0 .. $#{ $self->{ athletes }} ); } 

	# ===== NO ROUND DEFINED; FIGURE OUT WHICH ROUND TO START WITH, GIVEN THE NUMBER OF ATHLETES
	} else {
		my $n        = int( @{ $self->{ athletes }} );
		my $half     = int( ($n-1)/2 );
		my $flight   = $self->is_flight();
		my @athletes = ( 0 .. $#{ $self->{ athletes }});

		if( $method eq 'aau-single-cutoff' ) { 
			if    ( $n == 2  ) { $round = 'ro2';    $self->assign( $_, $round ) foreach @athletes; }
			elsif ( $n == 3  ) { $round = 'prefin'; $self->assign( $_, $round ) foreach @athletes; }
			elsif ( $n == 4  ) { $round = 'ro4b';   $self->assign( $_, 'ro4b' ) foreach @athletes[ 0, 1 ]; $self->assign( $_, 'ro4a' ) foreach @athletes[ 2, 3 ]; }
			elsif ( $n <= 29 ) { $round = 'semfin'; $self->assign( $_, $round ) foreach @athletes; }
			else  { die "Division Configuration Error: AAU Single Cutoff does not allow divisions with more than 29 athletes"; }

		} else {
			if    ( $flight || $n >= 20 ) { $round = 'prelim'; $self->assign( $_, $round ) foreach @athletes; }
			elsif ( $n >   8            ) { $round = 'semfin'; $self->assign( $_, $round ) foreach @athletes; }
			else  { $round = 'finals'; $self->assign( $_, $round ) foreach @athletes; }
		}
	}

	# ===== NORMALIZE THE SCORING MATRIX
	my $forms  = int( @{ $self->{ forms }{ $round }});
	my @rounds = grep { my $order = $self->{ order }{ $_ }; defined $order && int( @$order ); } $self->rounds();
	foreach my $round (@rounds) {
		foreach my $i (@{ $self->{ order }{ $round }}) {
			my $athlete = $self->{ athletes }[ $i ];
			$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
		}
	}

	$self->{ current } = $self->athletes_in_round( 'first' ) unless defined $self->{ current };
}

# ============================================================
sub pool_judge_ready {
# ============================================================
#** @method ( size, judge )
#   @brief Indicates that the judge is ready to start scoring accuracy
#*
	my $self    = shift;
	my $size    = shift;
	my $judge   = shift;

	$self->{ poolsize } = $size;
	my $athlete = $self->{ athletes }[ $self->{ current } ];
	my $round   = $self->{ round };
	my $form    = $self->{ form };
	my $forms   = int( @{ $self->{ forms }{ $round }});
	my $judges  = $self->{ judges };

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	return $athlete->{ scores }{ $round }->pool_judge_ready( $size, $form, $judge );
}

# ============================================================
sub record_pool_score {
# ============================================================
#** @method ( score_object )
#   @brief Records the given score within a judge's pool for online tournaments
#*
	my $self    = shift;
	my $score   = shift;

	my $athlete = $self->{ athletes }[ $self->{ current } ];
	my $round   = $self->{ round };
	my $form    = $self->{ form };
	my $forms   = int( @{ $self->{ forms }{ $round }});
	my $judges  = $self->{ judges };
	my $size    = $self->{ poolsize };

	$self->{ state } = 'score'; # Return to the scoring state when any judge scores
	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	return $athlete->{ scores }{ $round }->record_pool_score( $size, $form, $score );
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

	$self->{ state } = 'score'; # Return to the scoring state when any judge scores
	$self->{ flight }{ state } = 'in-progress' if( $self->is_flight() && $self->{ flight }{ state } eq 'ready' ); # Change flight status to in-progress once a judge has scored
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
#** @method ( punitive_declaration_text, athlete_index )
#   @brief Records the given punitive decision
#*
	my $self      = shift;
	my $decision  = shift;
	my $i         = shift;

	my $athlete   = $self->{ athletes }[ $i ];
	my $round     = $self->{ round };
	my $form      = $self->{ form };
	my $forms     = int( @{ $self->{ forms }{ $round }});
	my $judges    = $self->{ judges };

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	$athlete->{ scores }{ $round }->record_decision( $form, $decision );
	if( $self->is_flight()) {
		my $started = 0;
		foreach $athlete (@{ $self->{ athletes }}) {
			$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
			$started ||= $athlete->{ scores }{ $round }->started();
		}
		if( $started ) { $self->{ flight }{ state } = 'in-progress'; } 
		else           { $self->{ flight }{ state } = 'ready';       }
	}
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

	foreach my $round ($self->rounds()) {
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

	# Update order, placement, and pending lists
	$self->remove_from_list( $_, $i ) foreach (qw( order placement pending ));

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
			my $rounds   = join( '|', $self->rounds());
			if( /=/ ) {
				s/^#\s+//;
				my ($key, $value) = split /=/;
				if    ( $key eq 'flight'      ) { $self->{ $key } = _parse_flights( $value );   }
				elsif ( $key eq 'forms'       ) { $self->{ $key } = _parse_forms( $value );     }
				elsif ( $key eq 'tiebreakers' ) { $self->{ $key } = _parse_forms( $value );     }
				elsif ( $key eq 'places'      ) { $self->{ $key } = _parse_places( $value );    }
				elsif ( $key eq 'placement'   ) { $self->{ $key } = _parse_placement( $value ); }
				else                            { $self->{ $key } = $value;                     }

				$round = $self->{ round } if( defined $self->{ round } );

			} else {
				my $rounds = join( '|', $self->rounds());
			   	if( /^(?:$rounds)$/i ) {
					s/^#\s+//;

					# Store the last athlete of the previous round
					if( $athlete->{ name } ) {
						push @{ $order->{ $round }}, $athlete->{ name } if( $athlete->{ name } );
						$athlete = {};
					}

					# Change the context to the given round
					$round = $_;
				}
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
				my $r      = $athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
				$r->record_score( $form, $judge, $score );

			# Penalties for out-of-bounds (0.3 per error), time limit (0.3 for under or over), or athlete/coach misconduct (prohibited acts, no penalty)
			} elsif ( $judge =~ /^p/ ) {

				my @criteria  = (@FreeScore::Forms::WorldClass::Division::Round::PENALTIES, @FreeScore::Forms::WorldClass::Division::Round::GAMJEOMS, @FreeScore::Forms::WorldClass::Division::Round::TIME);
				my $penalties = { map { $_ => shift @score_criteria } @criteria };
				my $forms     = int( @{ $self->{ forms }{ $round }});
				my $judges    = $self->{ judges };
				my $r         = $athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
				$r->record_penalties( $form, $penalties );

			# Status notes describe athlete withdraw or disqualification
			} elsif ( $judge =~ /^s/ ) {
				my $decision = [ (map { my ($key, $value) = split /=/, $_, 2; ($key); } @score_criteria) ];
				my $forms    = int( @{ $self->{ forms }{ $round }});
				my $judges   = $self->{ judges };
				my $r        = $athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
				$r->record_decision( $form, $_ ) foreach @$decision;

			# Online poomsae tournaments judge pool scores (using redundancy to combat judge network intermittency)
			} elsif ( $judge =~ /^o/ ) {
				my $json   = $FreeScore::Forms::WorldClass::Division::Round::Pool::JSON;
				my ($data) = @score_criteria;
				my $score  = $json->decode( $data );
				my $pool   = $athlete->{ scores }{ $round }{ pool } = new FreeScore::Forms::WorldClass::Division::Round::Pool( $athlete->{ scores }{ $round }{ pool });
				$pool->size( $self->{ poolsize });
				$pool->want( $self->{ judges });
				$pool->record_score( $form, $score );
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
		my $n      = int( keys %$athletes );
		my $flight = $self->is_flight();
		my $method = $self->{ method };

		if( $n ==  0 ) { die "Division Configuration Error: No athletes declared $!"; }
		if( $method eq 'aau-single-cutoff' ) {
			if    ( $n > 4  ) { $round = 'semfin'; $order->{ 'semfin' } = $order->{ 'autodetect_required' }; }
			elsif ( $n == 4 ) { $round = 'ro4b';   $order->{ 'ro4b' }   = $order->{ 'autodetect_required' }; }
			elsif ( $n == 3 ) { $round = 'prefin'; $order->{ 'prefin' } = $order->{ 'autodetect_required' }; }
			elsif ( $n <= 2 ) { $round = 'ro2';    $order->{ 'ro2' }    = $order->{ 'autodetect_required' }; }

		} else {
			if    ( $n >= 20 || $flight ) { $round = 'prelim'; $order->{ 'prelim' } = $order->{ 'autodetect_required' }; }
			elsif ( $n <  20 && $n >  8 ) { $round = 'semfin'; $order->{ 'semfin' } = $order->{ 'autodetect_required' }; }
			elsif ( $n <=  8            ) { $round = 'finals'; $order->{ 'finals' } = $order->{ 'autodetect_required' }; }
		}

		delete $order->{ 'autodetect_required' };
	}

	# ===== READ THE ATHLETE ASSIGNMENT FOR THE ROUND SUB-HEADER IN THE FILE
	my $initial_order = {};
	foreach my $round ($self->rounds()) {
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
				$athletes->{ $name }{ id } = $i unless exists $athletes->{ $name }{ id };
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
sub resolve_pool {
# ============================================================
#** @method ( score_object )
#   @brief Records the given score within a judge's pool for online tournaments
#*
	my $self    = shift;

	my $athlete = $self->{ athletes }[ $self->{ current } ];
	my $round   = $self->{ round };
	my $form    = $self->{ form };
	my $forms   = int( @{ $self->{ forms }{ $round }});
	my $judges  = $self->{ judges };
	my $size    = $self->{ poolsize };

	$self->{ state } = 'score'; # Return to the scoring state when handling scores
	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	return $athlete->{ scores }{ $round }->resolve_pool( $size, $form );
}

# ============================================================
sub split {
# ============================================================
#** @method ( n )
#   @brief Splits the division into n flights
#*
	my $self  = shift;
	my $n     = shift;
	my $round = $self->{ round };
	
	return if $round ne 'prelim'; # Can only split prior to the preliminary round

	my @athletes = shuffle @{$self->{ athletes }};
	my $j        = round( int( @athletes )/$n );
	my @flights  = ();

	my $group = [ map { $self->{ name } . chr( ord( 'a' ) + ($_ - 1)) } (1 .. $n) ];

	foreach my $i ( 1 .. $n ) {
		my $id     = chr( ord( 'a' ) + ($i - 1));
		my $flight = $self->clone();
		my $k      = min( int( @athletes ), $j ); 
		$flight->{ flight }{ id } = $id;
		$flight->{ file } =~ s/$flight->{ name }\.txt$/$flight->{ name }$id.txt/;
		$flight->{ name } = $flight->{ name } . $id;
		$flight->{ athletes } = [ splice( @athletes, 0, $k ) ];
		$flight->{ order }{ prelim } = [ 0 .. $#{ $flight->{ athletes }} ];
		$flight->{ flight }{ state } = 'ready';
		$flight->{ flight }{ group } = $group;
		$flight->write();
		push @flights, $flight;
	}

	return @flights;
}

# ============================================================
sub summary {
# ============================================================
	my $self = shift;
	$self->{ state } = 'summary';
}

# ============================================================
sub update_status {
# ============================================================
#** @method ()
#   @brief Advances athletes to the next round after determining athlete rankings and tie resolution
#*
	my $self   = shift;
	my $method = $self->{ method };
	my $round  = $self->{ round };

	# ===== CALCULATE SCORE MEANS FOR ALL ROUNDS
	$self->calculate_means();

	# ===== SORT THE ATHLETES TO THEIR PLACES (1st, 2nd, etc.) AND DETECT TIES
	# Update after every completed score to give real-time audience feedback
	$self->rank_athletes(); 
	my $ties = $self->detect_ties();

	# ===== ASSIGN THE TIED ATHLETES TO A TIEBREAKER ROUND
	foreach my $tie (@$ties) {
		next unless ref $tie;
		foreach my $i (@$tie) {
			my $athlete = $self->{ athletes }[ $i ];
			$self->assign_tiebreaker( $athlete );
		}
	}

	# ------------------------------------------------------------
	# ASSIGN THE WINNING ATHLETES TO THE NEXT ROUND
	# ------------------------------------------------------------

	# ----------------------------------------
	# AAU SINGLE CUTOFF METHOD
	# ----------------------------------------
	if( $method eq 'aau-single-cutoff' ) {

=pod
		my $n = int( @{ $self->{ athletes }} ); # Note: n is the number of registered athletes, not remaining eligible athletes

		if( $round eq 'ro4b' && $self->round_complete( 'semfin' )) {

			# Skip if athletes have already been assigned to ro4
			my $ro4a = $self->{ order }{ ro4a };
			my $ro4b = $self->{ order }{ ro4b };
			return if((defined $ro4b && int( @$ro4b ) > 0) && (defined $ro4a && int( @$ro4a ) > 0));

			# Round of 4 is randomly assigned
			my @eligible = $self->eligible_athletes( 'semfin' );
			my $k        = int( @eligible ) > 3 ? 3 : int( @eligible ) - 1;
			my @order    = @eligible[ 0 .. $k ];

			if( $k <= 1 ) { $self->assign_with_bye( $_, 'ro2' ) foreach @order; return; }
			if( $k == 2 ) { $self->assign_with_bye( $order[ 0 ], 'ro4b' ); $self->assign( $_, 'ro4a' ) foreach @order[ qw( 1 2 ) ]; return; }

			my @match_b  = $order[ 0 ], $order[ 3 ]; # First place seed vs 4th place seed 
			my @match_a  = $order[ 1 ], $order[ 2 ]; # 2nd place seed vs 3rd place seed

			$self->assign( $_, 'ro4b' ) foreach @match_b;
			$self->assign( $_, 'ro4a' ) foreach @match_a;

		} elsif( $round eq 'ro4a' ) {

			if( $self->round_complete( 'ro4b' )) {

				# Skip if athletes have already been assigned to ro4
				my $ro4a = $self->{ order }{ ro4a };
				my $ro4b = $self->{ order }{ ro4b };
				return if((defined $ro4b && int( @$ro4b ) > 0) && (defined $ro4a && int( @$ro4a ) > 0));

			} elsif( $self->round_complete( 'prefin' )) {

				# Skip if athletes have already been assigned to ro4
				my $ro4a = $self->{ order }{ ro4a };
				return if( defined $ro4a && int( @$ro4a ) > 0 );

				# Round of 4 is assigned by seeding based on prefin
				my @eligible = $self->eligible_athletes( 'prefin' );
				my $first    = $eligible[ 0 ];
				return if( int( @eligible ) == 0 );
				if( int( @eligible ) == 1 ) { $self->assign_with_bye( $first, 'ro2'  ); return; }
				if( int( @eligible ) == 2 ) { $self->assign( $_, 'ro2'  ) foreach @eligible ; return; }

				$self->assign_with_bye( $first, 'ro4b'  ); 
				$self->assign( $_,     'ro4a' ) foreach @eligible[qw( 1 2 )]; # Place others in the last match of the Round of 4
			}

		} elsif( $round eq 'ro2' && $self->round_complete( 'ro4a' ) && $self->round_complete( 'ro4b' )) {

			# Skip if athletes have already been assigned to ro4
			my $ro2 = $self->{ order }{ ro2 };
			return if( defined $ro2 && int( @$ro2 ) > 0 );

			my @ro4b = $self->eligible_athletes( 'ro4b' );
			my @ro4a = $self->eligible_athletes( 'ro4a' );

			my $ro4b = shift @ro4b;
			my $ro4a = shift @ro4a;

			# Who knows what will happen if everyone is disqualified or withdraws
			if((! $ro4b) && (! $ro4a)) { return; }

			if( ! $ro4b ) { $self->assign_with_bye( $ro4a, 'ro2' ); return; }
			if( ! $ro4a ) { $self->assign_with_bye( $ro4b, 'ro2' ); return; }

			$self->assign( $ro4b, 'ro2' );
			$self->assign( $ro4a, 'ro2' );

		}
=cut

	# ----------------------------------------
	# CUTOFF METHOD
	# ----------------------------------------
	} else {

		my $n = int( @{ $self->{ athletes }} ); # Note: n is the number of registered athletes, not remaining eligible athletes

		# Flights have only one round (prelim); if it is completed, then mark the flight as complete (unless it is already merged)
		if     (($round eq 'prelim' || $round eq 'semfin') && $self->is_flight() && $self->round_complete( 'prelim' ) && $self->{ flight }{ state } ne 'merged' ) {
			$self->{ flight }{ state } = 'complete';

		} elsif( $round eq 'semfin' && $self->round_complete( 'prelim' )) {

			# Skip if athletes have already been assigned to the semi-finals
			my $semfin = $self->{ order }{ semfin };
			return if( defined $semfin && int( @$semfin ) > 0 );

			# Semi-final round goes in random order
			my $half       = int( ($n-1)/2 );
			my @eligible   = $self->eligible_athletes( 'prelim' );
			my @order      = shuffle (@eligible[ 0 .. $half ]);
			$self->assign( $_, 'semfin' ) foreach @order;

		} elsif( $round eq 'finals' && $self->round_complete( 'semfin' )) { 
			# Skip if athletes have already been assigned to the finals
			my $finals = $self->{ order }{ finals };
			return if( defined $finals && int( @$finals ) > 0 );

			# Finals go in reverse placement order of semi-finals
			my @eligible   = $self->eligible_athletes( 'semfin' );
			my $k          = $#eligible > 7 ? 7 : $#eligible;
			my @order      = reverse (@eligible[ 0 .. $k ]);
			$self->assign( $_, 'finals' ) foreach @order;
		}
	}
}

# ============================================================
sub round_complete {
# ============================================================
	my $self  = shift;
	my $round = shift || $self->{ round };

	my $order = $self->{ order }{ $round };
	return 0 unless( defined $order && int(@$order) > 0 );

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
	my $self    = shift;

	$self->update_status();
	$self->{ current } = $self->athletes_in_round( 'first' ) unless defined $self->{ current };

	# Flights always start in prelim
	$self->{ round } = 'prelim' if $self->is_flight();

	my $judges = $self->{ judges };

	# ===== COLLECT THE FORM NAMES TOGETHER PROPERLY
	my @forms = ();
	my @tiebreakers = ();
	foreach my $round ($self->rounds()) {
		push @forms,       "$round:" . join( ",", @{$self->{ forms }{ $round }} )       if exists $self->{ forms }{ $round }       && @{ $self->{ forms }{ $round }};
		push @tiebreakers, "$round:" . join( ",", @{$self->{ tiebreakers }{ $round }} ) if exists $self->{ tiebreakers }{ $round } && @{ $self->{ tiebreakers }{ $round }};
	}

	# ===== PREPARE THE PLACEMENTS AND PENDING ATHLETES
	$self->{ placement } = {} unless defined $self->{ placement };
	my @places = ();
	foreach my $round ($self->rounds()) {
		my $placements = $self->{ placement }{ $round };
		next unless defined $placements && int( @$placements );
		next unless grep { /^\d+$/ } @$placements;
		push @places, "$round:" . join( ",", grep { /^\d+$/ } @$placements );
	}
	my $flight = '';
	if( $self->is_flight()) { $flight = "id:$self->{ flight }{ id };group:" . join( ",", @{ $self->{ flight }{ group }}) . ";state:$self->{ flight }{ state }"; }

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# form=$self->{ form }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# poolsize=$self->{ poolsize }\n" if exists( $self->{ poolsize }) && defined( $self->{ poolsize });
	print FILE "# videos=$self->{ videos }\n" if exists( $self->{ videos }) && defined( $self->{ videos });
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# autopilot=$self->{ autopilot }\n" if exists( $self->{ autopilot }) && defined( $self->{ autopilot } );
	print FILE "# timers=$self->{ timers }\n" if exists( $self->{ timers }) && defined( $self->{ timers } );
	print FILE "# method=" . lc( $self->{ method } ) . "\n" if exists( $self->{ method } ) && defined( $self->{ method } );
	print FILE "# description=$self->{ description }\n";
	print FILE "# forms=" . join( ";", @forms ) . "\n" if @forms;
	print FILE "# placement=" . join( ";", @places ) . "\n" if @places;
	print FILE "# flight=$flight\n" if $self->is_flight();
	foreach my $round ($self->rounds()) {
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
	chmod 0666, $self->{ file };

	return 1;
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

	foreach my $round ($self->rounds()) {
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
	my @rounds  = $self->rounds();
	my @i       = grep { exists $self->{ order }{ $rounds[ $_ ] } } (0 .. $#rounds);
	my $first   = $i[ 0 ];
	my $map     = { map { ($rounds[ $_ ] => $_) } @i };
	my $i       = $map->{ $round };

	return if( $self->is_flight() ); # Flights have only one round: prelim

	if( $self->{ method } eq 'aau-single-cutoff' ) {
		my $n    = int( @{$self->{ athletes }});

		if    ( $round eq 'ro2' )              { $i = $first; }
		elsif ( $round eq 'prefin' )           { $i = $map->{ ro4a }; } # Proceed directly to the last match of the Ro4 from prefin (seeding) round
		elsif ( $round eq 'semfin' && $n > 3 ) { $i = $map->{ ro4b }; } # Divisions of more than 3 skip prefin (seeding) round
		else                                   { $i++; }

	} else {
		if    ( $round eq 'finals' ) { $i = $first; }
		else                         { $i++;        }
	}

	# ===== GO TO NEXT ROUND
	$self->{ state } = 'score';
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
	my @rounds  = $self->rounds();
	my @i       = grep { exists $self->{ order }{ $rounds[ $_ ] } } (0 .. $#rounds);
	my $first   = $i[ 0 ];
	my $map     = { map { ($rounds[ $_ ] => $_) } @i };
	my $i       = $map->{ $round };

	if( $self->{ method } eq 'aau-single-cutoff' ) {
		my $n    = int( @{$self->{ athletes }});

		if    ( $round eq 'semfin' )           { $i = $map->{ ro2 }; }
		elsif ( $round eq 'ro4b' )             { $i = $map->{ semfin }; } 
		elsif ( $round eq 'ro4a' )             { $i = $map->{ ro4b } ? $map->{ ro4b } : ($map->{ prefin } ? $map->{ prefin } : $map->{ semfin }); } 
		else                                   { $i++; }

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
sub next_available_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next athlete that needs a score and has not been withdrawn or disqualified
#*
	my $self      = shift;
	my $round     = $self->{ round };
	my $available = undef;
	my @athletes  = $self->athletes_in_round();
	my $searched  = 0;
	do {
		$self->{ current } = $self->athletes_in_round( 'next' );
		$available = ! $self->{ athletes }[ $self->{ current } ]{ scores }{ $round }->complete();
		$searched++;
	} while( ! $available && $searched < int( @athletes ));
	$self->{ state } = 'score';
	$self->{ form }  = 0;
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
		next unless exists $self->{ order }{ $round } && defined $self->{ order }{ $round };
		my @athletes_in_round = @{$self->{ order }{ $round }};
		foreach my $i (@athletes_in_round) {
			my $scores = $self->{ athletes }[ $i ]{ scores }{ $round };
			$scores = $self->{ athletes }[ $i ]{ scores }{ $round } = new FreeScore::Forms::WorldClass::Division::Round() if( ! defined $scores );
			$scores->calculate_means( $self->{ judges } );
		}
	}
}

# ============================================================
sub resolve_ties {
# ============================================================
# P: Presentation score, HL: High/Low score, TB: Tie-breaker form required
	my $a = shift;
	my $b = shift;
	my $x = shift;
	my $y = shift;

	my $xt = sprintf( "%.3f", $x->{ adjusted }{ total });
	my $yt = sprintf( "%.3f", $y->{ adjusted }{ total });

	return unless( $xt == $yt && $xt != 0 );

	my $json = new JSON::XS();
  my $n    = int( @{$x->{ forms }});
	my $xn   = $x->{ notes } ? $json->decode( $x->{ notes }) : {};
	my $yn   = $y->{ notes } ? $json->decode( $y->{ notes }) : {};

	my $xap  = sprintf( "%.3f", $x->{ adjusted }{ presentation } / $n);
	my $yap  = sprintf( "%.3f", $y->{ adjusted }{ presentation } / $n);

	if( $xap > $yap ) {
		$xn->{ $xap } = { results => 'win',  reason => "Pres. $xap" };
		$yn->{ $yap } = { results => 'loss', reason => "Pres. $yap" };

	} elsif( $xap < $yap ) {
		$xn->{ $xap } = { results => 'loss', reason => "Pres. $xap" };
		$yn->{ $yap } = { results => 'win',  reason => "Pres. $yap" };

	} else {
		$xn->{ $xap } = { results => 'tie', reason => "Pres. $xap" };
		$yn->{ $yap } = { results => 'tie', reason => "Pres. $yap" };
	}

	$x->{ notes } = $json->canonical->encode( $xn );
	$y->{ notes } = $json->canonical->encode( $yn );

	my $xat = sprintf( "%.3f", $x->{ allscore }{ total } / $n);
	my $yat = sprintf( "%.3f", $y->{ allscore }{ total } / $n);

	if( $xap == $yap ) { 
		if( $xat > $yat ) {
			$xn->{ $xat } = { results => 'win',  reason => "Total $xat" };
			$yn->{ $yat } = { results => 'loss', reason => "Total $yat" };
		} else {
			$xn->{ $xat } = { results => 'loss', reason => "Total $xat" };
			$yn->{ $yat } = { results => 'win',  reason => "Total $yat" };
		}
		$x->{ notes } = $json->canonical->encode( $xn );
		$y->{ notes } = $json->canonical->encode( $yn );
	}
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
sub rounds {
# ============================================================
	my $self = shift;
	local $_ = $self->{ method };

	if( /^aau-single-cutoff$/ ) { return ( qw( semfin prefin ro4b ro4a ro2 )); }
	else                        { return ( qw( prelim semfin finals )); }
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
sub _parse_flights {
# ============================================================
#** @function ( flight_text )
#   @brief Parses serialized flight text
#   @details For use with 'flight' header
#*
	my $value = shift;
	my ($id, $group, $state) = split /;/, $value;
	my $key = undef;
	($key, $id)     = split /\s*:\s*/, $id;
	($key, $group)  = split /\s*:\s*/, $group;
	$group          = [ split /\s*,\s*/, $group ];
	($key, $state)  = split /\s*:\s*/, $state;

	return { id => $id, group => $group, state => $state }; 
}

# ============================================================
sub _parse_forms {
# ============================================================
#** @function ( forms_text )
#   @brief Parses serialized form text
#   @details For use with 'forms' and 'tiebreakers' header
#*
	my $value = shift;

	my @rounds = map { 
		my ($round, $forms) = split /\s*:\s*/;
		my @forms = split /\s*,\s*/, $forms;
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

1;
