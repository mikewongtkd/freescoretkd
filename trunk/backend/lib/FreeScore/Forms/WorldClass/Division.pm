package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Method;
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Division::Round::Score;
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
#     - judge
#       - [ judge index ]
#         - Score Object
#     - adjusted
#       - accuracy
#       - presentation
#       - total
#     - original
#       - accuracy
#       - presentation
#       - total
#     - penalties
#     - started
# - match
# - started
# - tiebreakers
#   (same substructure as forms)
# - total
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

	$self->method( $round )->assign( $i );
}

# ============================================================
sub assign_tiebreaker {
# ============================================================
#** @method ( athlete )
#   @brief Assigns the athlete to a tiebreaker round.
#*
	my $self       = shift;
	my $i          = shift;
	my $athlete    = $self->{ athletes }[ $i ];
	my $judges     = $self->{ judges } - 1;
	my $round      = $self->{ round };
	my $forms      = $self->{ tiebreakers }{ $round };

	if( exists $self->{ tiebreakers }{ $round } ) {
		$self->reinstantiate_round( $round, $i )->add_tiebreaker( $judges );
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
			$started ||= $self->reinstantiate_round( $round, $athlete )->started();
		}
		$self->{ flight }{ state } = 'ready' if( ! $started );
	}
	$self->reinstantiate_round( $round )->clear_score( $form, $judge );
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
sub edit_athletes {
# ============================================================
	my $self  = shift;
	my $edits = shift;
	my $round = shift || $self->{ round };

	my $order       = $self->order();
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

	$self->order( $round, $reorder );
	$self->normalize();
}

# ============================================================
sub eligible_athletes {
# ============================================================
#** @method ( round, athlete_indices )
#   @brief Returns a filtered list of given athlete indices where the athlete has not been disqualified or withdrawn for the given round
#*
	my $self       = shift;
	my $round      = shift;
	my @candidates = @_;
	my @eligible   = ();

	foreach my $candidate (@candidates) {
		my $r = $self->{ athletes }[ $candidate ]{ scores }{ $round };
		next if( exists $r->{ decision } && (exists $r->{ decision }{ disqualify } || exists $r->{ decision }{ withdraw }));
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
sub initialize {
# ============================================================
#** @method ( athletes, order ) [round]
#   @brief Initializes the athlete information and competition order.
#*
	my $self     = shift;
	my $athletes = shift; # Dictionary of athletes by name (not by index!)
	my $order    = shift; # Athlete order by name (not by index!)
	my $round    = shift || $self->{ round };

	$self->{ state } ||= 'score';
	$self->{ form }  ||= 0;

	# ===== AUTODETECT THE FIRST ROUND
	if( exists $order->{ autodetect_required } ) {
		my $n      = int( keys %$athletes );
		my $flight = $self->is_flight();

		if( $n == 0 ) { die "Division Configuration Error: No athletes declared $!"; }

		if( $flight ) {
			$round = 'prelim'; 
			$order->{ prelim } = $order->{ autodetect_required }; 

		} else {
			foreach my $r ($self->rounds( 'object', 'nofilter' )) {
				my $rcode = $r->{ code };
				my $min   = exists $r->{ min } ? $r->{ min } : $n;
				my $max   = exists $r->{ max } ? $r->{ max } : $n;

				if( $n >= $min && $n <= $max ) { 
					$round = $rcode;
					$order->{ $rcode } = $order->{ autodetect_required };
					last;
				}
			}
		}

		delete $order->{ autodetect_required };
	}

	# ===== CONVERT FROM NAME INDEX TO NUMERIC INDEX
	# Indices have full document scope; that is, recurring names in subsequent
	# rounds refer to the same athlete of the same name from the previous
	# round, and therefore should have the same numeric index.
	my $numeric_index = {};
	foreach my $round ($self->rounds( 'code', 'nofilter' )) {
		next unless exists $order->{ $round };

		# Establish order by athlete name, based on the earliest round
		if( keys %$numeric_index ) {
			foreach my $name (@{ $order->{ $round }}) {
				next unless exists $numeric_index->{ $name };
				my $i = $numeric_index->{ $name };
				$self->assign( $i, $round );
			}

		# No initial order set; this must be the earliest round
		} else {
			foreach my $i ( 0 .. $#{ $order->{ $round }}) {
				my $name = $order->{ $round }[ $i ];
				$numeric_index->{ $name } = $i;
				$athletes->{ $name }{ id } = $i unless exists $athletes->{ $name }{ id };
				$self->assign( $i, $round );
				push @{ $self->{ athletes }}, $athletes->{ $name };
			}
		}
	}

	# ===== INITIALIZE ROUND LIST
	# Do NOT use this cache; instead invoke $self->rounds() to get the list
	# fresh (in case the division is edited; e.g. more athletes are added)
	$self->{ rounds } = [ $self->rounds() ];

	$self->method->initialize();
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
sub matches_string {
# ============================================================
	my $self    = shift;
	my $bracket = {};

	foreach my $round ($self->rounds()) {
		my $method = $self->method( $round );
		next if $method eq 'cutoff';
		next unless $self->round_defined( $round );
		my $matches = $method->matches();
		$_->winner() foreach grep { $_->complete() } $matches->list();
		$bracket->{ $round } = $matches->data();
	}

	return '' if( int( keys %$bracket) == 0 );

	my $json = new JSON::XS();
	return $json->canonical->encode( $bracket );
}

# ============================================================
sub method {
# ============================================================
	my $self   = shift;
	my $round  = shift || $self->{ round };
	my $method = exists $self->{ method } && $self->{ method } ? $self->{ method } : 'cutoff';
	my $mcode  = undef;

	if( ref $method eq 'HASH' && exists $method->{ $round }) {
		$mcode = $method->{ $round } 
	} else {
		$mcode = $method;
	}

	return FreeScore::Forms::WorldClass::Method::factory( $mcode, $self, $round );
}

# ============================================================
sub method_string {
# ============================================================
	my $self   = shift;
	my $method = $self->{ method };

	if( ref $method ) {
		my $json = new JSON::XS();
		return $json->canonical->encode( $method );
	} else {
		my $method = $self->method();
		return $method->string();
	}
}

# ============================================================
sub methods {
# ============================================================
	my $self   = shift;
	my $round  = shift || $self->{ round };
	my $method = exists $self->{ method } && $self->{ method } ? $self->{ method } : 'cutoff';

	if( ref $method eq 'HASH' ) {
		my $methods = {};
		foreach my $rcode (keys %$method) {
			my $mcode = $method->{ $rcode };
			$methods->{ $rcode } = FreeScore::Forms::WorldClass::Method::factory( $mcode, $self, $rcode );
		}
		return $methods;

	} else {
		return FreeScore::Forms::WorldClass::Method::factory( $method, $self, $round );
	}
}

# ============================================================
sub normalize {
# ============================================================
	my $self   = shift;
	my @rounds = $self->rounds();

	foreach my $round (@rounds) {
		my $method = $self->method( $round );
		$method->normalize( $round );
	}
}

# ============================================================
sub place_athletes {
# ============================================================
	my $self = shift;
	$self->method->place_athletes();
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

	my $round    = 'autodetect_required';
	my $order    = {}; # Athlete order by name (not by index!)
	my $athletes = {}; # Dictionary of athletes by name (not by index!)
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
				if    ( $key eq 'draws'     ) { $self->{ $key } = _parse_json( $value );      }
				elsif ( $key eq 'flight'    ) { $self->{ $key } = _parse_flights( $value );   }
				elsif ( $key eq 'forms'     ) { $self->{ $key } = _parse_forms( $value );     }
				elsif ( $key eq 'matches'   ) { $self->{ $key } = _parse_json( $value );      }
				elsif ( $key eq 'method'    ) { $self->{ $key } = _parse_json( $value );      }
				elsif ( $key eq 'order'     ) { $self->{ $key } = _parse_order( $value );     }
				elsif ( $key eq 'places'    ) { $self->{ $key } = _parse_places( $value );    }
				elsif ( $key eq 'placement' ) { $self->{ $key } = _parse_placement( $value ); }
				else                          { $self->{ $key } = $value;                     }

				$round = $self->{ round } if( defined $self->{ round } );

			# Round information is explicitly given
			} elsif( /prelim|ro256|ro128|ro64|ro32|semfin|ro16|finals|ro8|ro4|ro2/i ) {
				s/^#\s+//;

				# Store the last athlete for the previous round
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

				next unless( $major || $minor || $rhythm || $power || $ki );

				my $score  = { major => $major, minor => $minor, rhythm => $rhythm, power => $power, ki => $ki };
				my $forms  = int( @{ $self->{ forms }{ $round }});
				my $judges = $self->{ judges };
				my $ar     = $self->reinstantiate_round( $round, $athlete );
				$ar->record_score( $form, $judge, $score );

			# Penalties for out-of-bounds (0.3 per error), time limit (0.3 for under or over), or athlete/coach misconduct (prohibited acts, no penalty)
			} elsif ( $judge =~ /^p/ ) {

				my @criteria  = (@FreeScore::Forms::WorldClass::Division::Round::PENALTIES, @FreeScore::Forms::WorldClass::Division::Round::GAMJEOMS, @FreeScore::Forms::WorldClass::Division::Round::TIME);
				my $penalties = { map { $_ => shift @score_criteria } @criteria };
				my $forms     = int( @{ $self->{ forms }{ $round }});
				my $judges    = $self->{ judges };
				my $ar        = $self->reinstantiate_round( $round, $athlete );
				$ar->record_penalties( $form, $penalties );

			# Status notes describe athlete withdraw or disqualification
			} elsif ( $judge =~ /^s/ ) {
				my $decision  = [ (map { my ($key, $value) = split /=/, $_, 2; ($key); } @score_criteria) ];
				my $forms     = int( @{ $self->{ forms }{ $round }});
				my $judges    = $self->{ judges };
				my $ar        = $self->reinstantiate_round( $round, $athlete );
				$ar->record_decision( $form, $_ ) foreach @$decision;
			}

		} else {
			die "Database Read Error: Unknown line type '$_'\n";
		}
	}
	if( $athlete->{ name } ) { push @{ $order->{ $round }}, $athlete->{ name }; } # Store the last athlete.
	close FILE;

	$self->initialize( $athletes, $order );
	$self->normalize();
	$self->update_status();
}

# ============================================================
sub record_draw {
# ============================================================
#** @method ( draw_object )
#   @brief Records the form draw for a given match
#*
	my $self   = shift;
	my $form   = shift;
	my $round  = $self->{ round };
	my $match  = $self->method->matches->current();
	my $mnum   = $match->{ number };
	my $i      = $self->{ form };

	$self->{ draws } = {} unless exists $self->{ draws };
	$self->{ draws }{ $round } = {} unless exists $self->{ draws }{ $round };
	$self->{ draws }{ $round }{ $mnum } = [] unless exists $self->{ draws }{ $round }{ $mnum };

	$self->{ draws }{ $round }{ $mnum }[ $i ] = $form;
}

# ============================================================
sub record_score {
# ============================================================
#** @method ( judge_index, score_object )
#   @brief Records the given score for the given judge
#*
	my $self   = shift;
	my $judge  = shift;
	my $score  = shift;
	my $method = $self->method();

	$method->record_score( $judge, $score );
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

	$self->reinstantiate_round( $round )->record_penalties( $form, $penalties );
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

	$self->reinstantiate_round( $round, $i )->record_decision( $form, $decision );
	if( $self->is_flight()) {
		my $started = 0;
		foreach $athlete (@{ $self->{ athletes }}) {
			$started ||= $self->reinstantiate_round( $round, $i )->started();
		}
		if( $started ) { $self->{ flight }{ state } = 'in-progress'; } 
		else           { $self->{ flight }{ state } = 'ready';       }
	}
}

# ============================================================
sub reinstantiate_round {
# ============================================================
	my $self       = shift;
	my $round      = shift;
	my $i          = shift; $i = defined $i ? $i : $self->{ current }; # Athlete index or reference to Athlete
	my $athlete    = ref $i ? $i : $self->{ athletes }[ $i ];
	my $judges     = $self->{ judges };
	my @compulsory = exists $self->{ forms }{ $round } && $self->{ forms }{ $round } ? @{ $self->{ forms }{ $round }} : ();
	my $forms      = int( @compulsory );

	die "No forms defined for $round $!" unless $forms;

	return $athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
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
	my $order     = $self->order( $round );
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
sub round_complete {
# ============================================================
	my $self  = shift;
	my $round = shift || $self->{ round };

	my $order = $self->order( $round );
	return 0 unless( defined $order && int(@$order) > 0 );

	my @athletes = $self->athletes_in_round( $round );

	return 0 unless @athletes;

	my $complete = all { $self->reinstantiate_round( $round, $_ )->complete() } @athletes;

	return $complete;
}

# ============================================================
sub round_defined {
# ============================================================
	my $self  = shift;
	my $round = shift;

	return exists $self->{ order }{ $round } && defined $self->{ order }{ $round } && ref $self->{ order }{ $round } eq 'ARRAY' && int( @{$self->{ order }{ $round }}) > 0;
}

# ============================================================
sub rounds {
# ============================================================
	my $self     = shift;
	my $mode     = shift; # Undef for round codes, 'object' for round objects
	my $nofilter = shift; # Undef to enable filter; 'nofilter' to disable filter
	my @rounds   = ();
	my $method   = exists $self->{ method } && $self->{ method } ? $self->{ method } : 'cutoff';
	my @order    = @FreeScore::Forms::WorldClass::Division::round_order;

	# Combination methods
	if( ref( $method ) eq 'HASH' ) {
		@rounds = grep { exists $self->{ method }{ $_ } } @order;

	} else {
		# Cutoff
		if( $method eq 'cutoff' ) {
			@rounds = qw( prelim semfin finals );

		# Single Elimination (SE) or Side-by-Side (SBS)
		} elsif( $method eq 'se' || $self->{ method } eq 'sbs' ) {
			@rounds = qw( ro256 ro128 ro64 ro32 ro16 ro8 ro4 ro2 );
		}
	}

	# Get the first round and all rounds thereafter
	unless( defined $nofilter ) {
		my $i = first_index { $self->round_defined( $_ ) } @rounds;
		die "Database error: No first round defined for $method$!" unless int( @rounds ) && $i >= 0;
		@rounds = map { $rounds[ $_ ] } ( $i .. $#rounds );
	}


	# Convert to objects if so requested
	@rounds = map { $self->method( $_ )->round( $_ ) } @rounds if $mode =~ /^object/i;

	return @rounds;
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
sub state {
# ============================================================
	my $self   = shift;
	my $state  = shift;

	return $self->{ state } unless defined $state;

	my $method = $self->method();
	return $method->state( $state );
}

# ============================================================
sub update_status {
# ============================================================
#** @method ()
#   @brief Determine athlete placements and tie detection
#*
	my $self   = shift;
	my $method = $self->method();
	my $round  = $self->{ round };

	# ===== CALCULATE SCORE MEANS FOR ALL ROUNDS
	$self->calculate_totals();

	# ===== SORT THE ATHLETES TO THEIR PLACES (1st, 2nd, etc.) AND DETECT TIES
	# Update after every completed score to give real-time audience feedback
	$self->place_athletes(); 

	$method->advance_athletes();
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
	my $json   = new JSON::XS();

	# ===== COLLECT THE FORM NAMES TOGETHER PROPERLY
	my @forms = ();
	my @tiebreakers = ();
	foreach my $round ($self->rounds()) {
		push @forms,       "$round:" . join( ",", @{$self->{ forms }{ $round }} )       if exists $self->{ forms }{ $round }       && @{ $self->{ forms }{ $round }};
		push @tiebreakers, "$round:" . join( ",", @{$self->{ tiebreakers }{ $round }} ) if exists $self->{ tiebreakers }{ $round } && @{ $self->{ tiebreakers }{ $round }};
	}

	# ===== PREPARE THE PLACEMENTS AND PENDING ATHLETES
	$self->{ placement } = {} unless exists $self->{ placement } && defined $self->{ placement };
	my $flight = '';
	if( $self->is_flight()) { $flight = "id:$self->{ flight }{ id };group:" . join( ",", @{ $self->{ flight }{ group }}) . ";state:$self->{ flight }{ state }"; }

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# form=$self->{ form }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# autopilot=$self->{ autopilot }\n" if exists( $self->{ autopilot }) && defined( $self->{ autopilot } );
	print FILE "# method=" . $self->method_string() . "\n" if exists( $self->{ method }) && $self->{ method } ne 'cutoff';
	print FILE "# matches=" . $self->matches_string() . "\n" if exists( $self->{ matches }) && $self->{ matches };
	print FILE "# description=$self->{ description }\n";
	print FILE "# forms=" . join( ";", @forms ) . "\n" if @forms;
	print FILE "# draws=" . $json->canonical->encode( $self->{ draws }) . "\n" if exists $self->{ draws } && ref $self->{ draws } eq 'HASH' && int( keys %{$self->{ draws }}) > 0;
	print FILE "# placement=" . $json->canonical->encode( $self->{ placement }) . "\n" if exists $self->{ placement } && ref $self->{ placement } eq 'HASH' && int( keys %{$self->{ placement }}) > 0;
	print FILE "# flight=$flight\n" if $self->is_flight();
	foreach my $round ($self->rounds()) {
		my $order = $self->order( $round );
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
	elsif ( $object eq 'match'   ) { $self->{ current } = $value; }
	elsif ( $object eq 'form'    ) { $self->{ form }    = $value; }
}

# ============================================================
sub navigate_to_start {
# ============================================================
#** @method ()
#   @brief Navigates the division to the beginning
#*
	my $self   = shift;
	my @rounds = $self->rounds();
	my $first  = $rounds[ 0 ];

	$self->{ round }   = $first;
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
	my $i       = first_index { $_ eq $round } @rounds;
	my $first   = $rounds[ 0 ];
	my $last    = $rounds[ -1 ];

	return if( $self->is_flight() ); # Flights have only one round: prelim

	if( $round eq $last ) { $i = 0; }
	else                  { $i++;   }
	my $next = $rounds[ $i ];

	# ===== GO TO NEXT ROUND
	$self->{ state } = 'score';
	$self->{ round } = $next;

	# ===== GO TO THE FIRST FORM IN THAT ROUND
	$self->{ form } = 0;

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
	my $i       = first_index { $_ eq $round } @rounds;
	my $first   = $rounds[ 0 ];
	my $last    = $rounds[ -1 ];

	if( $round eq $first ) { $i = $last; } # first round wraps around to finals
	else                   { $i--;       }
	my $prev = $rounds[ $i ];

	# ===== GO TO PREVIOUS ROUND
	$self->{ state } = 'score';
	$self->{ round } = $prev;

	# ===== GO TO THE LAST FORM IN THAT ROUND
	$self->{ form } = $#{$self->{ forms }{ $prev }};

	# ===== GO TO THE LAST ATHLETE IN THAT ROUND
	$self->{ current } = $self->athletes_in_round( 'last' );
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
		$available = ! $self->reinstantiate_round( $round )->complete();
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
sub order {
# ============================================================
#** @method () [ round, value ]
#   @brief Returns the order for the given round, assigning the optional value if provided
#*
	my $self  = shift;
	my $order = $self->order_with_byes( @_ );

	return undef unless defined $order;

	return [ grep { defined $_ } @$order ];
}

# ============================================================
sub order_with_byes {
# ============================================================
#** @method () [ round, value ]
#   @brief Returns the order for the given round
#*
	my $self  = shift;
	my $round = shift || $self->{ round };
	my $value = shift;
	
	$self->{ order }{ $round } = $value if( $value );
	return undef unless exists  $self->{ order }{ $round };
	return undef unless defined $self->{ order }{ $round };
	return undef unless ref $self->{ order }{ $round } eq 'ARRAY';
	return undef unless int( @{$self->{ order }{ $round }});

	return $self->{ order }{ $round };
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
sub calculate_totals {
# ============================================================
	my $self = shift;

	foreach my $round (keys %{ $self->{ forms }}) {
		my $order = $self->order( $round );
		next unless $order;
		my @athletes_in_round = @$order;
		foreach my $i (@athletes_in_round) {
			my $scores = $self->{ athletes }[ $i ]{ scores }{ $round };
			$scores = $self->{ athletes }[ $i ]{ scores }{ $round } = new FreeScore::Forms::WorldClass::Division::Round() if( ! defined $scores );
			$scores->calculate_totals( $self->{ judges } );
		}
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
	my @rounds = $self->rounds();
	
	# ===== REQUEST FOR ALL ATHLETES IN A GIVEN ROUND
	if( grep { $_ eq $option } @rounds ) {
		my $order = $self->order( $option );
		return $order ? @$order : ();
	}

	# ===== REQUEST FOR AN ATHLETE IN THE CURRENT ROUND
	my $i     = $self->method->find_athlete( $option );
	my $order = $self->order();

	die "No order specified for $self->{ round } $!" unless $order;

	return $order->[ $i ];
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
sub _parse_json {
# ============================================================
#** @function ( json_text )
#   @brief Parses serialized json text, which is simply a string or JSON
#   @details For use with 'matches' and 'method' header
#*
	my $value = shift;

	if( $value =~ /^(?:\{|\[)/ ) {
		my $json = new JSON::XS();
		return $json->decode( $value );

	} else {
		return $value;
	}
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
		my @places = grep { /^(?:\d+)$/ } split /,/, $list;
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
	my $value  = shift;
	my $data   = _parse_json( $value );
	return $data if( ref $data );

	my @rounds = map {
		my ($round, $list) = split /:/;
		my @placements = grep { /^\d+$/ } split /,/, $list;
		($round => [ @placements ]);
	} split /;/, $value;
	return { @rounds };
}

our @round_order = (qw( prelim ro256 ro128 ro64 ro32 semfin ro16 finals ro8 ro4 ro2 ));
our $round_name  = { prelim => 'Preliminary', semfin => 'Semi-Finals', finals => 'Finals' };

1;
