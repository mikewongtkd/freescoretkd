package FreeScore::Form;
use base qw( FreeScore::Component );
use List::Util qw( all any );

our @DECISIONS       = qw( bye dsq wdr );

# ============================================================
sub complete {
# ============================================================
#**
# @method ()
# @brief Calculates form completeness and returns true if form is complete, false otherwise
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $event    = $division->{ _event };
	my $clock    = $division->{ _clock };
	my $n        = $division->{ judges };
	my $athlete  = $division->athlete->current();
	my $form     = $self->context();

	# If already calculated, return cached value
	return $form->{ complete } if( exists( $form->{ complete }));
	
	# A form is complete when: 
	# 1. a decision is rendered (e.g. DSQ, WDR, BYE)
	# 2. all scores are recorded
	if( exists $form->{ decision } && any { $form->{ decision } eq $_ } @DECISIONS ) {
		$form->{ complete } = 1;
		return $form->{ $complete };
	}
	
	return 0 unless exists $form->{ judge };
	my $judge    = $form->{ judge };
	my $judges   = map { defined $judge->[ $_ ] ? $event->score( $judge->[ $_ ]) : undef } ( 0 .. $n );
	my $complete = all { defined $_ && $_->complete() } @$judges
	if( ! $form->{ complete } && $complete ) {
		$form->{ info }{ time }{ completed } = $clock->time();
		$form->{ complete } = 1;
	}

	return $form->{ complete };
}

# ============================================================
sub current {
# ============================================================
#**
# @method ()
# @brief Returns current form
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $athlete  = $division->athlete->current();
	my $rid      = $division->{ current }{ round };
	my $fid      = $division->{ current }{ form };

	# Autovivify form datastructure
	if( ! exists $athlete->{ scores }{ $rid }) { $athlete->{ scores }{ $rid } = { forms => [ {} ]}; }
	if( $fid > 0 ) { $athlete->{ scores }{ $rid }{ forms }[ $_ ] ||= {} foreach ( 1 .. $fid ); }

	my $form = $self->context( $athlete->{ scores }{ $rid }{ forms }[ $fid ]);

	return $form;
}

# ============================================================
sub decision {
# ============================================================
#**
# @method ( [ decision ] )
# @brief Sets form decision if a decision is provided. Returns form decision.
#*
	my $self     = shift;
	my $decision = shift;
	my $form     = $self->context();

	if( $decision eq 'clear' ) { 
		delete $form->{ decision }; 
		delete $form->{ complete }; 
		$self->complete();
		return undef; 
	}

	if( any { $decision eq $_ } @DECISIONS ) {
		$form->{ decision } = $decision;
		$form->{ complete } = 1;
		return $decision;
	}
}

# ============================================================
sub info {
# ============================================================
#**
# @method ( [ info=value, ... ] )
# @brief Sets form info if information key-value pairs are provided. Returns form info.
#*
	my $self = shift;
	my %info = @_;

	$form->{ info } = {} unless exists $form->{ info };

	if( keys %info == 0 ) {
		return $form->{ info };

	} else {
		foreach $name (keys %info) {
			my $value = $info{ $name };
			if( $value eq '' ) { delete $form->{ info }{ $name };   } 
			else               { $form->{ info }{ $name } = $value; }
		}
		return $form->{ info };
	}
}

# ============================================================
sub penalties {
# ============================================================
#**
# @method ( [ penalty=value, ... ] )
# @brief Sets form penalties if information key-value pairs are provided. Returns form penalties.
#*
	my $self      = shift;
	my @penalties = @_;

	$form->{ penalties } = {} unless exists $form->{ penalties };

	if( @penalties == 0 ) {
		return $form->{ penalties };

	if( @penalties == 1 && $penalties[ 0 ] eq 'clear' ) {
		delete $form->{ penalties };
		return undef;

	} else {
		my %penalties = @penalties;
		foreach $name (keys %penalties) {
			my $value = 0 + $penalties{ $name };
			$form->{ penalties }{ $name } += $value;
		}
		return $form->{ penalties };
	}
}

# ============================================================
sub max {
# ============================================================
#**
# @method ()
# @brief Returns the maximum number of regulation forms
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $event    = $division->{ _event };
	my $rid      = $division->{ current }{ round };
	my $max      = $event->max_forms( $rid );

	return $max;
}

1;
