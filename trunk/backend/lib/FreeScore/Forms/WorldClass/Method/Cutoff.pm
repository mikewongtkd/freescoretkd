package FreeScore::Forms::WorldClass::Method::Cutoff;
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round;
use List::Util qw( shuffle reduce );
use base qw( FreeScore::Forms::WorldClass::Method );

# ============================================================
sub init {
# ============================================================
	my $self = shift;
	my $div  = shift;
	$self->{ div }    = $div;
	$self->{ name }   = 'cutoff';
	$self->{ rounds } = [ qw( prelim semfin finals )];
}

# ============================================================
sub advance_athletes {
# ============================================================
	my $self = shift;
	my $div  = $self->{ div };

	# ===== ASSIGN THE WINNING ATHLETES TO THE NEXT ROUND
	my $n = int( @{ $div->{ athletes }} ); # Note: n is the number of registered athletes, not remaining eligible athletes

	# Flights have only one round (prelim); if it is completed, then mark the flight as complete (unless it is already merged)
	if( $div->is_flight() && $div->round_complete( 'prelim' ) && $div->{ flight }{ state } ne 'merged' ) {
		$div->{ flight }{ state } = 'complete';

	} elsif( $round eq 'semfin' && $div->round_complete( 'prelim' )) {

		# Skip if athletes have already been advanced to the semi-finals
		my $semfin = $div->{ order }{ semfin };
		return if( defined $semfin && int( @$semfin ) > 0 );

		# Advance athletes. Semi-final round goes in random order
		my $half       = int( ($n-1)/2 );
		my @candidates = @{ $div->{ placement }{ prelim }};
		my @eligible   = $div->eligible_athletes( 'prelim', @candidates );
		my @order      = shuffle (@eligible[ 0 .. $half ]);
		$div->assign( $_, 'semfin' ) foreach @order;

	} elsif( $round eq 'finals' && $div->round_complete( 'semfin' )) {

		# Skip if athletes have already been advanced to the finals
		my $finals = $div->{ order }{ finals };
		return if( defined $finals && int( @$finals ) > 0 );

		# Advance athletes. Finals go in reverse placement order of semi-finals
		my $k          = $n > 8 ? 7 : ($n - 1);
		my @candidates = @{ $div->{ placement }{ semfin }};
		my @eligible   = $div->eligible_athletes( 'semfin', @candidates );
		my @order      = reverse (@eligible[ 0 .. $k ]);
		$div->assign( $_, 'finals' ) foreach @order;
	}
}

# ============================================================
sub detect_ties {
# ============================================================
#** @method ()
#   @brief Identifies ties in the current round.
#*
	my $self      = shift;
	my $div       = $self->{ div };
	my $ties      = [];
	my $round     = $div->{ round };
	my $placement = $div->{ placement }{ $round };

	# ===== DETECT TIES BY LOOKING AT PAIRS OF SCORES
	my $i = 0;
	my $k = int(@{$div->{ athletes }});
	while( $i < $k ) {
		my $a = $placement->[ $i ];
		my $x = $div->{ athletes }[ $i ]{ scores }{ $round };

		my $j = $i + 1;
		while( $j < $k ) {
			my $b = $placement->[ $j ];
			my $y = $div->{ athletes }[ $j ]{ scores }{ $round };
			if( exists $y->{ decision }{ withdraw } || exists $y->{ decision }{ disqualify } ) { $j++; next; } # Skip comparisons to withdrawn or disqualified athletes

			my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y );

			# ===== IF TIE DETECTED, GROW THE LIST OF TIED ATHLETES FOR THE GIVEN PLACEMENT
			if( $comparison == 0 ) {
				push @{ $ties->[ $i ]}, $j;
				$j++;

			# ===== OTHERWISE LOOK AT NEXT PLACE
			} else { last; }
		}
		$i = $j;
	}

	# ===== FILTER UNIMPORTANT TIES
	$i = 0;
	my $places   = $div->{ places };
	my $medals   = $places->{ $round }[ $i ];
	my $athletes = 0;
	while( $i < $k && $medals ) {
		if    ( ref( $ties->[ $i ])) { $athletes += int( @{ $ties->[ $i ]}); }
		elsif ( $athletes == 0     ) { $athletes  = 1; }

		my $gave = $medals >= $athletes ? $athletes : $medals;

		# ===== IF THERE ARE ENOUGH MEDALS, EACH ATHLETE GETS ONE MEDAL
		# No need for a tie breaker
		if( $medals >= $athletes ) {
			$medals -= $athletes;
			$athletes = 0;
			$ties->[ $i ] = undef;

		# ===== OTHERWISE GIVE AWAY ALL MEDALS; SOME ATHLETES WILL STILL NEED MEDALS
		} else {
			$athletes -= $medals;
			$medals = 0;
		}

		$i += $gave;
		$medals += $places->{ $round }[ $i ];
	}

	# ===== IGNORE ALL OTHER TIES
	splice( @$ties, $i);

	return $ties;
}

# ============================================================
sub rank_athletes {
# ============================================================
#** @method ()
#   @brief Calculates placements for the current round. Auto-updates score averages.
#*
	my $self      = shift;
	my $div       = $self->{ div };
	my $round     = $div->{ round };
	my $placement = [];

	# ===== ASSEMBLE THE RELEVANT COMPULSORY AND TIEBREAKER SCORES
	my @athlete_indices = @{$div->{ order }{ $round }};

	# ===== SORT THE ATHLETES BY COMPULSORY FORM SCORES, THEN TIE BREAKER SCORES
	@$placement = sort {
		# ===== COMPARE BY COMPULSORY ROUND SCORES
		my $x = $div->{ athletes }[ $a ]{ scores }{ $round }; # a := first athlete index;  x := first athlete round scores
		my $y = $div->{ athletes }[ $b ]{ scores }{ $round }; # b := second athlete index; y := second athlete round score
		my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y );

		# ===== ANNOTATE SCORES WITH TIE-RESOLUTION RESULTS
		# P: Presentation score, HL: High/Low score, TB: Tie-breaker form required
		if( $x->{ adjusted }{ total } == $y->{ adjusted }{ total } && $x->{ adjusted }{ total } != 0 ) {
			if    ( $x->{ adjusted }{ presentation } > $y->{ adjusted }{ presentation } ) { $x->{ notes } = 'P'; }
			elsif ( $x->{ adjusted }{ presentation } < $y->{ adjusted }{ presentation } ) { $y->{ notes } = 'P'; }
			else {
				if    ( $x->{ allscore }{ total } > $y->{ allscore }{ total } ) { $x->{ notes } = 'HL'; }
				elsif ( $x->{ allscore }{ total } < $y->{ allscore }{ total } ) { $y->{ notes } = 'HL'; }
				else {
					if( exists $x->{ decision }{ withdraw }   ) { $x->{ notes } = 'WDR'; }
					if( exists $x->{ decision }{ disqualify } ) { $x->{ notes } = 'DSQ'; }
					if( exists $y->{ decision }{ withdraw }   ) { $y->{ notes } = 'WDR'; }
					if( exists $y->{ decision }{ disqualify } ) { $y->{ notes } = 'DSQ'; }
				}
			}
		}

		# ===== COMPARE BY TIE-BREAKERS IF TIED
		if( $comparison == 0 ) { $comparison = FreeScore::Forms::WorldClass::Division::Round::_tiebreaker( $x, $y ); }

		$comparison;
	} @athlete_indices;

	# ===== ASSIGN PLACEMENTS
	my $half = int( (int(@{ $div->{ athletes }}) + 1) /2 );
	my $n    = 0;
	if( $div->{ places }{ $round }[ 0 ] eq 'half' ) { $n = $half; }
	else  { $n = reduce { $a + $b } @{ $div->{ places }{ $round }} };
	@$placement = grep { defined $div->{ athletes }[ $_ ]{ scores }{ $round };                    } @$placement; # Athlete is assigned to round
	@$placement = grep { $div->{ athletes }[ $_ ]{ scores }{ $round }->complete();                } @$placement; # Athlete's score is complete
	@$placement = grep { ! $div->{ athletes }[ $_ ]{ scores }{ $round }->any_disqualification();  } @$placement; # Athlete did not get disqualified
	@$placement = splice( @$placement, 0, $n );

	$div->{ placement }{ $round } = $placement;

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$div->{ order }{ $round }} ];
	@$pending   = grep { my $scores = $div->{ athletes }[ $_ ]{ scores }{ $round }; ! defined $scores || ! $scores->complete(); } @$pending; # Athlete's score is NOT complete

	$div->{ pending }{ $round } = $pending;

	my $ties = $self->detect_ties();

	# ===== ASSIGN THE TIED ATHLETES TO A TIEBREAKER ROUND
	foreach my $tie (@$ties) {
		next unless ref $tie;
		foreach my $i (@$tie) {
			my $athlete = $div->{ athletes }[ $i ];
			$div->assign_tiebreaker( $athlete );
		}
	}
}

1;
