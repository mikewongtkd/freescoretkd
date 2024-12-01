package FreeScore::Forms::WorldClass::Method::Cutoff;
use base qw( FreeScore::Forms::WorldClass::Method );
use FreeScore::Forms::WorldClass::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use List::Util qw( first shuffle );
use List::MoreUtils qw( first_index );

our @rounds = [
	{ code => 'prelim', name => 'Preliminary', min => 20 },
	{ code => 'semfin', name => 'Semi-Finals', min => 9, max => 19 },
	{ code => 'finals', name => 'Finals',      min => 1, max => 8  }
];

# ============================================================
sub advance_athletes {
# ============================================================
#** @method ( round )
#   @brief Advances the winning athletes of the current round to the next round
#*
	my $self        = shift;
	my $div         = $self->{ division };
	my $round       = shift || $div->{ round };
	my @rounds      = $div->rounds();
	my @round_order = @FreeScore::Forms::WorldClass::Division::round_order;
	my $i           = first_index { $_ eq $round } @round_order;

	# ===== DO NOTHING IF THE CURRENT ROUND IS THE FINALS (NO FURTHER ROUNDS)
	if( $round eq 'finals' ) { return; }

	# ===== ASSIGN THE WINNING ATHLETES TO THE NEXT ROUND
	my $n = int( @{ $div->{ athletes }} ); # Note: n is the number of registered athletes, not remaining eligible athletes

	# Flights have only one round (prelim); if it is completed, then mark the flight as complete (unless it is already merged)
	if( $div->is_flight() && $div->round_complete( 'prelim' ) && $div->{ flight }{ state } ne 'merged' ) {
		$div->{ flight }{ state } = 'complete';
		return;
	}

	my $prelim = first_index { $_ eq 'prelim' } @round_order;
	my $semfin = first_index { $_ eq 'prelim' } @round_order;
	my $advanced = {
		semfin => exists $div->{ order }{ semfin } && ref $div->{ order }{ semfin } eq 'ARRAY' && int( @{$div->{ order }{ semfin }}) > 0,
		finals => exists $div->{ order }{ finals } && ref $div->{ order }{ finals } eq 'ARRAY' && int( @{$div->{ order }{ finals }}) > 0
	};

	# ===== ADVANCE PRELIMINARY ATHLETES IF PRELIMINARY ROUND IS COMPLETE
	# Skip if the athletes have already been advanced to the semi-final round
	if( $i > $prelim && $div->round_complete( 'prelim' ) && ! $advanced->{ semfin }) {

		# Semi-final round goes in random order
		my $half       = int( ($n-1)/2 );
		my @candidates = @{ $div->{ placement }{ prelim }};
		my @eligible   = $div->eligible_athletes( 'prelim', @candidates );
		my @order      = shuffle (@eligible[ 0 .. $half ]);
		$div->assign( $_, 'semfin' ) foreach @order;
	} 

	# ===== ADVANCE SEMI-FINAL ATHLETES IF SEMI-FINAL ROUND IS COMPLETE
	# Skip if the athletes have already been advanced to the finals
	if( $i > $semfin && $div->round_complete( 'semfin' ) && ! $advanced->{ finals }) { 

		# Finals go in reverse placement order of semi-finals
		my $k          = $n > 8 ? 7 : ($n - 1);
		my @candidates = @{ $div->{ placement }{ semfin }};
		my @eligible   = $div->eligible_athletes( 'semfin', @candidates );
		my @order      = reverse (@eligible[ 0 .. $k ]);
		$div->assign( $_, 'finals' ) foreach @order;
	}
}

# ============================================================
sub assign {
# ============================================================
#** @method ( athlete_index, round )
#   @brief Assigns the athlete to a round
#*
	my $self       = shift;
	my $i          = shift;
	my $round      = $self->{ round };
	my $div        = $self->{ division };
	my $judges     = $div->{ judges };
	my $athlete    = $div->{ athletes }[ $i ];

	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no forms designated for round $!" unless exists $div->{ forms }{ $round };
	my @compulsory = @{ $div->{ forms }{ $round }};
	my $forms      = int( @compulsory );
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;

	# Do nothing if athlete is already assigned to the round
	return if( any { $_ == $i } @{ $div->{ order }{ $round }});

	$div->reinstantiate_round( $round, $i );
	push @{ $div->{ order }{ $round }}, $i;
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
			$div->reinstantiate_round( $round, $i );
		}
	}

	$div->{ current } = $div->athletes_in_round( 'first' ) unless defined $div->{ current };
}

# ============================================================
sub place_athletes {
# ============================================================
#** @method ()
#   @brief Calculates placements for the current round. Auto-updates score averages.
#*
	my $self      = shift;
	my $div       = $self->{ division };
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
					if( exists $x->{ decision }{ withdraw }   ) { $x->{ notes } = 'WD'; }
					if( exists $x->{ decision }{ disqualify } ) { $x->{ notes } = 'DQ'; }
					if( exists $y->{ decision }{ withdraw }   ) { $y->{ notes } = 'WD'; }
					if( exists $y->{ decision }{ disqualify } ) { $y->{ notes } = 'DQ'; }
				}
			}
		}

		# ===== COMPARE BY TIE-BREAKERS IF TIED
		if( abs( $comparison ) < 0.010 ) {
			$comparison = FreeScore::Forms::WorldClass::Division::Round::_tiebreaker( $x, $y ); 
		}

		$comparison;
	} @athlete_indices;

	# ===== ASSIGN PLACEMENTS
	my $half = int( (int(@{ $div->{ athletes }}) + 1) /2 );
	@$placement = grep { defined $div->{ athletes }[ $_ ]{ scores }{ $round };     } @$placement; # Athlete is assigned to round
	@$placement = grep { $div->{ athletes }[ $_ ]{ scores }{ $round }->complete(); } @$placement; # Athlete's score is complete

	$div->{ placement }{ $round } = $placement;

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$div->{ order }{ $round }} ];
	@$pending   = grep { my $scores = $div->{ athletes }[ $_ ]{ scores }{ $round }; ! defined $scores || ! $scores->complete(); } @$pending; # Athlete's score is NOT complete

	$div->{ pending }{ $round } = $pending;
}

# ============================================================
sub string { return 'cutoff'; }
# ============================================================

1;
