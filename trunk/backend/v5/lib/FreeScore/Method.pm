package FreeScore::Method;
use base qw( FreeScore::Component );
use List::Util qw( any );
use List::MoreUtils qw( first_index );
use FreeScore::Method::Cutoff;
use FreeScore::Method::Combination;
use FreeScore::Method::SingleElimination;

# ============================================================
sub factory {
# ============================================================
#**
# @method ( division )
# @brief Factory method for instantiating correct method based on event header. Default is Cutoff.
#
# Currently recognizes:
# | event              | Class                |
# | ------------------ |--------------------- |
# | combination        | Combination          |
# | cutoff             | Cutoff     (default) |
# | single-elimination | SingleElimination    |
#*
	my $self     = shift;
	my $division = shift;
	my $method   = exists $division->{ method } ? $division->{ method } : 'cutoff';
	my $class    = 'FreeScore::Method' . join( '', map { ucfirst } split /\-/, $event );
	my @loaded   = map { s/\//::/g; s/\.pm$//; } grep { /^FreeScore\/Method/ } keys %INC;

	die "Division configuration error: Method type '$method' not defined or loaded $!" unless ( any { $class eq $_ } @loaded );

	return new $class( $division );

}

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
#   @brief Returns the previous round or undef if there are no earlier rounds
#*
	my $self     = shift;
	my $division = $self->parent();
	my $round    = $division->{ _round };
	my $i        = first_index { $rid eq $_ } @{ $self->{ rounds }};
	return undef if( $i <= 0 );
	my $j        = $i - 1;

	return $round->context({ id => $self->{ rounds }[ $j ] });
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
