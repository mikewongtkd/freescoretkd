package FreeScore::Forms::WorldClass::Method::SideBySide;
use base qw( FreeScore::Forms::WorldClass::Method::SingleElimination );
use List::Util qw( first );

our @rounds = [
	{ code => 'ro256', name => 'Round of 256',  matches => 128, min => 129, max => 256 },
	{ code => 'ro128', name => 'Round of 128',  matches => 64,  min => 65,  max => 128 },
	{ code => 'ro64',  name => 'Round of 64',   matches => 32,  min => 33,  max => 64  },
	{ code => 'ro32',  name => 'Round of 32',   matches => 16,  min => 17,  max => 32  },
	{ code => 'ro16',  name => 'Round of 16',   matches => 8,   min => 9,   max => 16  },
	{ code => 'ro8',   name => 'Quarterfinals', matches => 4,   min => 5,   max => 8   },
	{ code => 'ro4',   name => 'Semifinals',    matches => 2,   min => 3,   max => 4   },
	{ code => 'ro2',   name => 'Finals',        matches => 1,   min => 1,   max => 2   }
];

# ============================================================
sub autopilot_steps {
# ============================================================
	my $self    = shift;
	my $rm      = shift; # Request Manager
	my $div     = $self->{ division };
	my $pause   = { score => 9, leaderboard => 6, brief => 1 };
	my $round   = $div->{ round };
	my $order   = $div->{ order }{ $round };
	my $forms   = $div->{ forms }{ $round };
	my $j       = first_index { $_ == $div->{ current } } @$order;
	my $matches = $self->matches();

	my $last = {
		match   => $matches->is_last_match(),
		athlete => $div->{ current } == $matches->last_match->last_athlete(),
		form    => ($div->{ form }   == int( @$forms ) - 1),
		round   => ($div->{ round } eq 'ro2')
	};

	# ===== AUTOPILOT BEHAVIOR
	# Autopilot behavior comprises the two afforementioned actions in
	# serial, with delays between.
	my $delay = new Mojo::IOLoop::Delay();
	my $show = {
		score => sub { # Display the athlete's score for 9 seconds
			my $delay = shift;
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ score } => $delay->begin );
			$request->{ action } = 'match';
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
		},
		next => sub { # Advance to the next form/match/round
			my $delay = shift;

			die "Disengaging autopilot\n" unless $div->autopilot();
			print STDERR "Advancing the division to next item.\n" if $DEBUG;

			# Go to X after Y
			my $go = {
				next  => {
					round   =>  $last->{ form } && $last->{ match } && ! $last->{ round },
					match   =>  $last->{ form } && ! $last->{ match },
					form    =>  ! $last->{ form }
				}
			};

			# ===== FORM/MATCH/ROUND NAVIGATION
			if    ( $go->{ next }{ round }) { $div->next_round(); $div->matches->first_match->first_athlete(); $div->first_form(); }
			elsif ( $go->{ next }{ match }) { $div->navigate( 'athlete', $matches->next_match->first_athlete() ); $div->first_form(); }
			elsif ( $go->{ next }{ form })  { $div->next_form(); }
			$div->autopilot( 'off' ); # Finished. Disengage autopilot for now.
			$div->write();

			$request->{ action } = 'next';
			$rm->broadcast_updated_division( $request, $progress, $group );
		}
	};

	# ===== SELECTIVELY CHOOSE AUTOPILOT BEHAVIOR STEPS
	my @steps = ();
	push @steps, $step->{ show }{ score };
	push @steps, $step->{ show }{ leaderboard } if($last->{ form }); # Display the leaderboard (brackets) for 6 seconds after every match
	push @steps, $step->{ go }{ next };

	return @steps;
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

	# Score both athletes
	foreach my $athlete ( $chung, $hong ) {
		my $i      = $athlete->{ index };
		my $name   = $div->{ athletes }[ $i ]{ name };
		my $ar     = $div->reinstantiate_round( $round, $i );
		my $target = $ar->match();
		my $error  = sprintf( "Database error: Score for %s given for %s Match %d but athlete is bracketed to Match %d", $name, uc $round, $match + 1, $target + 1 );
		die $error unless $match == $target;
		$ar->record_score( $form, $judge, $athlete->{ score });
	}
}

# ============================================================
sub string { return 'sbs'; }
# ============================================================

