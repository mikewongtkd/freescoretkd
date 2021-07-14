package FreeScore::Form;
use base qw( FreeScore::Component );
use FreeScore::Metadata::Info;
use List::Util qw( all any );

our @DECISIONS = qw( dsq wdr );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ _info } = new FreeScore::Metadata::Info( $self );
}

# ============================================================
sub complete {
# ============================================================
#**
# @method ()
# @brief Calculates form completeness and returns true if form is complete, false otherwise
#*
	my $self     = shift;
	my $event    = $self->event();
	my $ring     = $self->ring();
	my $clock    = $ring->clock();

	# If already calculated, return cached value
	return $self->{ complete } if( exists( $self->{ complete }));
	
	# A form is complete when: 
	# 1. a decision is rendered (e.g. DSQ, WDR, BYE)
	# 2. all scores are recorded
	return $self->{ complete } = 1 if $self->decision();
	
	return 0 unless exists $self->{ judge };
	my $judges   = $self->judges();
	my $complete = all { defined $_ && $event->score_complete( $_ ) } @$judges
	$self->info->update( 'time', { completed => $clock->now()}) if( ! $self->{ complete } && $complete );
	$self->{ complete } = $complete;

	return $self->{ complete };
}

# ============================================================
sub current {
# ============================================================
#**
# @method ()
# @brief Returns current form
#*
	my $self = shift;
	return $self->select();
}

# ============================================================
sub decision {
# ============================================================
#**
# @method ( decision )
# @param {string} [decision] - The decision to be awarded, or 'clear' to clear any previous decision
# @brief Sets form decision if a decision is provided. Returns form decision or undef if there are no decisions.
# @details
#
# | Decision | Places | Above |
# | -------- | ------ | ----- |
# | <none>   |  Yes   | All   |
# | dsq      |  No    | None  |
# | wdr      |  No    | dsq   |
#
#*
	my $self     = shift;
	my $decision = shift;

	if( ! $decision ) {
		if( exists $self->{ decision } && any { $self->{ decision } eq $_ } @DECISIONS ) {
			return $self->{ decision };
		} else {
			return undef;
		}
	}

	if( $decision eq 'clear' ) { 
		delete $self->{ decision }; 
		delete $self->{ complete }; 
		$self->complete();
		return undef; 
	}

	if( any { $decision eq $_ } @DECISIONS ) {
		$self->{ decision } = $decision;
		$self->{ complete } = 1;
		return $decision;
	}

	die "Unknown decision '$decision' $!";
}

# ============================================================
sub evaluate {
# ============================================================
#**
# @method ()
# @brief Calculates and caches the form ranking
# @details
# Uses double dispatch with the Event object
#**
	my $self  = shift;
	my $event = $self->black_magic(); # MW

	return $event->evaluate( $self )
}

# ============================================================
sub first {
# ============================================================
	my $self     = shift;
	my $event    = $self->parent();
	my $division = $event->parent();
	my $aid      = $division->athlete->current->id();
	my $rid      = $division->round->current->id();
	my $fid      = 0;

	$self->select( $aid, $rid, $fid );
}

# ============================================================
sub judges {
# ============================================================
	my $self     = shift;
	my $event    = $self->parent();
	my $division = $event->parent();
	my $event    = $division->event();
	my $n        = $division->judges();

	my $judge   = $self->{ judge };
	my $judges  = [ map { defined $judge->[ $_ ] ? $event->score->context( $judge->[ $_ ]) : undef } ( 0 .. $n )];

	return $judges;
}

# ============================================================
sub id {
# ============================================================
#**
# @method ()
# @brief Returns the form's ID (index)
	my $self = shift;
	return $self->{ id };
}

# ============================================================
sub max {
# ============================================================
#**
# @method ( rid )
# @brief Returns the maximum number of regulation forms for the given round (default is current round)
#*
	my $self     = shift;
	my $event    = $self->parent();
	my $division = $event->parent();
	my $rid      = shift || $division->round->current->id();
	my $max      = $event->max_forms( $rid );

	return $max;
}

# ============================================================
sub next {
# ============================================================
#** @method ()
#   @brief Returns the next form or undef if there are no further forms
#*
	my $self     = shift;
	my $event    = $self->parent();
	my $division = $event->parent();
	my $ring     = $division->parent();
	my $aid      = $division->athlete->current->id();
	my $rid      = $division->round->current->id();
	my $fid      = $division->form->current->id() + 1;
	my $n        = $self->max( $rid );
	return undef if( $fid < 0 || $fid >= $n );

	$ring->info->current->form( $fid );

	return $self->select( $aid, $rid, $fid );
}

# ============================================================
sub penalties {
# ============================================================
#**
# @method ( penalty=>value, ... )
# @param {string} ['clear'] - Clears all penalties
# @brief Sets form penalties if information key-value pairs are provided. Clears penalties if the key 'clear' is provided. Returns form penalties.
#*
	my $self      = shift;
	my @penalties = @_;

	$self->{ penalties } = {} unless exists $self->{ penalties } && ref $self->{ penalties } eq 'HASH';

	if( @penalties == 0 ) {
		return $self->{ penalties };

	} elsif( @penalties == 1 && $penalties[ 0 ] eq 'clear' ) {
		delete $self->{ penalties };
		return undef;

	} else {
		my %penalties = @penalties;
		foreach $name (keys %penalties) {
			my $value = 0 + $penalties{ $name };
			$self->{ penalties }{ $name } += $value;
		}
		return $self->{ penalties };
	}
}

# ============================================================
sub previous {
# ============================================================
#** @method ()
#   @brief Returns the previous form or undef if there are no prior forms
#*
	my $self     = shift;
	my $event    = $self->parent();
	my $division = $event->parent();
	my $aid      = $round->athlete->current->id();
	my $rid      = $ring->round->current->id();
	my $fid      = $round->{ current }{ form } - 1;
	my $n        = $self->max( $rid );
	return undef if( $fid < 0 || $fid >= $n );

	$ring->info->current->form( $fid );

	return $self->select( $aid, $rid, $fid );
}

# ============================================================
sub select {
# ============================================================
#** @method ( aid, rid, fid )
#   @brief Returns the form corresponding to the Form ID (fid) and Round ID (rid; default is current round)
#*
	my $self     = shift;
	my $round    = $self->round();
	my $aid      = shift || $round->athlete->current;
	my $rid      = shift || $round->id();
	my $fid      = shift || $round->form->current;
	my $max      = $self->max( $rid );
	die "Form() bounds error: $fid is beyond bounds [ 0, $max ] for $rid $!" if( $fid < 0 || $fid > $max );

	my $form = $db->get_form( $aid, $rid, $fid );

	return $form;
}

# ============================================================
# FAMILY TREE
# ============================================================
sub athlete    { my $self = shift; return $self->parent(); }
sub db         { my $self = shift; return $self->parent->parent->ring->parent->db(); }
sub division   { my $self = shift; return $self->parent->parent->parent(); }
sub event      { my $self = shift; return $self->parent->parent->parent->event(); }
sub method     { my $self = shift; return $self->parent->parent->parent->method(); }
sub round      { my $self = shift; return $self->parent->parent(); }
sub ring       { my $self = shift; return $self->parent->parent->ring(); }
sub tournament { my $self = shift; return $self->parent->parent->ring->parent(); }

1;
