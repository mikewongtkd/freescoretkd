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
			elsif   ( $key eq 'places' ) {
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

	for( my $i = 0; $i < $#sorted; $i++ ) {
		my $place  = shift @$places;
		my $medals = $place->{ medals };
		my $a      = $sorted[ $i ];
		my $x      = $self->{ athletes }[ $a ];

		last unless defined $places;

		push @$placements, $a;
		my $place_ties = { place => $place->{ place }, tied => [ $a ] };
		foreach my $j (($i + 1) .. ($i + $medals)) {
			last if $j > $#sorted; # More medals than athletes, e.g. 2 person division
			my $b = $sorted[ $j ];
			my $y = $self->{ athletes }[ $b ];

			push @$placements, $b;
			push @{ $place_ties->{ tied }}, $b if( _compare( $x, $y, $n ) == 0 );
		}

		my $ties = $#{ $place_ties->{ tied }};
		push @$tied, $place_ties if( $ties <= $medals && $ties > 0 );
	}

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

	# ===== CALCULATE SCORES
	foreach my $athlete (@{ $self->{ athletes }}) {
		my $stats = { min => 0, max => 0, sum => 0.0, tb => 0.0 };
		my $done  = 0;
		foreach my $j (0 .. $#{ $athlete->{ scores }}) {
			my $score = $athlete->{ scores }[ $j ];
			$stats->{ sum } += $score;
			$stats->{ min }  = $score < $athlete->{ scores }[ $stats->{ min }] ? $j : $stats->{ min };
			$stats->{ max }  = $score > $athlete->{ scores }[ $stats->{ max }] ? $j : $stats->{ max };
			$done++ if( $score > 0 );
		}

		foreach my $j ( 0 .. $#{ $athlete->{ tiebreakers }} ) {
			$stats->{ tb } += $athlete->{ tiebreakers }[ $j ];
		}

		# ===== IF THE SCORES ARE ALL THE SAME, THEN THE MIN WILL EQUAL MAX, SO DIFFERENTIATE THEM
		$stats->{ max }++ if( $stats->{ min } == $stats->{ max });
		$athlete->{ complete } = ($judges == $done);
		$athlete->{ tb }       = $stats->{ tb };

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

	my $ha = $a->{ scores }[ $a->{ max } ]; # High scores
	my $hb = $b->{ scores }[ $b->{ max } ];
	my $la = $a->{ scores }[ $a->{ min } ]; # Low scores
	my $lb = $b->{ scores }[ $b->{ min } ];
	my $tb = $judges > 3 ? $hb <=> $ha || $lb <=> $la : 0; # Tiebreaker: check high scores, then low scores

	return $b->{ score } <=> $a->{ score } || $tb;
}

1;
