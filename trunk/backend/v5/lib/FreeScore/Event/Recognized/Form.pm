package FreeScore::Event::Recognized::Form;
use base qw( FreeScore::Form );
use List::Util qw( sum0 );
use List::MoreUtils qw( first_index minmax );

# ============================================================
sub evaluate {
# ============================================================
#**
# @method ()
# @brief Evaluates the form for score and tiebreaking criteria
# @details
# For Recognized Poomsae
# - Score: trimmed mean
# - Tiebreaker 1: Trimmed presentation
# - Tiebreaker 2: Highs and lows
#*
	my $self     = shift;
	my $event    = $self->parent();

	# Incomplete forms cannot be evaluated
	return undef unless $self->complete();

	my $decision     = $self->decision();
	my $penalties    = $self->penalties();
	my $total_pen    = sum0 map { $penalties->{ $_ } } grep { ! /^misconduct$/i } keys %$penalties;

	return $self->{ ranking } = { score => 0 - $total_pen, tb1 => 0.0, tb2 => 0.0, penalties => $penalties, decision => $decision } if $decision;

	my $judges       = $self->judges();
	my $scores       = [ map { $event->score->context( $_ ) } @$judges ];
	my $accuracy     = [ map { $_->accuracy()     } @$scores ];
	my $presentation = [ map { $_->presentation() } @$scores ];

	my $trimmed_acc  = $self->_trimmed_mean( $accuracy );
	my $trimmed_pre  = $self->_trimmed_mean( $presentation );
	my $trimmed_mean = $trimmed_acc + $trimmed_pre - $total_pen;
	my $highs_lows   = sprintf( "%.2f", (sum0 @$accuracy + sum0 @$presentation)/$judges );

	return $self->{ ranking } = { score => $trimmed_mean, tb1 => $trimmed_pre, tb2 => $highs_lows, penalties => $penalties, decision => undef };
}

# ============================================================
sub _trimmed_mean {
# ============================================================
#**
# @method ()
# @brief Calculates the trimmed mean for a given form
#*
	my $self        = shift;
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

1;
