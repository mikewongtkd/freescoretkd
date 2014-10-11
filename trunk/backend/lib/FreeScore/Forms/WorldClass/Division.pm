package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use FreeScore::Forms::WorldClass::Division::Round;
use base qw( FreeScore::Forms::Division );
use Data::Dumper;

our @criteria = qw( major minor rhythm power ki );
our @round_order = ( qw( Preliminary Semi-Finals Finals Tiebreaker-1st Tiebreaker-2nd Tiebreaker-3rd ) );

# ============================================================
sub get_only {
# ============================================================
	my $self  = shift;
	my $judge = shift;

	delete $self->{ results };
	foreach my $athlete (@{ $self->{ athletes }}) {
		my $scores = [];
		my $forms  = [];
		my $round  = $athlete->{ scores }{ $self->{ round } };
		foreach my $form (@$round) {
			my $score = $form->[ $judge ];
			push @{$scores }, $score;
			push $forms, { accuracy => $score->accuracy(), presentation => $score->presentation() };
		}
		$athlete->{ scores } = $scores;
		$athlete->{ forms  } = $forms;
	}
}

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $judge = shift;
	my $score = shift;

	my $i = $self->{ current };
	my $j = $self->{ round };
	my $k = $self->{ form };

	$self->{ athletes }[ $i ]{ scores }{ $j }[ $k ][ $judge ] = $score;
}

# ============================================================
sub read {
# ============================================================
	my $self  = shift;

	my $athlete = {};
	my $table   = { rounds => {}, forms => 0, judges => 0 };
	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			$self->{ $key } = $value;
			if( $key eq 'forms' ) { $self->{ $key } = [ split /,/, $value ]; }
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
			$table->{ rounds }{ $round }++;
			$table->{ forms }  = $table->{ forms }  > $form  ? $table->{ forms }  : $form;
			$table->{ judges } = $table->{ judges } > $judge ? $table->{ judges } : $judge;
			$form  =~ s/f//; $form  = int( $form )  - 1;
			$judge =~ s/j//; $judge = int( $judge ) - 1;

			$athlete->{ scores }{ $round }[ $form ][ $judge ] = { major => $major, minor => $minor, rhythm => $rhythm, power => $power, ki => $ki };
		}
	}
	push @{ $self->{ athletes }}, $athlete if( $athlete->{ name } );
	close FILE;

	# ===== COMPLETE THE TABLE OF SCORES
	$table->{ judges } = $self->{ judges } if( exists $self->{ judges } );
	$table->{ rounds } = [ grep { exists $table->{ rounds }{ $_ } } @round_order ];
	foreach my $athlete (@{ $self->{ athletes }}) {
		foreach my $round (@{ $table->{ rounds }}) {
			foreach my $i ( 0 .. $table->{ forms } ) {
				my $scores = $athlete->{ scores }{ $round }[ $i ];
				foreach my $j ( 0 .. $table->{ judges } ) {
					next if( ref $scores->[ $j ] );
					$scores->[ $j ] = { major => -1.0, minor => -1.0, rhythm => -1.0, power => -1.0, ki => -1.0 };
				}
			}
			$athlete->{ scores }{ $round } = new FreeScore::Forms::WorldClass::Division::Round( $athlete->{ scores }{ $round } );
		}
	}
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# form=$self->{ form }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# forms=" . join( ",", @{$self->{ forms }}) . "\n";
	my $forms = int( split /,/, $self->{ forms } );
	foreach my $athlete (@{ $self->{ athletes }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank age ) }), "\n";

		foreach my $round (@round_order) {
			next unless exists $athlete->{ scores }{ $round };
			my $forms = $athlete->{ scores }{ $round };
			for( my $i = 0; $i < $#$forms; $i++ ) {
				my $judges = $forms->[ $i ];
				foreach my $j (0 .. $#$judges) {
					my $score = $judges->[ $j ];
					printf FILE "\t%s\tf%d\tj%d\t%.1f\t%.1f\t%.1f\t%.1f\t%.1f\n", $round, $i + 1, $score->{ judge } + 1, @{ $score }{ @criteria } if $score->valid;
				}
			}
		}
	}
	close FILE;
}

# ============================================================
sub next_round {
# ============================================================
	my $self  = shift;
	my $round = shift;
	my $cut   = shift;

	my @athletes = ();
	foreach my $athlete (@{ $self->{ athletes }}) {
		push @athletes, $athlete_copy;
	}

	# ===== IN CASE OF TIE-BREAKER, PUT THE TIED ATHLETES INTO A NEW ROUND
	if( defined $self->{ tiebreaker } ) {
		@athletes = @{ $self->{ tiebreaker }};

	# ===== TAKE THE TOP ATHLETES THAT MAKE THE CUT
	} else {
		@athletes = sort { 
			($a_mean, $a_presentation, $a_total) = _mean_score( $b->{ scores } );
			($b_mean, $b_presentation, $b_total) = _mean_score( $a->{ scores } );

			$a_mean         <=> $b_mean         ||
			$a_presentation <=> $b_presentation ||
			$a_total        <=> $b_total

		} @athletes;
		@athletes = splice( @athletes, 0, $cut );
	}
	$copy->{ athletes } = [ @athletes ];

	return $copy;
}

# ============================================================
sub next {
# ============================================================
	my $self = shift;
	$self->{ state } = 'score';

	my $form  = $self->{ form };
	my $max   = $#{ $self->{ forms }};

	if( $form < $max ) {
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

	my $form         = $self->{ form };
	my $max_forms    = $#{ $self->{ forms }};
	my $previous     = ($self->{ current } - 1);
	my $max_athletes = $#{ $self->{ forms }};

	if( $form > 0 ) {
		$self->{ form }--;
	} else {
		$self->{ current } = $previous >= 0 ? $previous: $max_athletes;
		$self->{ form }    = $max_forms;
	}
}

# ============================================================
sub _mean_score {
# ============================================================
	my $scores   = shift;
	my $min      = { accuracy => undef, presentation => undef };
	my $max      = { accuracy => undef, presentation => undef };
	my $total    = { score => 0.0, presentation => 0.0, adjusted => 0.0 };
	my $judges   = 1;

	foreach my $form (@$scores) {
		$judges = int( @$form );
		foreach my $judge_score (@$form) {
			my $penalties = $judge_score->{ minor } + $judge_score->{ major };
			my $accuracy  = $penalties > 4.0 ? 0.0 : 4.0 - $penalties;
			$min->{ accuracy } = (! defined $min->{ accuracy }) || ($min->{ accuracy } > $accuracy) ? $accuracy : $min->{ accuracy };
			$max->{ accuracy } = (! defined $max->{ accuracy }) || ($max->{ accuracy } < $accuracy) ? $accuracy : $max->{ accuracy };

			my $presentation = $judge_score->{ rhythm } + $judge_score->{ power } + $judge_score->{ ki };
			$min->{ presentation } = (! defined $min->{ presentation }) || ($min->{ presentation } > $presentation) ? $presentation : $min->{ presentation };
			$max->{ presentation } = (! defined $max->{ presentation }) || ($max->{ presentation } < $presentation) ? $presentation : $max->{ presentation };

			$total->{ score } += $accuracy + $presentation;
			$total->{ presentation } += $presentation;
		}
		my $dropped = {
			accuracy     => $judges > 3 ? ($min->{ accuracy }     + $max->{ accuracy }    ) : 0.0,
			presentation => $judges > 3 ? ($min->{ presentation } + $max->{ presentation }) : 0.0,
		};
		$total->{ adjusted }     += $total->{ score } - ($dropped->{ accuracy } + $dropped->{ presentation });
		$total->{ presentation } += $presentation   - $dropped->{ presentation };
	}

	return (($adjusted/$judges), $total->{ presentation }, $total->{ score });
}

1;
