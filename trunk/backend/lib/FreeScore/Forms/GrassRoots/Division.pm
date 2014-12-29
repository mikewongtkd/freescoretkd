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
	$self->{ places } = [ { place => 1, medals => 1 }, { place => 2, medals => 1 }, { place => 3, medals => 2 } ];

	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			if      ( $key eq 'placements' ) { $self->{ $key } = [ split( /,/, $value ) ]; } 
			elsif   ( $key eq 'tied' ) {} # Do nothing; better to calculate this fresh
			elsif ( $key eq 'places' ) {
				my $places = [];
				foreach my $entry (split /,/, $value) {
					my ($place, $medals) = split /:/, $entry;
					push @$places, { place => $place, medals => $medals };
				}
				$self->{ $key } = $places;
 
			} else { $self->{ $key } = $value; }
			next;
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns   = split /\t/;
		my $athlete   = shift @columns;
		my $rank      = shift @columns;
		my $n         = $self->{ judges } - 1;
		my @scores    = ();
		my @tb_scores = ();
		foreach ( 0 .. $n ) { push @scores,    shift @columns; }
		foreach ( 0 .. $n ) { push @tb_scores, shift @columns; }
		push @{ $self->{ athletes }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ], tiebreakers => [ @tb_scores ] };
		$index++;
	}
	close FILE;

	$self->calculate_scores();
	$self->calculate_placements();
}

# ============================================================
sub calculate_placements {
# ============================================================
	my $self       = shift;
	my $n          = $self->{ judges };
	my @sorted     = sort { my $x = $self->{ athletes }[ $a ]; my $y = $self->{ athletes }[ $b ]; _compare( $x, $y, $n ); } ( 0 .. $#{ $self->{ athletes }});
	my $tied       = [];
	my $placements = [];
	my $places     = [ @{ $self->{ places }} ];

	# ===== CALCULATE TIES
	for( my $i = 0; $i < $#sorted; $i++ ) {
		my $a = $sorted[ $i ];
		my $x = $self->{ athletes }[ $a ];

		push @$placements, $a;
		my $place_ties = { place => $i + 1, tied => [ $a ] };
		for( my $j = ($i + 1); $j <= $#sorted; $j++ ) {
			my $b = $sorted[ $j ];
			my $y = $self->{ athletes }[ $b ];
			last unless _compare( $x, $y, $n ) == 0;

			push @$placements, $b;
			push @{ $place_ties->{ tied }}, $b;
			$i = $j;
		}

		my $ties = $#{ $place_ties->{ tied }};
		push @$tied, $place_ties if($#{ $place_ties->{ tied }});
	}

	# ===== FILTER UNIMPORTANT TIES
	@$tied = grep {
		my $tie = $_;
		my ($place) = grep { $_->{ place } == $tie->{ place } } @$places;
		if( ! defined $place ) { (); }
		elsif( $place->{ medals } < int( @{ $tie->{ tied }} )) { $tie; }
		else { (); }
	} @$tied;

	if( $self->{ complete } ) {
		if( @$tied ) { $self->{ tied }       = $tied;       } # Complete, unresolved
		else         { $self->{ placements } = $placements; } # Complete, resolved
	}
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self     = shift;
	my $judges   = $self->{ judges };
	my $complete = 1;

	foreach my $athlete (@{ $self->{ athletes }}) {
		my $stats = { min => 0, max => 0, sum => 0.0, tb => 0.0 };
		my $done  = 0;

		# ===== CALCULATE SCORES
		foreach my $j (0 .. $#{ $athlete->{ scores }}) {
			my $score = $athlete->{ scores }[ $j ];
			$stats->{ sum } += $score;
			$stats->{ min }  = $score < $athlete->{ scores }[ $stats->{ min }] ? $j : $stats->{ min };
			$stats->{ max }  = $score > $athlete->{ scores }[ $stats->{ max }] ? $j : $stats->{ max };
			$done++ if( $score > 0 );
		}
		$athlete->{ complete } = ($judges == $done);

		# ===== CALCULATE TIEBREAKERS
		foreach my $j ( 0 .. $#{ $athlete->{ tiebreakers }} ) {
			my $score = $athlete->{ tiebreakers }[ $j ];
			$stats->{ tb } += $athlete->{ tiebreakers }[ $j ];
		}
		$athlete->{ tb } = $stats->{ tb } || undef;

		# ===== IF THE SCORES ARE ALL THE SAME, THEN THE MIN WILL EQUAL MAX, SO DIFFERENTIATE THEM
		$stats->{ max }++ if( $stats->{ min } == $stats->{ max });

		if( $judges == 3 ) { $athlete->{ score } = $stats->{ sum }; } 
		else {
			$athlete->{ min }   = $stats->{ min };
			$athlete->{ max }   = $stats->{ max };
			$athlete->{ score } = $stats->{ sum } - ($athlete->{ scores }[ $stats->{ min }] + $athlete->{ scores }[ $stats->{ max }]);
		}
		$complete &&= $athlete->{ complete };
	}
	$self->{ complete } = $complete;
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
	my $self   = shift;
	my $tied   = join ";", (map { $_->{ place } . ':' . join( ",", @{ $_->{ tied }} ); } @{ $self->{ tied }}) if exists $self->{ tied };
	my $places = join ",", (map { join( ":", $_->{ place }, $_->{ medals } ); } @{ $self->{ places }}) if exists $self->{ places };

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n" if exists $self->{ description };
	print FILE "# places=$places\n" if exists $self->{ places };
	print FILE "# tied=$tied\n" if exists $self->{ tied };
	print FILE "# placements=" . join( ",", @{$self->{ placements }}) . "\n" if exists $self->{ placements };
	foreach my $athlete (@{ $self->{ athletes }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @{ $athlete->{ scores }}, @{ $athlete->{ tiebreakers }} ), "\n";
	}
	close FILE;
}

# ============================================================
sub _compare {
# ============================================================
	my $a      = shift;
	my $b      = shift;
	my $judges = shift;

	my $score = sprintf( "%.1f", $b->{ score } ) <=> sprintf( "%.1f", $a->{ score } );
	my $high  = { a => $a->{ scores }[ $a->{ max } ], b => $b->{ scores }[ $b->{ max } ] };
	my $low   = { a => $a->{ scores }[ $a->{ min } ], b => $b->{ scores }[ $b->{ min } ] };
	my $hilo  = ($judges > 3) ? sprintf( "%.1f", $high->{ b } ) <=> sprintf( "%.1f", $high->{ a } ) || sprintf( "%.1f", $low->{ b } ) <=> sprintf( "%.1f", $low->{ a } ) : 0; # High-Low tiebreaker: check high scores, then low scores
	my $tb    = (defined $a->{ tb } && defined $b->{ tb }) ? sprintf( "%.1f", $b->{ tb } ) <=> sprintf( "%.1f", $a->{ tb } ) : 0; # Tiebreaker scores

	return $score || $hilo || $tb;
}

1;
