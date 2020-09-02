package FreeScore::Forms::WorldClass::Method::Cutoff;
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round;
use base qw( FreeScore::Forms::WorldClass::Method );

# ============================================================
sub init {
# ============================================================
	my $self = shift;
	my $div  = shift;
	$self->{ div }    = $div;
	$self->{ name }   = 'single-elim';
	$self->{ rounds } = [ qw( ro64 ro32 ro16 ro8 ro4 ro2 ) ];
}

sub advance_athletes {
	my $self = shift;
	my $div  = $self->{ div };

	# ===== ASSIGN THE WINNING ATHLETES TO THE NEXT ROUND
	my $n = int( @{ $div->{ athletes }} ); # Note: n is the number of registered athletes, not remaining eligible athletes

	# Flights have only one round (prelim); if it is completed, then mark the flight as complete (unless it is already merged)
	if     (($round eq 'prelim' || $round eq 'semfin') && $div->is_flight() && $div->round_complete( 'prelim' ) && $div->{ flight }{ state } ne 'merged' ) {
		$div->{ flight }{ state } = 'complete';

	} elsif( $round eq 'semfin' && $div->round_complete( 'prelim' )) {

		# Skip if athletes have already been assigned to the semi-finals
		my $semfin = $div->{ order }{ semfin };
		return if( defined $semfin && int( @$semfin ) > 0 );

		# Semi-final round goes in random order
		my $half       = int( ($n-1)/2 );
		my @candidates = @{ $div->{ placement }{ prelim }};
		my @eligible   = $div->eligible_athletes( 'prelim', @candidates );
		my @order      = shuffle (@eligible[ 0 .. $half ]);
		$div->assign( $_, 'semfin' ) foreach @order;

	} elsif( $method eq 'combination' && $round eq 'final1' && $div->round_complete( 'semfin' )) {
		# Skip if athletes have already been assigned to the finals
		my $finals = $div->{ order }{ final1 };
		return if( defined $finals && int( @$finals ) > 0 );

		# Finals go in reverse placement order of semi-finals
		my $k          = $n > 8 ? 7 : ($n - 1);
		my @candidates = @{ $div->{ placement }{ semfin }};
		my @eligible   = $div->eligible_athletes( 'semfin', @candidates );
		my @order      = int( @eligible ) > 4 ? (@eligible[ ( 0 .. 3 ) ], shuffle( @eligible[ 4 .. $k ] )) : @eligible[ ( 0 .. $#eligible ) ];
		$div->distribute_evenly( 'final1', \@order );

	} elsif( $method eq 'combination' && $round eq 'final2' && $div->round_complete( 'final1' )) {
		# Skip if athletes have already been assigned to the finals
		my $finals = $div->{ order }{ final2 };
		return if( defined $finals && int( @$finals ) > 0 );

		my $goto = { final1 => 'final2' };
		foreach my $match (qw( final1 )) { # MW Figure this out when sober
			my @candidates = @{ $div->{ placement }{ $match }};
			my @eligible   = $div->eligible_athletes( $match, @candidates );
			next unless @eligible >= 1; # Skip the assignment if there isn't any eligible candidates

			my $winner = shift @eligible; # Advance the first place athlete of the previous match
			my $final2 = $goto->{ $match };
			$div->assign( $winner, $final2 );
		}

	} elsif( $method eq 'combination' && $round eq 'final3' && $div->round_complete( 'final2' )) {
		# Skip if athletes have already been assigned to the finals
		my $finals = $div->{ order }{ ro2 };
		return if( defined $finals && int( @$finals ) > 0 );

		# TODO: Use bracket variable to determine winner of finals2 to move them to finals3

	} elsif( $round eq 'finals' && $div->round_complete( 'semfin' )) { 
		# Skip if athletes have already been assigned to the finals
		my $finals = $div->{ order }{ finals };
		return if( defined $finals && int( @$finals ) > 0 );

		# Finals go in reverse placement order of semi-finals
		my $k          = $n > 8 ? 7 : ($n - 1);
		my @candidates = @{ $div->{ placement }{ semfin }};
		my @eligible   = $div->eligible_athletes( 'semfin', @candidates );
		my @order      = reverse (@eligible[ 0 .. $k ]);
		$div->assign( $_, 'finals' ) foreach @order;
	}

}

# ============================================================
sub matches {
# ============================================================
#** @method ()
#   @brief Returns the matches for the current round
#*
	my $self    = shift;
	my $div     = shift;
	my $matches = $div->{ matches };
	my $round   = $div->{ round };

	die "No matches found $!" unless $matches;
	return $matches->{ $round } if( exists $matches->{ $round });
	die "No matches found for '$round' $!";
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

	my @matches   = $self->matches();

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
		if( $comparison == 0 ) {
			$comparison = FreeScore::Forms::WorldClass::Division::Round::_tiebreaker( $x, $y ); 
		}

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
}

1;
