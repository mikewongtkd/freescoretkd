package FreeScore::Forms::WorldClass::Method::SideBySide;
use base qw( FreeScore::Forms::WorldClass::Method::SingleElimination );
use List::Util qw( first );
use List::MoreUtils qw( first_index );
use Data::Dumper;

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

our @states = ( qw( draw scores results bracket leaderboard matches ));

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
sub change_display {
# ============================================================
	my $self   = shift;
	my $div    = $self->division();
	my $states = [ @FreeScore::Forms::WorldClass::Method::SideBySide::states ];
	my $i      = first_index { $_ eq $div->{ state } } @$states;

	if   ( $i >= $#$states ) { $i = 0; }
	elsif( $i < 0 )          { warn "Invalid state '$div->{ state }'; defaulting to 'score' $!"; $i = 1; }
	else                     { $i++; }

	$div->{ state } = $states->[ $i ];
}


# ============================================================
sub record_score {
# ============================================================
#** @method ( judge_index, score_object )
#   @brief Records the scores for Side-By-Side
#*
	my $self   = shift;
	my $judge  = shift;
	my $scores = shift;
	my $div    = $self->{ division };
	my $round  = $div->{ round };
	my $form   = $div->{ form };
	my $match  = $scores->{ match };
	my $chung  = $scores->{ chung };
	my $hong   = $scores->{ hong };

	$div->{ state } = 'score'; # Return to the scoring state when any judge scores

	print STDERR "SBS - RECORD SCORE - score\n"; # MW
	print STDERR Dumper $scores;

	# Score both athletes
	foreach my $score ( $chung, $hong ) {
		my $i = $score->{ index };
		next unless defined $i;

		my $name   = $div->{ athletes }[ $i ]{ name };
		my $ar     = $div->reinstantiate_round( $round, $i );
		my $target = $self->matches->current();
		my $error  = sprintf( "Database error: Score for %s given for %s Match %d but athlete is bracketed to Match %d", $name, uc $round, $match, $target->{ number });
		die $error unless $match == $target->{ number };
		$ar->record_score( $form, $judge, $score );
	}
}

# ============================================================
sub string { return 'sbs'; }
# ============================================================

