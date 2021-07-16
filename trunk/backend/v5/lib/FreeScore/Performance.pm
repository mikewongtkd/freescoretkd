package FreeScore::Performance;
use base qw( FreeScore::Component FreeScore::Clonable );
use FreeScore::Form;
use FreeScore::Fight;
use overload 'cmp' => \&compare;

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	my $event  = $self->event();

	$event->evaluate_performance( $self );
}

# ============================================================
sub compare {
# ============================================================
	my $self  = shift;
	my $other = shift;
	my $event = $self->event();

	return $event->performance_compare( $self, $other );
}

# ============================================================
sub complete {
# ============================================================
	my $self  = shift;
	my $event = $self->event();

	return $event->performance_complete( $self );
}

# ============================================================
sub forms {
# ============================================================
	my $self = shift;
	# MW
}

# ============================================================
sub fights {
# ============================================================
	# MW - Similar to forms
}

# ============================================================
sub select {
# ============================================================
	my $self = shift;
	# MW
}

# ============================================================
sub tiebreaker {
# ============================================================
	my $self  = shift;
	my $other = shift;
	my $event = $self->event();

	return $event->performance_tiebreaker( $self, $other );
}

# ============================================================
# NAVIGATION
# ============================================================
sub event { my $self = shift; return $self->parent->parent->event(); }
