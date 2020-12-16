package FreeScore::Forms::WorldClass::Method;
use List::MoreUtils qw( first_index );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );
	return $self;
}

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
#** @method ( $wrap )
#   @brief Returns the next round ID
#*
	my $self    = shift;
	my $wrap    = shift;
	my $div     = $self->{ div };
	my $current = $div->{ round };
	my $i       = first_index { $_ eq $current } @{ $self->{ rounds }};
	my $unknown = $i == -1;
	my $last    = $i == $#{$self->{ rounds }};
	my $next    = $i + 1;
	my $first   = $wrap ? $self->{ rounds }[ 0 ] : undef;

	return $last ? $first : $self->{ rounds }[ $next ];
}

# ============================================================
sub previous_round {
# ============================================================
#** @method ( $wrap )
#   @brief Returns the previous round ID
#*
	my $self    = shift;
	my $div     = $self->{ div };
	my $current = $div->{ round };
	my $i       = first_index { $_ eq $current } @{ $self->{ rounds }};
	my $unknown = $i == -1;
	my $first   = $i == 0;
	my $prev    = $i - 1;
	my $last    = $wrap ? $self->{ rounds }[ -1 ] : undef;

	return $first ? $last : $self->{ rounds }[ $prev ];
}

# ============================================================
sub rounds {
# ============================================================
	my $self = shift;
	return @{ $self->{ rounds }};
}

1;
