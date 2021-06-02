package FreeScore::Athlete;
use base qw( FreeScore::Component );
use List::MoreUtils qw( first_index );

# ============================================================
sub current {
# ============================================================
#** @method ()
#   @brief Returns the current athlete
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $divid    = $division->{ name };
	my $aid      = $division->{ current }{ athlete };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid, $divid, $rid ) unless $i >= 0;

	my $athletes = $division->{ athletes };
	my $athlete  = $self->context( $athletes->[ $aid ]);

	return $athlete;
}

# ============================================================
sub form {
# ============================================================
#** @method ( rid, fid )
#   @brief Returns the requested form, or undef if it doesn't exist
#*
	my $self     = shift;
	my $rid      = shift;
	my $fid      = shift;
	my $division = $self->{ _parent };
	my $athlete  = $self->current();
	my $form     = $division->{ _form };

	$rid = ref $rid ? $rid->id() : $rid;
	$fid = ref $fid ? $fid->id() : $fid;

	return undef unless( exists $athlete->{ scores }{ $rid })
	return undef unless defined $athlete->{ scores }{ $rid }{ forms }[ $fid ];

	return $form->context( $athlete->{ scores }{ $rid }{ forms }[ $fid ]);
}

# ============================================================
sub id {
# ============================================================
#** @method ()
#   @brief Returns the athlete ID (aid)
#*
	my $self = shift;
	return $self->{ _id };
}

# ============================================================
sub next {
# ============================================================
#** @method ()
#   @brief Calls Method::next_athlete()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $divid    = $division->{ name };
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid->[ $i ], $divid, $rid ) unless $i >= 0;
	return undef if( $i == 0 );
	my $j        = $i - 1;
	my $naid     = $order->[ $j ]; # next athlete ID
	my $athletes = $division->{ athletes };
	my $athlete  = $self->context( $athletes->[ $naid ]);
	return $athlete;
}

# ============================================================
sub previous {
# ============================================================
#** @method ()
#   @brief Calls Method::next_athlete()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $divid    = $division->{ name };
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;
	my $n        = $#$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid, $divid, $rid ) unless $i >= 0;
	return undef if( $i >= $n );
	my $j        = $i + 1;
	my $paid     = $order->[ $j ]; # previous athlete ID
	my $athletes = $division->{ athletes };
	my $athlete  = $self->context( $athletes->[ $paid ]);
	return $athlete;
}

# ============================================================
sub select {
# ============================================================
#** @method ( aid )
#   @brief Returns the athlete corresponding to the Athlete ID (aid)
#*
	my $self     = shift;
	my $aid      = shift;
	my $division = $self->{ _parent };
	my $athletes = $division->{ athletes };
	die "Athlete::select() bounds error: $aid is beyond bounds [ 0, $#$athletes ] $!" if( $aid < 0 || $aid > $#$athletes );

	my $athlete  = $self->context( $athletes->[ $aid ]);
	return $athlete;
}

1;
