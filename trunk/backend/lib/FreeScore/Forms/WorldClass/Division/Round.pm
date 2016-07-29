package FreeScore::Forms::WorldClass::Division::Round;
use JSON::XS;
use List::Util qw( all sum );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use Data::Dumper;
use Carp;

# $SIG{ __DIE__ } = sub { Carp::confess( @_ ) };

# Round data structure (also see FreeScore::Forms::WorldClass::Division::Round)
# - complete
# - decision
#   - withdrawn
#   - disqualified
# - forms
#   - [ form index ]
#     - complete
#     - penalties
#     - decision
#       - withdrawn
#       - disqualified
#   - judge
#     - [ judge index ]
#       - Score Object
# - tiebreakers
#   (same substructure as forms)

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
sub record_score {
# ============================================================
# Records a given score. Will overwrite if the same judge has
# given a previous score for the same form.
#------------------------------------------------------------
 	my $self  = shift;
	my $form  = shift;
	my $judge = shift;
	my $score = shift;

	$self->{ forms }[ $form ]{ judge }[ $judge ] = new FreeScore::Forms::WorldClass::Division::Round::Score( $score );
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
	$form->{ decision }{ $decision } = 1;

	if( $notes ) {
		print STDERR Dumper $notes;
		print STDERR Dumper $form;
	}

	my $punitive_declaration = undef;
	foreach my $j ($i .. $#$self) {  
		my $form = $self->{ forms }[ $j ];
		foreach my $decision (sort keys %{ $form->{ decision }}) { $punitive_declaration = $decision; }
		# Copy the decision of the current form and all subsequent forms
		if( defined $punitive_declaration ) { 
			$form->{ complete } = 1; 
			$form->{ decision }{ $punitive_declaration } = 1;
		}
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
sub calculate_means {
# ============================================================
	my $self   = shift;
	my $judges = shift;
	my $means  = [];

	$self->complete();
	foreach my $form (@{$self->{ forms }}) {
		next unless $form->{ complete };
		next unless exists $form->{ judge };

		# ===== SKIP CALCULATIONS FOR WITHDRAWN OR DISQUALIFIED ATHLETES
		my $punitive_decision = exists $form->{ decision } && (exists $form->{ decision }{ withdrawn } || exists $form->{ decision }{ disqualified });
		if( $punitive_decision ) {
			$form->{ adjusted_mean } = 0.0;
			$form->{ complete_mean } = 0.0;
			$self->{ decision }{ withdrawn }    = 1 if exists $form->{ decision }{ withdrawn };
			$self->{ decision }{ disqualified } = 1 if exists $form->{ decision }{ disqualified };
			$self->{ adjusted }{ total }        = sprintf( "%.2f", 0.0 );
			$self->{ adjusted }{ presentation } = sprintf( "%.2f", 0.0 );
			$self->{ complete }{ total }        = sprintf( "%.2f", 0.0 );
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

		# ===== CALCULATE PENALTIES
		my $penalties = sum @{$form->{ penalty }}{ ( qw( bounds timelimit restart misconduct )) };

		# ===== CALCULATE COMPLETE MEANS
		$complete = { map { ( $_ => sprintf( "%.2f", ($complete->{ $_ }/$judges))) } keys %$complete };

		$adjusted->{ total } = $adjusted->{ accuracy } + $adjusted->{ presentation } - $penalties;
		$complete->{ total } = $complete->{ accuracy } + $complete->{ presentation } - $penalties;

		$form->{ adjusted_mean } = $adjusted;
		$form->{ complete_mean } = $complete;
		push @$means, { adjusted_mean => $adjusted, complete_mean => $complete };
	}
	# ===== CALCULATE TIEBREAKER SCORES (NOT YET IMPLEMENTED)
	foreach my $form (@{$self->{ tiebreakers }}) {
	}

	# ===== CACHE CALCULATIONS
	$self->{ adjusted } = { total => 0, presentation => 0 };
	$self->{ complete } = { total => 0 };

	foreach my $mean (@$means) {
		$self->{ adjusted }{ total }        += $mean->{ adjusted_mean }{ total };
		$self->{ adjusted }{ presentation } += $mean->{ adjusted_mean }{ presentation };
		$self->{ complete }{ total }        += $mean->{ complete_mean }{ total };
	};

	$self->{ adjusted }{ total }        = sprintf( "%.2f", $self->{ adjusted }{ total } );
	$self->{ adjusted }{ presentation } = sprintf( "%.2f", $self->{ adjusted }{ presentation } );
	$self->{ complete }{ total }        = sprintf( "%.2f", $self->{ complete }{ total } );

	return $self;
}

# ============================================================
sub form_complete {
# ============================================================
# An athlete's form is complete if there is a punitive declaration or when all judges have registered a valid score
# ------------------------------------------------------------
	my $self = shift;
	my $i    = shift;
	my $form = $self->{ forms }[ $i ];

	# ===== FORM IS COMPLETE IF THERE IS A PUNITATIVE DECISION
	my $punitive_declaration = exists $form->{ decision } && (exists $form->{ decision }{ withdrawn } || exists $form->{ decision }{ disqualified });
	$form->{ complete }      = $punitive_declaration; 
	return 1 if $form->{ complete };

	# ===== FORM IS COMPLETE IF ALL JUDGES HAVE REGISTERED A VALID SCORE
	return 0 unless exists $form->{ judge };
	$form->{ complete } ||= all { $_->complete() } ( @{ $form->{ judge }} );
	return $form->{ complete };
}

# ============================================================
sub complete {
# ============================================================
# An athlete's round is complete when all their compulsory forms are complete
# ------------------------------------------------------------
	my $self = shift;
	return $self->{ complete } if $self->{ complete };

	# ===== A FORM IS COMPLETE WHEN ALL JUDGE SCORES ARE COMPLETED
	foreach my $i (0 .. $#{ $self->{ forms }}) { $self->form_complete( $i ); }

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
sub string {
# ============================================================
	my $self   = shift;
	my $round  = shift;
	my $forms  = shift;
	my $judges = shift;
	my @string = ();
	
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

		# ===== RECORD PENALTIES
		if( exists $form->{ penalty } && keys %{ $form->{ penalty }} ) {
			push @string, "\t" . join( "\t", $round, $form_id, 'p', @{$form->{ penalty }}{ qw( bounds timelimit restart misconduct time ) } ) . "\n";
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

	return
		$b->{ adjusted }{ total }        <=> $a->{ adjusted }{ total }        ||
		$b->{ adjusted }{ presentation } <=> $a->{ adjusted }{ presentation } ||
		$b->{ complete }{ total }        <=> $a->{ complete }{ total };
}

# ============================================================
sub _tiebreaker {
# ============================================================
	my $a = shift;
	my $b = shift;
}

1;
