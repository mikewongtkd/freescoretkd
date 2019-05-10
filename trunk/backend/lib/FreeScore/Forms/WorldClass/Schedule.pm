package Schedule;

use base qw( Clone );
use JSON::XS;
use File::Slurp qw( read_file );
use Data::Structure::Util qw( unbless );
use Date::Manip;
use List::Util qw( sum );
use POSIX qw( ceil floor );
use Schedule::Block;
use Data::Dumper;

our $TIME_PER_FORM = 4;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $contents = read_file( 'schedule.json' );
	my $json     = new JSON::XS();
	my $self     = bless $json->decode( $contents ), $class;

	$self->init();

	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self      = shift;
	my $divisions = $self->{ divisions };
	my @blocks    = ();

	# ===== BUILD ALL BLOCKS AND ASSIGN PRECONDITIONS
	foreach my $division (@$divisions) {
		my $prelim = [];
		my $n = $division->{ athletes };
		if( $self->{ teams } =~ /individual/i ) {
			if( $division->{ description } =~ /pair/i ) { $n = ceil( $n/2 ); }
			if( $division->{ description } =~ /team/i ) { $n = ceil( $n/3 ); }
		}

		# ===== START WITH FLIGHTED PRELIMINARY ROUND
		if( $n > 20 ) {
			my $f = 2;
			if   ( $n <  40 ) { $f = 2; } # 21-40 as per USAT; WT splits 20-39 into 2 flights
			elsif( $n <= 60 ) { $f = 3; } # 41-60 as per USAT; WT splits 40+ into 3 flights and has no provisions for 4 flights
			elsif( $n >  60 ) { $f = 4; } # 61+   as per USAT

			my $m = $n;
			for( my $i = 0; $i < $f; $i++ ) {
				my $j      = $f - $i;
				my $letter = chr( ord( 'a' ) + $i ); # a, b, c, d, etc.
				my $k      = ceil( $m/$j );          # Assign k athletes to this flight

				my $block  = new Schedule::Block( $division, $k, 'prelim', $letter );
				push @$prelim, $block;
				$m -= $k;
			}

			$n = sum map { ceil( $_->{ athletes }/2) } @$prelim;
			my $semfin = new Schedule::Block( $division, $n, 'semfin' );
			$semfin->preconditions( @$prelim );

			my $finals = new Schedule::Block( $division, 8, 'finals' );
			$finals->preconditions( $semfin );

			push @blocks, @$prelim, $semfin, $finals;

		# ===== START WITH SEMI-FINALS
		} elsif( $n > 8 ) {
			my $semfin = new Schedule::Block( $division, $n, 'semfin' );
			$semfin->preconditions( @$prelim );

			my $finals = new Schedule::Block( $division, 8, 'finals' );
			$finals->preconditions( $semfin );

			push @blocks, $semfin, $finals;

		# ===== START WITH FINALS
		} else {
			my $finals = new Schedule::Block( $division, 8, 'finals' );

			push @blocks, $finals;
		}
	}

	# ===== FIND ALL NONCONCURRENCES
	foreach my $block (@blocks) {
		$block->nonconcurrences( $divisions );
	}

	$self->{ blocks } = { map { $_->{ id } => $_ } @blocks }
}

# ============================================================
sub build {
# ============================================================
	my $self  = shift;

	foreach my $i (0 .. $#{$self->{ day }}) {
		my $day       = $self->{ day }[ $i ];
		my $rings     = $day->{ rings };
		my $num_rings = int( @$rings );
		my $divisions = join( '|', @{ $day->{ divisions }});
		my @blocks    = sort Schedule::Block::by_priority grep { $_->{ id } =~ /^$divisions\|/i } values %{ $self->{ blocks }};

		while( @blocks ) {
			my $block = shift @blocks;

			# ===== ATTEMPT TO PLACE THE BLOCK IN EACH RING AND TAKE THE BEST FINISH TIME
			my $best  = { ring => undef, finish => '11:59 PM' };
			foreach my $ring (@$rings) {
				if( $self->place( $block, $i, $ring )) {
					my $a = new Date::Manip::Date( $best->{ finish });
					my $b = new Date::Manip::Date( $block->{ stop });
					if( $a->cmp( $b ) > 0 ) {
						$best->{ ring }   = $ring;
						$best->{ finish } = $block->{ stop };
					}
				}
				$self->remove( $block, $ring );
			}

			if( $best->{ ring }) {
				if( $self->place( $block, $i, $best->{ ring })) {
					print STDERR "Placing $block->{ id } to $best->{ ring }{ name }\n";
					$block->{ try_hard } = 0;
				} else {
					die "Placing $block->{ id } to $best->{ ring }{ name } FAILED\n";
				}

			} else {
				$self->remove( $block, $ring );

				# ===== CANNOT FIT THE BLOCK; REINSERT IT AFTER THE NEXT BLOCK AND CONTINUE
				if( $block->{ try_hard } < 3 ) {
					if( @blocks ) {
						splice @blocks, 1, 0, $block;
					} else {
						push @blocks, $block;
					}
					$block->{ try_hard }++;

				# ===== CANNOT FIT THE BLOCK; REINSERT IT AT THE END AND CONTINUE
				} elsif( $block->{ try_hard } < 4 ) {
					push @blocks, $block;
					$block->{ try_hard }++;

				# ===== CANNOT FIT THE BLOCK AT ALL; GIVE A WARNING
				} else {
					warn "Cannot place '$block->{ id }' at all!";
				}
			}
		}
	}
}

# ============================================================
sub check {
# ============================================================
	my $self   = shift;
	my $days   = $self->{ day };
	my $lookup = $self->{ blocks };

	foreach my $day (@$days) {
		my $rings = $day->{ rings };

		foreach my $ring (@$rings) {
			my $plan = $ring->{ plan };

			foreach my $blockid (@$plan) {
				my $block = $lookup->{ $blockid };
				$block->{ invalid } = { concurrency => [], precondition => [] };

				my $nonconcurrents = $block->{ require }{ nonconcurrent };
				foreach my $otherid (@$nonconcurrents) {
					my $other = $lookup->{ $otherid };
					push @{$block->{ invalid }{ concurrency }}, $otherid if( $block->is_concurrent( $other ));
				}

				my $preconditions = $block->{ require }{ precondition };
				foreach my $otherid (@$preconditions) {
					my $other = $lookup->{ $otherid };
					push @{$block->{ invalid }{ precondition }}, $otherid unless $block->precondition_is_satisfied( $other );
				}
			}
		}
	}
}

# ============================================================
sub place {
# ============================================================
	my $self  = shift;
	my $block = shift;
	my $day_i = shift;
	my $ring  = shift;

	my $day   = $self->{ day }[ $day_i ];
	my $prev  = $ring->{ plan }[ -1 ];
	my $start = undef;
	if( defined( $prev )) {
		my $padding = new Date::Manip::Delta( "$TIME_PER_FORM minutes" );

		my $other = $self->{ blocks }{ $prev };
		$start = new Date::Manip::Date( $other->{ stop });
		$start = $start->calc( $padding );

	} else {
		$start = new Date::Manip::Date( defined( $ring->{ start }) ? $ring->{ start } : $day->{ start });
	}
	my $stop  = $start->calc( new Date::Manip::Delta( "$block->{ duration } minutes" ));
	$block->{ day }   = ($day_i + 1);
	$block->{ start } = $start->printf( '%i:%M %p' ); $block->{ start } =~ s/^\s+//;
	$block->{ stop  } = $stop->printf( '%i:%M %p' );  $block->{ stop } =~ s/^\s+//;
	push @{$ring->{ plan }}, $block->{ id };
	$block->{ ring } = $ring->{ id };

	return $self->placement_ok( $block );
}

# ============================================================
sub placement_ok {
# ============================================================
	my $self   = shift;
	my $block  = shift;
	my $lookup = $self->{ blocks };
	my $day_i  = $block->{ day } - 1;
	my $day    = $self->{ day }[ $day_i ];

	# ===== CHECK FOR GOING OVERTIME FOR THE DAY
	return 0 if( $block->overtime_for_day( $day ));

	# ===== CHECK FOR GOING OVERTIME FOR THE RING
	my $ring = find { $_->{ name } eq $block->{ ring }} @{ $day->{ rings }};
	return 0 if( $block->overtime_for_ring( $ring ));

	# ===== CHECK TO SEE IF THERE ARE ANY NONCONCURRENT BLOCKS RUNNING CONCURRENTLY
	my $nonconcurrents = $block->{ require }{ nonconcurrent };
	foreach my $blockid (@$nonconcurrents) {
		my $other = $lookup->{ $blockid };
		return 0 if( $block->is_concurrent( $other ));
	}

	# ===== CHECK TO SEE IF THERE ARE ANY MISSING PRECONDITIONS
	my $preconditions = $block->{ require }{ precondition };
	foreach my $blockid (@$preconditions) {
		my $other = $lookup->{ $blockid };
		return 0 unless $block->precondition_is_satisfied( $other );
	}

	return 1;
}

# ============================================================
sub remove {
# ============================================================
	my $self  = shift;
	my $block = shift;
	my $ring  = shift;

	delete $block->{ $_ } foreach (qw( start stop day ring ));
	pop @{$ring->{ plan }};
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;
	my $json = new JSON::XS();

	my $clone = unbless( $self->clone());

	open FILE, ">schedule.json" or die $!;
	print FILE $json->canonical->pretty->encode( $clone );
	close FILE;
}

1;
