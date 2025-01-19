package FreeScore::Forms::WorldClass::Division::Round;
use JSON::XS;
use List::Util qw( all any none sum );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use Data::Dumper;
use Carp;

# $SIG{ __DIE__ } = sub { Carp::confess( @_ ) };

# Round data structure (also see FreeScore::Forms::WorldClass::Division)
# - adjusted
#   - accuracy
#   - presentation
#   - total
#   - decision
# - complete
# - forms
#   - [ form index ]
#     - complete
#     - decision
#       - withdraw
#       - disqualify
#     - judge
#       - [ judge index ]
#         - Score Object
#     - adjusted
#       - accuracy
#       - presentation
#       - total
#     - original
#       - accuracy
#       - presentation
#       - total
#     - penalties
#     - started
# - match
# - started
# - tiebreakers
#   (same substructure as forms)
# - total

our @PENALTIES = qw( bounds timelimit restart );
our @GAMJEOMS  = qw( misconduct );
our @TIME      = qw( time );

# ============================================================
sub new {
# ============================================================
# A round is an has an array of one or more forms.
# ------------------------------------------------------------
	my ($class) = map { ref || $_ } shift;
	my $data    = shift || {};
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
sub forms {
# ============================================================
	my $self = shift;

	return $self->{ forms };
}

# ============================================================
sub tiebreakers {
# ============================================================
	my $self = shift;

	return $self->{ tiebreakers };
}

# ============================================================
sub clear_score {
# ============================================================
# Records a given score. Will overwrite if the same judge has
# given a previous score for the same form.
#------------------------------------------------------------
 	my $self  = shift;
	my $form  = shift;
	my $judge = shift;

	my $judges = $self->{ forms }[ $form ]{ judge };
	$self->{ forms }[ $form ]{ judge }[ $judge ] = new FreeScore::Forms::WorldClass::Division::Round::Score();
	$self->{ forms }[ $form ]{ complete } = 0;
	$self->{ forms }[ $form ]{ started }  = any { $_->started() } @$judges;
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

	$score = new FreeScore::Forms::WorldClass::Division::Round::Score( $score );

	my $judges = $self->{ forms }[ $form ]{ judge };
	$self->{ forms }[ $form ]{ judge }[ $judge ] = $score;
	$self->{ forms }[ $form ]{ started }         = any { $_->started() } @$judges;
}

# ============================================================
sub record_penalties {
# ============================================================
# Records penalties. Will overwrite. 
#------------------------------------------------------------
 	my $self    = shift;
	my $form    = shift;
	my $penalty = shift;

	foreach my $key (keys %$penalty) {
		$self->{ forms }[ $form ]{ penalty }{ $key } = $penalty->{ $key };
	}
}

# ============================================================
sub record_decision {
# ============================================================
# Records decision notes. Will overwrite. 
#------------------------------------------------------------
 	my $self     = shift;
	my $i        = shift;
	my $decision = shift;

	my $form = $self->{ forms }[ $i ];
	if( $decision eq 'clear' ) {
		delete $form->{ decision }{ $_ } foreach (keys %{ $form->{ decision }});
		$form->{ complete } = 0;
		$form->{ started }  = 0;
		$self->{ complete } = 0 if( none { $self->form_complete( $_ )} @{$self->{ forms }} );

	} else {
		$form->{ decision }{ $decision } = 1;
		$form->{ complete }              = 1;
	}
}

# ============================================================
sub add_tiebreaker {
# ============================================================
	my $self   = shift;
	my $judges = shift;

	foreach my $i ( 0 .. $judges ) {
		push @{ $self->{ tiebreakers }[ $i ]{ judge }}, new FreeScore::Forms::WorldClass::Division::Round::Score();
	}
}

# ============================================================
sub calculate_totals {
# ============================================================
	my $self   = shift;
	my $judges = shift;
	my $totals = [];

	$self->started();
	$self->complete();
	my $dcode = { disqualify => 'DSQ', withdraw => 'WDR' };
	foreach my $form (@{$self->{ forms }}) {
		next unless $form->{ complete };
		next unless exists $form->{ judge };

		# ===== SKIP CALCULATIONS FOR WITHDRAWN OR DISQUALIFIED ATHLETES
		my $decision = $self->form_has_punitive_decision( $form );
		if( $decision ) {
			$self->{ adjusted }{ total }        = sprintf( "%.3f", 0.0 );
			$self->{ adjusted }{ presentation } = sprintf( "%.3f", 0.0 );
			$self->{ total }                    = sprintf( "%.3f", 0.0 );
			$self->{ adjusted }{ decision }     = $dcode->{ $decision };
			last;
		}

		my $stats  = { minacc => 0, minpre => 0, maxacc => 0, maxpre => 0 };
		my $k      = $#{ $form->{ judge }};

		# ===== FIND MIN/MAX ACCURACY AND PRESENTATION
		foreach my $i (0 .. $k) {
			my $score        = $form->{ judge }[ $i ];
			my $accuracy     = $score->{ accuracy };
			my $presentation = $score->{ presentation };
			die "Round Object Error: Accuracy not calculated!"  if ! defined $accuracy     && ! $punitive_decision;
			die "Round Object Error: Precision not calculated!" if ! defined $presentation && ! $punitive_decision;
			$stats->{ minacc } = $form->{ judge }[ $stats->{ minacc } ]{ accuracy     } > $accuracy     ? $i : $stats->{ minacc };
			$stats->{ maxacc } = $form->{ judge }[ $stats->{ maxacc } ]{ accuracy     } < $accuracy     ? $i : $stats->{ maxacc };
			$stats->{ minpre } = $form->{ judge }[ $stats->{ minpre } ]{ presentation } > $presentation ? $i : $stats->{ minpre };
			$stats->{ maxpre } = $form->{ judge }[ $stats->{ maxpre } ]{ presentation } < $presentation ? $i : $stats->{ maxpre };
			$stats->{ sumacc } += $accuracy;
			$stats->{ sumpre } += $presentation;
		}

		# ===== IF ALL SCORES ARE THE SAME, THEN WE NEED TO DROP DIFFERENT SCORES (ONE "HIGH" AND ONE "LOW")
		if( $stats->{ minacc } == $stats->{ maxacc } && $k > 0 ) { $stats->{ maxacc }++; }
		if( $stats->{ minpre } == $stats->{ maxpre } && $k > 0 ) { $stats->{ maxpre }++; }

		# ===== MARK THE SCORES AS MIN OR MAX
		foreach my $i (0 .. $k) { $form->{ judge }[ $i ]->clear_minmax(); }

		$form->{ judge }[ $stats->{ minacc } ]->mark_minmax( 'minacc' );
		$form->{ judge }[ $stats->{ maxacc } ]->mark_minmax( 'maxacc' );
		$form->{ judge }[ $stats->{ minpre } ]->mark_minmax( 'minpre' );
		$form->{ judge }[ $stats->{ maxpre } ]->mark_minmax( 'maxpre' );

		# ===== RE-MAP FROM INDICES TO VALUES
		$stats->{ minacc } = $form->{ judge }[ $stats->{ minacc } ]{ accuracy };
		$stats->{ maxacc } = $form->{ judge }[ $stats->{ maxacc } ]{ accuracy };
		$stats->{ minpre } = $form->{ judge }[ $stats->{ minpre } ]{ presentation };
		$stats->{ maxpre } = $form->{ judge }[ $stats->{ maxpre } ]{ presentation };

		my @subtotals = (
			accuracy     => sprintf( "%.3f", $stats->{ sumacc }),
			presentation => sprintf( "%.3f", $stats->{ sumpre })
		);
		my $adjusted = { @subtotals };
		my $original = { @subtotals };

		# ===== CALCULATE ADJUSTED TOTALS
		if( $judges >= 5 ) {
			$adjusted->{ accuracy }     -= ($stats->{ minacc } + $stats->{ maxacc });
			$adjusted->{ presentation } -= ($stats->{ minpre } + $stats->{ maxpre });

			$adjusted->{ accuracy }     /= ($judges - 2);
			$adjusted->{ presentation } /= ($judges - 2);

			$adjusted->{ accuracy }     = $adjusted->{ accuracy }     < 0 ? 0 : $adjusted->{ accuracy };
			$adjusted->{ presentation } = $adjusted->{ presentation } < 0 ? 0 : $adjusted->{ presentation };
			
			$adjusted->{ accuracy }     = sprintf( "%.3f", $adjusted->{ accuracy } );
			$adjusted->{ presentation } = sprintf( "%.3f", $adjusted->{ presentation } );

		} else {
			$adjusted = { map { ( $_ => sprintf( "%.3f", ($adjusted->{ $_ }/$judges))) } keys %$adjusted };
		}

		# ===== CALCULATE PENALTIES
		my $penalties = sum @{$form->{ penalty }}{ ( @PENALTIES ) };

		# ===== CALCULATE TOTALS AND APPLY PENALTIES
		$original = { map { ( $_ => sprintf( "%.3f", ($original->{ $_ }/$judges))) } keys %$original };

		$adjusted->{ total } = $adjusted->{ accuracy } + $adjusted->{ presentation } - $penalties;
		$original->{ total } = $original->{ accuracy } + $original->{ presentation } - $penalties;

		$form->{ adjusted } = $adjusted;
		$form->{ original } = $original;

		push @$totals, { adjusted => $adjusted, original => $original };
	}

	# ===== CACHE CALCULATIONS
	$self->{ adjusted } = { total => 0, presentation => 0 };

	foreach my $total (@$totals) {
		$self->{ adjusted }{ total }        += $total->{ adjusted }{ total };
		$self->{ adjusted }{ accuracy }     += $total->{ adjusted }{ accuracy };
		$self->{ adjusted }{ presentation } += $total->{ adjusted }{ presentation };
		$self->{ total }                    += $total->{ original }{ total };
	};

	$self->{ adjusted }{ total }        = 0.0 + sprintf( "%.3f", $self->{ adjusted }{ total } );
	$self->{ adjusted }{ presentation } = 0.0 + sprintf( "%.3f", $self->{ adjusted }{ presentation } );
	$self->{ total }                    = 0.0 + sprintf( "%.3f", $self->{ total } );

	return $self;
}

# ============================================================
sub form_complete {
# ============================================================
# An athlete's form is complete if there is a punitive declaration or when all judges have registered a valid score
# ------------------------------------------------------------
	my $self = shift;
	my $i    = shift; # Index or reference to the form
	my $form = ref $i ? $i : $self->{ forms }[ $i ];

	return 1 if $form->{ complete };                     # Return previously resolved cached value
	return 1 if $self->form_has_punitive_decision( $i ); # Form is complete if there is a punitive decision

	# ===== FORM IS COMPLETE IF ALL JUDGES HAVE REGISTERED A VALID SCORE
	return 0 unless exists $form->{ judge };
	$form->{ complete } ||= all { $_->complete() } ( @{ $form->{ judge }} );
	return $form->{ complete };
}

# ============================================================
sub form_has_punitive_decision {
# ============================================================
	my $self = shift;
	my $i    = shift; # Index or reference to the form
	my $form = ref $i ? $i : $self->{ forms }[ $i ];

	return 0 unless exists $form->{ decision };
	my $fd = $form->{ decision };

	foreach my $decision (qw( withdraw disqualify )) {
		next unless exists $fd->{ $decision } && defined $fd->{ $decision };

		$form->{ adjusted }{ total }        = 0.0;
		$form->{ adjusted }{ presentation } = 0.0;

		return $decision;
	}
	return 0;
}

# ============================================================
sub any_punitive_decision {
# ============================================================
	my $self = shift;

	foreach my $form (@{ $self->{ forms }}) { 
		$self->form_complete( $form ); # Update form status
		if( $self->form_has_punitive_decision( $form )) {
			$self->{ complete } = 1;
			return 1;
		}
	}
	return 0;
}

# ============================================================
sub compare {
# ============================================================
	my $self  = shift;
	my $other = shift;

	return FreeScore::Forms::WorldClass::Division::Round::_compare( $self, $other );
}

# ============================================================
sub complete {
# ============================================================
# An athlete's round is complete when all their compulsory forms are complete
# ------------------------------------------------------------
	my $self = shift;
	return $self->{ complete } if $self->{ complete };

	return 1 if $self->any_punitive_decision();

	# ===== A ROUND IS COMPLETE WHEN ALL COMPULSORY FORMS ARE COMPLETED
	$self->{ complete } = all { $_->{ complete }; } @{ $self->{ forms }};
	return $self->{ complete };
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
				push @{$new->{ forms }[ $i ]{ judge }}, new FreeScore::Forms::WorldClass::Division::Round::Score();
			}
		}
		return $new;
	}
	my $sub = eval { $self->can( "record_score" ) };
	my $ref = ref $self;
	if( ! $sub ) {
		if( $ref eq 'HASH' ) { bless $self, "FreeScore::Forms::WorldClass::Division::Round"; } 
		else                 { die "Round Object Error: Attempting to instantiate an round object that is not an hash ($ref) $!"; }
	}
	for( my $i = 0; $i < $forms; $i++ ) {
		for( my $j = 0; $j < $judges; $j++ ) {
			$self->{ forms }[ $i ]{ judge }[ $j ] = FreeScore::Forms::WorldClass::Division::Round::Score::reinstantiate( $self->{ forms }[ $i ]{ judge }[ $j ]);
		}
	}
	return $self;
}

# ============================================================
sub started {
# ============================================================
# An athlete's round is started when any their compulsory forms are started or complete
# ------------------------------------------------------------
	my $self = shift;
	return $self->{ complete } if $self->{ complete };

	return 1 if $self->any_punitive_decision();

	# ===== A ROUND IS STARTED WHEN ANY COMPULSORY FORMS ARE STARTED
	foreach my $form (@{ $self->{ forms }}) {
		$form->{ started } = any { $_->started() } @{$form->{ judge }};
	}
	$self->{ started } = any { $form->{ started }} @{ $self->{ forms }};
	return $self->{ started };
}

# ============================================================
sub string {
# ============================================================
	my $self   = shift;
	my $round  = shift;
	my $forms  = shift;
	my $judges = shift;
	my $match  = exists $self->{ match } && $self->{ match } ? sprintf( "m%d", ($self->{ match } + 1)) : undef;
	my @string = ();

	$round .= $match if $match;
	
	for( my $i = 0; $i < $forms; $i++ ) {
		my $form    = $self->{ forms }[ $i ];
		my $form_id = 'f' . ($i + 1);

		# ===== RECORD STATUS
		if( exists $form->{ decision } ) {
			foreach my $key (sort keys %{ $form->{ decision }}) {
				my $value = $form->{ decision }{ $key };
				push @string, "\t" . join( "\t", $round, $form_id, 's', "$key=$value" ) . "\n";
			}
		}

		# ===== RECORD PENALTIES AND TIME
		if( exists $form->{ penalty } && keys %{ $form->{ penalty }} && any { $_ } values %{ $form->{ penalty }}) {
			push @string, "\t" . join( "\t", $round, $form_id, 'p', @{$form->{ penalty }}{ ( @PENALTIES, @GAMJEOMS, @TIME )} ) . "\n";
		}

		# ===== RECORD SCORES
		for( my $j = 0; $j < $judges; $j++ ) {
			$form->{ judge }[ $j ] = FreeScore::Forms::WorldClass::Division::Round::Score::reinstantiate( $form->{ judge }[ $j ] );
			my $score    = $form->{ judge }[ $j ];
			my $judge_id = ($j == 0 ? 'r' : "j$j");

			push @string, "\t" . join( "\t", $round, $form_id, $judge_id, $score->string() ) . "\n";
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

	my $pa = $a->any_punitive_decision();
	my $pb = $b->any_punitive_decision();

	return  0 if( $pa && $pb );
	return  1 if( $pa );
	return -1 if( $pb );

	if( $a->{ adjusted }{ total } == $b->{ adjusted }{ total } && $a->{ adjusted }{ total } != 0 ) {
		$a->{ tb }[ 0 ] = $a->{ adjusted }{ presentation }; 
		$b->{ tb }[ 0 ] = $b->{ adjusted }{ presentation }; 

		if( $a->{ adjusted }{ presentation } == $b->{ adjusted }{ presentation }) { 
			$a->{ tb }[ 1 ] = $a->{ total };
			$b->{ tb }[ 1 ] = $b->{ total };

			if( $a->{ total } == $b->{ total } ) { 
				$a->{ tb }[ 2 ] = 'tiebreaker match required';
				$b->{ tb }[ 2 ] = 'tiebreaker match required';
			}
		}
	}

	my $criteria = {
		adjusted_total => $b->{ adjusted }{ total }        <=> $a->{ adjusted }{ total },
		presentation   => $b->{ adjusted }{ presentation } <=> $a->{ adjusted }{ presentation },
		total          => $b->{ total }                    <=> $a->{ total }
	};

	return $criteria->{ adjusted_total } || $criteria->{ presentation } || $criteria->{ total };
}

# ============================================================
sub _tiebreaker {
# ============================================================
	my $a = shift;
	my $b = shift;
}

1;
