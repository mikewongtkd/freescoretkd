package FreeScore::Forms::WorldClass::Division::Round;
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round::Score;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift;
	my $self = bless $data, $class;
	$self->init();
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self = shift;
	foreach my $form (@$self) {
		foreach my $i (0 .. $#{ $form->{ judge }}) {
			my $judge_score = $form->{ judge };
			$judge_score->[ $i ] = new FreeScore::Forms::WorldClass::Division::Round::Score( $judge_score->[ $i ] );
		}
	}
	$self->calculate_means();
}

# ============================================================
sub calculate_means {
# ============================================================
	my $self   = shift;
	my $means  = [];

	return $means unless $self->valid();

	foreach my $form (@$self) {
		my $stats  = {};
		my $judges = $form->{ judge };
		foreach my $score (@{ $form->{ judge }}) {
			my $presentation = $score->presentation();
			my $accuracy     = $score->accuracy();
			$stats->{ min }{ pre } = ! defined $stats->{ min }{ pre } || $stats->{ min }{ pre } > $presentation ? $presentation : $stats->{ min }{ pre };
			$stats->{ max }{ pre } = ! defined $stats->{ max }{ pre } || $stats->{ max }{ pre } < $presentation ? $presentation : $stats->{ max }{ pre };
			$stats->{ min }{ acc } = ! defined $stats->{ min }{ acc } || $stats->{ min }{ acc } > $accuracy     ? $accuracy     : $stats->{ min }{ acc };
			$stats->{ max }{ acc } = ! defined $stats->{ max }{ acc } || $stats->{ max }{ acc } > $accuracy     ? $accuracy     : $stats->{ max }{ acc };
			$stats->{ sum }{ acc } += $accuracy;
			$stats->{ sum }{ pre } += $presentation;
		}
		my @mean = (
			accuracy     => sprintf( "%.2f", $stats->{ sum }{ acc } / $judges ),
			presentation => sprintf( "%.2f", $stats->{ sum }{ pre } / $judges )
		);
		my $adjusted = { @mean };
		my $complete = { @mean };

		if( $judges >= 5 ) {
			$adjusted->{ accuracy }     -= ($stats->{ min }{ acc } + $stats->{ max }{ acc }) / $judges;
			$adjusted->{ presentation } -= ($stats->{ min }{ pre } + $stats->{ max }{ pre }) / $judges;
			
			$adjusted->{ accuracy }     = sprintf( "%.2f", $adjusted->{ accuracy } );
			$adjusted->{ presentation } = sprintf( "%.2f", $adjusted->{ presentation } );
		}

		$form->{ adjusted_mean } = $adjusted;
		$form->{ complete_mean } = $complete;
		push @$means, { adjusted_mean => $adjusted, complete_mean => $complete };
	}

	return $means;
}

# ============================================================
sub valid {
# ============================================================
	my $self = shift;
	foreach my $form (@$self) {
		foreach my $score (@{ $form->{ judge }}) {
			return 0 unless $score->valid();
		}
	}
	return 1;
}

1;
