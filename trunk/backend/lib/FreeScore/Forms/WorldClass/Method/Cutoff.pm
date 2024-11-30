package FreeScore::Forms::WorldClass::Method::Cutoff;
use base qw( FreeScore::Forms::WorldClass::Method );
use List::Util qw( first );

our @rounds = [
	{ code => 'prelim', name => 'Preliminary', min => 20 },
	{ code => 'semfin', name => 'Semi-Finals', min => 9, max => 19 },
	{ code => 'finals', name => 'Finals',      min => 1, max => 8  }
];

# ============================================================
sub initialize {
# ============================================================
#** @method ()
#   @brief Normalizes the division object.
#*
	my $self     = shift;
	my $athletes = shift; # Dictionary of athletes by name (not by index!)
	my $order    = shift; # Athlete order by name (not by index!)
	my $div      = $self->{ division };
	my $judges   = $div->{ judges };
	my $round    = $div->{ round };

	my ($prelim, $semfin, $finals) = @FreeSore::Forms::WorldClass::Method::Cutoff::rounds;

	$div->{ state } ||= 'score';
	$div->{ form }  ||= 0;

	# ===== AUTODETECT THE FIRST ROUND
	if( exists $order->{ autodetect_required } ) {
		my $n      = int( keys %$athletes );
		my $flight = $div->is_flight();

		if    ( $n ==  0            ) { die "Division Configuration Error: No athletes declared $!"; }
		elsif ( $n >= $prelim->{ min } || $flight )               { $round = 'prelim'; $order->{ prelim } = $order->{ autodetect_required }; }
		elsif ( $n <  $prelim->{ min } && $n >= $semfin->{ min }) { $round = 'semfin'; $order->{ semfin } = $order->{ autodetect_required }; }
		elsif ( $n <=  $finals->{ max }            )              { $round = 'finals'; $order->{ finals } = $order->{ autodetect_required }; }

		delete $order->{ autodetect_required };
	}

	# ===== CONVERT FROM NAME INDEX TO NUMERIC INDEX
	# Indices have full document scope; that is, recurring names in subsequent
	# rounds refer to the same athlete of the same name from the previous
	# round, and therefore should have the same numeric index.
	my $numeric_index = {};
	foreach my $round ($self->rounds()) {
		next unless exists $order->{ $round };

		# Establish order by athlete name, based on the earliest round
		if( keys %$numeric_index ) {
			foreach my $name (@{ $order->{ $round }}) {
				next unless exists $numeric_index->{ $name };
				my $i = $numeric_index->{ $name };
				$div->assign( $i, $round );
			}

		# No initial order set; this must be the earliest round
		} else {
			foreach my $i ( 0 .. $#{ $order->{ $round }}) {
				my $name = $order->{ $round }[ $i ];
				$numeric_index->{ $name } = $i;
				$athletes->{ $name }{ id } = $i unless exists $athletes->{ $name }{ id };
				$div->assign( $i, $round );
				push @{ $div->{ athletes }}, $athletes->{ $name };
			}
		}
	}
}

# ============================================================
sub normalize {
# ============================================================
#** @method ()
#   @brief Normalizes the division object.
#*
	my $self   = shift;
	my $round  = shift || $div->{ round };
	my $div    = $self->{ division };
	my $judges = $div->{ judges };

	$div->{ state } ||= 'score';
	$div->{ form }  ||= 0;

	# ===== NORMALIZE THE SCORING MATRIX
	my $forms  = int( @{ $div->{ forms }{ $round }});
	if( exists $div->{ order } && exists $div->{ order }{ $round }) {
		foreach my $i (@{ $div->{ order }{ $round }}) {
			my $athlete = $div->{ athletes }[ $i ];
			$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
		}
	}

	$div->{ current } = $div->athletes_in_round( 'first' ) unless defined $div->{ current };
}

# ============================================================
sub string {
# ============================================================
	my $self = shift;
	return 'cutoff';
}

1;
