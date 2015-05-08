package FreeScore::Forms::WorldClass::Division::Round;
use JSON::XS;
use List::Util qw( all );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use Data::Dumper;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift;
	my $forms   = shift;
	my $judges  = shift;
	my $self    = bless $data, $class; 
	if( defined $judges ) {
		foreach ( 1 .. $forms ) {
			my $scores = [];
			push @$scores, {} foreach ( 1 .. $judges ) ;
			push @$self, { judge => $scores };
		}
	}

	$self->init( @_ );
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self = shift;
	foreach my $form (@$self) {
		foreach my $i (0 .. $#{ $form->{ judge }}) {
			my $judge_score = $form->{ judge };
			bless $judge_score->[ $i ], 'FreeScore::Forms::WorldClass::Division::Round::Score';
		}
	}
	$self->calculate_means();
}

# ============================================================
sub add_tiebreaker {
# ============================================================
	my $self   = shift;
	my $judges = shift;
	my $start  = shift;
	my $stop   = shift;

	foreach my $i ( $start .. $stop ) {
		my $scores = [];
		push @$scores, new FreeScore::Forms::WorldClass::Division::Round::Score( {} ) foreach( 1 .. $judges );
		$self->[ $i ] = defined $self->[ $i ] ? $self->[ $i ] : { judge => $scores };
	}
}

# ============================================================
sub calculate_means {
# ============================================================
	my $self   = shift;
	my $means  = [];

	$self->complete();
	foreach my $form (@$self) {
		next unless $form->{ complete };

		my $stats  = { min => { acc => 0, pre => 0 }, max => { acc => 0, pre => 0 }};
		my $k = int @{$form->{ judge }};
		# ===== FIND MIN/MAX ACCURACY AND PRESENTATION
		foreach my $i (0 .. $#{ $form->{ judge }}) {
			my $score        = $form->{ judge }[ $i ];
			my $accuracy     = $score->{ accuracy };
			my $presentation = $score->{ presentation };
			$stats->{ min }{ acc } = $form->{ judge }[ $stats->{ min }{ acc } ]{ accuracy     } > $accuracy     ? $i : $stats->{ min }{ acc };
			$stats->{ max }{ acc } = $form->{ judge }[ $stats->{ max }{ acc } ]{ accuracy     } < $accuracy     ? $i : $stats->{ max }{ acc };
			$stats->{ min }{ pre } = $form->{ judge }[ $stats->{ min }{ pre } ]{ presentation } > $presentation ? $i : $stats->{ min }{ pre };
			$stats->{ max }{ pre } = $form->{ judge }[ $stats->{ max }{ pre } ]{ presentation } < $presentation ? $i : $stats->{ max }{ pre };
			$stats->{ sum }{ acc } += $accuracy;
			$stats->{ sum }{ pre } += $presentation;
		}

		# ===== IF ALL SCORES ARE THE SAME, THEN THE MIN AND MAX WILL BE THE SAME; DIFFERENTIATE THEM
		if( $stats->{ min }{ acc } == $stats->{ max }{ acc } ) { $stats->{ max }{ acc }++; }
		if( $stats->{ min }{ pre } == $stats->{ max }{ pre } ) { $stats->{ max }{ pre }++; }

		# ===== MARK THE SCORES AS MIN OR MAX
		foreach my $i (0 .. $#{ $form->{ judge }}) {
			foreach my $minmax (qw( minacc maxacc minpre maxpre )) { $form->{ judge }[ $i ]{ $minmax } = JSON::XS::false; }
		}
		$form->{ judge }[ $stats->{ min }{ acc } ]{ minacc } = JSON::XS::true;
		$form->{ judge }[ $stats->{ max }{ acc } ]{ maxacc } = JSON::XS::true;
		$form->{ judge }[ $stats->{ min }{ pre } ]{ minpre } = JSON::XS::true;
		$form->{ judge }[ $stats->{ max }{ pre } ]{ maxpre } = JSON::XS::true;

		# ===== RE-MAP FROM INDICES TO VALUES
		$stats->{ min }{ acc } = $form->{ judge }[ $stats->{ min }{ acc } ]{ accuracy };
		$stats->{ max }{ acc } = $form->{ judge }[ $stats->{ max }{ acc } ]{ accuracy };
		$stats->{ min }{ pre } = $form->{ judge }[ $stats->{ min }{ pre } ]{ presentation };
		$stats->{ max }{ pre } = $form->{ judge }[ $stats->{ max }{ pre } ]{ presentation };

		my @mean = (
			accuracy     => sprintf( "%.2f", $stats->{ sum }{ acc }),
			presentation => sprintf( "%.2f", $stats->{ sum }{ pre })
		);
		my $adjusted = { @mean };
		my $complete = { @mean };

		# ===== CALCULATE ADJUSTED MEANS
		if( $k >= 5 ) {
			$adjusted->{ accuracy }     -= ($stats->{ min }{ acc } + $stats->{ max }{ acc });
			$adjusted->{ presentation } -= ($stats->{ min }{ pre } + $stats->{ max }{ pre });

			$adjusted->{ accuracy }     /= ($k - 2);
			$adjusted->{ presentation } /= ($k - 2);

			$adjusted->{ accuracy }     = $adjusted->{ accuracy }     < 0 ? 0 : $adjusted->{ accuracy };
			$adjusted->{ presentation } = $adjusted->{ presentation } < 0 ? 0 : $adjusted->{ presentation };
			
			$adjusted->{ accuracy }     = sprintf( "%.2f", $adjusted->{ accuracy } );
			$adjusted->{ presentation } = sprintf( "%.2f", $adjusted->{ presentation } );

		} else {
			$adjusted = { map { ( $_ => sprintf( "%.2f", ($adjusted->{ $_ }/$k))) } keys %$adjusted };
		}

		# ===== CALCULATE COMPLETE MEANS
		$complete = { map { ( $_ => sprintf( "%.2f", ($complete->{ $_ }/$k))) } keys %$complete };

		$adjusted->{ total } = $adjusted->{ accuracy } + $adjusted->{ presentation };
		$complete->{ total } = $complete->{ accuracy } + $complete->{ presentation };

		$form->{ adjusted_mean } = $adjusted;
		$form->{ complete_mean } = $complete;
		push @$means, { adjusted_mean => $adjusted, complete_mean => $complete };
	}

	return $means;
}

# ============================================================
sub _compare {
# ============================================================
	my $a = shift;
	my $b = shift;

	if( ! defined $a && ! defined $b ) { return 0; }
	if( ! defined $a ) { return  1; }
	if( ! defined $b ) { return -1; }

	my $sum_a = {};
	my $sum_b = {};
	my $n     = $#$a >= $#$b ? $#$a : $#$b;

	foreach my $mean ( qw( adjusted_mean complete_mean )) {
		for my $i ( 0 .. $n ) {
			my $score_a = $a->[ $i ];
			my $score_b = $b->[ $i ];

			foreach my $category ( qw( accuracy presentation total )) {
				$sum_a->{ $mean }{ $category } += $score_a->{ $mean }{ $category };
				$sum_b->{ $mean }{ $category } += $score_b->{ $mean }{ $category };
			}
		}
	}

	foreach my $mean ( qw( adjusted_mean complete_mean )) {
		for my $i ( 0 .. $n ) {
			foreach my $category ( qw( accuracy presentation total )) {
				$sum_a->{ $mean }{ $category } = sprintf( "%5.2f", $sum_a->{ $mean }{ $category } );
				$sum_b->{ $mean }{ $category } = sprintf( "%5.2f", $sum_b->{ $mean }{ $category } );
			}
		}
	}

	return
		$sum_b->{ adjusted_mean }{ total }        <=> $sum_a->{ adjusted_mean }{ total }        ||
		$sum_b->{ adjusted_mean }{ presentation } <=> $sum_a->{ adjusted_mean }{ presentation } ||
		$sum_b->{ complete_mean }{ total }        <=> $sum_a->{ complete_mean }{ total };
}

# ============================================================
sub complete {
# ============================================================
# An athlete's round is complete when all their compulsory forms are complete
# ------------------------------------------------------------
	my $self = shift;
	my $n    = shift || int( @$self ) > 1 ? 2 : 1;
	$n = $n - 1;

	# ===== A FORM IS COMPLETE WHEN ALL JUDGE SCORES ARE COMPLETED
	foreach my $form (@$self) {
		$form->{ complete } = all { $_->complete() } ( @{ $form->{ judge }} );
	}

	# ===== A ROUND IS COMPLETE WHEN ALL COMPULSORY FORMS ARE COMPLETED
	my $complete = all { $_->{ complete }; } @$self;
	return $complete;
}
1;
