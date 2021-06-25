package FreeScore::Round;
use base qw( FreeScore::Component );

# ============================================================
sub init {
# ============================================================
	my $self      = shift;
	my $division  = shift;
	my $rid       = shift;
	my $method    = $division->method();
	$self->{ id } = $rid;

	$self->SUPER::init( $division );
	$self->arrange( $method->round_neighborhood( $rid )); # MW

}

# ============================================================
sub advance {
# ============================================================
#** 
# @method ( placements )
# @param {array} placements - List of placed athletes
# @brief Advances the appropriate number of placed athletes to the current round
# @returns an order list
#*
	my $self       = shift;
	my $placements = shift;
	my $rid        = $self->id();
	my $division   = $self->parent();
	my $method     = $division->method();

	return $method->advance( $placements, $rid );
}

# ============================================================
sub arrange {
# ============================================================
	my $self   = shift;
	my $next   = shift || undef;
	my $prev   = shift || undef;
	my $left   = shift || undef;
	my $right  = shift || undef;

	$self->{ next }      = $next;
	$self->{ previous }  = $prev;
	$self->{ left }      = $left;
	$self->{ right }     = $right;
}

# ============================================================
sub athletes {
# ============================================================
	my $self     = shift;
	my $division = $self->parent();
	my $rid      = $self->id();
	my $athletes = $division->{ registered };
	my $order    = $self->{ athletes };

	return [] unless defined $order && ref $order eq 'ARRAY';

	my $athletes = [ map { $division->athlete->select( $_ ) } @$order ];
	return $athletes;
}

# ============================================================
sub complete {
# ============================================================
	my $self     = shift;
	my $rid      = $self->id();
	my $athletes = $self->athletes();

	# The round is complete if all athletes in the round are complete
	# An athlete in the round is complete if all forms are complete or any
	# form has a decision
	my $complete = all { 
		my $forms = $_->forms( $rid );
		any { $_->decision() } @$forms ||
		all { $_->complete() } @$forms
	} @$athletes

	return $complete;
}

# ============================================================
sub current {
# ============================================================
	my $self     = shift;
	my $division = $self->parent();
	my $rid      = $division->{ current }{ round };
	my $method   = $division->{ _method };
	die sprintf( "Division configuration error: Current round is set to '%s', which is not a valid round ID for method %s", $rid, $method->name()) unless $method->has_round( $rid );

	my $round    = $self->context({ id => $rid });

	return $round;
}

# ============================================================
sub first {
# ============================================================
#** 
# @method ()
# @brief Returns the first relevant round for the division
#*
	my $self     = shift;
	my $division = $self->parent();
	my $method   = $division->method();

	my $rid      = $method->first_round();
	return $self->select( $rid );
}

# ============================================================
sub goto {
# ============================================================
#** 
# @method ( rid )
# @param {string} rid - Round ID
# @brief Returns the requested round or undef if the round doesn't exist
#*
	my $self     = shift;
	my $rid      = shift;
	my $division = $self->parent();
	my $ring     = $self->ring();

	return undef unless $rid;
	return undef unless any { $rid eq $_ } keys %{ $division->{ rounds }};
	return undef unless exists $division->{ rounds }{ $rid } && defined $division->{ rounds }{ $rid };

	$ring->round->current( $rid );
	$round->athlete->current( $round->athlete->first->id() );
	$round->form->current( $division->event->form->first->id() );

	return $self->select( $rid );
}

# ============================================================
sub id {
# ============================================================
#** 
# @method ()
# @brief Returns the round ID
#*
	my $self = shift;
	return $self->{ id };
}

# ============================================================
sub next     { my $self = shift; $self->goto( $self->{ next }); }
sub previous { my $self = shfit; $self->goto( $self->{ previous }); }
sub left     { my $self = shfit; $self->goto( $self->{ left }); }
sub right    { my $self = shfit; $self->goto( $self->{ right }); }

# ============================================================
sub place {
# ============================================================
#** @method ( athletes )
#   @param {array} athletes - List of athletes to place
#   @brief Order the athletes by round results and assign places
#*
	my $self     = shift;
	my $athletes = shift;

	return [] if int( @$athletes ) == 0;

	# Rank the athletes
	my $rankings = $self->rank( $athletes );

	# Place the athletes
	my $placements = $self->ranks2places( $rankings );

	return $placements;
}

# ============================================================
sub rank {
# ============================================================
#**
# @method ( athletes )
# @param {array} athletes - List of athletes to rank
# @returns ranking - Ordered list of athlete ids with ranking criteria
#*
	my $self     = shift;
	my $athletes = shift;
	my $rid      = $self->id();
	my $division = $self->parent();
	my $event    = $division->event();

	# Evaluate each athlete ranking (implicit in the ranking constructor)
	my $rankings = [];
	foreach my $athlete (@$athletes) {
		# Autovivify
		$athlete->{ scores }{ $rid } = {} unless exists $athlete->{ scores }{ $rid };

		my $ranking = $event->ranking->context( $athlete->{ scores }{ $rid });
		$ranking->{ aid } = $athlete->id();
		push @$rankings, $ranking;
	}

	@$rankings = sort @$rankings;

	return $rankings;
}

# ============================================================
sub ranks2places {
# ============================================================
#** @method ( rankings )
#   @param {array} rankings - List of ordered rankings
#   @brief Place athletes, grouping true ties together at the same placement
#*
	my $self       = shift;
	my $rankings   = shift;
	my $place      = 1;
	my $placements = [];

	my $a          = shift @$rankings;
	my $placement  = { place => $place, athletes => [ $a->clone() ]};
	push @$placements, $placement;
	my $current    = $placement;

	while( @$rankings ) {
		my $a   = $current->{ athletes }[ 0 ];
		my $b   = shift @$rankings;
		my $cmp = $a cmp $b;
		$place++;

		# Tied; group the athletes as the same placement
		if( $cmp == 0 ) {
			push @{$current->{ athletes }}, $b->clone();

		# Not tied, assign the athlete to a new placement
		} else {
			my $p              = $b->{ decision } =~ /^(?:dsq|wdr)$/ ? '-' : $place;
			my $placement      = { place => $p, athletes => [ $b->clone() ]};
			my $tiebreaker     = $a->tiebreaker( $b );
			$placement->{ tb } = $tiebreaker if $tiebreaker;

			push @$placements, $placement;
			$current = $placement;
		}
	}

	# Sort tied groups by last name, then first name
	my $division = $self->parent();
	foreach my $placement (@$placements) {
		my $athletes = $placement->{ athletes };
		my $sorted   = [];
		foreach my $entry (@$athletes) {
			my $aid      = $entry->{ aid };
			my $athlete  = $division->athlete->select( $aid );
			push @$sorted, { first => $athlete->first_name(), last => $athlete->last_name(), ranking => $entry };
		}
		@$sorted = map { $_->{ ranking } } sort { $a->{ last } cmp $b->{ last } || $a->{ first } cmp $b->{ first } } @$sorted;
		$placement->{ athletes } = $sorted;
	}

	return $placements;
}

# ============================================================
sub select {
# ============================================================
#** @method ( rid )
#   @brief Returns the round corresponding to the Round ID (rid)
#*
	my $self     = shift;
	my $rid      = shift;
	my $division = $self->parent();

	return undef unless any { $_ eq $rid } keys %{ $division->{ rounds }};

	return $self->context( $division->{ rounds }{ $rid } );
}

# ============================================================
sub siblings {
# ============================================================
	my $self     = shift;
	my $siblings = [ $self->id() ];
}

# ============================================================
sub update {
# ============================================================
	my $self       = shift;
	my $division   = $self->parent();
	my $event      = $division->event();
	my $method     = $division->method();
	my $rid        = $self->id();
	my $athletes   = $self->athletes();
	my $placements = [];

	if( $event->form->complete()) {
		$placements = $self->place( $athletes );
		$self->{ placement }{ $rid } = $placements;
	}

	if( $self->complete()) {
		my $next = $self->next();
		my $nrid = $next->id();

		$next->advance( $placements );
	}
}

1;
