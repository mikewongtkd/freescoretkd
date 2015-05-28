package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use List::Util qw( any none first shuffle reduce );
use Try::Tiny;
use Data::Dumper;
use base qw( FreeScore::Forms::Division );
use strict;

our @round_order = ( qw( prelim semfin finals ) );

# ============================================================
sub assign {
# ============================================================
# Assigns the athlete to a round
# ------------------------------------------------------------
	my $self       = shift;
	my $i          = shift;
	my $round      = shift;
	my $judges     = $self->{ judges };
	my $athlete    = $self->{ athletes }[ $i ];

	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no forms designated for round $!" unless exists $self->{ forms }{ $round };
	my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
	my $forms      = int( @compulsory );
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;

	# Do nothing if athlete is already assigned to the round
	return if( any { $_ == $i } @{ $self->{ order }{ $round }});

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	push @{ $self->{ order }{ $round }}, $i;
}

# ============================================================
sub assign_tiebreaker {
# ============================================================
# Assigns the athlete to a tiebreaker round
# ------------------------------------------------------------
	my $self    = shift;
	my $athlete = shift;
	my $round   = shift || $self->{ round };
	my $judges  = $self->{ judges } - 1;

	if( exists $self->{ forms }{ $round } ) {
		my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
		my @tiebreaker = grep { $_->{ type } eq 'tiebreaker' } @{ $self->{ forms }{ $round }};
		my $start = int( @compulsory );
		my $stop  = int( @compulsory ) + int( @tiebreaker ) - 1;
		for my $i ($start .. $stop) {
			# $athlete->{ scores }{ $round }->add_tiebreaker( $judges, $start, $stop ); # MW TODO
		}
	}
}

# ============================================================
sub place_athletes {
# ============================================================
# Calculates placements for the current round. Auto-updates
# score averages.
# ------------------------------------------------------------
	my $self      = shift;
	my $round     = $self->{ round };
	my $placement = [];

	# ===== ASSEMBLE THE RELEVANT COMPULSORY AND TIEBREAKER SCORES
	my @athlete_indices = ( 0 .. $#{ $self->{ athletes }} );
	my $scores = [ map {
		my $compulsory = $self->select_compulsory_round_scores( $_, $round );
		my $tiebreaker = $self->select_tiebreaker_round_scores( $_, $round );
		{ compulsory => $compulsory, tiebreaker => $tiebreaker }
	} @athlete_indices ];

	# ===== SORT THE ATHLETES BY COMPULSORY FORM SCORES, THEN TIE BREAKER SCORES
	@$placement = sort { 
		# ===== COMPARE BY COMPULSORY ROUND SCORES
		my $x = $scores->[ $a ]{ compulsory };
		my $y = $scores->[ $b ]{ compulsory };
		my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ); 

		# ===== CALCULATE STATISTICS IN CASE OF TIES
		my $x_stats = { sum => 0, pre => 0, all => 0 };
		$x_stats->{ sum } += $_->{ adjusted_mean }{ total }        foreach @$x;
		$x_stats->{ pre } += $_->{ adjusted_mean }{ presentation } foreach @$x;
		$x_stats->{ all } += $_->{ complete_mean }{ total }        foreach @$x;
		$x_stats->{ $_ } = sprintf( "%5.2f", $x_stats->{ $_ } )    foreach (qw( sum pre all ));

		my $y_stats = { sum => 0, pre => 0, all => 0 };
		$y_stats->{ sum } += $_->{ adjusted_mean }{ total }        foreach @$y;
		$y_stats->{ pre } += $_->{ adjusted_mean }{ presentation } foreach @$y;
		$y_stats->{ all } += $_->{ complete_mean }{ total }        foreach @$y;
		$y_stats->{ $_ } = sprintf( "%5.2f", $y_stats->{ $_ } )    foreach (qw( sum pre all ));

		# ===== DETECT TIES AND APPLY AUTOMATED TIE-RESOLUTION
		# P: Presentation score, HL: High/Low score, TB: Tie-breaker form required
		if( $x_stats->{ sum } == $y_stats->{ sum } ) {
			if    ( $x_stats->{ pre } > $y_stats->{ pre } ) { $self->{ athletes }[ $a ]{ notes } = 'P'; }
			elsif ( $x_stats->{ pre } < $y_stats->{ pre } ) { $self->{ athletes }[ $b ]{ notes } = 'P'; }
			else {
				if    ( $x_stats->{ all } > $y_stats->{ all } ) { $self->{ athletes }[ $a ]{ notes } = 'HL'; }
				elsif ( $x_stats->{ all } < $y_stats->{ all } ) { $self->{ athletes }[ $b ]{ notes } = 'HL'; }
				else {
					$self->{ athletes }[ $a ]{ notes } = 'TB';
					$self->{ athletes }[ $b ]{ notes } = 'TB';
				}
			}
		}

		# ===== COMPARE BY TIE-BREAKERS IF TIED
		if( _is_tie( $comparison )) {
			my $x = $scores->[ $a ]{ tiebreaker };
			my $y = $scores->[ $b ]{ tiebreaker };
			$comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ); 
		}

		$comparison;
	} @athlete_indices;

	# ===== ASSIGN PLACEMENTS
	my $half = int( (int(@{ $self->{ athletes }}) + 1) /2 );
	my $n    = 0;
	if( $self->{ places }{ $round }[ 0 ] eq 'half' ) { $n = $half; }
	else  { $n = reduce { $a + $b } @{ $self->{ places }{ $round }} };
	@$placement = grep { $self->{ athletes }[ $_ ]{ scores }{ $round }->complete(); } @$placement;
	@$placement = splice( @$placement, 0, $n );

	$self->{ placement }{ $round } = $placement;

	# ===== CALCULATE PENDING
	# Updates the leaderboard to indicate the next player
	my $pending = [ @{$self->{ order }{ $round }} ];
	@$pending = grep { ! $self->{ athletes }[ $_ ]{ scores }{ $round }->complete(); } @$pending;
	while( @$pending ) {
		my $i = $pending->[ 0 ];
		if( $i == $self->{ current } ) { last; }
		else { shift @$pending; }
	}

	$self->{ pending }{ $round } = $pending;
}

# ============================================================
sub detect_ties {
# ============================================================
	my $self      = shift;
	my $ties      = [];
	my $round     = $self->{ round };
	my $placement = $self->{ placement }{ $round };

	# ===== DETECT TIES BY LOOKING AT PAIRS OF SCORES
	my $i = 0;
	my $k = int(@{$self->{ athletes }});
	while( $i < $k ) {
		my $a = $placement->[ $i ];
		my $x = $self->select_compulsory_round_scores( $a, $round );

		my $j = $i + 1;
		while( $j < $k ) {
			my $b = $placement->[ $j ];
			my $y = $self->select_compulsory_round_scores( $b, $round );
			my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y );

			# ===== IF TIE DETECTED, GROW THE LIST OF TIED ATHLETES FOR THE GIVEN PLACEMENT
			if( _is_tie( $comparison )) {
				push @{ $ties->[ $i ]}, $j; 
				$j++;

			# ===== OTHERWISE LOOK AT NEXT PLACE
			} else { last; }
		}
		$i = $j;
	}

	# ===== FILTER UNIMPORTANT TIES
	$i = 0;
	my $places   = $self->{ places };
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
sub get_only {
# ============================================================
	my $self  = shift;
	my $judge = shift;
	my $round = $self->{ round };

	foreach my $athlete (@{ $self->{ athletes }}) {
		$athlete->{ scores } = { $round => $athlete->{ scores }{ $round } };
		foreach my $form (@{$athlete->{ scores }{ $round }}) {
			next unless exists $form->{ judge };
			$form->{ judge } = [ $form->{ judge }[ $judge ] ];
		}
	}
}

# ============================================================
sub normalize {
# ============================================================
	my $self   = shift;
	my $judges = $self->{ judges };

	my $round  = $self->{ round };
	# ===== ASSIGN ALL ATHLETES TO THE DEFINED ROUND
	if( defined $round ) {
		my $order = $self->{ order }{ $round };
		if( ! (defined $order && int( @$order ))) { $self->assign( $_, $round ) foreach ( 0 .. $#{ $self->{ athletes }} ); } 

	# ===== OTHERWISE FIGURE OUT WHICH ROUND TO START WITH, GIVEN THE NUMBER OF ATHLETES
	} else {
		my $n        = int( @{ $self->{ athletes }} );
		my $half     = int( ($n-1)/2 );

		if    ( $n >= 20 ) { $round = 'prelim'; }
		elsif ( $n >=  8 ) { $round = 'semfin'; }
		else               { $round = 'finals'; }

		if   ( $n >= 20 )          { $self->assign( $_, 'prelim' ) foreach ( 0 .. $#{ $self->{ athletes }} ); }
		elsif( $n > 8 && $n < 20 ) { $self->assign( $_, 'semfin' ) foreach ( 0 .. $#{ $self->{ athletes }} ); }
		elsif( $n <= 8 )           { $self->assign( $_, 'finals' ) foreach ( 0 .. $#{ $self->{ athletes }} ); }
	}

	# ===== NORMALIZE THE SCORING MATRIX
	my $forms  = int( @{ $self->{ forms }{ $round }});
	my @rounds = grep { my $order = $self->{ order }{ $_ }; defined $order && int( @$order ); } qw( prelim semfin finals );
	foreach my $round (@rounds) {
		foreach my $i (@{ $self->{ order }{ $round }}) {
			my $athlete = $self->{ athletes }[ $i ];
			$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
		}
	}

	$self->{ current } = $self->athletes_in_round( 'first' ) unless defined $self->{ current };
}

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $judge = shift;
	my $score = shift;

	my $athlete = $self->{ athletes }[ $self->{ current } ];
	my $round   = $self->{ round };
	my $form    = $self->{ form };
	my $forms   = int( @{ $self->{ forms }{ $round }});
	my $judges  = $self->{ judges };

	$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
	$athlete->{ scores }{ $round }->record_score( $form, $judge, $score );
}

# ============================================================
sub reorder {
# ============================================================
	my $self      = shift;
	my $reorder   = shift;
	my $round     = $self->{ round };
	my $order     = $self->{ order }{ $round };
	my $new_order = [];

	foreach my $i (@$reorder) {
		push @$new_order, $order->[ ($i - 1) ];
	}

	$self->{ order }{ $round } = $new_order;
}

# ============================================================
sub read {
# ============================================================
	my $self  = shift;

	# ===== DEFAULTS
	$self->{ state }   = 'score';
	$self->{ places }  = _parse_places( 'prelim:half;semfin:8;finals:1,1,2' );

	my $round    = 'autodetect_required';
	my $order    = {};
	my $athletes = {};
	my $athlete  = {};
	open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			if( /=/ ) {
				s/^#\s+//;
				my ($key, $value) = split /=/;
				if    ( $key eq 'forms'     ) { $self->{ $key } = _parse_forms( $value );     }
				elsif ( $key eq 'places'    ) { $self->{ $key } = _parse_places( $value );    }
				elsif ( $key eq 'placement' ) { $self->{ $key } = _parse_placement( $value ); }
				else                          { $self->{ $key } = $value;                     }

				$round = $self->{ round } if( defined $self->{ round } );

			} elsif( /prelim|semfin|finals/i ) {
				s/^#\s+//;

				# Store the last athlete
				if( $athlete->{ name } ) {
					push @{ $order->{ $round }}, $athlete->{ name } if( $athlete->{ name } );
					$athlete = {};
				}

				# Assign round
				$round = $_;
			}
		# ===== READ DIVISION ATHLETE INFORMATION
		} elsif( /^\w/ ) {
			die "Division Configuration Error: Number of Judges not defined before athlete information" unless $self->{ judges };
			die "Division Configuration Error: Forms not defined before athlete information" unless $self->{ forms };

			# Store the current athlete before starting a new athlete
			if( $athlete->{ name } ) {
				push @{ $order->{ $round }}, $athlete->{ name } if( $athlete->{ name } );
				$athlete = {};
			}

			my ($name, $rank, $age) = split /\t/;

			# Reload the athlete seen from a previous round or...
			if( exists $athletes->{ $name } ) {
				$athlete = $athletes->{ $name };

			# Start a new athlete
			} else {
				$athlete->{ name }   = $name;
				$athlete->{ rank }   = $rank;
				$athlete->{ age }    = $age;
				$athlete->{ scores } = {};

				$athletes->{ $athlete->{ name } } = $athlete; 
			}

		# ===== READ DIVISION ATHLETE SCORES
		} elsif( /^\t\w/ ) {
			s/^\t//;
			my ($score_round, $form, $judge, $major, $minor, $rhythm, $power, $ki) = split /\t/;
			$major ||= 0; $minor ||= 0; $rhythm ||= 0; $power ||= 0; $ki ||= 0;
			die "Database Integrity Error: score recorded for $athlete->{ name } for $score_round round does not match context $round round\n" if $round ne $score_round;
			$self->{ rounds }{ $round } = 1;

			$form  =~ s/f//; $form  = int( $form )  - 1; die "Division Configuration Error: Invalid form index '$form' $!" unless $form >= 0;
			$judge =~ s/j//; $judge = int( $judge ) - 1; die "Division Configuration Error: Invalid judge index '$judge' $!" unless $judge >= 0;
			next unless( $major || $minor || $rhythm || $power || $ki );

			my $score  = { major => $major, minor => $minor, rhythm => $rhythm, power => $power, ki => $ki };
			my $forms  = int( @{ $self->{ forms }{ $round }});
			my $judges = $self->{ judges };
			$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round }, $forms, $judges );
			$athlete->{ scores }{ $round }->record_score( $form, $judge, $score );

		} else {
			die "Database Read Error: Unknown line type '$_'\n";
		}
	}
	if( $athlete->{ name } ) { push @{ $order->{ $round }}, $athlete->{ name }; } # Store the last athlete.
	close FILE;

	foreach my $i ( 0 .. $#{ $self->{ athletes }} ) {
		next unless $athlete->{ scores }{ prelim };
	}

	# ===== AUTODETECT THE FIRST ROUND
	if( exists $order->{ 'autodetect_required' } ) {
		my $n = int( keys %$athletes );
		if    ( $n >= 20            ) { $round = 'prelim'; $order->{ 'prelim' } = $order->{ 'autodetect_required' }; }
		elsif ( $n <  20 && $n >  8 ) { $round = 'semfin'; $order->{ 'semfin' } = $order->{ 'autodetect_required' }; }
		elsif (             $n >= 8 ) { $round = 'finals'; $order->{ 'finals' } = $order->{ 'autodetect_required' }; }

		delete $order->{ 'autodetect_required' };
	}

	# ===== READ THE ATHLETE ASSIGNATION FOR THE ROUND SUB-HEADER IN THE FILE
	my $initial_order = {};
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $order->{ $round };

		# Establish order by athlete name, based on the earliest round
		if( keys %$initial_order ) {
			foreach my $name (@{ $order->{ $round }}) {
				push @{$self->{ order }{ $round }}, $initial_order->{ $name } if defined $initial_order->{ $name };
			}

		# No initial order set; this must be the earliest round
		} else {
			my $i = 0;
			foreach my $name (@{ $order->{ $round }}) {
				$initial_order->{ $name } = $i;
				push @{$self->{ order }{ $round }}, $i;
				push @{ $self->{ athletes }}, $athletes->{ $name };
				$i++;
			}
		}
	}

	$self->normalize();
	$self->update_status();

}

# ============================================================
sub update_status {
# ============================================================
# Determine athlete placements and tie detection
# ------------------------------------------------------------
	my $self  = shift;
	my $round = $self->{ round };

	# ===== SORT THE ATHLETES TO THEIR PLACES (1st, 2nd, etc.) AND DETECT TIES
	# Update after every completed score to give real-time audience feedback
	$self->place_athletes(); 
	my $ties = $self->detect_ties();

	# ===== ASSIGN THE TIED ATHLETES TO A TIEBREAKER ROUND
	# foreach my $tie (@$ties) {
	# 	next unless ref $tie;
	# 	foreach my $i (@$tie) {
	# 		my $athlete = $self->{ athletes }[ $i ];
	# 		$self->assign_tiebreaker( $athlete );
	# 	}
	# }

	# ===== ASSIGN THE ATHLETES TO THE NEXT ROUND
	my $n        = int( @{ $self->{ athletes }} );
	if     ( $round eq 'semfin' && $self->round_complete( 'prelim' )) {

		# Skip if athletes have already been assigned to the semi-finals
		my $semfin = $self->{ order }{ semfin };
		return if( defined $semfin && int( @$semfin ) > 0 );

		# Semi-final round goes in random order
		my $half             = int( ($n-1)/2 );
		my @order            = shuffle (@{ $self->{ placement }{ prelim }}[ 0 .. $half ]);
		$self->assign( $_, 'semfin' ) foreach @order;

	} elsif( $round eq 'finals' && $self->round_complete( 'semfin' )) { 

		# Skip if athletes have already been assigned to the finals
		my $finals = $self->{ order }{ finals };
		return if( defined $finals && int( @$finals ) > 0 );

		# Finals go in reverse placement order of semi-finals
		my $k                = $n > 8 ? 7 : ($n - 1);
		my @order            = reverse (@{ $self->{ placement }{ semfin }}[ 0 .. $k ]);
		$self->assign( $_, 'finals' ) foreach @order;
	}
}

# ============================================================
sub round_complete {
# ============================================================
	my $self  = shift;
	my $round = shift || $self->{ round };

	my $order = $self->{ order }{ $round };
	return 0 unless( defined $order && int(@$order) > 0 );

	my $forms        = $self->{ forms }{ $round };
	my @form_indices = ( 0 .. $#$forms );
	my @athletes     = $self->athletes_in_round( $round );
	my $complete     = 1;

	return 0 unless @athletes;

	foreach my $i (@athletes) {
		my $athlete = $self->{ athletes }[ $i ];
		$athlete->{ scores }{ $round } = FreeScore::Forms::WorldClass::Division::Round::reinstantiate( $athlete->{ scores }{ $round } ) unless defined $athlete->{ scores }{ $round };
		$complete &&= $athlete->{ scores }{ $round }->complete();
	}
	return $complete;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	$self->update_status();
	$self->{ current } = $self->athletes_in_round( 'first' ) unless defined $self->{ current };

	my $judges = $self->{ judges };

	# ===== COLLECT THE FORM NAMES TOGETHER PROPERLY
	my @forms = ();
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ forms }{ $round };
		push @forms, "$round:" . join( ",", map { $_->{ type } eq 'tiebreaker' ? "$->{ name } ($_->{ type })" : $_->{ name }; } @{$self->{ forms }{ $round }} );
	}

	# ===== PREPARE THE PLACEMENTS AND PENDING ATHLETES
	$self->{ placement } = {} unless defined $self->{ placement };
	my @places = ();
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		my $placements = $self->{ placement }{ $round };
		next unless defined $placements && int( @$placements );
		next unless grep { /^\d+$/ } @$placements;
		push @places, "$round:" . join( ",", grep { /^\d+$/ } @$placements );
	}

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# form=$self->{ form }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n";
	print FILE "# forms=" . join( ";", @forms ) . "\n" if @forms;
	print FILE "# placement=" . join( ";", @places ) . "\n" if @places;
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		my $order = $self->{ order }{ $round };
		next unless defined $order && int( @$order );
		print FILE "# ------------------------------------------------------------\n";
		print FILE "# $round\n";
		print FILE "# ------------------------------------------------------------\n";
		my $forms = int( @{$self->{ forms }{ $round }});
		foreach my $k (@$order) {
			my $athlete = $self->{ athletes }[ $k ];
			print FILE join( "\t", @{ $athlete }{ qw( name rank age ) }), "\n";
			print FILE $athlete->{ scores }{ $round }->string( $round, $forms, $judges );
		}
	}
	close FILE;
}

# ============================================================
sub navigate {
# ============================================================
	my $self   = shift;
	my $object = shift;
	my $value  = shift;

	if    ( $object eq 'round'   ) { $self->{ round }   = $value; }
	elsif ( $object eq 'athlete' ) { $self->{ current } = $value; }
	elsif ( $object eq 'form'    ) { $self->{ form }    = $value; }
}

# ============================================================
sub navigate_to_start {
# ============================================================
	my $self = shift;

	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ rounds }{ $round };
		$self->{ round } = $round;
		last;
	}

	$self->{ current } = 0;
	$self->{ form }    = 0;
}


# ============================================================
sub next_round {
# ============================================================
	my $self   = shift;
	my @rounds = @FreeScore::Forms::WorldClass::Division::round_order;
	my @i      = (0 .. $#rounds);
	my ($i)    = grep { $self->{ round } eq $rounds[ $_ ] } @i;
	if( $i == $#rounds ) { $i = 0; }
	else                 { $i++; }

	# ===== GO TO NEXT ROUND
	$self->{ round } = $rounds[ $i ];

	# ===== GO TO THE FIRST ATHLETE IN THAT ROUND
	$self->{ current } = $self->athletes_in_round( 'first' );
}

# ============================================================
sub previous_round {
# ============================================================
	my $self   = shift;
	my @rounds = @FreeScore::Forms::WorldClass::Division::round_order;
	my @i      = (0 .. $#rounds);
	my ($i)    = grep { $self->{ round } eq $rounds[ $_ ] } @i;
	if( $i == 0 ) { $i = $#rounds; }
	else          { $i--; }

	# ===== GO TO PREVIOUS ROUND
	$self->{ round } = $rounds[ $i ];

	# ===== GO TO THE LAST ATHLETE IN THAT ROUND
	$self->{ current } = $self->athletes_in_round( 'last' );
}

# ============================================================
sub next_athlete {
# ============================================================
	my $self = shift;

	$self->{ state }   = 'score';
	$self->{ current } = $self->athletes_in_round( 'next' );
	$self->{ form }    = 0;
}

# ============================================================
sub next_form {
# ============================================================
	my $self = shift;

	$self->{ state } = 'score';
	my $round        = $self->{ round };
	my $form         = $self->{ form };
	my $max_forms    = $#{ $self->{ forms }{ $round }};

	return unless( $form < $max_forms );
	$self->{ form }++;
}

# ============================================================
sub previous_athlete {
# ============================================================
	my $self = shift;

	$self->{ state }      = 'score';
	$self->{ current }    = $self->athletes_in_round( 'prev' );
	$self->{ form }       = 0;
}

# ============================================================
sub previous_form {
# ============================================================
	my $self = shift;

	$self->{ state } = 'score';
	my $round        = $self->{ round };
	my $form         = $self->{ form };

	return unless( $form > 0 );
	$self->{ form }--;
}

# ============================================================
sub select_round_scores {
# ============================================================
	my $self  = shift;
	my $i     = shift;
	my $round = shift;
	my $type  = shift;

	die "Division Object Error: Bad indices when selecting rounds $!" if( $i < 0 || $i > $#{ $self->{ athletes }} );
	die "Division Object Error: Forms not defined for round $round $!" unless( exists $self->{ forms }{ $round } );
	return undef unless( exists $self->{ athletes }[ $i ]{ scores }{ $round } );

	my $scores = $self->{ athletes }[ $i ]{ scores }{ $round };
	my $forms  = $self->{ forms }{ $round };

	$scores->calculate_means( $self->{ judges } );

	my @form_indices = ( 0 .. $#$forms );
	my @selected     = grep { $forms->[ $_ ]{ type } eq $type } @form_indices;
	
	return [ map { $scores->[ $_ ] } @selected   ];
}


# ============================================================
sub select_tiebreaker_round_scores {
# ============================================================
	my $self  = shift;
	my $i     = shift;
	my $round = shift;

	return $self->select_round_scores( $i, $round, 'tiebreaker' );
}

# ============================================================
sub select_compulsory_round_scores {
# ============================================================
	my $self    = shift;
	my $i       = shift;
	my $round   = shift;

	return $self->select_round_scores( $i, $round, 'compulsory' );
}

# ============================================================
sub athletes_in_round {
# ============================================================
	my $self   = shift;
	my $option = shift;

	my $i      = undef;
	my $find   = 0;
	my $round  = $self->{ round };

	if    ( $option eq 'first'   ) { $i     =  0; }
	elsif ( $option eq 'last'    ) { $i     = -1; }
	elsif ( $option eq 'next'    ) { $find  =  1; }
	elsif ( $option eq 'prev'    ) { $find  = -1; }
	elsif ( $option eq 'prelim'  ) { $round = $option; }
	elsif ( $option eq 'semfin'  ) { $round = $option; }
	elsif ( $option eq 'finals'  ) { $round = $option; }

	$self->{ order }{ $round } ||= [];
	my @athletes_in_round = @{$self->{ order }{ $round }};

	if( defined $i ) {
		return $athletes_in_round[ $i ];

	} elsif( $find ) {
		die "Division Configuration Error: While searching for $option athlete in '$round', found no athletes assigned to '$round'" unless( int( @athletes_in_round ));
		my $j = first { $athletes_in_round[ $_ ] == $self->{ current } } ( 0 .. $#athletes_in_round );
		my $k = ($j + $find) < 0 ? $#athletes_in_round : ($j + $find) % int( @athletes_in_round );
		return $athletes_in_round[ $k ];

	} else {
		return @athletes_in_round;
	}
}

# ============================================================
sub _is_tie {
# ============================================================
# Smallest difference is 0.1 divided by 7 judges for complete
# scores, or ~0.014; so we set the tie detection threshold to
# 0.010 for convenience
# ------------------------------------------------------------
	my $comparison = shift;
	return abs( $comparison ) < 0.010;
}

# ============================================================
sub _parse_forms {
# ============================================================
# Compulsory forms are optionally labeled. Tiebreaker forms 
# must be labeled.
# ------------------------------------------------------------
	my $value = shift;

	my @rounds = map { 
		my ($round, $forms) = split /:/;
		my @forms = map { my ($name, $type) = /^([\w\s]+)(?:\s\((compulsory|tiebreaker)\))?/; { name => $name, type => $type || 'compulsory' }; } split /,\s*/, $forms;
		($round => [ @forms ]);
	} split /;/, $value;
	return { @rounds }; 
}

# ============================================================
sub _parse_places {
# ============================================================
	my $value = shift;
	my @rounds = map {
		my ($round, $list) = split /:/;
		my @places = grep { /^(?:\d+|half)$/ } split /,/, $list;
		($round => [ @places ]);
	} split /;/, $value;
	return { @rounds };
}

# ============================================================
sub _parse_placement {
# ============================================================
	my $value = shift;
	my @rounds = map {
		my ($round, $list) = split /:/;
		my @placements = grep { /^\d+$/ } split /,/, $list;
		($round => [ @placements ]);
	} split /;/, $value;
	return { @rounds };
}

1;
