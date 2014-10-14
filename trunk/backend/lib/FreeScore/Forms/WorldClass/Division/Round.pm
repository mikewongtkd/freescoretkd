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

	foreach my $form (@$self) {
		my $complete = 1;
		foreach my $score (@{ $form->{ judge }}) {
			$complete &&= $score->complete();
		}
		$form->{ complete } = $complete;
		next unless $complete;

		my $stats  = {};
		my $k = int @{$form->{ judge }};
		foreach my $score (@{ $form->{ judge }}) {
			my $accuracy     = $score->{ accuracy };
			my $presentation = $score->{ presentation };
			$stats->{ min }{ acc } = ! defined $stats->{ min }{ acc } || $stats->{ min }{ acc } > $accuracy     ? $accuracy     : $stats->{ min }{ acc };
			$stats->{ max }{ acc } = ! defined $stats->{ max }{ acc } || $stats->{ max }{ acc } > $accuracy     ? $accuracy     : $stats->{ max }{ acc };
			$stats->{ min }{ pre } = ! defined $stats->{ min }{ pre } || $stats->{ min }{ pre } > $presentation ? $presentation : $stats->{ min }{ pre };
			$stats->{ max }{ pre } = ! defined $stats->{ max }{ pre } || $stats->{ max }{ pre } < $presentation ? $presentation : $stats->{ max }{ pre };
			$stats->{ sum }{ acc } += $accuracy;
			$stats->{ sum }{ pre } += $presentation;
		}
		my @mean = (
			accuracy     => sprintf( "%.2f", $stats->{ sum }{ acc } / $k ),
			presentation => sprintf( "%.2f", $stats->{ sum }{ pre } / $k )
		);
		my $adjusted = { @mean };
		my $complete = { @mean };

		if( $k >= 5 ) {
			$adjusted->{ accuracy }     -= ($stats->{ min }{ acc } + $stats->{ max }{ acc }) / $k;
			$adjusted->{ presentation } -= ($stats->{ min }{ pre } + $stats->{ max }{ pre }) / $k;
			
			$adjusted->{ accuracy }     = sprintf( "%.2f", $adjusted->{ accuracy } );
			$adjusted->{ presentation } = sprintf( "%.2f", $adjusted->{ presentation } );
		}

		$form->{ adjusted_mean } = $adjusted;
		$form->{ complete_mean } = $complete;
		push @$means, { adjusted_mean => $adjusted, complete_mean => $complete };
	}

	return $means;
}

1;
