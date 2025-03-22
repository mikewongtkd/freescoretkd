package FreeScore::Forms::WorldClass::Method::Cutoff;
use base qw( FreeScore::Forms::WorldClass::Method );
use FreeScore::Forms::WorldClass::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use List::Util qw( any first shuffle );
use List::MoreUtils qw( first_index );
use Mojo::IOLoop;

our @rounds = [
	{ code => 'prelim', name => 'Preliminary', min => 20 },
	{ code => 'semfin', name => 'Semi-Finals', min => 9, max => 19 },
	{ code => 'finals', name => 'Finals',      min => 1, max => 8  }
];

our @states = (qw( score display ));

# ============================================================
sub advance_athletes {
# ============================================================
#** @method ( round )
#   @brief Advances the winning athletes of the current round to the next round
#*
	my $self     = shift;
	my $div      = $self->{ division };
	my $round    = shift || $div->{ round };
	my @rounds   = $div->rounds();
	my $i        = first_index { $_ eq $round } @rounds;
	my $i_n      = $i < $#rounds ? $i + 1 : undef;
	my $i_p      = $i > 0 ? $i - 1 : undef;
	my $previous = defined $i_p ? $rounds[ $i_p ] : undef;
	my $next     = defined $i_n ? $rounds[ $i_n ] : undef;

	# ===== DO NOTHING IF THERE ARE NO FURTHER ROUNDS
	if( ! defined $next ) { return; }

	# Flights have only one round (prelim); if it is completed, then mark the flight as complete (unless it is already merged)
	if( $div->is_flight() && $div->round_complete( 'prelim' ) && $div->{ flight }{ state } ne 'merged' ) {
		$div->{ flight }{ state } = 'complete';
		return;
	}

	# ===== ADVANCE WINNING ATHLETES TO THE NEXT ROUND IF CURRENT ROUND IS COMPLETE
	# Skip if the athletes have already been advanced to the current round
	my $skip    = exists $div->{ order }{ $next } && ref $div->{ order }{ $next } eq 'ARRAY' && int( @{$div->{ order }{ $next }}) > 0;
	my @winners = ();
	my $n       = int( @{ $div->{ athletes }} ); # Note: n is the number of registered athletes, not remaining eligible athletes

	return unless( $div->round_complete( $round ) && ! $skip );

	if( $round eq 'prelim' ) {
		my $half     = int( ($n-1)/2 );
		my @athletes = @{ $div->{ placement }{ $round }};
		my @eligible = $div->eligible_athletes( $round, @athletes );
		@winners     = shuffle (@eligible[ 0 .. $half ]);

	} elsif( $round eq 'semfin' ) {
		my $k        = $n > 8 ? 7 : ($n - 1);
		my @athletes = @{ $div->{ placement }{ $round }};
		my @eligible = $div->eligible_athletes( $round, @athletes );

		@winners = (@eligible[ 0 .. $k ]);
		@winners = reverse @winners if $next eq 'finals';
	}
	$div->assign( $_, $next ) foreach @winners;
}

# ============================================================
sub assign {
# ============================================================
#** @method ( athlete_index, round )
#   @brief Assigns the athlete to a round
#*
	my $self       = shift;
	my $i          = shift;
	my $round      = $self->{ round };
	my $div        = $self->{ division };
	my $judges     = $div->{ judges };
	my $athlete    = $div->{ athletes }[ $i ];

	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no forms designated for round $!" unless exists $div->{ forms }{ $round };
	my @compulsory = @{ $div->{ forms }{ $round }};
	my $forms      = int( @compulsory );
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;

	# Do nothing if athlete is already assigned to the round
	return if( any { $_ == $i } @{ $div->{ order }{ $round }});

	$div->reinstantiate_round( $round, $i );
	push @{ $div->{ order }{ $round }}, $i;
}

# ============================================================
sub autopilot_steps {
# ============================================================
	my $self     = shift;
	my $rm       = shift; # Request Manager
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $div      = $self->{ division };
	my $pause    = { score => 9, leaderboard => 12, brief => 1 };
	my $round    = $div->{ round };
	my $order    = $div->{ order }{ $round };
	my $forms    = $div->{ forms }{ $round };
	my $j        = first_index { $_ == $div->{ current } } @$order;

	my $last = {
		athlete => ($div->{ current } == $order->[ -1 ]),
		form    => ($div->{ form }    == int( @$forms ) - 1),
		round   => ($div->{ round } eq 'finals'),
		cycle   => (!(($j + 1) % 2)),
	};

	# ===== AUTOPILOT BEHAVIOR
	# Autopilot behavior comprises the two afforementioned actions in
	# serial, with delays between.
	my $step = {
		show => {
			score => sub { # Display the athlete's score for 9 seconds
				my $delay = shift;
				Mojo::IOLoop->timer( $pause->{ score } => $delay->begin );
				$request->{ action } = 'scoreboard';
				$rm->broadcast_updated_division( $request, $progress, $group );
			},
			leaderboard => sub { 
				my $delay = shift;

				die "Disengaging autopilot\n" unless $div->autopilot();

				print STDERR "Showing leaderboard.\n" if $DEBUG;
				$div->display() unless $div->is_display(); 
				$div->write(); 
				Mojo::IOLoop->timer( $pause->{ leaderboard } => $delay->begin );
				$request->{ action } = 'leaderboard';
				$rm->broadcast_updated_division( $request, $progress, $group );
			}
		},
		go => {
			next => sub { # Advance to the next form/athlete/round
				my $delay = shift;

				die "Disengaging autopilot\n" unless $div->autopilot();
				print STDERR "Advancing the division to next item.\n" if $DEBUG;

				my $go_next = {
					round   =>   $last->{ form } &&   $last->{ athlete } && ! $last->{ round },
					athlete =>   $last->{ form } && ! $last->{ athlete },
					form    => ! $last->{ form }
				};

				if    ( $go_next->{ round }   ) { $div->next_round(); $div->first_form(); }
				elsif ( $go_next->{ athlete } ) { $div->next_available_athlete(); }
				elsif ( $go_next->{ form }    ) { $div->next_form(); }
				$div->autopilot( 'off' ); # Finished. Disengage autopilot for now.
				$div->write();

				$request->{ action } = 'next';
				$rm->broadcast_updated_division( $request, $progress, $group );
			}
		}
	};

	# ===== SELECTIVELY CHOOSE AUTOPILOT BEHAVIOR STEPS
	my @steps = ();
	push @steps, $step->{ show }{ score };
	push @steps, $step->{ show }{ leaderboard } if( $last->{ form } && ( $last->{ cycle } || $last->{ athlete } )); # Display the leaderboard for 12 seconds every $cycle athlete, or last athlete
	push @steps, $step->{ go }{ next };

	return @steps;
}

# ============================================================
sub change_display {
# ============================================================
	my $self = shift;
	my $div  = $self->division();
	if( $div->is_display() ) { $div->score();   } 
	else                     { $div->display(); }
}

# ============================================================
sub clear_score {
# ============================================================
#** @method ( judge_index, score_object )
#   @brief Records the scores for Side-By-Side
#*
# score { index: int, major: float, minor: float, power: float, rhythm: float, ki: float } 
# 
	my $self    = shift;
	my $judge   = shift;
	my $i       = shift;
	my $div     = $self->{ division };
	my $round   = $div->{ round };
	my $form    = $div->{ form };

	$div->{ state } = 'score'; # Return to the scoring state when any judge scores
	if( $div->is_flight()) {
		my $started = 0;
		foreach $athlete (@{ $div->{ athletes }}) {
			$started ||= $div->reinstantiate_round( $round, $athlete )->started();
		}
		$div->{ flight }{ state } = 'ready' if( ! $started );
	}
	$div->reinstantiate_round( $round, $i )->clear_score( $form, $judge );
}

# ============================================================
sub detect_ties {
# ============================================================
	my $self      = shift;
	my $a         = shift;
	my $x         = shift;
	my $b         = shift;
	my $y         = shift;
	my $ties = shift;

	if( exists $x->{ tb } && int( @{$x->{ tb }}) == 3 ) {
		my $key = join( ',', @{$x->{ tb }});
		push @{ $ties->{ $key }}, $a unless grep { $_ == $a } @{ $ties->{ $key }};
	}
	if( exists $y->{ tb } && int( @{$y->{ tb }}) == 3 ) {
		my $key = join( ',', @{$y->{ tb }});
		push @{ $ties->{ $key }}, $b unless grep { $_ == $b } @{ $ties->{ $key }};
	}
}


# ============================================================
sub find_athlete {
# ============================================================
	my $self     = shift;
	my $div      = $self->{ division };
	my $option   = shift;
	my $athletes = $div->order();
	my $last     = $#$athletes;

	if( $option =~ /^(?:first|last)$/ ) {
		if( $option =~ /^first$/ ) {
			return 0;
		} else {
			return $last;
		}
	} elsif( $option =~ /^(?:next|prev)/ ) {
		my $i    = first_index { $_ == $div->{ current } } @$athletes;
		if( $option =~ /^next$/ ) {
			if( $i == $last ) { return 0; } # Wrap around to first
			return $athletes->[ $i + 1 ];
		} else {
			if( $i == 0 ) { return $last; } # Wrap around to last
			return $athletes->[ $i - 1 ];
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
	my $round  = shift || $div->{ round };
	my $div    = $self->{ division };
	my $judges = $div->{ judges };

	$div->{ state } ||= 'score';
	$div->{ form }  ||= 0;

	# ===== NORMALIZE THE SCORING MATRIX
	my $forms = int( @{ $div->{ forms }{ $round }});
	my $order = $div->order( $round );
	if( $order ) {
		$div->reinstantiate_round( $round, $_ ) foreach (@$order);
	}

	$div->{ current } = $div->athletes_in_round( 'first' ) unless defined $div->{ current };
}

# ============================================================
sub place_athletes {
# ============================================================
#** @method ()
#   @brief Calculates rankings for the current round. Auto-updates score averages.
#*
	my $self      = shift;
	my $div       = $self->{ division };
	my $round     = $div->{ round };
	my $ties      = {};
	my $placement = [];

	# ===== GET ALL THE ATHLETES FOR THE GIVEN ROUND
	my @athlete_indices = @{$div->{ order }{ $round }};

	# ===== SORT THE ATHLETES BY COMPULSORY FORM SCORES, THEN TIE BREAKER SCORES
	@$placement = sort { 
		my $x = $div->reinstantiate_round( $round, $a ); # a := first athlete index;  x := first athlete round scores
		my $y = $div->reinstantiate_round( $round, $b ); # b := second athlete index; y := second athlete round score

		my $comparison = $x->compare( $y );
		$self->detect_ties( $a, $x, $b, $y, $ties );

		$comparison;
	} @athlete_indices;
	
	$self->record_ties( $ties, $placement );

	# ===== ASSIGN PLACEMENTS
	@$placement = grep { defined $div->{ athletes }[ $_ ]{ scores }{ $round };     } @$placement; # Athlete is assigned to round
	@$placement = grep { $div->{ athletes }[ $_ ]{ scores }{ $round }->complete(); } @$placement; # Athlete's score is complete

	$div->{ placement }{ $round } = $placement;

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$div->{ order }{ $round }} ];
	@$pending   = grep { my $scores = $div->{ athletes }[ $_ ]{ scores }{ $round }; ! defined $scores || ! $scores->complete(); } @$pending; # Athlete's score is NOT complete

	$div->{ pending }{ $round } = $pending;
}

# ============================================================
sub record_score {
# ============================================================
#** @method ( judge_index, score_object )
#   @brief Records the scores for Side-By-Side
#*
# score { index: int, major: float, minor: float, power: float, rhythm: float, ki: float } 
# 
	my $self    = shift;
	my $judge   = shift;
	my $score   = shift;
	my $div     = $self->{ division };
	my $athlete = $div->{ athletes }[ $div->{ current } ];
	my $round   = $div->{ round };
	my $form    = $div->{ form };

	$div->{ state } = 'score'; # Return to the scoring state when any judge scores
	$div->{ flight }{ state } = 'in-progress' if( $div->is_flight() && $div->{ flight }{ state } eq 'ready' ); # Change flight status to in-progress once a judge has scored
	$div->reinstantiate_round( $round )->record_score( $form, $judge, $score );
}

# ============================================================
sub record_ties {
# ============================================================
	my $self = shift;
	my $ties = shift;


}

# ============================================================
sub code { return 'cutoff'; }
# ============================================================

1;
