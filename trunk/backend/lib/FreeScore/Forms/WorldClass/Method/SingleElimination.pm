package FreeScore::Forms::WorldClass::Method::SingleElimination;
use base qw( FreeScore::Forms::WorldClass::Method );
use FreeScore::Forms::WorldClass::Division::Round;
use List::Util qw( all uniq );
use List::MoreUtils qw( first_index part );

our @rounds = [
	{ code => 'ro256', name => 'Round of 256',  matches => 128, min => 129, max => 256 },
	{ code => 'ro128', name => 'Round of 128',  matches => 64,  min => 65,  max => 128 },
	{ code => 'ro64',  name => 'Round of 64',   matches => 32,  min => 33,  max => 64  },
	{ code => 'ro32',  name => 'Round of 32',   matches => 16,  min => 17,  max => 32  },
	{ code => 'ro16',  name => 'Round of 16',   matches => 8,   min => 9,   max => 16  },
	{ code => 'ro8',   name => 'Quarterfinals', matches => 4,   min => 5,   max => 8   },
	{ code => 'ro4',   name => 'Semifinals',    matches => 2,   min => 3,   max => 4   },
	{ code => 'ro2',   name => 'Finals',        matches => 1,   min => 1,   max => 2   }
];

# ============================================================
sub advance_athletes {
# ============================================================
#** @method ( round )
#   @brief Advances the winning athletes of the current round to the next round
#*
	my $self     = shift;
	my $div      = $self->{ division };
	my $round    = shift || $div->{ round };
	my @rounds   = $div->rounds();
	my $i        = first_index { $_ eq $round } @rounds;
	my $i_n      = $i < $#rounds ? $i + 1 : undef;
	my $next     = defined $i_n ? $rounds[ $i_n ] : undef;

	# ===== ADVANCE WINNING ATHLETES TO THE NEXT ROUND IF CURRENT ROUND IS COMPLETE
	# Skip if the athletes have already been advanced to the current round
	my $skip    = exists $div->{ order }{ $next } && ref $div->{ order }{ $next } eq 'ARRAY' && int( @{$div->{ order }{ $next }}) > 0;

	return unless( $div->round_complete( $round ) && ! $skip );
	my @winners = $self->calculate_winners( $round );

	$div->assign( $_, $next ) foreach @winners;
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
sub bracket {
# ============================================================
#** @method ( round )
#   @brief Brackets the athletes into matches for the given round
#*
	my $self   = shift;
	my $div    = $self->{ division };
	my $rcode  = shift || $div->{ round };
	my @order  = @{$div->{ order }{ $round }};
	my $n      = int( @order ); # Number of athletes
	my $k      = $#order;       # Index of last athlete
	my $round  = $self->round( $rcode );

	die "Database error: $n athletes unsuitable for round '$rcode' (required range: $round->{ min } to $round->{ max } athletes) $!" if( $n < $round->{ min } || $n > $round->{ max });

	foreach my $mnum ( 0 .. $#{$round->{ matches }}) {
		my $i = $mnum;
		my $j = $round->{ max } - ($i + 1);

		# Assign Chung athlete (if one exists)
		my $chung = $order[ $i ];
		$div->reinstantiate_round( $round, $chung )->match( $mnum ) unless $chung < 0; # -1 indicates player has WDR or DSQ decision

		# Do not assign Hong athlete if there is a bye
		next if( $j > $k );

		# Assign Hong athlete (if one exists)
		my $hong = $order[ $j ];
		$div->reinstantiate_round( $round, $hong )->match( $mnum );
	}
}

# ============================================================
sub calculate_winners {
# ============================================================
	my $self     = shift;
	my $div      = $self->{ division };
	my $round    = shift || $div->{ round };
	my $annotate = shift || 0;

	my $athletes = $div->{ order }{ $round };
	my @matches  = part { $div->reinstantiate_round( $round, $_ )->match() } @$athletes;
	my @winners  = ();

	foreach my $match (@matches) {
		my ($winner, $loser);
		if( int( @$match ) == 1 ) {
			my $winner = $match->[ 0 ];

		} else {
			($winner, $loser) = sort { 
				my $x = $div->{ athletes }[ $a ]{ scores }{ $round };
				my $y = $div->{ athletes }[ $b ]{ scores }{ $round };
				_annotate( $x, $y ) if $annotate;
				FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ) 
			} @$match;
		}
		if( $div->{ athletes }[ $winner ]{ scores }{ $round }->any_punitive_decision()) {
			push @winners, -1; # -1 indicates player has WDR or DSQ decision

		} else {
			push @winners, $winner;
		}
	}

	return @winners;
}

# ============================================================
sub find_athlete {
# ============================================================
	my $self     = shift;
	my $div      = $self->{ division };
	my $option   = shift;
	my $round    = $div->{ round };
	my $athletes = $div->order();
	my @matches  = part { $div->reinstantiate_round( $round, $_ )->match() } grep { $_ >= 0 } @$athletes; # Athlete-Rounds

	my $first = { match => first { any { $_ >= 0 } @$_ } @matches }; # Skip matches where the previous winner either WDR or DSQ (rare event)
	$first->{ athlete } = first { $_ >= 0 } @{$first->{ match }};    # Find the first athlete in a match who has not WDR or DSQ
	my $last = { match => first { any { $_ >= 0 } @$_ } reverse @matches }; # Skip matches where the previous winner either WDR or DSQ (rare event)
	$last->{ athlete } = first { $_ >= 0 } reverse @{$last->{ match }};     # Find the first athlete in a match who has not WDR or DSQ
	my $current = { athlete => $div->{ current }};
	my $i = first_index { any { $_ == $div->{ current }} @$_ } @matches
	$current->{ match } = $matches[ $i ];

	if( $option =~ /^(?:first|last)$/ ) {
		if( $option =~ /^first$/ ) {
			return $first->{ athlete };
		} else {
			return $last->{ athlete };
		}
	} elsif( $option =~ /^(?:next|prev)/ {
		if( $option =~ /^next$/ ) {
			my $next  = { match => $i < $#matches ? $matches[ $i + 1 ] : $matches[ 0 ] };
			my $limit = 0;
			while( any { $_ < 0 } @{$next->{ match }} && $limit < $#$matches ) { $next->{ match } = $next->{ match } < $#matches ? $next->{ match } + 1 : $matches[ 0 ]; $limit++; } # Go to the next valid match (no WDR or DSQ)
			return $first->{ athlete } if( $current->{ athlete } == $last->{ athlete  }); # Wrap around to first
			if( $current->{ match }[ 0 ] == $current->{ athlete } && @{$current->{ match }} == 2 ) { 
				return $current->{ match }[ 1 ];
			} else {
				return $next->{ match }[ 0 ];
			}
		} else {
			my $prev  = { match => $i > 0 ? $matches[ $i - 1 ] : $matches[ -1 ] };
			my $limit = 0;
			while( any { $_ < 0 } @{$next->{ match }} && $limit < $#$matches ) { $prev->{ match } = $prev->{ match } > 0 ? $prev->{ match } - 1 : $matches[ - 1 ]; $limit++; } # Go to the previous valid match (no WDR or DSQ)
			return $last->{ athlete } if( $current->{ athlete } == $first->{ athlete }); # Wrap around to last
			if( $current->{ match }[ 1 ] == $current->{ athlete } && @{$current->{ match }} == 2 ) { 
				return $current->{ match }[ 0 ];
			} else {
				return $prev->{ match }[ -1 ];
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
	my @rounds    = grep { /^ro/ } $div->rounds();
	my $i         = first_index { $_ eq $round } @rounds;
	my $wins      = {};

	splice @rounds, $i + 1 unless $i < 0; # Remove all rounds past current round

	# ===== TALLY THE WINS FROM ALL PREVIOUS SINGLE ELIMINATION ROUNDS
	foreach my $rcode (@rounds) {
		my $order = exists $div->{ order }{ $rcode } && int( @{$div->{ order }{ $rcode }}) ? $div->{ order }{ $rcode } : undef;
		next unless $order;
		next if all { ! $div->reinstantiate_round( $rcode, $_ )->complete() } @$order

		my @winners = $self->calculate_winners( $rcode, 'annotate' );

		foreach my $winner (@winners) {
			next if $winner < 0;
			$wins->{ $winner }++;
		}
	}

	$div->{ placement }{ $round } = [ sort { $wins->{ $b } <=> $wins->{ $a } } keys %$wins ];

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$div->{ order }{ $round }} ];
	@$pending   = grep { my $scores = $div->{ athletes }[ $_ ]{ scores }{ $round }; ! defined $scores || ! $scores->complete(); } @$pending; # Athlete's score is NOT complete

	$div->{ pending }{ $round } = $pending;
}

# ============================================================
sub record_score {
# ============================================================
#** @method ( judge_index, score_object )
#   @brief Records the scores for Side-By-Side
#*
	my $self   = shift;
	my $judge  = shift;
	my $scores = shift;
	my $div    = $self->{ division };
	my $round  = $div->{ round };
	my $form   = $div->{ form };
	my $match  = $scores->{ match };
	my $chung  = $scores->{ chung };
	my $hong   = $scores->{ hong };

	$div->{ state } = 'score'; # Return to the scoring state when any judge scores

	# Score both athletes
	foreach my $athlete ( $chung, $hong ) {
		my $name   = $div->{ athletes }[ $athlete->{ index } ]{ name };
		my $ar     = $div->reinstantiate_round( $round, $athlete->{ index })
		my $target = $ar->match();
		my $error  = sprintf( "Database error: Score for %s given for %s Match %d but athlete is bracketed to Match %d", $name, uc $round, $match + 1, $target + 1 );
		die $error unless $match == $target;
		$ar->record_score( $form, $judge, $athlete->{ score });
	}
}

# ============================================================
sub string { return 'se'; }
# ============================================================

# ============================================================
sub _annotate {
# ============================================================
	my $x = shift;
	my $y = shift;

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
}

1;
