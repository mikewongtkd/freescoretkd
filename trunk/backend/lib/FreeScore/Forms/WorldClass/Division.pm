package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use List::Util qw( any none first shuffle reduce );
use base qw( FreeScore::Forms::Division );
use Data::Dumper;
use strict;

our @round_order = ( qw( prelim semfin finals ) );

# ============================================================
sub assign {
# ============================================================
# Assigns the athlete to a round
# ------------------------------------------------------------
	my $self       = shift;
	my $athlete    = shift;
	my $round      = shift || $self->{ round };
	my $judges     = $self->{ judges };

	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no forms designated for round $!" unless exists $self->{ forms }{ $round };
	my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
	my $forms      = int( @compulsory );
	die "Division Configuration Error: While assigning '$athlete->{ name }' to '$round', no compulsory forms designated for round $!" unless $forms > 0;

	# Find athlete by name
	my $i = first { $self->{ athletes }[ $_ ]{ name } eq $athlete->{ name } } ( 0 .. $#{ $self->{ athletes }});

	# Do nothing if athlete is already assigned to the round
	return if( exists $athlete->{ scores }{ $round });
	return if( first { $_ == $i } @{ $self->{ order }{ $round }});

	$athlete->{ scores }{ $round } = new FreeScore::Forms::WorldClass::Division::Round();
	$athlete->{ scores }{ $round }->normalize( $forms, $judges );
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
	my $pending   = [];

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

	# ===== FILTER ATHLETES THAT HAVE SCORES STILL PENDING
	@$pending   = grep { 
		my $round_scores = $self->{ athletes }[ $_ ]{ scores }{ $round }; 
		defined $round_scores && ! $round_scores->complete() 
	} @{ $self->{ order }{ $round }};

	my $half = int( (int(@{ $self->{ athletes }}) + 1) /2 ) - 1;
	my $n    = 0;
	if( $self->{ places }{ $round }[ 0 ] eq 'half' ) { $n = $half; }
	else  { $n = reduce { $a + $b } @{ $self->{ places }{ $round }} };
	@$placement = @$placement[ 0 .. $n ];

	$self->{ pending }{ $round }   = $pending;
	$self->{ placement }{ $round } = $placement;
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

	# ===== INITIALIZE EACH ROUND IF NOT ALREADY DEFINED
	my $round = $self->{ round };
	if( defined $round ) {
		if( none { my $rounds = int(keys %{ $_->{ scores }}); $rounds > 0 } @{ $self->{ athletes }} ) {
			$self->assign( $_, $round ) foreach ( @{ $self->{ athletes }} );
		}

	} else {
		my $n        = int( @{ $self->{ athletes }} );
		my $half     = int( ($n-1)/2 );

		if    ( $n >= 20 ) { $round = 'prelim'; }
		elsif ( $n >=  8 ) { $round = 'semfin'; }
		else               { $round = 'finals'; }

		if   ( $n >= 20 )          { $self->assign( $_, 'prelim' ) foreach ( @{ $self->{ athletes }} ); }
		elsif( $n > 8 && $n < 20 ) { $self->assign( $_, 'semfin' ) foreach ( @{ $self->{ athletes }} ); }
		elsif( $n <= 8 )           { $self->assign( $_, 'finals' ) foreach ( @{ $self->{ athletes }} ); }
	}

	# ===== NORMALIZE THE SCORING MATRIX
	foreach my $athlete (@{ $self->{ athletes }}) {
		my @rounds = grep { exists $athlete->{ scores }{ $_ }; } qw( prelim semfin finals );
		foreach my $round (@rounds) {
			my $forms         = int( @{ $self->{ forms }{ $round }});

			next unless exists $athlete->{ scores }{ $round };
			foreach my $i ( 0 .. $forms ) {
				my $judge_scores = $athlete->{ scores }{ $round }[ $i ];
				$judge_scores->{ judge } = [] unless exists $judge_scores->{ judge };
				foreach my $j ( 0 .. ($self->{ judges } - 1) ) {
					next if( ref $judge_scores->{ judge }[ $j ] );
					$judge_scores->{ judge }[ $j ] = { major => undef, minor => undef, rhythm => undef, power => undef, ki => undef };
				}
			}
			$athlete->{ scores }{ $round }->normalize( $forms, $judges )
		}
	}

	$self->{ current } = $self->athletes_in_round( 'first' ) unless( $self->{ current } );
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

	$athlete->{ scores }{ $round }->record_score( $form, $judge, $score );
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
				elsif ( $key eq 'pending'   ) { $self->{ $key } = _parse_pending( $value );   }
				else                          { $self->{ $key } = $value;                     }

				$round = $self->{ round } if( defined $self->{ round } );

			} elsif( /prelim|semfin|finals/i ) {
				s/^#\s+//;
				$round = $_;
			}
		# ===== READ DIVISION ATHLETE INFORMATION
		} elsif( /^\w/ ) {
			# Store the current athlete before starting a new athlete
			if( $athlete->{ name } ) {
				push @{ $order->{ $round }}, $athlete->{ name } if( $athlete->{ name } );
				$athlete = {};
			}

			# Start a new athlete
			my ($name, $rank, $age) = split /\t/;

			$athlete->{ name }   = $name;
			$athlete->{ rank }   = $rank;
			$athlete->{ age }    = $age;
			$athlete->{ scores } = {};

			$athletes->{ $athlete->{ name } } = $athlete;

		# ===== READ DIVISION ATHLETE SCORES
		} elsif( /^\t\w/ ) {
			s/^\t//;
			my ($score_round, $form, $judge, $major, $minor, $rhythm, $power, $ki) = split /\t/;
			$major ||= 0; $minor ||= 0; $rhythm ||= 0; $power ||= 0; $ki ||= 0;
			die "Database Integrity Error: score recorded for $athlete->{ name } for $score_round round does not match context $round round\n" if $round ne $score_round;
			$self->{ rounds }{ $round } = 1;

			$form  =~ s/f//; $form  = int( $form )  - 1; die "Division Configuration Error: Invalid form index '$form' $!" unless $form >= 0;
			$judge =~ s/j//; $judge = int( $judge ) - 1; die "Division Configuration Error: Invalid judge index '$judge' $!" unless $judge >= 0;

			my $score = { major => $major, minor => $minor, rhythm => $rhythm, power => $power, ki => $ki };
			$athlete->{ scores }{ $round } = new FreeScore::Forms::WorldClass::Division::Round() unless exists $athlete->{ scores }{ $round };
			$athlete->{ scores }{ $round }->record_score( $form, $judge, $score );

		} else {
			die "Database Read Error: Unknown line type '$_'\n";
		}
	}
	if( $athlete->{ name } ) { push @{ $order->{ $round }}, $athlete->{ name }; }
	close FILE;

	# ===== AUTODETECT THE FIRST ROUND
	if( exists $order->{ 'autodetect_required' } ) {
		my $n = int( keys %$athletes );
		if    ( $n >= 20            ) { $round = 'prelim'; $order->{ 'prelim' } = $order->{ 'autodetect_required' }; }
		elsif ( $n <  20 && $n >  8 ) { $round = 'semfin'; $order->{ 'semfin' } = $order->{ 'autodetect_required' }; }
		elsif (             $n >= 8 ) { $round = 'finals'; $order->{ 'finals' } = $order->{ 'autodetect_required' }; }

		delete $order->{ 'autodetect_required' };
	}

	# ===== ESTABLISH THE ORDER BASED ON THE FIRST ROUND
	my $initial_order = {};
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $order->{ $round };
		if( keys %$initial_order ) {
			foreach my $name (@{ $order->{ $round }}) {
				push @{$self->{ order }{ $round }}, $initial_order->{ $name };
			}
		} else {
			my $i = 0;
			foreach my $name (@{ $order->{ $round }}) {
				$initial_order->{ $name } = $i;
				push @{$self->{ order }{ $round }}, $i;
				push @{ $self->{ athletes }}, $athletes->{ $name };
				$i++;
			}
		}
		last;
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
	$self->place_athletes();
	my $ties = $self->detect_ties();

	# ===== ASSIGN THE TIED ATHLETES TO A TIEBREAKER ROUND
	foreach my $tie (@$ties) {
		next unless ref $tie;
		foreach my $i (@$tie) {
			my $athlete = $self->{ athletes }[ $i ];
			$self->assign_tiebreaker( $athlete );
		}
	}

	# ===== ASSIGN THE ATHLETES TO THE NEXT ROUND
	my $n        = int( @{ $self->{ athletes }} );
	my $half     = int( ($n-1)/2 );
	my $k        = $n > 8 ? 7 : ($n - 1);
	if     ( $round eq 'semfin' && $self->round_complete( 'prelim' )) {
		# Semi-final round goes in random order
		my @order            = shuffle (@{ $self->{ placement }{ prelim }}[ 0 .. $half ]);
		my @athlete_advances = map { $self->{ athletes }[ $_ ] } @order;
		$self->assign( $_, 'semfin' ) foreach @athlete_advances;

	} elsif( $round eq 'finals' && $self->round_complete( 'semfin' )) { 
		# Finals go in reverse placement order of semi-finals
		my @order            = reverse (@{ $self->{ placement }{ semfin }}[ 0 .. $k ]);
		my @athlete_advances = map { $self->{ athletes }[ $_ ] } @order;
		$self->assign( $_, 'finals' ) foreach @athlete_advances;
	}
}

# ============================================================
sub round_complete {
# ============================================================
	my $self  = shift;
	my $round = shift || $self->{ round };

	my $forms        = $self->{ forms }{ $round };
	my @form_indices = ( 0 .. $#$forms );
	my @compulsory   = grep { $forms->[ $_ ]{ type } eq 'compulsory' } @form_indices;
	my $n            = int( @compulsory );
	my $complete     = 1;
	foreach my $athlete ($self->athletes_in_round( $round )) {
		next unless exists $athlete->{ scores }{ $round };
		$complete &&= $athlete->{ scores }{ $round }->complete( $n );
	}
	return $complete;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;
	my @criteria = qw( major minor rhythm power ki );

	$self->update_status();

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
		next unless exists $self->{ placement }{ $round } && int(@{$self->{ placement }{ $round }});
		next unless grep { /^\d+$/ } @{ $self->{ placement }{ $round }};
		push @places, "$round:" . join( ",", grep { /^\d+$/ } @{$self->{ placement }{ $round }} );
	}
	$self->{ pending } = {} unless defined $self->{ pending };
	my @pending = ();
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ pending }{ $round } && int( @{ $self->{ pending }{ $round }} );
		push @pending, "$round:" . join( ",", @{$self->{ pending }{ $round }} );
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
	print FILE "# pending=" . join( ";", @pending ) . "\n" if @pending;
	my $forms = int( split /,/, $self->{ forms } );
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ order }{ $round } && int( @{ $self->{ order }{ $round }});
		print FILE "# ------------------------------------------------------------\n";
		print FILE "# $round\n";
		print FILE "# ------------------------------------------------------------\n";
		foreach my $k (@{ $self->{ order }{ $round }}) {
			my $athlete = $self->{ athletes }[ $k ];
			print FILE join( "\t", @{ $athlete }{ qw( name rank age ) }), "\n";

			next unless exists $athlete->{ scores }{ $round };
			my $forms = $athlete->{ scores }{ $round };
			for( my $i = 0; $i <= $#$forms; $i++ ) {
				my $form = $forms->[ $i ];
				next unless exists $form->{ judge };

				my $judges = $form->{ judge };
				foreach my $j (0 .. $#$judges) {
					my $score = $judges->[ $j ];
					my @scores = map { defined $_ ? sprintf( "%.1f", $_ ) : '' } @{ $score }{ @criteria };
					printf FILE "\t" . join( "\t", $round, 'f' . ($i + 1), 'j' . ($j + 1), @scores ) . "\n";
				}
			}
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
	$self->update_status();

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
	$self->update_status();

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

	my $round     = $self->{ round };
	my $form      = $self->{ form };
	my $max_forms = $#{ $self->{ forms }{ $round }};

	return unless( $form < $max_forms );
	$self->{ form }++;
}

# ============================================================
sub previous_athlete {
# ============================================================
	my $self = shift;
	$self->{ state } = 'score';

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

	print STDERR Dumper "$self->{ athletes }[ $i ]{ name }";

	$scores->calculate_means();

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

# ============================================================
sub _parse_pending {
# ============================================================
	my $value = shift;
	my @rounds = map {
		my ($round, $list) = split /:/;
		my @pending = grep { /^\d+$/ } split /,/, $list;
		($round => [ @pending ]);
	} split /;/, $value;
	return { @rounds };
}


1;
