package FreeScore::Performance;
use base qw( FreeScore::Component FreeScore::Clonable );
use FreeScore::Form;
use FreeScore::Fight;
use FreeScore::Athlete;
use List::Util qw( first );
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
#**
# @method ( aid )
# @param {int} [aid] - Athlete ID
# @brief Gets the corresponding athlete
# @returns the corresponding athlete
#*
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
#**
# @method ( other )
# @param {Performance} other - An instance of a performance
# @brief Compares the two performances for sorting
# @details Overloads the cmp operator
# @returns 0 if the two performances are tied, 1 if self > other, -1 if self < other
#*
	my $self  = shift;
	my $other = shift;
	my $event = $self->event();

	return $event->performance_compare( $self, $other );
}

# ============================================================
sub complete {
# ============================================================
#**
# @method ()
# @brief Evaluates if the performance is complete
# @returns True if the performance is complete, false otherwise
#*
	my $self  = shift;
	my $event = $self->event();

	return $event->performance_complete( $self );
}

# ============================================================
sub decision {
# ============================================================
#**
# @method ()
# @brief Returns the first decision awarded in the forms or fights
# @returns the first decision awarded in the forms or fights
#*
	my $self      = shift;
	my $forms     = $self->forms();
	my $fights    = $self->fights();
	my $decisions = [ map { $_->decision() } @$forms, map { $_->decision() } @$fights ];

	return first { defined $_ } @$decisions;
}

# ============================================================
sub forms {
# ============================================================
#**
# @method ()
# @brief Gets the corresponding forms for a given performance
# @returns Forms
#*
	my $self  = shift;
	my $divid = $self->division->id();
	my $aid   = $self->{ aid } || shift || $self->athlete->id();
	my $rid   = $self->{ rid } || shift || $self->round->id();
	my $db    = $self->tournament->db();
	my $forms = $db->load_forms( $divid, $aid, $rid );

	$forms = [ map { $self->{ _form }->context( $_ ) } @$forms ];
	return $forms;
}

# ============================================================
sub fights {
# ============================================================
#**
# @method ()
# @brief Gets the corresponding fights for a given performance
# @returns Fights
#*
	my $divid  = $self->division->id();
	my $aid    = $self->{ aid } || shift || $self->athlete->id();
	my $rid    = $self->{ rid } || shift || $self->round->id();
	my $db     = $self->tournament->db();
	my $fights = $db->load_forms( $divid, $aid, $rid );

	$fights = [ map { $self->{ _fight }->context( $_ ) } @$fights ];
	return $fights;
}

# ============================================================
sub select {
# ============================================================
#**
# @method ( divid, aid, rid )
# @param {string} [divid] - Division ID
# @param {int} [aid] - Athlete ID
# @param {string} [rid] - Round ID
# @brief Selects the performance for the given Division ID, Athlete ID, and Round ID
# @returns Performance
#*
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
#**
# @method ( other )
# @param {Performance} other - An instance of a performance
# @brief Identifies ties or tiebreaker criteria for two performances
# @returns False if both performances
#*
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
