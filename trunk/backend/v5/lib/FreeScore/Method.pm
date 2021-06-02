package FreeScore::Method;
use base qw( FreeScore::Component );
use List::Util qw( any );
use List::MoreUtils qw( first_index );

# ============================================================
sub has_round {
# ============================================================
	my $self  = shift;
	my $rid   = shift;

	return any { $rid eq $_ } @{ $self->{ rounds }};
}

# ============================================================
sub name {
# ============================================================
	my $self = shift;
	return $self->{ name };
}

# ============================================================
sub next_round {
# ============================================================
#** @method ()
#   @brief Returns the next round ID or undef if there are no more incomplete rounds
#*
	my $self     = shift;
	my $rid      = shift;
	my $division = $self->{ _parent };
	my $round    = $division->round();
	my $i        = first_index { $rid eq $_ } @{ $self->{ rounds }};
	return undef if( $i < 0 || $i >= $#{ $self->{ rounds }});
	my $j        = $i + 1;

	return $round->context( { _id => $self->{ rounds }[ $j ] });
}

# ============================================================
sub next_todo {
# ============================================================
#** @method ()
#   @brief Returns the next todo item or undef if there are no more todo items remaining
#*
	my $self = shift;
	die "Stub method Method::next_todo() called $!";
}

# ============================================================
sub previous_round {
# ============================================================
#** @method ()
#   @brief Returns the previous round ID or undef if there are no earlier rounds
#*
	my $self     = shift;
	my $rid      = shift;
	my $division = $self->{ _parent };
	my $round    = $division->round();
	my $i        = first_index { $rid eq $_ } @{ $self->{ rounds }};
	return undef if( $i <= 0 );
	my $j        = $i - 1;

	return $round->context( { _id => $self->{ rounds }[ $j ] });
}

# ============================================================
sub previous_todo {
# ============================================================
#** @method ()
#   @brief Returns the previous todo item or undef if there are no prior todo items
#*
	my $self = shift;
	die "Stub method Method::previous_todo() called $!";
}

# ============================================================
sub rounds {
# ============================================================
	my $self = shift;
	return @{ $self->{ rounds }};
}

1;
