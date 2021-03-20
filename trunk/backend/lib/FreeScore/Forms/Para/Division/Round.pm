package FreeScore::Forms::Para::Division::Round;
use JSON::XS;
use List::Util qw( all any none sum );
use FreeScore;
use FreeScore::Forms::Para::Division::Round::Pool;
use FreeScore::Forms::Para::Division::Round::Score;
use Data::Structure::Util qw( unbless );
use Date::Manip;
use Data::Dumper;
use Carp;

# $SIG{ __DIE__ } = sub { Carp::confess( @_ ) };

# Round data structure (also see FreeScore::Forms::Para::Division)
# - adjusted
#   - technical
#   - presentation
#   - total
# - complete
# - forms
#   - [ form index ]
#     - adjusted
#       - technical
#       - presentation
#       - total
#     - complete
#     - decision
#       - withdraw
#       - disqualify
#       - bye
#     - original
#       - technical
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
	$self->{ forms }[ $form ]{ judge }[ $judge ] = new FreeScore::Forms::Para::Division::Round::Score();
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
	my $pool = $self->{ pool } = new FreeScore::Forms::Para::Division::Round::Pool( $self->{ pool });
	$pool->size( $size );
	$pool->want( $k );

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

	$score = new FreeScore::Forms::Para::Division::Round::Score( $score );

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
	my $pool = $self->{ pool } = new FreeScore::Forms::Para::Division::Round::Pool( $self->{ pool });
	$pool->size( $size );
	$pool->want( $k );

	my $votes = $pool->record_score( $form, $score );

	return { status => 'in-progress', votes => $votes } unless $votes->{ have }{ valid } == $size;
	my $result = $pool->resolve( $form, $self, 0 );

	return $result;
}

# ============================================================
sub record_completion_time {
# ============================================================
# Records penalties. Will overwrite.
#------------------------------------------------------------
 	my $self = shift;
	my $form = shift;
	my $time = shift;

	$self->{ forms }[ $form ]{ complete } = $time;
}

# ============================================================
sub record_decision {
# ============================================================
# Records decision notes. Will overwrite. Also converts pool
# punitive DSQ votes to 'OK'
#------------------------------------------------------------
 	my $self     = shift;
	my $i        = shift;
	my $decision = shift;

	my $form = $self->{ forms }[ $i ];
	if( $decision eq 'clear' ) {
		foreach my $form (@{ $self->{ forms }}) {
			delete $form->{ decision }{ $_ } foreach (qw( disqualify withdraw ));
			unless( exists( $form->{ decision }{ bye }) && defined( $form->{ decision }{ bye })) {
				$form->{ complete } = 0;
				$form->{ started }  = 0;
			}
		}
		$self->{ complete } = 0 if( none { $self->form_complete( $_ )} @{$self->{ forms }} );

		return unless( exists $self->{ pool });
		foreach my $score (values %{$self->{ pool }{ forms }[ $i ]{ scores }}) {
			next unless( exists $score->{ video } && exists $score->{ video }{ feedback });
			next unless $score->{ video }{ feedback } eq 'dsq';
			$score->{ video }{ feedback } = 'ok';
		}

	} else {
		$form->{ decision }{ $decision } = 1;
		$form->{ complete }              = _now();
	}
}

# ============================================================
sub resolve_pool {
# ============================================================
# Timeout-forced resolution of the current pool
# ------------------------------------------------------------
	my $self  = shift;
	my $size  = shift;
	my $form  = shift;

	my $k    = int( @{ $self->{ forms }[ $form ]{ judge }});
	my $pool = $self->{ pool } = new FreeScore::Forms::Para::Division::Round::Pool( $self->{ pool });
	$pool->size( $size );
	$pool->want( $k );

	my $result = $pool->resolve( $form, $self, 1 );
	return undef if( $result->{ have }{ responses } == 0 ); # Bad data or literally EVERYONE has dropped
	return $result;
}

# ============================================================
sub add_tiebreaker {
# ============================================================
	my $self   = shift;
	my $judges = shift;

	foreach my $i ( 0 .. $judges ) {
		push @{ $self->{ tiebreakers }[ $i ]{ judge }}, new FreeScore::Forms::Para::Division::Round::Score();
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
			$self->{ adjusted }{ total }        = 0.0 + sprintf( "%.2f", 0.0 );
			$self->{ adjusted }{ presentation } = 0.0 + sprintf( "%.2f", 0.0 );
			$self->{ total }                    = 0.0 + sprintf( "%.2f", 0.0 );
			last;
		}

		# ===== SKIP CALCULATIONS FOR ATHLETES WITH BYES
		my $winning_decision = $self->form_has_winning_decision( $form );
		if( $winning_decision ) {
			$self->{ adjusted }{ total }        = 0.0 + sprintf( "%.2f", 0.0 );
			$self->{ adjusted }{ presentation } = 0.0 + sprintf( "%.2f", 0.0 );
			$self->{ total }                    = 0.0 + sprintf( "%.2f", 0.0 );
			last;
		}

		my $stats  = { mintec => 0, minpre => 0, maxtec => 0, maxpre => 0 };
		my $k      = $#{ $form->{ judge }};

		# ===== FIND MIN/MAX TECHNICAL AND PRESENTATION
		foreach my $i (0 .. $k) {
			my $score        = $form->{ judge }[ $i ];
			my $technical    = $score->{ technical };
			my $presentation = $score->{ presentation };
			die "Round Object Error: Technical not calculated!"    if ! defined $technical    && ! $punitive_decision;
			die "Round Object Error: Presentation not calculated!" if ! defined $presentation && ! $punitive_decision;
			$stats->{ mintec } = $form->{ judge }[ $stats->{ mintec } ]{ technical    } > $technical    ? $i : $stats->{ mintec };
			$stats->{ maxtec } = $form->{ judge }[ $stats->{ maxtec } ]{ technical    } < $technical    ? $i : $stats->{ maxtec };
			$stats->{ minpre } = $form->{ judge }[ $stats->{ minpre } ]{ presentation } > $presentation ? $i : $stats->{ minpre };
			$stats->{ maxpre } = $form->{ judge }[ $stats->{ maxpre } ]{ presentation } < $presentation ? $i : $stats->{ maxpre };
			$stats->{ sumtec } += $technical;
			$stats->{ sumpre } += $presentation;
		}

		# ===== IF ALL SCORES ARE THE SAME, THEN WE NEED TO DROP DIFFERENT SCORES (ONE "HIGH" AND ONE "LOW")
		if( $stats->{ mintec } == $stats->{ maxtec } && $k > 0 ) { $stats->{ maxtec }++; }
		if( $stats->{ minpre } == $stats->{ maxpre } && $k > 0 ) { $stats->{ maxpre }++; }

		# ===== MARK THE SCORES AS MIN OR MAX
		foreach my $i (0 .. $k) { $form->{ judge }[ $i ]->clear_minmax(); }

		$form->{ judge }[ $stats->{ mintec } ]->mark_minmax( 'mintec' );
		$form->{ judge }[ $stats->{ maxtec } ]->mark_minmax( 'maxtec' );
		$form->{ judge }[ $stats->{ minpre } ]->mark_minmax( 'minpre' );
		$form->{ judge }[ $stats->{ maxpre } ]->mark_minmax( 'maxpre' );

		# ===== RE-MAP FROM INDICES TO VALUES
		$stats->{ mintec } = $form->{ judge }[ $stats->{ mintec } ]{ technical };
		$stats->{ maxtec } = $form->{ judge }[ $stats->{ maxtec } ]{ technical };
		$stats->{ minpre } = $form->{ judge }[ $stats->{ minpre } ]{ presentation };
		$stats->{ maxpre } = $form->{ judge }[ $stats->{ maxpre } ]{ presentation };

		my @mean = (
			technical    => 0.0 + sprintf( "%.2f", $stats->{ sumtec }),
			presentation => 0.0 + sprintf( "%.2f", $stats->{ sumpre })
		);
		my $adjusted = { @mean };
		my $allscore = { @mean };

		# ===== CALCULATE ADJUSTED MEANS
		# For 5 or more judges, drop the highs & lows and take the mean
		if( $judges >= 5 ) {
			$adjusted->{ technical }    -= ($stats->{ mintec } + $stats->{ maxtec });
			$adjusted->{ presentation } -= ($stats->{ minpre } + $stats->{ maxpre });

			$adjusted->{ technical }    /= ($judges - 2);
			$adjusted->{ presentation } /= ($judges - 2);

			$adjusted->{ technical }     = $adjusted->{ technical }    < 0 ? 0 : $adjusted->{ technical };
			$adjusted->{ presentation }  = $adjusted->{ presentation } < 0 ? 0 : $adjusted->{ presentation };

		# For fewer than 5 judges, take the mean (no outlier filtering)
		} else {
			$adjusted = { map { $_ => $adjusted->{ $_ }/$judges } keys %$adjusted };
		}

		# ===== ROUND TO TWO DECIMAL PRECISION
		$adjusted->{ technical }    = 0.0 + sprintf( "%.2f", $adjusted->{ technical });
		$adjusted->{ presentation } = 0.0 + sprintf( "%.2f", $adjusted->{ presentation });

		# ===== CALCULATE PENALTIES
		my $penalties = sum @{$form->{ penalty }}{ ( @PENALTIES ) };

		# ===== CALCULATE ALL-SCORE MEANS
		$allscore = { map { $_ => $allscore->{ $_ }/$judges } keys %$allscore };

		$adjusted->{ total } = $adjusted->{ technical } + $adjusted->{ presentation } - $penalties;
		$allscore->{ total } = $allscore->{ technical } + $allscore->{ presentation } - $penalties;

		$form->{ adjusted } = $adjusted;
		$form->{ allscore } = $allscore;

		push @$means, { adjusted => $adjusted, allscore => $allscore };
	}
	# ===== CALCULATE TIEBREAKER SCORES (NOT YET IMPLEMENTED)
	foreach my $form (@{$self->{ tiebreakers }}) {
	}

	# ===== CACHE CALCULATIONS
	$self->{ adjusted } = { total => 0, technical => 0, presentation => 0 };
	$self->{ allscore } = { total => 0 };

	foreach my $mean (@$means) {
		$self->{ adjusted }{ total }        += $mean->{ adjusted }{ total };
		$self->{ adjusted }{ technical }    += $mean->{ adjusted }{ technical };
		$self->{ adjusted }{ presentation } += $mean->{ adjusted }{ presentation };
		$self->{ allscore }{ total }        += $mean->{ allscore }{ total };
	};

	$self->{ adjusted }{ total }        = 0.0 + $self->{ adjusted }{ total };
	$self->{ adjusted }{ presentation } = 0.0 + $self->{ adjusted }{ presentation };
	$self->{ allscore }{ total }        = 0.0 + $self->{ allscore }{ total };

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

	# Form is complete if there is a punitive decision
	$form->{ complete } = _now() if( ! $form->{ complete } && $self->form_has_punitive_decision( $i ));

	# Return previously resolved cached value
	return $form->{ complete } if $form->{ complete };

	# ===== FORM IS COMPLETE IF ALL JUDGES HAVE REGISTERED A VALID SCORE
	return 0 unless exists $form->{ judge };
	my $complete = all { $_->complete() } ( @{ $form->{ judge }} );
	$form->{ complete } = _now() if( $complete && ! $form->{ complete });
	return $form->{ complete };
}

# ============================================================
sub form_has_winning_decision {
# ============================================================
	my $self = shift;
	my $i    = shift; # Index or reference to the form
	my $form = ref $i ? $i : $self->{ forms }[ $i ];

	if( exists $form->{ decision } && $form->{ decision }{ bye }) {
		$form->{ adjusted }{ total }        = 0.0;
		$form->{ adjusted }{ presentation } = 0.0;
		return 1;
	}
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
sub any_disqualification {
# ============================================================
	my $self = shift;

	foreach my $form (@{ $self->{ forms }}) {
		return 1 if( exists $form->{ decision }{ disqualify } && $form->{ decision }{ disqualify } );
	}
	return 0;
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
sub any_winning_decision {
# ============================================================
	my $self = shift;

	foreach my $form (@{ $self->{ forms }}) {
		$self->form_complete( $form );
		if( $self->form_has_winning_decision( $form )) {
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
	$self->{ complete } = all { $_->{ complete } } @{ $self->{ forms }};
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
		$new = new FreeScore::Forms::Para::Division::Round();
		for( my $i = 0; $i < $forms; $i++ ) {
			for( my $j = 0; $j < $judges; $j++ ) {
				push @{$new->{ forms }[ $i ]{ judge }}, new FreeScore::Forms::Para::Division::Round::Score();
			}
		}
		return $new;
	}
	my $sub = eval { $self->can( "record_score" ) };
	my $ref = ref $self;
	if( ! $sub ) {
		if( $ref eq 'HASH' ) { bless $self, "FreeScore::Forms::Para::Division::Round"; }
		else                 { die "Round Object Error: Attempting to instantiate a round object that is not a hash ($ref) $!"; }
	}
	for( my $i = 0; $i < $forms; $i++ ) {
		for( my $j = 0; $j < $judges; $j++ ) {
			$self->{ forms }[ $i ]{ judge }[ $j ] = FreeScore::Forms::Para::Division::Round::Score::reinstantiate( $self->{ forms }[ $i ]{ judge }[ $j ]);
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

		# ===== RECORD PENALTIES AND TIME (OVER)
		if( exists $form->{ penalty } && keys %{ $form->{ penalty }} && any { $_ } values %{ $form->{ penalty }}) {
			push @string, join( "\t", ('', $round, $form_id, 'p', @{$form->{ penalty }}{ ( @PENALTIES, @GAMJEOMS, @TIME )})) . "\n";
		}

		# ===== RECORD SCORES
		for( my $j = 0; $j < $judges; $j++ ) {
			$form->{ judge }[ $j ] = FreeScore::Forms::Para::Division::Round::Score::reinstantiate( $form->{ judge }[ $j ] );
			my $score    = $form->{ judge }[ $j ];
			my $judge_id = ($j == 0 ? 'r' : "j$j");

			push @string, join( "\t", ('', $round, $form_id, $judge_id, $score->string())) . "\n";
		}

		# ===== RECORD COMPLETION TIME
		push @string, join( "\t", ('', $round, $form_id, 't', $form->{ complete })) . "\n" if $form->{ complete };

		# ===== RECORD POOL SCORES FOR ONLINE TOURNAMENTS
		push @string, $self->{ pool }->string( $round, $i ) if( exists $self->{ pool } && defined $self->{ pool });
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

	my $at   = 0.0 + sprintf( "%.3f", $a->{ adjusted }{ total });
	my $aap  = 0.0 + sprintf( "%.3f", $a->{ adjusted }{ presentation });
	my $aat  = 0.0 + sprintf( "%.3f", $a->{ allscore }{ total });
	my $apun = _rank_punitive( $a );
	my $bt   = 0.0 + sprintf( "%.3f", $b->{ adjusted }{ total });
	my $bap  = 0.0 + sprintf( "%.3f", $b->{ adjusted }{ presentation });
	my $bat  = 0.0 + sprintf( "%.3f", $b->{ allscore }{ total });
	my $bpun = _rank_punitive( $b );

	return
		$bt   <=> $at   ||
		$bap  <=> $aap  ||
		$bat  <=> $aat  ||
		$apun <=> $bpun;
}

# ============================================================
sub _now {
# ============================================================
	my $date = new Date::Manip::Date( 'now GMT' ); # The time right now, using the GMT timezone
	# return $date->printf( "%Y-%m-%dT%H:%M:%SZ" ); # ISO8601 UTC format
	return 1;
}

# ============================================================
sub _rank_punitive {
# ============================================================
	my $score    = shift;
	my $decision = undef;

	foreach my $form (@{ $score->{ forms }}) {
		next unless( exists $form->{ decision });
		$decision = $form->{ decision };
		last;
	}

	return 0 unless defined $decision;
	return 1 if exists $decision->{ withdraw }   && defined $decision->{ withdraw };
	return 2 if exists $decision->{ disqualify } && defined $decision->{ disqualify };
}

# ============================================================
sub _tiebreaker {
# ============================================================
	my $a = shift;
	my $b = shift;
}

1;
