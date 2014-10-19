package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use FreeScore::Forms::WorldClass::Division::Round::Score;
use base qw( FreeScore::Forms::Division );

our @round_order = ( qw( prelim pre-tb semfin sem-tb finals fin-tb ) );

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

	$score = new FreeScore::Forms::WorldClass::Division::Round::Score( {%$score} );
	my $i = $self->{ current };
	my $j = $self->{ round };
	my $k = $self->{ form };

	$self->{ athletes }[ $i ]{ scores }{ $j }[ $k ]{ judge }[ $judge ] = $score;
	$self->update_status();
}

# ============================================================
sub read {
# ============================================================
	my $self  = shift;

	my $athlete = {};
	my $table   = { max_rounds => {}, max_forms => 0, max_judges => 0 };
	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			if( $key eq 'forms' ) { $self->{ $key } = _parse_forms( $value ); }
			else                  { $self->{ $key } = $value;                 }
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
			$table->{ max_rounds }{ $round }++;
			$table->{ max_forms }  = $table->{ max_forms }  > $form  ? $table->{ max_forms }  : $form;
			$table->{ max_judges } = $table->{ max_judges } > $judge ? $table->{ max_judges } : $judge;
			$form  =~ s/f//; $form  = int( $form )  - 1;
			$judge =~ s/j//; $judge = int( $judge ) - 1;

			$athlete->{ scores }{ $round }[ $form ] = { judge => [] } unless exists $athlete->{ scores }{ $round }[ $form ]{ judge };
			$athlete->{ scores }{ $round }[ $form ]{ judge }[ $judge ] = { major => $major, minor => $minor, rhythm => $rhythm, power => $power, ki => $ki };

		} else {
			die "Unknown line type '$_'\n";
		}
	}
	push @{ $self->{ athletes }}, $athlete if( $athlete->{ name } );
	close FILE;

	# ===== COMPLETE THE TABLE OF SCORES
	$table->{ max_judges } = $self->{ judges } if( exists $self->{ judges } );
	$table->{ max_rounds } = [ grep { exists $table->{ max_rounds }{ $_ } } @FreeScore::Forms::WorldClass::Division::round_order ];
	foreach my $athlete (@{ $self->{ athletes }}) {
		foreach my $round (@{ $table->{ max_rounds }}) {
			foreach my $i ( 0 .. $table->{ max_forms } ) {
				my $judge_scores = $athlete->{ scores }{ $round }[ $i ];
				$judge_scores->{ judge } = [] unless exists $judge_scores->{ judge };
				foreach my $j ( 0 .. $table->{ max_judges } ) {
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

	# ===== ORGANIZE ATHLETES BY ROUND
	my $tie        = 0; # a constant representing a tie
	my $completed  = {};
	my $k          = int( @ { $self->{ athletes }});
	my $placement  = {};
	my $tied       = {};
	ROUND: foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {

		# ===== SORT THE ATHLETES AND DETECT TIES
		my @unsorted = ( 0 .. $#{ $self->{ athletes }} );
		@{ $placement->{ $round }} = sort { 
			my $x = exists $self->{ athletes }[ $a ]{ scores }{ $round } ? $self->{ athletes }[ $a ]{ scores }{ $round } : undef;
			my $y = exists $self->{ athletes }[ $b ]{ scores }{ $round } ? $self->{ athletes }[ $b ]{ scores }{ $round } : undef;
			Forms::WorldClass::Division::Round::_compare( $x, $y ); 
		} @unsorted;
		my $i = 0;
		while( $i < $k ) {
			my $a = $placement->{ $round }[ $i ];
			my $x = exists $self->{ athletes }[ $a ]{ scores }{ $round } ? $self->{ athletes }[ $a ]{ scores }{ $round } : undef;
			my $j = $i + 1;
			while( $j < $k ) {
				my $b = $placement->{ $round }[ $j ];
				my $y = exists $self->{ athletes }[ $b ]{ scores }{ $round } ? $self->{ athletes }[ $b ]{ scores }{ $round } : undef;
				last unless Forms::WorldClass::Division::Round::_compare( $x, $y ) == $tie;
				push @{ $tied->{ $round }{ $i }}, $j; 
				$j++;
			}
			$i = $j;
		}

		# ===== PRELIMINARY ROUND FOR 20 OR MORE ATHLETES
		# Assign all athletes to the preliminary round, if not already assigned
		if( $round eq 'prelim' ) {
			if( $k >= 20 ) {
				foreach my $athlete (@{ $self->{ athletes }} ) { $athlete->{ scores }{ $round } = [] unless exists $athlete->{ scores }{ $round }; }
				next ROUND;
			}
		}

		# ===== PRELIMINARY TIE-BREAKERS
		# Assign players to a tie-breaker round unless there's enough places for top half.
		if( $round eq 'pre-tb' ) {
			my $assigned = $athletes->{ 'prelim' };
			my $ties     = $tied->{ 'prelim' };
			my $order    = $placement->{ 'prelim' }; # Maps placement to athlete index (e.g. 1st place -> Athlete #3, 2nd place -> Athlete #1, etc.)
			my $n        = int( @{ $assigned } );
			my $half     = int( ($n+1)/2 );

			# Count number of places needed
			my $places_needed = 0;
			while( $places_needed < $half ) {
				$places_needed++;
				next unless exists $ties->{ $places_needed };
				my $num_ties = int( @{ $ties->{ $places_needed }} );

				# Deal with ties that cross the number of available places (e.g. 3 ties for 19th place out of 20 available places; 2 of 3 ties will advance)
				if( $places_needed + $num_ties > $half ) {
					my @athletes = map { my $i = $order->[ $_ ]; $self->{ athletes }[ $i ]; } ($places_needed, @{ $ties->{ $places_needed }});
					foreach my $athlete (@athletes) {
						$athlete->{ scores }{ $round } = [] unless exists $athlete->{ scores }{ $round };
					}
				} else {
					# Discard ties that are comfortably below the top half athletes
					delete $ties->{ $places_needed };
				}
				$places_needed += $num_ties;
			}
			# Discard ties that are beyond the top half athletes
			while( $places_needed < $n ) {
				delete $ties->{ $places_needed } if exists $ties->{ $places_needed };
				$places_needed++;
			}

			next ROUND;
		}

		# ===== SEMI-FINALS ROUND
		# Assign all athletes to the preliminary round, if not already assigned
		if( $round eq 'semfin' ) {
			if(($k > 8 && $k < 20)) {
				foreach my $athlete (@{ $self->{ athletes }} ) { $athlete->{ scores }{ $round } = [] unless exists $athlete->{ scores }{ $round }; }
				next ROUND;

			} elsif( $completed->{ 'prelim' } && $completed->{ 'pre-tb' } ) {
				# TODO USE TIE-BREAKER RESULTS TO RESOLVE TIES IN THE PRELIMINARY ROUND
				my ($i) = keys %{ $tied->{ 'prelim' }};
				my @tied = ($i, @{ $tied->{ 'prelim' }{ $i }});
			}
		}

		# ===== ASSESS IF ROUND HAS BEEN COMPLETED
		# Note that the assessment has to be after initialization; rounds that
		# have no athletes are automatically completed.
		my $complete = 1;
		foreach my $athlete (@{$self->{ athletes }}) {
			next unless exists $athlete->{ scores }{ $round };
			$complete &&= $athlete->{ scores }{ $round }->complete();
		}
		$completed->{ $round } = $complete;
	}
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;
	my @criteria = qw( major minor rhythm power ki );

	# ===== COLLECT THE FORM NAMES TOGETHER PROPERLY
	my @forms = ();
	foreach my $round (@FreeScore::Forms::WorldClass::Division::round_order) {
		next unless exists $self->{ forms }{ $round };
		push @forms, "$round:" . join( ",", @{$self->{ forms }{ $round }} );
	}

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# form=$self->{ form }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# description=$self->{ description }\n";
	print FILE "# forms=" . join( ";", @forms ) . "\n";
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
					printf FILE "\t%s\tf%d\tj%d\t%.1f\t%.1f\t%.1f\t%.1f\t%.1f\n", $round, $i + 1, $j + 1, @{ $score }{ @criteria } if $score->complete();
				}
			}
		}
	}
	close FILE;
}

# ============================================================
sub next {
# ============================================================
	my $self = shift;
	$self->{ state } = 'score';

	my $round        = $self->{ round };
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
sub _parse_forms {
# ============================================================
	my $value = shift;

	my @rounds = map { 
		my ($round, $forms) = split /:/;
		my @forms = split /,/, $forms;
		$round => [ @forms ];
	} split /;/, $value;
	return { @rounds }; 
}

# ============================================================
sub _compare {
# ============================================================
}

1;
