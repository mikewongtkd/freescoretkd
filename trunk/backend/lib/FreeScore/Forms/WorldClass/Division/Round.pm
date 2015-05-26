package FreeScore::Forms::WorldClass::Division::Round;
use JSON::XS;
use List::Util qw( all );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use Data::Dumper;
use Carp;

$SIG{ __DIE__ } = sub { Carp::confess( @_ ) };

# ============================================================
sub new {
# ============================================================
# A round is an array of one or more forms.
# ------------------------------------------------------------
	my ($class) = map { ref || $_ } shift;
	my $data    = shift || [];
	my $self    = bless $data, $class; 
	$self->init( @_ );
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self = shift;
}

# ============================================================
sub record_score {
# ============================================================
# Records a given score. Will overwrite if the same judge has
# given a previous score for the same form.
#------------------------------------------------------------
 	my $self  = shift;
	my $form  = shift;
	my $judge = shift;
	my $score = shift;

	$self->[ $form ]{ judge }[ $judge ] = new FreeScore::Forms::WorldClass::Division::Round::Score( $score );
}

# ============================================================
sub add_tiebreaker {
# ============================================================
	my $self   = shift;
	my $judges = shift;
	my $start  = shift;
	my $stop   = shift;

	foreach my $i ( $start .. $stop ) {
		foreach ( 0 .. $judges ) {
			push @{ $self->[ $i ]{ judge }}, new FreeScore::Forms::WorldClass::Division::Round::Score();
		}
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
		next unless exists $form->{ judge };

		my $stats  = { minacc => 0, minpre => 0, maxacc => 0, maxpre => 0 };
		my $judges = int @{$form->{ judge }};
		my $k      = $#{ $form->{ judge }};
		# ===== FIND MIN/MAX ACCURACY AND PRESENTATION
		foreach my $i (0 .. $k) {
			my $score        = $form->{ judge }[ $i ];
			my $accuracy     = $score->{ accuracy };
			my $presentation = $score->{ presentation };
			die "Round Object Error: Accuracy not calculated!"  if not defined $accuracy;
			die "Round Object Error: Precision not calculated!" if not defined $presentation;
			$stats->{ minacc } = $form->{ judge }[ $stats->{ minacc } ]{ accuracy     } > $accuracy     ? $i : $stats->{ minacc };
			$stats->{ maxacc } = $form->{ judge }[ $stats->{ maxacc } ]{ accuracy     } < $accuracy     ? $i : $stats->{ maxacc };
			$stats->{ minpre } = $form->{ judge }[ $stats->{ minpre } ]{ presentation } > $presentation ? $i : $stats->{ minpre };
			$stats->{ maxpre } = $form->{ judge }[ $stats->{ maxpre } ]{ presentation } < $presentation ? $i : $stats->{ maxpre };
			$stats->{ sumacc } += $accuracy;
			$stats->{ sumpre } += $presentation;
		}

		# ===== IF ALL SCORES ARE THE SAME, THEN THE MIN AND MAX WILL BE THE SAME; DIFFERENTIATE THEM
		if( $stats->{ minacc } == $stats->{ maxacc } && $k > 0 ) { $stats->{ maxacc }++; }
		if( $stats->{ minpre } == $stats->{ maxpre } && $k > 0 ) { $stats->{ maxpre }++; }

		# ===== MARK THE SCORES AS MIN OR MAX
		foreach my $i (0 .. $k) { $form->{ judge }[ $i ]->clear_minmax(); }

		$form->{ judge }[ $stats->{ minacc } ]->mark_minmax( 'minacc' );
		$form->{ judge }[ $stats->{ maxacc } ]->mark_minmax( 'maxacc' );
		$form->{ judge }[ $stats->{ minpre } ]->mark_minmax( 'minpre' );
		$form->{ judge }[ $stats->{ maxpre } ]->mark_minmax( 'maxpre' );

		# ===== RE-MAP FROM INDICES TO VALUES
		$stats->{ min }{ acc } = $form->{ judge }[ $stats->{ minacc } ]{ accuracy };
		$stats->{ max }{ acc } = $form->{ judge }[ $stats->{ maxacc } ]{ accuracy };
		$stats->{ min }{ pre } = $form->{ judge }[ $stats->{ minpre } ]{ presentation };
		$stats->{ max }{ pre } = $form->{ judge }[ $stats->{ maxpre } ]{ presentation };

		my @mean = (
			accuracy     => sprintf( "%.2f", $stats->{ sumacc }),
			presentation => sprintf( "%.2f", $stats->{ sumpre })
		);
		my $adjusted = { @mean };
		my $complete = { @mean };

		# ===== CALCULATE ADJUSTED MEANS
		if( $judges >= 5 ) {
			$adjusted->{ accuracy }     -= ($stats->{ minacc } + $stats->{ maxacc });
			$adjusted->{ presentation } -= ($stats->{ minpre } + $stats->{ maxpre });

			$adjusted->{ accuracy }     /= ($judges - 2);
			$adjusted->{ presentation } /= ($judges - 2);

			$adjusted->{ accuracy }     = $adjusted->{ accuracy }     < 0 ? 0 : $adjusted->{ accuracy };
			$adjusted->{ presentation } = $adjusted->{ presentation } < 0 ? 0 : $adjusted->{ presentation };
			
			$adjusted->{ accuracy }     = sprintf( "%.2f", $adjusted->{ accuracy } );
			$adjusted->{ presentation } = sprintf( "%.2f", $adjusted->{ presentation } );

		} else {
			$adjusted = { map { ( $_ => sprintf( "%.2f", ($adjusted->{ $_ }/$judges))) } keys %$adjusted };
		}

		# ===== CALCULATE COMPLETE MEANS
		$complete = { map { ( $_ => sprintf( "%.2f", ($complete->{ $_ }/$judges))) } keys %$complete };

		$adjusted->{ total } = $adjusted->{ accuracy } + $adjusted->{ presentation };
		$complete->{ total } = $complete->{ accuracy } + $complete->{ presentation };

		$form->{ adjusted_mean } = $adjusted;
		$form->{ complete_mean } = $complete;
		push @$means, { adjusted_mean => $adjusted, complete_mean => $complete };
	}

	return $means;
}

# ============================================================
sub complete {
# ============================================================
# An athlete's round is complete when all their compulsory forms are complete
# ------------------------------------------------------------
	my $self = shift;

	# ===== A FORM IS COMPLETE WHEN ALL JUDGE SCORES ARE COMPLETED
	foreach my $form (@$self) {
		next unless exists $form->{ judge };
		$form->{ complete } = all { $_->complete() } ( @{ $form->{ judge }} );
	}

	# ===== A ROUND IS COMPLETE WHEN ALL COMPULSORY FORMS ARE COMPLETED
	my $complete = all { $_->{ complete }; } @$self;
	return $complete;
}

# ============================================================
sub reinstantiate {
# ============================================================
	my $self   = shift;
	my $forms  = shift;
	my $judges = shift;

	my $new = undef;

	if( ! defined $self ) {
		$new = new FreeScore::Forms::WorldClass::Division::Round();
		for( my $i = 0; $i < $forms; $i++ ) {
			for( my $j = 0; $j < $judges; $j++ ) {
				push @{$new->[ $i ]{ judge }}, new FreeScore::Forms::WorldClass::Division::Round::Score();
			}
		}
		return $new;
	}
	my $sub = eval { $self->can( "record_score" ) };
	my $ref = ref $self;
	if( ! $sub ) {
		if( $ref eq 'ARRAY' ) { bless $self, "FreeScore::Forms::WorldClass::Division::Round"; } 
		else                  { die "Round Object Error: Attempting to instantiate an round object that is not an array ($ref) $!"; }
	}
	for( my $i = 0; $i < $forms; $i++ ) {
		for( my $j = 0; $j < $judges; $j++ ) {
			$self->[ $i ]{ judge }[ $j ] = FreeScore::Forms::WorldClass::Division::Round::Score::reinstantiate( $self->[ $i ]{ judge }[ $j ]);
		}
	}
	return $self;
}

# ============================================================
sub string {
# ============================================================
	my $self   = shift;
	my $round  = shift;
	my $forms  = shift;
	my $judges = shift;
	my @string = ();
	
	for( my $i = 0; $i < $forms; $i++ ) {
		my $form = $self->[ $i ];
		for( my $j = 0; $j < $judges; $j++ ) {
			my $score = $form->{ judge }[ $j ];
			push @string, "\t" . join( "\t", $round, 'f' . ($i + 1), 'j' . ($j + 1), $score->string() ) . "\n";
		}
	}
	return join "", @string;
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

1;
