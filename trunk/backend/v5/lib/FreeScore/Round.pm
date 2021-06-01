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

	return $rid;
}

# ============================================================
sub next {
# ============================================================
#** @method ()
#   @brief Calls FreeScore::Method::next_round()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $method   = $division->{ _method };
	return $method->next_round();
}

# ============================================================
sub previous {
# ============================================================
#** @method ()
#   @brief Calls FreeScore::Method::next_round()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $method   = $division->{ _method };
	return $method->previous_round();
}

1;
