package FreeScore::Forms::WorldClass::Method::SingleElimination;
use base qw( FreeScore::Forms::WorldClass::Method );
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Method::SingleElimination::Matches;
use List::Util qw( any );
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
	my $j        = $i < $#rounds ? $i + 1 : undef;
	my $next     = defined $j ? $rounds[ $j ] : undef;

	# ===== SKIP IF THERE IS NO NEXT ROUND
	return unless defined $next;

	# ===== ADVANCE WINNING ATHLETES TO THE NEXT ROUND IF CURRENT ROUND IS COMPLETE
	# Skip if the athletes have already been advanced to the current round
	my $already_done = exists $div->{ order }{ $next } && ref $div->{ order }{ $next } eq 'ARRAY' && int( @{$div->{ order }{ $next }}) > 0;

	return if ! $div->round_complete( $round );
	return if $already_done;

	my @winners = $self->calculate_winners( $round );

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
	#	my $pause    = { score => 9, leaderboard => 12, brief => 1 };
	my $pause    = { score => 2, leaderboard => 2, brief => 1 }; # MW FOR DEBUGGING PURPOSES
	my $round    = $div->{ round };
	my $order    = $div->{ order }{ $round };
	my $forms    = $div->{ forms }{ $round };
	my $j        = first_index { $_ == $div->{ current } } @$order;
	my $matches  = $self->matches();

	my $last = {
		match   => $matches->current->is_last(),
		athlete => $div->{ current } == $matches->current->last_athlete(),
		form    => ($div->{ form }   == int( @$forms ) - 1),
		round   => ($div->{ round } eq 'ro2'),
		cycle   => (!(($j + 1) % 2)),
	};

	my $just_performed = {
		chung => $matches->current->chung() == $div->{ current },
		hong  => $matches->current->hong()  == $div->{ current }
	};

	$last->{ chung }{ form } = $last->{ form } && $just_performed->{ chung };
	$last->{ hong }{ form }  = $last->{ form } && $just_performed->{ hong };

	print STDERR "SE AUTOPILOT last:\n"; # MW
	print STDERR Dumper $last; # MW
	print STDERR "SE AUTOPILOT just_performed\n"; # MW
	print STDERR Dumper $just_performed; # MW

	# ===== AUTOPILOT BEHAVIOR
	# Autopilot behavior comprises the two afforementioned actions in
	# serial, with delays between.
	my $step = {
		show => {
			score => sub { # Display the athlete's score for 9 seconds
				my $delay = shift;
				Mojo::IOLoop->timer( $pause->{ score } => $delay->begin );
				$request = { type => 'autopilot', action => 'scoreboard', delay => $pause->{ score }};
				$rm->broadcast_updated_division( $request, $progress, $group );

			},
			leaderboard => sub { 
				my $delay = shift;

				die "Disengaging autopilot\n" unless $div->autopilot();

				print STDERR "Showing leaderboard.\n" if $DEBUG;
				$div->display() unless $div->is_display(); 
				$div->write(); 
				Mojo::IOLoop->timer( $pause->{ leaderboard } => $delay->begin );
				$request = { type => 'autopilot', action => 'leaderboard', delay => $pause->{ leaderboard }};
				$rm->broadcast_updated_division( $request, $progress, $group );
			},
		},
		go => {
			next => sub { # Advance to the next form/athlete/match/round
				my $delay = shift;

				die "Disengaging autopilot\n" unless $div->autopilot();
				print STDERR "Advancing the division to next item.\n" if $DEBUG;

				# Go to X => after Y
				my $go = {
					chung => ! $last->{ form } && $just_performed->{ hong },
					hong  => $just_performed->{ chung },
					next  => {
						round   =>  $matches->current->complete() && ! $last->{ round },
						match   =>  $last->{ hong }{ form } && ! $last->{ match },
						form    =>  $first->{ hong }
					}
				};
				print STDERR "SE AUTOPILOT go:\n"; # MW
				print STDERR Dumper $go; # MW

				# ===== ATHLETE NAVIGATION
				if    ( $go->{ chung })         { $div->navigate( 'athlete', $matches->current->chung() ); }
				elsif ( $go->{ hong })          { $div->navigate( 'athlete', $matches->current->hong() ); }

				# ===== FORM/MATCH/ROUND NAVIGATION
				if    ( $go->{ next }{ round }) { $div->next_round(); $div->matches->first->first_athlete(); $div->first_form(); }
				elsif ( $go->{ next }{ match }) { $div->navigate( 'athlete', $matches->next->first_athlete() ); $div->first_form(); }
				elsif ( $go->{ next }{ form })  { $div->next_form(); }
				$div->autopilot( 'off' ); # Finished. Disengage autopilot for now.
				$div->write();

				$request = { type => 'autopilot', action => 'next', delay => $pause->{ brief }};
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
sub bracket {
# ============================================================
#** @method ( round )
#   @brief Brackets the athletes into matches for the given round
#*
	my $self    = shift;
	my $div     = $self->{ division };
	my $rcode   = shift || $div->{ round };
	my @order   = @{$div->{ order }{ $rcode }};
	my $n       = int( @order ); # Number of athletes
	my $k       = $#order;       # Index of last athlete
	my $round   = $self->round( $rcode );
	my $bracket = [];

	die "Database error: $n athletes unsuitable for round '$rcode' (required range: $round->{ min } to $round->{ max } athletes) $!" if( $n < $round->{ min } || $n > $round->{ max });

	my $n = $round->{ matches } - 1;
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

		# Do not assign Hong athlete if there is a bye
		next if( $j > $k );

		# Assign Hong athlete
		my $hong = $order[ $j ];
		push @$match, $hong;
	}

	return $bracket;
}

# ============================================================
sub calculate_winners {
# ============================================================
	my $self     = shift;
	my $div      = $self->{ division };
	my $round    = shift || $div->{ round };

	my $athletes = $div->{ order }{ $round };
	my $matches  = $self->matches();
	my @winners  = map { $_->winner() } $matches->list();

	return @winners;
}

# ============================================================
sub find_athlete {
# ============================================================
	my $self     = shift;
	my $option   = shift;
	my $div      = $self->{ division };
	my $round    = $div->{ round };
	my $athletes = $div->order();
	my $matches  = $self->matches();

	if( $option =~ /^(?:first|last)$/ ) {
		if( $option =~ /^first$/ ) {
			return $matches->first->first_athlete();
		} else {
			return $matches->last->last_athlete();
		}

	} elsif( $option =~ /^(?:chung|hong)/ ) {
		if( $option =~ /^next$/ ) {
			return $matches->current->chung();
		} else {
			return $matches->current->hong();
		}

	} elsif( $option =~ /^(?:next|prev)/i ) {
		if( $option =~ /^next$/i ) {
			my $current = $matches->current();

			# Note assymetric behavior: 
			# - athlete -> next means next available athlete
			# - athlete -> prev means previous athlete, regardless of match status
			if( $current->contested() && ! $current->complete()) {
				if    ( $current->first_athlete() == $div->{ current }) { return $current->last_athlete();  } 
				elsif ( $current->last_athlete()  == $div->{ current }) { return $current->first_athlete(); }
			} else {
				my $next = $matches->next();
				return $next->first_athlete() if $next;
				warn "No next match $!";
			}
		} else {
			my $current = $matches->current();

			if( $current->contested() && $current->last_athlete() == $div->{ current }) { 
				return $current->first_athlete();
			} else {
				my $prev = $matches->prev();
				return $prev->last_athlete() if $prev;
				warn "No previous match $!";
			}
		}
	}
}

# ============================================================
sub initialize {
# ============================================================
	my $self  = shift;
	my $div   = $self->{ division };
	my $round = $div->{ round };

	$div->{ matches } = {} unless exists $div->{ matches };
	$div->{ matches }{ $round } = $self->matches->data();
}

# ============================================================
sub matches {
# ============================================================
	my $self    = shift;
	my $div     = $self->{ division };
	my $round   = $div->{ round };
	my $matches = $self->bracket( $round );

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
	if( exists $div->{ order } && exists $div->{ order }{ $round }) {
		foreach my $i (@{ $div->{ order }{ $round }}) {
			$div->reinstantiate_round( $round, $i );
		}
	}

	$div->{ current } = $div->athletes_in_round( 'first' ) unless defined $div->{ current };
}

# ============================================================
sub place_athletes {
# ============================================================
#** @method ()
#   @brief Calculates placements for the current round. Auto-updates score averages.
#*
	my $self      = shift;
	my $div       = $self->{ division };
	my $round     = $div->{ round };
	my @rounds    = grep { /^ro/ } $div->rounds();
	my $i         = first_index { $_ eq $round } @rounds;
	my $wins      = {};

	splice @rounds, $i + 1 unless $i < 0; # Remove all rounds past current round

	# ===== TALLY THE WINS FROM ALL PREVIOUS SINGLE ELIMINATION ROUNDS
	foreach my $rcode (@rounds) {
		my $order = exists $div->{ order }{ $rcode } && int( @{$div->{ order }{ $rcode }}) ? $div->{ order }{ $rcode } : undef;
		next unless $order;
		next if any { ! $div->reinstantiate_round( $rcode, $_ )->complete() } @$order;

		my @winners = $self->calculate_winners( $rcode, 'annotate' );

		foreach my $winner (@winners) {
			next if $winner < 0;
			$wins->{ $winner }++;
		}
	}

	$div->{ placement }{ $round } = [ sort { $wins->{ $b } <=> $wins->{ $a } } keys %$wins ];

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$div->{ order }{ $round }} ];
	@$pending   = grep { my $scores = $div->reinstantiate_round( $round, $_ ); ! $scores->complete(); } @$pending; # Athlete's score is NOT complete

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
sub string { return 'se'; }
# ============================================================

1;
