package FreeScore::Performance;
use base qw( FreeScore::Component FreeScore::Clonable );
use FreeScore::Form;
use FreeScore::Fight;
use FreeScore::Athlete;
use overload 'cmp' => \&compare;

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	my $event  = $self->event();

	$self->{ _athlete } = new FreeScore::Athlete();
	$self->{ _form }    = new FreeScore::Form();
	$self->{ _fight }   = new FreeScore::Fight();

	$event->evaluate_performance( $self );
}

# ============================================================
sub athlete {
# ============================================================
	my $self    = shift;
	my $divid   = $self->division->id();
	my $aid     = $self->{ aid } || shift || $self->round->athlete->current->id();
	my $db      = $self->tournament->db();
	my $athlete = $db->load_athlete( $divid, $aid );

	$athlete = $self->{ _athlete }->context( $athlete );
	return $athlete;
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
	my $self  = shift;
	my $divid = $self->division->id();
	my $aid   = $self->{ aid } || shift || $self->round->athlete->current->id();
	my $rid   = $self->{ rid } || shift || $self->round->id();
	my $db    = $self->tournament->db();
	my $forms = $db->load_forms( $divid, $aid, $rid );

	$forms = [ map { $self->{ _form }->context( $_ ) } @$forms ];
	return $forms;
}

# ============================================================
sub fights {
# ============================================================
	my $divid  = $self->division->id();
	my $aid    = $self->{ aid } || shift || $self->round->athlete->current->id();
	my $rid    = $self->{ rid } || shift || $self->round->id();
	my $db     = $self->tournament->db();
	my $fights = $db->load_forms( $divid, $aid, $rid );

	$fights = [ map { $self->{ _fight }->context( $_ ) } @$fights ];
	return $fights;
}

# ============================================================
sub select {
# ============================================================
	my $self  = shift;
	my $round = $self->round();
	my $divid = shift || $self->division->id();
	my $aid   = shift || $self->athlete->id();
	my $rid   = shift || $self->round();

	$self->{ divid } = $divid;
	$self->{ aid }   = $aid;
	$self->{ rid }   = $rid;

	return $self;
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
sub round      { my $self = shift; return $self->parent(); }
sub division   { my $self = shift; return $self->parent->parent(); }
sub tournament { my $self = shift; return $self->parent->parent->parent(); }
sub event      { my $self = shift; return $self->division->event(); }
