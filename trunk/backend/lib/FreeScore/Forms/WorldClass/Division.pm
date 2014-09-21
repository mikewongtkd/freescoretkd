package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use base qw( FreeScore::Forms::Division );
use Data::Dumper;

our @criteria = qw( major minor rhythm power ki );

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $judge = shift;
	my $score = shift;

	my $i = $self->{ current };
	my $j = $self->{ form } - 1;

	$self->{ athletes }[ $i ]{ scores }[ $j ][ $judge ] = $score;
}

# ============================================================
sub read {
# ============================================================
	my $self  = shift;
	my $index = 0;
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
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns  = split /\t/;
		my $athlete  = shift @columns;
		my $rank     = shift @columns;
		my @scores   = ();
		while( @columns ) {
			my $form_scores = shift @columns || undef;
			if( defined $form_scores ) {
				my @judge_scores = split /;/, $form_scores;
				my $score = [];
				foreach my $judge_score (@judge_scores) {
					my $individual_score = {};
					@{$individual_score}{ @criteria } = map { sprintf "%.1f", $_; } split /\//, $judge_score;
					push @$score, $individual_score;
				}
				push @scores, $score;

			} else {
				push @scores, [];
			}
		}
		push @{ $self->{ athletes }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ] };
		$index++;
	}
	close FILE;
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
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# forms=" . join( ",", @{$self->{ forms }}) . "\n";
	my $forms = int( split /,/, $self->{ forms } );
	foreach my $athlete (@{ $self->{ athletes }}) {
		my $scores = $athlete->{ scores };
		my @scores = ();
		foreach my $judge_scores (@$scores) {
			my @judge_scores = ();
			foreach my $judge_score (@$judge_scores) {
				push @judge_scores, join( "/", (map { $judge_score->{ $_ }; } @criteria));
			}
			push @scores, join( ";", @judge_scores );
		}
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @scores), "\n";
	}
	close FILE;
}

# ============================================================
sub next_round {
# ============================================================
	my $self  = shift;
	my $round = shift;
	my $cut   = shift;
	my $copy  = {};

	foreach my $key (keys %$self) {
		next if( $key =~ /^athletes|forms?|name|file$/ );
		$copy->{ $key } = $self->{ $key };
	}
	$copy->{ name }  = "$self->{ name }." . lc( $round );
	$copy->{ file }  = "$self->{ path }/div.$copy->{ name }..txt";
	$copy->{ form }  = 0;
	$copy->{ forms } = [ @{ $self->{ forms }} ];
	$copy->{ round } = $round;

	my @athletes = ();
	foreach my $athlete (@{ $self->{ athletes }}) {
		my $athlete_copy = _clone_athlete( $athlete );
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

# ============================================================
sub _clone_athlete {
# ============================================================
	my $athlete = shift;
	my @scores = ();
	my $scores = $athlete->{ scores };
	foreach my $judge_scores (@$scores) {
		my @judge_scores = ();
		foreach my $judge_score (@$judge_scores) {
			push @judge_scores, {(map { $_ => $judge_score->{ $_ }; } @criteria)};
		}
		push @scores, [ @judge_scores ];
	}
	my $athlete_copy = { %$athlete };
	$athlete_copy->{ scores } = [ @scores ];
	return $athlete_copy;
}

1;
