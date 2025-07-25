package FreeScore::Forms::WorldClass::Method::SingleElimination;
use base qw( FreeScore::Forms::WorldClass::Method );
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Method::SingleElimination::Matches;
use List::Util qw( all any max uniq );
use List::MoreUtils qw( first_index );
use Data::Dumper;

our $DEBUG  = 1;
our @rounds = (
	{ code => 'ro256', name => 'Round of 256',  matches => 128, min => 129, max => 256 },
	{ code => 'ro128', name => 'Round of 128',  matches => 64,  min => 65,  max => 128 },
	{ code => 'ro64',  name => 'Round of 64',   matches => 32,  min => 33,  max => 64  },
	{ code => 'ro32',  name => 'Round of 32',   matches => 16,  min => 17,  max => 32  },
	{ code => 'ro16',  name => 'Round of 16',   matches => 8,   min => 9,   max => 16  },
	{ code => 'ro8',   name => 'Quarterfinals', matches => 4,   min => 5,   max => 8   },
	{ code => 'ro4',   name => 'Semifinals',    matches => 2,   min => 3,   max => 4   },
	{ code => 'ro2',   name => 'Finals',        matches => 1,   min => 1,   max => 2   }
);

our @states = ( qw( scores results bracket leaderboard matches ));

# ============================================================
sub advance_athletes {
# ============================================================
#** @method ( round )
#   @brief Advances the winning athletes of the current round to the next round
#*
	my $self     = shift;
	my $div      = $self->{ division };
	my $round    = $self->{ round };
	my @rounds   = $div->rounds();
	my $i        = first_index { $_ eq $round } @rounds;
	my $j        = $i < $#rounds ? $i + 1 : undef;
	my $next     = defined $j ? $rounds[ $j ] : undef;
	my $matches  = $self->matches();

	# ===== SKIP IF THERE IS NO NEXT ROUND OR THE ROUND IS NOT COMPLETE
	return unless defined $next;
	return unless all { $_->complete() } $matches->list();

	# ===== ADVANCE WINNING ATHLETES TO THE NEXT ROUND IF CURRENT ROUND IS COMPLETE
	# Skip if the athletes have already been advanced to the next round
	my $already_done = $div->round_defined( $next );
	return if $already_done;

	my @winners = $self->calculate_winners();

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
	my $div        = $self->{ division };
	my $round      = shift || $self->{ round };
	my $judges     = $div->{ judges };

	my $athlete = defined $i ? $div->{ athletes }[ $i ] : { name => 'BYE' };
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no forms designated for round $!" unless exists $div->{ forms }{ $round };
	my $forms   = int(@{ $div->{ forms }{ $round }});
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;

	if( defined $i ) {
		# Do nothing if athlete is already assigned to the round
		return if any { $_ == $i } @{ $div->{ order }{ $round }};
		$div->reinstantiate_round( $round, $i );
	}

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
	my $pause    = { matches => 7, score => 7, results => 7, bracket => 12, leaderboard => 12, brief => 1 };
	my $round    = $div->{ round };
	my $order    = $div->order( $round );
	my $forms    = $div->{ forms }{ $round };
	my $j        = first_index { $_ == $div->{ current } } @$order;
	my $matches  = $self->matches();

	my $last = {
		match   => $matches->current->is_last(),
		athlete => $div->{ current } == $matches->current->last_athlete(),
		form    => ($div->{ form }   == int( @$forms ) - 1),
		round   => ($round eq 'ro2'),
	};

	# ===== AUTOPILOT BEHAVIOR
	# Autopilot behavior comprises the two afforementioned actions in
	# serial, with delays between.
	my $step = {
		show => {
			score => sub { # Display the athlete's score for 9 seconds
				my $delay = shift;
				die "Disengaging autopilot\n" unless $div->autopilot();
				print STDERR "Showing score.\n" if $DEBUG;
				unless( $div->state() eq 'score' ) {
					$div->state( 'score' );
					$div->write(); 
				}
				Mojo::IOLoop->timer( $pause->{ score } => $delay->begin );
				$request = { type => 'autopilot', action => 'scoreboard', delay => $pause->{ score }};
				$rm->broadcast_updated_division( $request, $progress, $group );

			},
			bracket => sub { 
				my $delay = shift;
				die "Disengaging autopilot\n" unless $div->autopilot();
				print STDERR "Showing division bracket.\n" if $DEBUG;
				unless( $div->state() eq 'bracket' ) {
					$div->state( 'bracket' );
					$div->write(); 
				}
				Mojo::IOLoop->timer( $pause->{ bracket } => $delay->begin );
				$request = { type => 'autopilot', action => 'bracket', delay => $pause->{ leaderboard }};
				$rm->broadcast_updated_division( $request, $progress, $group );
			},
			leaderboard => sub { 
				my $delay = shift;
				die "Disengaging autopilot\n" unless $div->autopilot();
				print STDERR "Showing leaderboard.\n" if $DEBUG;
				unless( $div->state() eq 'leaderboard' ) {
					$div->state( 'leaderboard' );
					$div->write(); 
				}
				Mojo::IOLoop->timer( $pause->{ leaderboard } => $delay->begin );
				$request = { type => 'autopilot', action => 'leaderboard', delay => $pause->{ leaderboard }};
				$rm->broadcast_updated_division( $request, $progress, $group );
			},
			matches => sub {
				my $delay = shift;
				die "Disengaging autopilot\n" unless $div->autopilot();
				print STDERR "Showing matches.\n" if $DEBUG;
				unless( $div->state() eq 'matches' ) { $div->state( 'matches' ); }
				$div->autopilot( 'off' ); # Finished. Disengage autopilot for now.
				$div->write(); 
				Mojo::IOLoop->timer( $pause->{ matches } => $delay->begin );
				$request = { type => 'autopilot', action => 'matches', delay => $pause->{ score }};
				$rm->broadcast_updated_division( $request, $progress, $group );
			}
		},
		go => {
			next => sub { # Advance to the next form/athlete/match/round
				my $delay = shift;

				die "Disengaging autopilot\n" unless $div->autopilot();
				print STDERR "Advancing the division to next item.\n" if $DEBUG;

				# Go to X => after Y
				my $go = {
					chung => ! $last->{ form } && $last->{ athlete },
					hong  => ! $last->{ athlete },
					next  => {
						round   =>  $matches->complete() && ! $last->{ round },
						match   =>  $matches->current->complete() && ! $last->{ match },
						form    =>  ! $last->{ form } && $last->{ athlete }
					}
				};

				# ===== ATHLETE NAVIGATION
				if    ( $go->{ chung }) { $div->navigate( 'athlete', $matches->current->chung() ); }
				elsif ( $go->{ hong })  { $div->navigate( 'athlete', $matches->current->hong() ); }

				# ===== FORM/MATCH/ROUND NAVIGATION
				if    ( $go->{ next }{ round }) { 
					$div->next_round(); # Advance the round
					my $first = $div->method->matches->first->first_athlete(); # Get new method object for matches in the new round and get the first athlete of the first match
					$div->navigate( 'athlete', $first ); # Advance to the first athlete in the first match of the new round
					$div->first_form(); # Reset to the first form

				} elsif ( $go->{ next }{ match }) { 
					$div->navigate( 'athlete', $matches->next->first_athlete() ); # Same round, so we can use the cached matches object
					$div->first_form();

				} elsif ( $go->{ next }{ form }) { 
					$div->next_form(); 
				}

				$div->write();

				Mojo::IOLoop->timer( $pause->{ brief } => $delay->begin );
				$request = { type => 'autopilot', action => 'next', delay => $pause->{ brief }};
				$rm->broadcast_updated_division( $request, $progress, $group );
			}
		}
	};

	# ===== SELECTIVELY CHOOSE AUTOPILOT BEHAVIOR STEPS
	my @steps = ();
	push @steps, $step->{ show }{ score };
	push @steps, $step->{ show }{ results } if((int( @$forms ) > 1) && $matches->current->complete());
	push @steps, $step->{ show }{ bracket } if( $matches->current->complete() && ! $last->{ round }); # Display the bracket whenever it's not the last match of the division
	push @steps, $step->{ show }{ leaderboard } if( $last->{ round } && $matches->current->complete() ); # Display the leaderboard when the last match of the division is completed
	push @steps, $step->{ go }{ next };
	push @steps, $step->{ show }{ match } unless( $matches->current->started());

	return @steps;
}

# ============================================================
sub bracket {
# ============================================================
#** @method ()
#   @brief Brackets the athletes into matches
#*
	my $self     = shift;
	my $rcode    = $self->{ round };
	my $div      = $self->{ division };
	my @order    = @{$div->order_with_byes( $rcode )};
	my $athletes = int( @order ); # Number of athletes
	my $k        = $#order;       # Index of last athlete
	my $round    = $self->round( $rcode );
	my $bracket  = [];

	# Use cached bracket if bracket is already calculated
	if( exists $div->{ matches }{ $rcode } && ref( $div->{ matches }{ $rcode }) eq 'ARRAY' ) {
		return [ map {[ $_->{ chung }, $_->{ hong } ]} @{$div->{ matches }{ $rcode }}];
	}

	die "Database error: $div->{ name } $athletes athletes unsuitable for round '$rcode' (required range: $round->{ min } to $round->{ max } athletes) $!" if( $athletes < $round->{ min } || $athletes > $round->{ max });

	my $n = $round->{ matches } - 1; # Index of last match
	foreach my $mnum ( 0 .. $n ) {
		my $i = $mnum;
		my $j = $round->{ max } - ($i + 1);

		# Skip if there are more matches than remaining athletes
		next if( $i > $j );

		my $match = [];
		push @$bracket, $match;

		# Assign Chung athlete
		my $chung = $order[ $i ];
		push @$match, $chung;

		# Assign Hong athlete
		my $hong = $j <= $k ? $order[ $j ] : undef;
		push @$match, $hong;
	}

	return $bracket;
}

# ============================================================
sub calculate_winners {
# ============================================================
	my $self     = shift;
	my $div      = $self->{ division };
	my $matches  = $self->matches();
	delete $_->{ winner } foreach $matches->list(); # Clear cache
	my @complete = grep { $_->complete() } $matches->list(); # List of completed matches
	my @winners  = int( @complete ) > 0 ? map { $_->winner() } @complete : ();

	return @winners;
}

# ============================================================
sub change_display {
# ============================================================
	my $self   = shift;
	my $div    = $self->division();
	my $states = [ qw( matches score results bracket leaderboard )];
	my $i      = first_index { $_ eq $div->{ state } } @$states;

	if   ( $i >= $#$states ) { $i = 0; }
	elsif( $i < 0 )          { warn "Invalid state '$div->{ state }'; defaulting to 'score' $!"; $i = 1; }
	else                     { $i++; }

	$div->{ state } = $states->[ $i ];
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
	$div->reinstantiate_round( $round, $i )->clear_score( $form, $judge );
}

# ============================================================
sub find_athlete {
# ============================================================
	my $self    = shift;
	my $option  = shift;
	my $div     = $self->{ division };
	my $round   = $div->{ round };
	my $order   = $div->order( $round );
	my $matches = $self->matches();
	my $aid     = undef;

	if( $option =~ /^(?:first|last)$/ ) {
		if( $option =~ /^first$/ ) {
			$aid = $matches->first->first_athlete();
		} else {
			$aid = $matches->last->last_athlete();
		}

	} elsif( $option =~ /^(?:chung|hong)/ ) {
		if( $option =~ /^next$/ ) {
			$aid = $matches->current->chung();
		} else {
			$aid = $matches->current->hong();
		}

	} elsif( $option =~ /^(?:next|prev)/i ) {
		my $match = $matches->current();
		if( $option =~ /^next$/i ) {

			# Note assymetric behavior: 
			# - athlete -> next means next available athlete
			# - athlete -> prev means previous athlete, regardless of match status
			if( $match->contested() && ! $match->complete()) {
				if    ( $match->first_athlete() == $div->{ current }) { $aid = $match->last_athlete();  } 
				elsif ( $match->last_athlete()  == $div->{ current }) { $aid = $match->first_athlete(); }
			} else {
				my $next = $matches->next();
				$aid = $next->first_athlete() if $next;
				warn "No next match $!";
			}
		} else {
			if( $match->contested() && $match->last_athlete() == $div->{ current }) { 
				$aid = $match->first_athlete();
			} else {
				my $prev = $matches->prev();
				$aid = $prev->last_athlete() if $prev;
				warn "No previous match $!";
			}
		}
	}
	my $i = first_index { $_ == $aid } @$order;

	return $i;
}

# ============================================================
sub initialize {
# ============================================================
	my $self  = shift;
	my $div   = $self->{ division };
	my $round = $self->{ round }; # Note: Method objects and $div->{ round } are independent, $self->{ round } is dependent

	$div->{ matches } = {} unless exists $div->{ matches };
	$div->{ matches }{ $round } = $self->matches->data();
}

# ============================================================
sub matches {
# ============================================================
	my $self    = shift;
	my $div     = $self->{ division };
	my $matches = $self->bracket();

	return new FreeScore::Forms::WorldClass::Method::SingleElimination::Matches( $self, $matches );
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
	my $forms  = int( @{ $div->{ forms }{ $round }});
	if( $div->round_defined( $round )) {
		$div->reinstantiate_round( $round, $_ ) foreach @{$div->order( $round )};
	}

	$div->{ current } = $div->athletes_in_round( 'first' ) unless defined $div->{ current };
}

# ============================================================
sub place_athletes {
# ============================================================
#** @method ()
#   @brief Calculates placements for the current round.
#*
	my $self     = shift;
	my $div      = $self->{ division };
	my @previous = grep { /^ro/ } $div->rounds();
	my $i        = first_index { $_ eq $self->{ round }} @previous;
	my $wins     = { map { ( $_ => 0 ) } @{$div->order( $previous[ 0 ])} };

	splice @previous, $i + 1 unless $i < 0; # Remove all rounds past current round

	# ===== TALLY THE WINS FROM ALL PREVIOUS SINGLE ELIMINATION ROUNDS
	foreach my $prev (@previous) {
		my $pmethod = $div->method( $prev ); # Get the previous method object for the corresponding previous round
		my $matches = $pmethod->matches(); # Retrieve the matches for the previous round

		next unless $div->round_defined( $prev );
		next unless $matches->complete();

		my @winners = grep { defined $_ } $pmethod->calculate_winners(); # Calculate the winners for the previous round (using the method object for that round)
		$wins->{ $_ }++ foreach @winners;

		my $n          = max values %$wins;
		my $placements = [];
		my $athletes   = $div->{ athletes };
		foreach my $i ( reverse( 0 .. $n )) {
			my $place = [ sort { $athletes->[ $a ]{ name } cmp $athletes->[ $b ]{ name } } map { int( $_ ) } grep { $wins->{ $_ } == $i } keys %$wins ];
			push @$placements, $place;
		}

		$div->{ placement }{ $prev } = $placements;
	}

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $round   = $self->{ round };
	my $pending = [ @{$div->order( $round )} ];
	@$pending   = grep { ! $div->reinstantiate_round( $round, $_ )->complete(); } @$pending; # Athlete's score is NOT complete

	$div->{ pending }{ $round } = $pending;
}

# ============================================================
sub record_score {
# ============================================================
	my $self    = shift;
	my $judge   = shift;
	my $score   = shift;
	my $div     = $self->{ division };
	my $athlete = $div->{ athletes }[ $div->{ current } ];
	my $round   = $div->{ round };
	my $form    = $div->{ form };

	$div->{ state } = 'score'; # Return to the scoring state when any judge scores
	$div->reinstantiate_round( $round )->record_score( $form, $judge, $score );
}

# ============================================================
sub code { return 'se'; }
# ============================================================

1;
