package FreeScore::Event::Recognized::Ranking;
use base qw( FreeScore::Component FreeScore::Clonable );
use overload 'cmp' => \&_cmp;

# ============================================================
sub init {
# ============================================================
	my $self     = shift;
	my $parent   = shift;
	my $division = $parent->parent();

	$self->SUPER::init( $parent );

	# Average the scores over all forms
	my $ranking = {};
	my $n       = int( @{ $self->{ forms }});
	foreach $data (@{ $self->{ forms }}) {
		my $form = $division->form->context( $data );
		$form->evaluate();
		$ranking->{ $_ } += $form->{ ranking }{ $_ } foreach (qw( score tb1 tb2 ));
		$ranking->{ decision } = $form->{ decision } if $form->{ decision };
	}
	$ranking->{ $_ }   = 0.0 + sprintf( "%.3f", $ranking->{ $_ } / $n ) foreach (qw( score tb1 tb2 ));
	$self->{ ranking } = $ranking;
}

# ============================================================
sub complete {
# ============================================================
#**
# @method ()
# @brief A ranking for Recognized Poomsae is complete if all forms are complete
#*
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
sub tiebreaker {
# ============================================================
#**
# @method ( b )
# @brief Identifies which tiebreaker was needed, if a tiebreaker is needed; undef otherwise
#*
	my $a = shift;
	my $b = shift;

	my $decision_value = { '' => 0, dsq => 10, wdr => 1 };
	my $adv = $decision_value->{ $a->{ ranking }{ decision }};
	my $bdv = $decision_value->{ $b->{ ranking }{ decision }};

	return undef if $adv <=> $bdv;
	return undef if $b->{ ranking }{ score } <=> $a->{ ranking }{ score };
	return 'tb1' if $b->{ ranking }{ tb1 } <=> $a->{ ranking }{ tb1 };

	return $b->{ ranking }{ tb2 } <=> $a->{ ranking }{ tb2 } ? 'tb2' : undef;
}

# ============================================================
sub _cmp {
# ============================================================
	my $a = shift;
	my $b = shift;

	my $decision_value = { '' => 0, dsq => 10, wdr => 1 };
	my $adv = $decision_value->{ $a->{ ranking }{ decision }};
	my $bdv = $decision_value->{ $b->{ ranking }{ decision }};

	return $adv <=> $bdv ||
		$b->{ ranking }{ score } <=> $a->{ ranking }{ score } || 
		$b->{ ranking }{ tb1 } <=> $a->{ ranking }{ tb1 } ||
		$b->{ ranking }{ tb2 } <=> $a->{ ranking }{ tb2 }

}

1;
