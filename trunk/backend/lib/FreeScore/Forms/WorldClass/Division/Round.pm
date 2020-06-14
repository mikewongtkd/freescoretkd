package FreeScore::Forms::WorldClass::Division::Round;
use JSON::XS;
use List::Util qw( all any none sum );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round::Pool;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use Data::Structure::Util qw( unbless );
use Data::Dumper;
use Carp;

# $SIG{ __DIE__ } = sub { Carp::confess( @_ ) };

# Round data structure (also see FreeScore::Forms::WorldClass::Division)
# - adjusted
#   - accuracy
#   - presentation
#   - total
# - complete
# - forms
#   - [ form index ]
#     - adjusted
#       - accuracy
#       - presentation
#       - total
#     - complete
#     - decision
#       - withdraw
#       - disqualify
#     - original
#       - accuracy
#       - presentation
#       - total
#     - penalties
#     - started
#   - judge
#     - [ judge index ]
#       - Score Object
# - pool
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
sub pool_judge_ready {
# ============================================================
# A judge has indicated they are ready to score
# ------------------------------------------------------------
	my $self    = shift;
	my $size    = shift;
	my $form    = shift;
	my $judge   = shift;

	my $k    = int( @{ $self->{ forms }[ $form ]{ judge }});
	my $pool = $self->{ pool } = new FreeScore::Forms::WorldClass::Division::Round::Pool( $self->{ pool });
	$pool->size( $size );
	$pool->want( $k );

	print STDERR "  POOL JUDGE READY (SIZE: $size, WANT: $k)\n"; # MW

	my $result = $pool->ready( $form, $judge );
	return $result;
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
sub record_pool_score {
# ============================================================
# Records a score from a judge pool. 
#------------------------------------------------------------
 	my $self  = shift;
	my $size  = shift;
	my $form  = shift;
	my $score = shift;

	my $k    = int( @{ $self->{ forms }[ $form ]{ judge }});
	my $pool = $self->{ pool } = new FreeScore::Forms::WorldClass::Division::Round::Pool( $self->{ pool });
	$pool->size( $size );
	$pool->want( $k );

	my $capacity = $pool->record_score( $form, $score );

	print STDERR "  Pool score capacity: $capacity\n"; # MW

	return { status => 'error' } if $capacity eq 'error';
	return { status => 'in-progress', capacity => $capacity } unless $capacity eq 'full';
	my $result = $pool->resolve( $form, $self );
	$result->{ capacity } = $capacity;

	return $result;
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
sub calculate_means {
# ============================================================
	my $self   = shift;
	my $judges = shift;
	my $means  = [];

	$self->started();
	$self->complete();
	foreach my $form (@{$self->{ forms }}) {
		next unless $form->{ complete };
		next unless exists $form->{ judge };

		# ===== SKIP CALCULATIONS FOR WITHDRAWN OR DISQUALIFIED ATHLETES
		my $punitive_decision = $self->form_has_punitive_decision( $form );
		if( $punitive_decision ) {
			$self->{ adjusted }{ total }        = sprintf( "%.2f", 0.0 );
			$self->{ adjusted }{ presentation } = sprintf( "%.2f", 0.0 );
			$self->{ total }                    = sprintf( "%.2f", 0.0 );
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
		my $allscore = { @mean };

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
		my $penalties = sum @{$form->{ penalty }}{ ( @PENALTIES ) };

		# ===== CALCULATE ALL-SCORE MEANS
		$allscore = { map { ( $_ => sprintf( "%.2f", ($allscore->{ $_ }/$judges))) } keys %$allscore };

		$adjusted->{ total } = $adjusted->{ accuracy } + $adjusted->{ presentation } - $penalties;
		$allscore->{ total } = $allscore->{ accuracy } + $allscore->{ presentation } - $penalties;

		$form->{ adjusted } = $adjusted;
		$form->{ allscore } = $allscore;

		push @$means, { adjusted => $adjusted, allscore => $allscore };
	}
	# ===== CALCULATE TIEBREAKER SCORES (NOT YET IMPLEMENTED)
	foreach my $form (@{$self->{ tiebreakers }}) {
	}

	# ===== CACHE CALCULATIONS
	$self->{ adjusted } = { total => 0, presentation => 0 };

	foreach my $mean (@$means) {
		$self->{ adjusted }{ total }        += $mean->{ adjusted }{ total };
		$self->{ adjusted }{ accuracy }     += $mean->{ adjusted }{ accuracy };
		$self->{ adjusted }{ presentation } += $mean->{ adjusted }{ presentation };
		$self->{ allscore }{ total }        += $mean->{ allscore }{ total };
	};

	$self->{ adjusted }{ total }        = 0.0 + sprintf( "%.2f", $self->{ adjusted }{ total } );
	$self->{ adjusted }{ presentation } = 0.0 + sprintf( "%.2f", $self->{ adjusted }{ presentation } );
	$self->{ allscore }{ total }        = 0.0 + sprintf( "%.2f", $self->{ allscore }{ total } );

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

	if( exists $form->{ decision } && ($form->{ decision }{ withdraw } || $form->{ decision }{ disqualify })) {
		$form->{ adjusted }{ total }        = 0.0;
		$form->{ adjusted }{ presentation } = 0.0;
		return 1;
	}
}

# ============================================================
sub any_punitive_decision {
# ============================================================
	my $self = shift;

	foreach my $form (@{ $self->{ forms }}) { 
		$self->form_complete( $form ); 
		if( $self->form_has_punitive_decision( $form )) {
			$self->{ complete } = 1;
			return 1;
		}
	}
	return 0;
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
	my @string = ();
	
	for( my $i = 0; $i < $forms; $i++ ) {
		my $form    = $self->{ forms }[ $i ];
		my $form_id = 'f' . ($i + 1);

		# ===== RECORD STATUS
		if( exists $form->{ decision } ) {
			foreach my $key (sort keys %{ $form->{ decision }}) {
				my $value = $form->{ decision }{ $key };
				push @string, join( "\t", ('', $round, $form_id, 's', "$key=$value" )) . "\n";
			}
		}

		# ===== RECORD PENALTIES AND TIME
		if( exists $form->{ penalty } && keys %{ $form->{ penalty }} && any { $_ } values %{ $form->{ penalty }}) {
			push @string, join( "\t", ('', $round, $form_id, 'p', @{$form->{ penalty }}{ ( @PENALTIES, @GAMJEOMS, @TIME )})) . "\n";
		}

		# ===== RECORD SCORES
		for( my $j = 0; $j < $judges; $j++ ) {
			$form->{ judge }[ $j ] = FreeScore::Forms::WorldClass::Division::Round::Score::reinstantiate( $form->{ judge }[ $j ] );
			my $score    = $form->{ judge }[ $j ];
			my $judge_id = ($j == 0 ? 'r' : "j$j");

			push @string, join( "\t", ('', $round, $form_id, $judge_id, $score->string())) . "\n";
		}

		# ===== RECORD POOL SCORES FOR ONLINE TOURNAMENTS
		push @string, $self->{ pool }->string( $round, $forms ) if( exists $self->{ pool } && defined $self->{ pool });
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
		$b->{ allscore }{ total }        <=> $a->{ allscore }{ total };
}

# ============================================================
sub _tiebreaker {
# ============================================================
	my $a = shift;
	my $b = shift;
}

1;
