package FreeScore::Forms::WorldClass::Schedule;

use base qw( Clone );
use JSON::XS;
use File::Slurp qw( read_file );
use Data::Structure::Util qw( unbless );
use Date::Manip;
use List::Util qw( first sum all );
use List::MoreUtils qw( first_index );
use POSIX qw( ceil floor );
use FreeScore::Forms::WorldClass::Schedule::Block;
use Scalar::Util qw( blessed );
use Data::Dumper;

our $TIME_PER_FORM = 4;

# ============================================================
sub new {
# ============================================================
	my ($class)  = map { ref || $_ } shift;
	my $file     = shift;
	my $debug    = shift;
	my $contents = read_file( $file );
	my $json     = new JSON::XS();
	my $self     = bless $json->decode( $contents ), $class;

	$self->{ file }  = $file;
	$self->{ debug } = $debug;
	$self->init();

	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self      = shift;
	my $divisions = $self->{ divisions };
	my @blocks    = ();

	if( exists $self->{ blocks }) {
		foreach my $blockid (keys %{ $self->{ blocks }}) {
			my $block = $self->{ blocks }{ $blockid };
			$self->{ blocks }{ $blockid } = bless $block, 'FreeScore::Forms::WorldClass::Schedule::Block' unless( blessed $block )
		}
		return;
	}

	# ===== BUILD ALL BLOCKS AND ASSIGN PRECONDITIONS
	foreach my $division (@$divisions) {
		my $prelim = [];
		my $semfin = undef;
		my $n = $division->{ athletes };
		if( $self->{ teams } =~ /individual/i ) {
			if( $division->{ description } =~ /pair/i ) { $n = ceil( $n/2 ); }
			if( $division->{ description } =~ /team/i ) { $n = ceil( $n/3 ); }
		}

		# ===== START WITH FLIGHTED PRELIMINARY ROUND
		if( $division->{ round } eq 'prelim' && ( $n > 20 || exists( $division->{ flight }))) {
			if( exists( $division->{ flight })) {
				$division->{ name } =~ s/[A-Za-z]$//;

				my $flight = $division->{ flight };

				foreach my $divid (@$flight) {
					my ($flight) = $divid =~ /([A-Za-z])$/;
					my $block    = new FreeScore::Forms::WorldClass::Schedule::Block( $division, $k, 'prelim', $flight );
					push @$prelim, $block;
				}

				$n = sum map { ceil( $_->{ athletes }/2) } @$prelim;
				$semfin = new FreeScore::Forms::WorldClass::Schedule::Block( $division, $n, 'semfin' );
				$semfin->preconditions( @$prelim );

				# Clear prelim values and insert the flight that we are currently processing; other flights will show up later as separate divisions
				$prelim = [ new FreeScore::Forms::WorldClass::Schedule::Block( $division, $k, 'prelim', $flight->{ id })];

			} else {
				my $f = 2;
				if   ( $n <  40 ) { $f = 2; } # 21-40 as per USAT; WT splits 20-39 into 2 flights
				elsif( $n <= 60 ) { $f = 3; } # 41-60 as per USAT; WT splits 40+ into 3 flights and has no provisions for 4 flights
				elsif( $n >  60 ) { $f = 4; } # 61+   as per USAT

				my $m = $n;
				for( my $i = 0; $i < $f; $i++ ) {
					my $j      = $f - $i;
					my $flight = chr( ord( 'a' ) + $i ); # a, b, c, d, etc.
					my $k      = ceil( $m/$j );          # Assign k athletes to this flight

					my $block  = new FreeScore::Forms::WorldClass::Schedule::Block( $division, $k, 'prelim', $flight );
					push @$prelim, $block;
					$m -= $k;
				}
				$n = sum map { ceil( $_->{ athletes }/2) } @$prelim;
				$semfin = new FreeScore::Forms::WorldClass::Schedule::Block( $division, $n, 'semfin' );
				$semfin->preconditions( @$prelim );
			}

			my $finals = new FreeScore::Forms::WorldClass::Schedule::Block( $division, 8, 'finals' );
			$finals->preconditions( $semfin );

			push @blocks, @$prelim; 
			push @blocks, $semfin unless first { $_->{ id } eq $semfin->{ id } } @blocks; 
			push @blocks, $finals unless first { $_->{ id } eq $finals->{ id } } @blocks;

		# ===== START WITH SEMI-FINALS
		} elsif( $n > 8 ) {
			my $semfin = new FreeScore::Forms::WorldClass::Schedule::Block( $division, $n, 'semfin' );
			$semfin->preconditions( @$prelim );

			my $finals = new FreeScore::Forms::WorldClass::Schedule::Block( $division, 8, 'finals' );
			$finals->preconditions( $semfin );

			push @blocks, $semfin, $finals;

		# ===== START WITH FINALS
		} else {
			my $finals = new FreeScore::Forms::WorldClass::Schedule::Block( $division, 8, 'finals' );

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
	my $self    = shift;
	my $build = { ok => 1, errors => [], warnings => [] };
	$self->clear();

	foreach my $i (0 .. $#{$self->{ days }}) {
		my $day       = $self->{ days }[ $i ];
		my $d         = ((new Date::Manip::Date( $self->{ start }))->calc( new Date::Manip::Delta( "$i days" )))->printf( '%b %d, %Y' );
		my $rings     = $day->{ rings };
		my $num_rings = int( @$rings );
		my $divisions = join( '|', @{ $day->{ divisions }});
		my @blocks    = sort FreeScore::Forms::WorldClass::Schedule::Block::by_priority grep { $_->{ id } =~ /^$divisions\|/i } values %{ $self->{ blocks }};

		while( @blocks ) {
			my $block = shift @blocks;

			# ===== ATTEMPT TO PLACE THE BLOCK IN EACH RING AND TAKE THE BEST FINISH TIME
			my $best  = { ring => undef, finish => undef };
			foreach my $ring (@$rings) {
				if( $self->place( $block, $i, $ring )) {
					print STDERR "Attempting to place $block->{ id } to $ring->{ name } on day " . ($i + 1) . " ($d), stop time: '$d $block->{ stop }'\n" if $self->{ debug };
					my $a = defined $best->{ finish } ? new Date::Manip::Date( "$d $best->{ finish }" ) : undef;
					my $b = new Date::Manip::Date( "$d $block->{ stop }" );
					if(( ! defined $a) || $a->cmp( $b ) > 0 ) {
						$best->{ ring }   = $ring;
						$best->{ finish } = $block->{ stop };
					}
				}
				$self->remove( $block, $ring );
			}

			if( $best->{ ring }) {

				# ===== THERE IS A BEST RING TO PLACE THE BLOCK
				if( $self->place( $block, $i, $best->{ ring })) {
					$block->{ try_hard } = 0;
					push @{ $build->{ warnings }}, { block => $block->{ id }, cause => { reason => 'overtime' }} if( $block->overtime_for_day( $day ) || $block->overtime_for_ring( $best->{ ring }));

				# ===== THE BEST RING CANDIDATE IS INVALID (SHOULD NEVER HAPPEN)
				} else {
					$build->{ ok } = 0;
					push @{$build->{ errors }}, { block => $block->{ id }, ring =>  $best->{ ring }{ id }, cause => { reason => 'failed' }};
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

				# ===== CANNOT FIT THE BLOCK AT ALL
				} else {
					$build->{ ok } = 0;
					push @{$build->{ errors }}, { block => $block->{ id }, cause => { reason => 'failed' }};
				}
			}
		}
	}
	return $build;
}

# ============================================================
sub check {
# ============================================================
	my $self   = shift;
	my $days   = $self->{ days };
	my $lookup = $self->{ blocks };
	my $check  = { ok => 1, errors => [], warnings => []};

	foreach my $i (0 .. $#$days) {
		my $day = $self->{ days }[ $i ];

		unless( exists $day->{ rings }) { 
			push @{$check->{ errors }}, { cause => { day => $i, reason => 'no rings' }}; 
			$check->{ ok } = 0; 
		}
		my $rings = $day->{ rings };

		if( all { ! exists( $_->{ plan }) || (int( @{ $_->{ plan }}) == 0 )} @$rings ) {
			push @{$check->{ errors }}, { cause => { ring => $ring->{ id }, reason => 'no plan' }}; 
			$check->{ ok } = 0; 
		}

		foreach my $ring (@$rings) {
			my $plan = $ring->{ plan };

			foreach my $blockid (@$plan) {
				my $block = $lookup->{ $blockid };

				my $nonconcurrents = $block->{ require }{ nonconcurrent };
				foreach my $otherid (@$nonconcurrents) {
					my $other = $lookup->{ $otherid };
					next unless $block->is_concurrent( $other );

					push @{$check->{ errors }}, { block => $blockid, cause => { by => $otherid, reason => 'concurrent' }};
					$check->{ ok } = 0;
				}

				my $preconditions = $block->{ require }{ precondition };
				foreach my $otherid (@$preconditions) {
					my $other = $lookup->{ $otherid };
					next if $block->precondition_is_satisfied( $other );

					push @{$check->{ errors }}, { block => $blockid, cause => { by => $otherid, reason => 'precondition' }};
					$check->{ ok } = 0;
				}

				push @{ $check->{ warnings }}, { block => $block->{ id }, cause => 'overtime' } if( $block->overtime_for_day( $day ) || $block->overtime_for_ring( $ring ));
			}
		}
	}

	delete $_->{ try_hard } foreach values %{ $self->{ blocks }};

	return $check;
}

# ============================================================
sub clear {
# ============================================================
	my $self = shift;
	foreach my $i (0 .. $#{$self->{ days }}) {
		my $day       = $self->{ days }[ $i ];
		my $rings     = $day->{ rings };

		foreach my $ring (@$rings) { $ring->{ plan } = []; }
	}
}

# ============================================================
sub data {
# ============================================================
	my $self  = shift;
	my $clone = $self->clone();
	return unbless( $clone );
}

# ============================================================
sub place {
# ============================================================
	my $self  = shift;
	my $block = shift;
	my $day_i = shift;
	my $ring  = shift;

	my $day   = $self->{ days }[ $day_i ];
	my $prev  = $ring->{ plan }[ -1 ];
	my $start = undef;

	# ===== ADD TO RING WITH BLOCKS
	if( defined( $prev )) {
		my $padding = new Date::Manip::Delta( "$TIME_PER_FORM minutes" );

		my $other = $self->{ blocks }{ $prev };
		$start = new Date::Manip::Date( $other->{ stop });
		$start = $start->calc( $padding );

	# ===== START ADDING TO A NEW RING
	} elsif( defined( $day->{ start }) || defined( $ring->{ start })) {
		$start = new Date::Manip::Date( defined( $ring->{ start }) ? $ring->{ start } : $day->{ start });

	# ===== THE RING IS NOT AVAILABLE
	} else {
		return 0;
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
	my $day    = $self->{ days }[ $day_i ];

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
	my $i = first_index { $_ eq $block->{ id } } @{ $ring->{ plan }};
	splice( @{ $ring->{ plan }}, $i, 1 ) unless $i < 0;
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	my $file  = shift;
	my $json  = new JSON::XS();

	my $clone = unbless( $self->clone());
	$self->{ file } = $file if defined $file;

	open FILE, ">$self->{ file }" or die $!;
	print FILE $json->canonical->pretty->encode( $clone );
	close FILE;
}

1;
