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
	foreach my $round (@$self) {
		foreach my $i (0 .. $#$round) {
			$round->[ $i ] = new FreeScore::Forms::WorldClass::Division::Round::Score( $round->[ $i ] );
		}
	}
}

# ============================================================
sub means {
# ============================================================
	my $self   = shift;
	my $means  = [];

	return $means unless $self->valid();

	foreach my $round (@$self) {
		my $stats  = {};
		my $judges = int( @$round );
		foreach my $score (@$round) {
			my $precision = $score->precision();
			my $accuracy  = $score->accuracy();
			$stats->{ min }{ pre } = ! defined $stats->{ min }{ pre } || $stats->{ min }{ pre } > $precision ? $precision : $stats->{ min }{ pre };
			$stats->{ max }{ pre } = ! defined $stats->{ max }{ pre } || $stats->{ max }{ pre } < $precision ? $precision : $stats->{ max }{ pre };
			$stats->{ min }{ acc } = ! defined $stats->{ min }{ acc } || $stats->{ min }{ acc } > $accuracy  ? $accuracy  : $stats->{ min }{ acc };
			$stats->{ max }{ acc } = ! defined $stats->{ max }{ acc } || $stats->{ max }{ acc } > $accuracy  ? $accuracy  : $stats->{ max }{ acc };
			$stats->{ sum }{ acc } += $accuracy;
			$stats->{ sum }{ pre } += $precision;
		}
		my @mean = (
			accuracy     => sprintf( "%.2f", $stats->{ sum }{ acc } / $judges ),
			presentation => sprintf( "%.2f", $stats->{ sum }{ pre } / $judges )
		);
		my $adjusted   = { @mean };
		my $unadjusted = { @mean };

		if( $judges >= 5 ) {
			$adjusted->{ accuracy }     -= ($stats->{ min }{ acc } + $stats->{ max }{ acc }) / $judges;
			$adjusted->{ presentation } -= ($stats->{ min }{ pre } + $stats->{ max }{ pre }) / $judges;
			
			$adjusted->{ accuracy }     = sprintf( "%.2f", $adjusted->{ accuracy } );
			$adjusted->{ presentation } = sprintf( "%.2f", $adjusted->{ presentation } );
		}

		push @$means, { adjusted => $adjusted, unadjusted => $unadjusted };
	}

	return $means;
}

# ============================================================
sub totals {
# ============================================================
	my $self   = shift;
	my $rounds = shift;
}

# ============================================================
sub valid {
# ============================================================
	my $self = shift;
	foreach my $round (@$self) {
		foreach my $score (@$round) {
			return 0 unless $score->valid();
		}
	}
	return 1;
}

1;
