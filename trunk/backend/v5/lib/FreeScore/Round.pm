package FreeScore::Round;
use base qw( FreeScore::Component );

# ============================================================
sub current {
# ============================================================
	my $self     = shift;
	my $division = $self->{ _parent };
	my $rid      = $division->{ current }{ round };
	my $method   = $division->{ _method };
	die sprintf( "Division configuration error: Current round is set to '%s', which is not a valid round ID for method %s", $rid, $method->name()) unless $method->has_round( $rid );

	my $round    = $self->context( { _id => $rid } );

	return $round;
}

# ============================================================
sub id {
# ============================================================
#** @method ()
#   @brief Returns the round ID
#*
	my $self = shift;
	return $self->{ _id };
}

# ============================================================
sub next {
# ============================================================
#** @method ( [ rid ] )
#   @brief Calls Method::next_round()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $rid      = shift || $division->{ current }{ round };
	my $method   = $division->{ _method };
	return $method->next_round( $rid );
}

# ============================================================
sub previous {
# ============================================================
#** @method ( [ rid ] )
#   @brief Calls Method::previous_round()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $rid      = shift || $division->{ current }{ round };
	my $method   = $division->{ _method };
	return $method->previous_round( $rid );
}

1;
