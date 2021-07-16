package FreeScore::Form;
use base qw( FreeScore::Component );
use FreeScore::Metadata::Info;
use FreeScore::Score;
use List::Util qw( all any );

our @DECISIONS = qw( dsq wdr );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;

	$self->SUPER::init( $parent );
	$self->{ _info }    = new FreeScore::Metadata::Info( $self );
	$self->{ _score }   = new FreeScore::Score( $self );
	$self->{ _athlete } = new FreeScore::Athlete( $self );
}

# ============================================================
sub athlete {
# ============================================================
#**
# @method ()
# @brief Returns the athlete for the given form
#*
	my $self    = shift;
	my $athlete = $self->performance->athlete();

	return $athlete;
}

# ============================================================
sub complete {
# ============================================================
#**
# @method ()
# @brief Calculates form completeness and returns true if form is complete, false otherwise
#*
	my $self  = shift;
	my $event = $self->event();
	my $clock = $self->tournament->clock();

	# If already calculated, return cached value
	return $self->{ _complete } if( exists( $self->{ _complete }));
	
	# A form is complete when: 
	# 1. a decision is rendered (e.g. DSQ, WDR, BYE)
	# 2. all scores are recorded
	return $self->{ _complete } = 1 if $self->decision();
	
	my $scores = $self->scores();
	return 0 unless int( @$scores );

	my $complete = all { defined $_ && $event->score_complete( $_ ) } @$scores
	$self->info->update( 'time', { completed => $clock->now()}) if( ! $self->{ _complete } && $complete );
	$self->{ _complete } = $complete;

	return $self->{ _complete };
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
	my $event = $self->event();

	return $event->evaluate_form( $self )
}

# ============================================================
sub first {
# ============================================================
	my $self  = shift;
	my $round = $self->round();
	my $divid = $self->{ divid } || $self->division->id();
	my $aid   = $self->{ aid }   || $round->athlete->current->id();
	my $rid   = $self->{ rid }   || $round->id();
	my $fid   = $self->{ fid } = 0;

	$self->select( $divid, $aid, $rid, $fid );
}

# ============================================================
sub id {
# ============================================================
#**
# @method ()
# @brief Returns the form's ID (index)
	my $self = shift;
	return $self->{ fid };
}

# ============================================================
sub max {
# ============================================================
#**
# @method ()
# @brief Returns the maximum number of regulation forms for the given round
#*
	my $self     = shift;
	my $round    = $self->round();
	my $rid      = $round->id();
	my $max      = int( @{$round->info->get( 'forms' )});

	return $max;
}

# ============================================================
sub next {
# ============================================================
#** @method ()
#   @brief Returns the next form or undef if there are no further forms
#*
	my $self  = shift;
	my $round = $self->round();
	my $divid = $self->{ divid } || $self->division->id();
	my $aid   = $self->{ aid }   || $round->athlete->current->id();
	my $rid   = $self->{ rid }   || $round->id();
	my $fid   = $round->form->current->id() + 1;
	my $n     = $self->max( $rid );
	return undef if( $fid < 0 || $fid >= $n );

	$ring->info->current->form( $fid );

	return $self->select( $divid, $aid, $rid, $fid );
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
#** 
# @method ()
# @brief Returns the previous form or undef if there are no prior forms
#*
	my $self  = shift;
	my $round = $self->round();
	my $divid = $self->{ divid } || $self->division->id();
	my $aid   = $self->{ aid }   || $round->athlete->current->id();
	my $rid   = $self->{ rid }   || $round->id();
	my $fid   = $round->form->current->id() - 1;
	my $n     = $self->max( $rid );
	return undef if( $fid < 0 || $fid >= $n );

	$ring->info->current->form( $fid );

	return $self->select( $divid, $aid, $rid, $fid );
}

# ============================================================
sub save {
# ============================================================
#** 
# @method ()
# @brief Saves the form to the database
#*
	my $self  = shift;
	my $clone = $self->clone();
	my $db    = $self->tournament->db();
	$db->save_form( $clone );
}

# ============================================================
sub scores {
# ============================================================
#** 
# @method ()
# @brief Returns the form's current scores
#*
	my $self   = shift;
	my $db     = $self->tournament->db();
	my $round  = $self->round();
	my $divid  = $self->division->id();
	my $rid    = $round->id();
	my $aid    = $round->athlete->current->id();
	my $fid    = $self->id();
	my $scores = [ map { $self->score->context( $_ ) } $db->get_scores( $divid, $rid, $aid, $fid )];

	return $scores;
}

# ============================================================
sub select {
# ============================================================
#** 
# @method ( divid, aid, rid, fid )
# @brief Returns the form corresponding to the Form ID (fid) and Round ID (rid; default is current round)
#*
	my $self  = shift;
	my $db    = $self->tournament->db();
	my $round = $self->round();
	my $divid = shift || $self->division->id();
	my $aid   = shift || $round->athlete->current->id();
	my $rid   = shift || $round->id();
	my $fid   = shift || $round->form->current->id();
	my $max   = $self->max( $rid );
	die "Form() bounds error: $fid is beyond bounds [ 0, $max ] for $rid $!" if( $fid < 0 || $fid > $max );

	my $form = $db->load_form( $divid, $rid, $aid, $fid );

	return $self->context( $form );
}

# ============================================================
# NAVIGATION
# ============================================================
sub info        { my $self = shift; return $self->{ _info }; }
sub score       { my $self = shift; return $self->{ _score }; }
sub performance { my $self = shift; return $self->parent(); }
sub round       { my $self = shift; return $self->parent->parent(); }
sub division    { my $self = shift; return $self->parent->parent->parent(); }
sub tournament  { my $self = shift; return $self->parent->parent->parent->parent(); }
sub event       { my $self = shift; return $self->division->event(); }

1;
