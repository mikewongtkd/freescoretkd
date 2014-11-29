package FreeScore::Forms::GrassRoots::Division;
use FreeScore;
use FreeScore::Forms::Division;
use base qw( FreeScore::Forms::Division );

# ============================================================
sub read {
# ============================================================
	my $self  = shift;

	my $index = 0;
	$self->{ judges } = 3; # Default value

	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			$self->{ $key } = $value;
			next;
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns = split /\t/;
		my $athlete = shift @columns;
		my $rank    = shift @columns;
		my $n       = $self->{ judges } - 1;
		my @scores  = ();
		$scores[ $_ ] = $columns[ $_ ] foreach( 0 .. $n );
		push @{ $self->{ athletes }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ] };
		$index++;
	}
	close FILE;

	$self->calculate_scores();
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self   = shift;
	my $judges = $self->{ judges };

	# ===== CALCULATE SCORES
	foreach my $athlete (@{ $self->{ athletes }}) {
		my $stats = { min => 0, max => 0, sum => 0.0 };
		my $done  = 0;
		foreach my $j (0 .. $#{ $athlete->{ scores }}) {
			my $score = $athlete->{ scores }[ $j ];
			$stats->{ sum } += $score;
			$stats->{ min }  = $score < $athlete->{ scores }[ $stats->{ min }] ? $j : $stats->{ min };
			$stats->{ max }  = $score > $athlete->{ scores }[ $stats->{ max }] ? $j : $stats->{ max };
			$done++ if( $score > 0 );
		}

		# ===== IF THE SCORES ARE ALL THE SAME, THEN THE MIN WILL EQUAL MAX, SO DIFFERENTIATE THEM
		$stats->{ max }++ if( $stats->{ min } == $stats->{ max });
		$athlete->{ complete } = ($judges == $done);

		if( $judges == 3 ) { $athlete->{ score } = $stats->{ sum }; } 
		else {
			$athlete->{ min }   = $stats->{ min };
			$athlete->{ max }   = $stats->{ max };
			$athlete->{ score } = $stats->{ sum } - ($athlete->{ scores }[ $stats->{ min }] + $athlete->{ scores }[ $stats->{ max }]);
		}
	}

	# ===== TIE DETECTION
	my @sorted = sort { $b->{ score } <=> $a->{ score } } @{ $self->{ athletes }};
	for( my $i = 0; $i < int(@sorted); $i++ ) {
		my $a = $sorted[ $i ];
		foreach my $j ( $i + 1 .. $#sorted ) {
			my $b = $sorted[ $j ];
			next unless $a->{ score } == $b->{ score };
			if( $judges > 3 ) { _resolve_ties( $a, $b, $j ); }
			else              { _mark_unresolved_ties( $a, $b, $j ); }
			$i = $j;
		}
	}
}

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $judge = shift;
	my $score = shift;

	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	$athlete->{ scores }[ $judge ] = $score;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n" if exists $self->{ description };
	foreach my $athlete (@{ $self->{ athletes }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @{ $athlete->{ scores }} ), "\n";
	}
	close FILE;
}

# ============================================================
sub _resolve_ties {
# ============================================================
	my $a = shift;
	my $b = shift;
	my $j = shift;

	# ===== BRING BACK THE HIGH SCORES
	my $ha = $a->{ scores }[ $a->{ max }];
	my $hb = $b->{ scores }[ $b->{ max }];
	if( $ha >  $hb ) { $a->{ notes } = 'H'; }
	if( $ha <  $hb ) { $b->{ notes } = 'H'; }
	if( $ha == $hb ) { _bring_back_low_scores( $a, $b, $j )};
}

# ============================================================
sub _bring_back_low_scores {
# ============================================================
	my $a = shift;
	my $b = shift;
	my $j = shift;

	my $la = $a->{ scores }[ $a->{ min }];
	my $lb = $b->{ scores }[ $b->{ min }];
	if( $la == $lb ) { _mark_unresolved_ties( $a, $b, $j ); }
	if( $la >  $lb ) { $a->{ notes } = 'L'; }
	if( $la <  $lb ) { $b->{ notes } = 'L'; }
}

# ============================================================
sub _mark_unresolved_ties {
# ============================================================
	my $a = shift;
	my $b = shift;
	my $j = shift;

	$a->{ notes } = 'TB'; 
	$b->{ notes } = 'TB'; 
	push @{ $a->{ tied }}, $j; 
}

1;

