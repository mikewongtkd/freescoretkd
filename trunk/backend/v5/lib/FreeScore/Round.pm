package FreeScore::Round;
use base qw( FreeScore::Component );

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
sub athletes {
# ============================================================
	my $self     = shift;
	my $division = $self->parent();
	my $rid      = $self->id();
	my $athletes = $division->{ athletes };
	my $order    = $division->{ order }{ $rid };

	return () unless defined $order && ref $order eq 'ARRAY';

	my $athletes = [ map { $division->athlete->select( $_ ) } @{ $division->{ order }{ $rid }} ];
	return $athletes;
}

# ============================================================
sub complete {
# ============================================================
	my $self     = shift;
	my $athletes = $self->athletes();

	# The round is complete if all athletes in the round are complete
	# An athlete in the round is complete if all forms are complete or any
	# form has a decision
	my $complete = all { 
		my $forms = $_->forms();
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
sub next {
# ============================================================
#** 
# @method ()
# @brief Returns the next round or undef if there are no further rounds
#*
	my $self     = shift;
	my $division = $self->parent();
	my $rid      = $self->id();
	my $n        = $#{ $self->{ rounds }};
	my $i        = first_index { $rid eq $_ } @{ $self->{ rounds }};
	return undef if( $i < 0 || $i >= $n );
	my $j        = $i + 1;
	my $nrid     = $self->{ rounds }[ $j ];
	my $order    = $division->{ order }{ $rid };

	return undef unless $self->complete(); # The current round is incomplete, so the next round is undefined
	return undef unless( defined $order && @$order > 0 ); # The next round competition order has yet to be initialized

	$division->{ current }{ round }   = $nrid
	$division->{ current }{ athlete } = $division->athlete->first->id();
	$division->{ current }{ form }    = $division->event->form->first->id();

	return $self->context({ id => $self->{ rounds }[ $j ] });
}

# ============================================================
sub previous {
# ============================================================
#** @method ()
#   @brief Returns the previous round or undef if there are no prior rounds
#*
	my $self     = shift;
	my $division = $self->parent();
	my $rid      = $self->id();
	my $i        = first_index { $rid eq $_ } @{ $self->{ rounds }};
	return undef if( $i <= 0 );
	my $j        = $i - 1;
	my $prid     = $self->{ rounds }[ $j ];
	my $order    = $division->{ order }{ $prid };

	return undef unless( defined $order && @$order > 0 ); # The previous round competition order has yet to be initialized

	$division->{ current }{ round }   = $prid
	$division->{ current }{ athlete } = $division->athlete->first->id();
	$division->{ current }{ form }    = $division->event->form->first->id();

	return $self->context({ id => $self->{ rounds }[ $j ] });
}

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
sub read {
# ============================================================
	my $self     = shift;
	my $cache    = shift;
	my $division = $self->parent();
	my $method   = $division->method();

	my $rid_regex = join '|', $method->rounds();

	if( $cache->[ 0 ] =~ /# (?:$rid_regex)/ ) {

	}
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

	return undef unless any { $_ eq $rid } @{ $self->{ rounds }};

	return $self->context({ id => $rid });
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;
	my $fh   = shift;

	my $rid  = $self->id();
	
	print $fh "# ------------------------------------------------------------\n";
	print $fh "# $rid\n";
	print $fh "# ------------------------------------------------------------\n";

	my $athletes = $self->athletes();
	foreach my $athlete (@$athletes) { $athlete->write( $fh, $rid ); }
}

1;
