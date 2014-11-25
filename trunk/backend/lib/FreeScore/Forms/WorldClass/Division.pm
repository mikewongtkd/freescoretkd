package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use base qw( FreeScore::Forms::Division );

our @round_order = ( qw( prelim semfin finals ) );

# ============================================================
sub assign {
# ============================================================
# Assigns the athlete to a round; if the athlete is already 
# assigned to the round this function does nothing.
# ------------------------------------------------------------
	my $self    = shift;
	my $athlete = shift;
	my $round   = shift || $self->{ round };
	my $judges  = $self->{ judges };
	my $forms   = 0;

	if( exists $self->{ forms }{ $round } ) {
		my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
		$forms = int( @compulsory );
	}

	return if exists $athlete->{ scores }{ $round };
	$athlete->{ scores }{ $round } = new FreeScore::Forms::WorldClass::Division::Round( [], $forms, $judges );
}

# ============================================================
sub assign_tiebreaker {
# ============================================================
# Assigns the athlete to a tiebreaker round; if the athlete is already assigned
# to a tiebreaker round this function does nothing.
# ------------------------------------------------------------
	my $self    = shift;
	my $athlete = shift;
	my $round   = shift || $self->{ round };
	my $judges  = $self->{ judges };

	if( exists $self->{ forms }{ $round } ) {
		my @compulsory = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
		my @tiebreaker = grep { $_->{ type } eq 'tiebreaker' } @{ $self->{ forms }{ $round }};
		my $start = int( @compulsory );
		my $stop  = int( @compulsory ) + int( @tiebreaker ) - 1;
		for my $i ($start .. $stop) {
			$athlete->{ scores }{ $round }->add_tiebreaker( $judges, $start, $stop );
		}
	}
}

# ============================================================
sub place_athletes {
# ============================================================
	my $self      = shift;
	my $round     = $self->{ round };
	my $placement = [];

	# ===== PLACE ATHLETES
	my @athlete_indices = ( 0 .. $#{ $self->{ athletes }} );
	my $scores = [ map {
		my $compulsory = $self->select_compulsory_round_scores( $_, $round );
		my $tiebreaker = $self->select_tiebreaker_round_scores( $_, $round );
		{ compulsory => $compulsory, tiebreaker => $tiebreaker }
	} @athlete_indices ];

	@$placement = sort { 
		# ===== COMPARE BY COMPULSORY ROUND SCORES
		my $x = $scores->[ $a ]{ compulsory };
		my $y = $scores->[ $b ]{ compulsory };
		my $comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ); 

		# ===== COMPARE BY TIE-BREAKERS IF TIED
		if( _is_tie( $comparison )) {
			my $x = $scores->[ $a ]{ tiebreaker };
			my $y = $scores->[ $b ]{ tiebreaker };
			$comparison = FreeScore::Forms::WorldClass::Division::Round::_compare( $x, $y ); 
		}

		$comparison;
	} @athlete_indices;

	@$placement = grep { $self->{ athletes }[ $_ ]{ scores }{ $round }->complete() } @$placement;

	$self->{ placement }{ $round } = $placement;

	return $placement;
}

# ============================================================
sub detect_ties {
# ============================================================
	my $self      = shift;
	my $placement = shift;
	my $ties      = [];
	my $round     = $self->{ round };

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
	my $places   = $self->{ places };
	my $i        = 0;
	my $medals   = $places->[ $i ];
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
		$medals += $places->[ $i ];
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
			$form->{ judge } = [ $form->{ judge }[ $judge ] ];
		}
	}
}

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $judge = shift;
	my $score = shift;

	$score = new FreeScore::Forms::WorldClass::Division::Round::Score({ %$score });
	my $i = $self->{ current };
	my $j = $self->{ round };
	my $k = $self->{ form };

	$self->{ athletes }[ $i ]{ scores }{ $j }[ $k ]{ judge }[ $judge ] = $score;
}

# ============================================================
sub read {
# ============================================================
	my $self  = shift;

	# ===== DEFAULTS
	$self->{ state }   = 'score';
	$self->{ current } = 0;
	$self->{ round }   = 'finals';

	my $athlete = {};
	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			if    ( $key eq 'forms'     ) { $self->{ $key } = _parse_forms( $value );     }
			elsif ( $key eq 'placement' ) { $self->{ $key } = _parse_placement( $value ); }
			else                          { $self->{ $key } = $value;                     }
			next;

		# ===== READ DIVISION ATHLETE INFORMATION
		} elsif( /^\w/ ) {
			if( $athlete->{ name } ) {
				push @{ $self->{ athletes }}, $athlete;
				$athlete = {};
			}

			my ($name, $rank, $age) = split /\t/;

			$athlete->{ name }   = $name;
			$athlete->{ rank }   = $rank;
			$athlete->{ age }    = $age;
			$athlete->{ scores } = {};

		# ===== READ DIVISION ATHLETE SCORES
		} elsif( /^\t/ ) {
			s/^\t//;
			my ($round, $form, $judge, $major, $minor, $rhythm, $power, $ki) = split /\t/;
			$self->{ rounds }{ $round } = 1;

			$form  =~ s/f//; $form  = int( $form )  - 1;
			$judge =~ s/j//; $judge = int( $judge ) - 1;

			$athlete->{ scores }{ $round }[ $form ] = { judge => [] } unless exists $athlete->{ scores }{ $round }[ $form ]{ judge };
			$athlete->{ scores }{ $round }[ $form ]{ judge }[ $judge ] = { judge => $judge, major => $major, minor => $minor, rhythm => $rhythm, power => $power, ki => $ki };

		} else {
			die "Unknown line type '$_'\n";
		}
	}
	push @{ $self->{ athletes }}, $athlete if( $athlete->{ name } );
	close FILE;

	# ===== INITIALIZE EACH ROUND (IF NOT ALREADY INITIALIZED)
	my @rounds = ();
	ROUND_SETUP: {
		my $round    = local $_ = $self->{ round };
		my $n        = int( @{ $self->{ athletes }} );
		my $half     = int( ($n+1)/2);

		push @rounds, 'prelim' if $n >= 20;
		push @rounds, 'semfin' if $n >  8;
		push @rounds, 'finals';

		if     ( /^prelim$/ ) { 
			last ROUND_SETUP unless $n >= 20;
			$self->assign( $_ ) foreach ( @{ $self->{ athletes }} );
			$self->{ places } = [ $half ];

		} elsif( /^semfin$/ ) {
			last ROUND_SETUP unless $n > 8 && $n < 20;
			$self->assign( $_ ) foreach ( @{ $self->{ athletes }} );
			$self->{ places } = [ 8 ];

		} elsif( /^finals$/ ) {
			last ROUND_SETUP unless $n <= 8;
			$self->assign( $_ ) foreach ( @{ $self->{ athletes }} );
			$self->{ places } = [ 1, 1, 2 ];
		}
	}

	# ===== COMPLETE THE TABLE OF SCORES
	foreach my $athlete (@{ $self->{ athletes }}) {
		foreach my $round (@rounds) {
			my @compulsory    = grep { $_->{ type } eq 'compulsory' } @{ $self->{ forms }{ $round }};
			my $athlete_forms = $#{ $athlete->{ scores }{ $round }};
			my $forms         = $#compulsory > $athlete_forms ? $#compulsory : $athlete_forms;

			foreach my $i ( 0 .. $forms ) {
				my $judge_scores = $athlete->{ scores }{ $round }[ $i ];
				$judge_scores->{ judge } = [] unless exists $judge_scores->{ judge };
				foreach my $j ( 0 .. ($self->{ judges } - 1) ) {
					next if( ref $judge_scores->{ judge }[ $j ] );
					$judge_scores->{ judge }[ $j ] = { major => undef, minor => undef, rhythm => undef, power => undef, ki => undef };
				}
			}
			$athlete->{ scores }{ $round } = new FreeScore::Forms::WorldClass::Division::Round( $athlete->{ scores }{ $round } );
		}
	}
}

# ============================================================
sub update_status {
# ============================================================
	my $self  = shift;
	my $round = $self->{ round };

	# ==== SKIP STATUS UPDATE UNLESS ROUND IS NOT INITIALIZED OR ROUND IS COMPLETE
	# This avoids unnecessary processing

	# ===== SORT THE ATHLETES TO THEIR PLACES (1st, 2nd, etc.) AND DETECT TIES
	my $placement = $self->place_athletes();
	my $ties      = $self->detect_ties( $placement );

	# ===== ASSIGN THE TIED ATHLETES TO A TIEBREAKER ROUND
	foreach my $tie (@$ties) {
		next unless ref $tie;
		foreach my $i (@$tie) {
			my $athlete = $self->{ athletes }[ $i ];
			$self->assign_tiebreaker( $athlete );
		}
	}

	return $placement;
}

# ============================================================
sub round_complete {
# ============================================================
	my $self  = shift;
	my $round = shift;

	my $complete = 1;
	foreach my $athlete (@{$self->{ athletes }}) {
		next unless exists $athlete->{ scores }{ $round };
		$complete &&= $athlete->{ scores }{ $round }->complete();
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

	# ===== PREPARE THE PLACEMENTS
	$self->{ placement } = {} unless defined $self->{ placement };
	my @places = ();
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ placement }{ $round };
		push @places, "$round:" . join( ",", @{$self->{ placement }{ $round }} );
	}

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# form=$self->{ form }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n";
	print FILE "# forms=" . join( ";", @forms ) . "\n";
	print FILE "# placement=" . join( ";", @places ) . "\n";
	my $forms = int( split /,/, $self->{ forms } );
	foreach my $athlete (@{ $self->{ athletes }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank age ) }), "\n";

		foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
			next unless exists $athlete->{ scores }{ $round };
			my $forms = $athlete->{ scores }{ $round };
			for( my $i = 0; $i <= $#$forms; $i++ ) {
				my $form   = $forms->[ $i ];
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
sub next_round {
# ============================================================
	my $self   = shift;
	my @rounds = @FreeScore::Forms::WorldClass::Division::round_order;
	my @i      = (0 .. $#rounds);
	my ($i)    = grep { $self->{ round } eq $rounds[ $_ ] } @i;
	if( $i == $#rounds ) { $i = 0; }
	else { $i++; }

	$self->{ round } = $rounds[ $i ];
}

# ============================================================
sub previous_round {
# ============================================================
	my $self   = shift;
	my @rounds = @FreeScore::Forms::WorldClass::Division::round_order;
	my @i      = (0 .. $#rounds);
	my ($i)    = grep { $self->{ round } eq $rounds[ $_ ] } @i;
	if( $i == 0 ) { $i = $#rounds; }
	else { $i--; }

	$self->{ round } = $rounds[ $i ];
}


# ============================================================
sub next {
# ============================================================
	my $self = shift;
	$self->{ state } = 'score';

	my $round     = $self->{ round };
	my $form      = $self->{ form };
	my $max_forms = $#{ $self->{ forms }{ $round }};

	if( $form < $max_forms ) {
		$self->{ form }++;
	} else {
		$self->{ current } = ($self->{ current } + 1) % int( @{ $self->{ athletes }});
		$self->{ form } = 0;
	}
}

# ============================================================
sub previous {
# ============================================================
	my $self = shift;
	$self->{ state } = 'score';

	my $round        = $self->{ round };
	my $form         = $self->{ form };
	my $max_forms    = $#{ $self->{ forms }{ $round }};
	my $previous     = ($self->{ current } - 1);
	my $max_athletes = $#{ $self->{ athletes }};

	if( $form > 0 ) {
		$self->{ form }--;
	} else {
		$self->{ current } = $previous >= 0 ? $previous: $max_athletes;
		$self->{ form }    = $max_forms;
	}
}

# ============================================================
sub select_tiebreaker_round_scores {
# ============================================================
	my $self    = shift;
	my $i       = shift;
	my $round   = shift;

	die "Bad indices when selecting rounds $!" if( $i < 0 || $i > $#{ $self->{ athletes }} );
	die "Forms not defined for round $round $!" unless( exists $self->{ forms }{ $round } );
	return undef unless( exists $self->{ athletes }[ $i ]{ scores }{ $round } );

	my $scores = $self->{ athletes }[ $i ]{ scores }{ $round };
	my $forms   = $self->{ forms }{ $round };

	$scores->calculate_means();

	my @form_indices = ( 0 .. $#$forms );
	my @tiebreaker   = grep { $forms->[ $_ ]{ type } eq 'tiebreaker' } @form_indices;
	
	return [ map { $scores->[ $_ ] } @tiebreaker ];
}

# ============================================================
sub select_compulsory_round_scores {
# ============================================================
	my $self    = shift;
	my $i       = shift;
	my $round   = shift;

	die "Bad indices when selecting rounds $!" if( $i < 0 || $i > $#{ $self->{ athletes }} );
	die "Forms not defined for round $round $!" unless( exists $self->{ forms }{ $round } );
	return undef unless( exists $self->{ athletes }[ $i ]{ scores }{ $round } );

	my $scores = $self->{ athletes }[ $i ]{ scores }{ $round };
	my $forms   = $self->{ forms }{ $round };

	$scores->calculate_means();

	my @form_indices = ( 0 .. $#$forms );
	my @compulsory   = grep { $forms->[ $_ ]{ type } eq 'compulsory' } @form_indices;
	
	return [ map { $scores->[ $_ ] } @compulsory ];
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
		my @forms = map { my ($name, $type) = /^([\w\s]+)(?:\s\((compulsory|tiebreaker)\))?/; { name => $name, type => $type || 'compulsory' }; } split /,\s?/, $forms;
		$round => [ @forms ];
	} split /;/, $value;
	return { @rounds }; 
}

# ============================================================
sub _parse_placement {
# ============================================================
	my $value = shift;
	my @rounds = map {
		my ($round, $list) = split /:/;
		my @placements = split /,/, $list;
		$round => [ @placements ];
	} split /;/, $value;
	return { @rounds };
}

1;
