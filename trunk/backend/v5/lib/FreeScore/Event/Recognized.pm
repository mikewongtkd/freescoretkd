package FreeScore::Event::Recognized;
use base qw( FreeScore::Event );
use List::Util qw( all any reduce sum0 );
use List::MoreUtils qw( first_index minmax );

our @ACCURACY     = qw( major minor );
our @PRESENTATION = qw( power rhythm energy );
our @CATEGORIES   = ( @ACCURACY, @PRESENTATION );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ name } = 'recognized';
}

# ============================================================
# PERFORMANCES
# ============================================================

# ============================================================
sub evaluate_performance {
# ============================================================
	my $self        = shift;
	my $performance = shift;
	my $divid       = $self->division->id();
	my $forms       = $performance->forms();

	# Average the scores over all forms
	my $n       = int( @$forms );
	foreach $form (@$forms) {
		$form->evaluate();
		$self->{ $_ } += $form->{ ranking }{ $_ } foreach (qw( score tb1 tb2 ));
		$self->{ decision } = $form->{ decision } if $form->{ decision };
	}
	$self->{ $_ }   = 0.0 + sprintf( "%.3f", $self->{ $_ } / $n ) foreach (qw( score tb1 tb2 ));
}

# ============================================================
sub performance_complete {
# ============================================================
	my $self     = shift;
	my $division = $self->parent->parent();
	my $complete = 1;

	foreach my $data (@{ $self->{ forms }}) {
		my $form = $division->form->context( $data );
		$complete &&= $form->complete();
	}

	return $complete;
}

# ============================================================
sub performance_tiebreaker {
# ============================================================
	my $self = shift;
	my $a    = shift;
	my $b    = shift;

	my $decision_value = { dsq => 10, wdr => 1 };
	my $adv = exists $a->{ decision } && defined $a->{ decision } ? $decision_value->{ $a->{ decision }} : 0;
	my $bdv = exists $b->{ decision } && defined $b->{ decision } ? $decision_value->{ $b->{ decision }} : 0;

	return undef if $adv <=> $bdv;
	return undef if $b->{ score } <=> $a->{ score };
	return 'tb1' if $b->{ tb1 } <=> $a->{ tb1 };

	return $b->{ tb2 } <=> $a->{ tb2 } ? 'tb2' : undef;
}

# ============================================================
# FORMS
# ============================================================

# ============================================================
sub evaluate_form {
# ============================================================
#**
# @method ( form )
# @brief Evaluates the form for score and tiebreaking criteria
# @param form - Form to be evaluated
# @details
# For Recognized Poomsae
# - Score: trimmed mean
# - Tiebreaker 1: Trimmed presentation
# - Tiebreaker 2: Highs and lows
#*
	my $self     = shift;
	my $form     = shift;
	my $event    = $self->parent();

	# Incomplete forms cannot be evaluated
	return undef unless $form->complete();

	my $decision     = $form->decision();
	my $penalties    = $form->penalties();
	my $total_pen    = sum0 map { $penalties->{ $_ } } grep { ! /^misconduct$/i } keys %$penalties;

	return $form->{ ranking } = { score => 0 - $total_pen, tb1 => 0.0, tb2 => 0.0, penalties => $penalties, decision => $decision } if $decision;

	my $judges       = $form->judges();
	my $scores       = [ map { $event->score->context( $_ ) } @$judges ];	my $accuracy     = [ map { $self->accuracy( $_ ) } @$scores ];
	my $presentation = [ map { $self->presentation( $_ ) } @$scores ];

	my $trimmed_acc  = $self->_trimmed_mean( $form, $accuracy );
	my $trimmed_pre  = $self->_trimmed_mean( $form, $presentation );
	my $trimmed_mean = $trimmed_acc + $trimmed_pre - $total_pen;
	my $highs_lows   = sprintf( "%.2f", (sum0 @$accuracy + sum0 @$presentation)/$judges );

	return $form->{ ranking } = { score => $trimmed_mean, tb1 => $trimmed_pre, tb2 => $highs_lows, penalties => $penalties, decision => undef };
}

# ============================================================
sub _trimmed_mean {
# ============================================================
#**
# @method ()
# @brief Calculates the trimmed mean for a given form
#*
	my $self        = shift;
	my $form        = shift;
	my $scores      = shift;
	my $total       = sum0 @$scores;
	my $judges      = int( @$scores );

	if( $judges > 3 ) {
		my ($min, $max) = minmax @$scores;
		my $i           = first_index { $_ == $min } @$scores;
		my $j           = first_index { $_ == $max } @$scores;
		$j++ if $i == $j;

		my $trimmed     = $total - ($min + $max);
	}

	return { mean => sprintf( "%.2f", $total / $n ) };
}

# ============================================================
# SCORES
# ============================================================

# ============================================================
sub accuracy {
# ============================================================
#**
# @method ( score )
# @param score - Score to calculate for accuracy
# @brief Calculates the accuracy subtotal
	my $self  = shift;
	my $score = shift;

	# Cast values as numerical
	$score->{ $_ } = 0.0 + sprintf( "%.1f", $score->{ $_ } foreach (@ACCURACY);
	my $accuracy = 4.0 - (reduce { $a + $b } map { $score->{ $_ } } @ACCURACY);
	$accuracy = $accuracy > 4 ? 4 : $accuracy;
	$accuracy = $accuracy < 0 ? 0 : $accuracy;
	return $accuracy;
}

# ============================================================
sub presentation {
# ============================================================
#**
# @method ( score )
# @param score - Score to calculate for presentation
# @brief Calculates the presentation subtotal
	my $self  = shift;
	my $score = shift;

	# Cast values as numerical
	$score->{ $_ } = 0.0 + sprintf( "%.1f", $score->{ $_ } foreach (@PRESENTATION);

	my $presentation = (reduce { $a + $b } map { $score->{ $_ } } @PRESENTATION);
	$presentation = $presentation < 1.5 ? 1.5 : $presentation;
	$presentation = $presentation > 6   ? 6   : $presentation;
	return $presentation;
}

# ============================================================
sub score_complete {
# ============================================================
#**
# @method ( score )
# @param score - Score to evaluate for completeness
# @brief A Recognized Poomsae score is complete if all fields have valid values
#*
	my $self         = shift;
	my $score        = shift;

	my $accuracy     = all { defined $score->{ $_ } && $score->{ $_ } >= 0 } @ACCURACY;
	my $presentation = all { defined $score->{ $_ } && $score->{ $_ } >= 0.5 && $score->{ $_ } <= 2.0 } @PRESENTATION;
	my $complete     = $accuracy && $presentation;

	return $complete;
}

# ============================================================
# NAVIGATION
# ============================================================
sub division   { my $self = shift; return $self->parent(); }
sub tournament { my $self = shift; return $self->parent->parent(); }

1;
