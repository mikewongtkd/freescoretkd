package FreeScore::Athlete;
use base qw( FreeScore::Component );
use List::MoreUtils qw( first_index );

# ============================================================
sub current {
# ============================================================
	my $self     = shift;
	my $division = $self->{ _parent };
	my $aid      = $division->{ current }{ athlete };
	my $athletes = $division->{ athletes };
	my $athlete  = $athletes->[ $aid ];

	return $athlete;
}

# ============================================================
sub next {
# ============================================================
#** @method ()
#   @brief Calls FreeScore::Method::next_athlete()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s", $aid, $rid ) unless $i >= 0;
	return undef if( $i == 0 );
	my $j        = $i - 1;
	my $athletes = $division->{ athletes };
	my $athlete  = $athletes->[ $j ];
	return $athlete;
}

# ============================================================
sub previous {
# ============================================================
#** @method ()
#   @brief Calls FreeScore::Method::next_athlete()
#*
	my $self     = shift;
	my $division = $self->{ _parent };
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;
	my $n        = $#$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s", $aid, $rid ) unless $i >= 0;
	return undef if( $i >= $n );
	my $j        = $i + 1;
	my $athletes = $division->{ athletes };
	my $athlete  = $athletes->[ $j ];
	return $athlete;
}

1;
