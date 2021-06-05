package FreeScore::Form;
use base qw( FreeScore::Component );
use List::Util qw( all any );

our @DECISIONS       = qw( dsq wdr );

# ============================================================
sub complete {
# ============================================================
#**
# @method ()
# @brief Calculates form completeness and returns true if form is complete, false otherwise
#*
	my $self     = shift;
	my $event    = $self->parent();
	my $division = $event->parent();
	my $clock    = $division->clock();
	my $athlete  = $division->athlete->current();

	# If already calculated, return cached value
	return $self->{ complete } if( exists( $self->{ complete }));
	
	# A form is complete when: 
	# 1. a decision is rendered (e.g. DSQ, WDR, BYE)
	# 2. all scores are recorded
	return $self->{ complete } = 1 if $self->decision();
	
	return 0 unless exists $self->{ judge };
	my $judges   = $self->judges();
	my $complete = all { defined $_ && $_->complete() } @$judges
	$self->{ info }{ time }{ completed } = $clock->now() if( ! $self->{ complete } && $complete );
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
sub info {
# ============================================================
#**
# @method ( key => value, ... )
# @param {...key-value-pair} key => value - One or more key-value pairs
# @param {string} key - Request value for a given key
# @param no parameters - Request the info hash (all info values)
# @brief Sets form info if information key-value pairs are provided. Returns a single value if a single key is provided. Returns all form info if no parameters given.
#*
	my $self = shift;
	my @info = @_;

	$self->{ info } = {} unless exists $self->{ info };

	if( @info == 0 ) {
		return $self->{ info };

	} elsif( @info == 1 ) {
		my $name = shift @info;
		return undef unless exists $self->{ info }{ $name };
		return $self->{ info }{ $name };

	} else {
		my %info = @info;
		foreach $name (keys %info) {
			my $value = $info{ $name };
			if( $value eq '' ) { delete $self->{ info }{ $name };   } 
			else               { $self->{ info }{ $name } = $value; }
		}
		return $self->{ info };
	}
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
	my $rid      = shift || $division->{ current }{ round };
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
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $fid      = $division->{ current }{ form } + 1;
	my $n        = $self->max( $rid );
	return undef if( $fid < 0 || $fid >= $n );

	$division->{ current }{ form } = $fid;

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
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $fid      = $division->{ current }{ form } - 1;
	my $n        = $self->max( $rid );
	return undef if( $fid < 0 || $fid >= $n );

	$division->{ current }{ form } = $fid;

	return $self->select( $aid, $rid, $fid );
}

# ============================================================
sub select {
# ============================================================
#** @method ( aid, rid, fid )
#   @brief Returns the form corresponding to the Form ID (fid) and Round ID (rid; default is current round)
#*
	my $self     = shift;
	my $event    = $self->parent();
	my $division = $event->parent();
	my $aid      = shift || $division->{ current }{ athlete };
	my $rid      = shift || $division->{ current }{ round };
	my $fid      = shift || $division->{ current }{ form };
	my $max      = $self->max( $rid );
	die "Form() bounds error: $fid is beyond bounds [ 0, $max ] for $rid $!" if( $fid < 0 || $fid > $max );

	my $athlete  = $division->athlete->select( $aid );

	# Autovivify 
	$athlete->{ scores }{ $rid } = { forms => [ {} ] } unless( exists $athlete->{ scores }{ $rid })
	$athlete->{ scores }{ $rid }{ forms }[ $fid ] = {} unless defined $athlete->{ scores }{ $rid }{ forms }[ $fid ];

	my $form      = $athlete->{ scores }{ $rid }{ forms }[ $fid ];
	$form->{ id } = $fid;
	$form         = $self->context( $form );

	return $form;
}

1;
