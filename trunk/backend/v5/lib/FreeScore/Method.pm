package FreeScore::Method;
use base qw( FreeScore::Component );
use List::MoreUtils qw( first_index );

# ============================================================
sub has_round {
# ============================================================
	my $self  = shift;
	my $text  = shift;
	my $regex = join( '|', @{$self->{ rounds }});

	my ($match) = $text =~ /\b($regex)\b/;

	return $match ? $match : undef;
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
	my $self = shift;
	die "Stub method next_round() called $!";
}

# ============================================================
sub next_todo {
# ============================================================
#** @method ()
#   @brief Returns the next todo item or undef if there are no more todo items remaining
#*
	my $self = shift;
	die "Stub method next_todo() called $!";
}

# ============================================================
sub previous_round {
# ============================================================
#** @method ()
#   @brief Returns the previous round ID or undef if there are no earlier rounds
#*
	my $self = shift;
	die "Stub method previous_round() called $!";
}

# ============================================================
sub previous_todo {
# ============================================================
#** @method ()
#   @brief Returns the previous todo item or undef if there are no prior todo items
#*
	my $self = shift;
	die "Stub method previous_todo() called $!";
}

# ============================================================
sub rounds {
# ============================================================
	my $self = shift;
	return @{ $self->{ rounds }};
}

1;
