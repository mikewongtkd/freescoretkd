package FreeScore::Forms::Para::Schedule;

use base qw( Clone );
use JSON::XS;
use File::Slurp qw( read_file );
use Data::Structure::Util qw( unbless );
use Date::Manip;
use List::Util qw( first sum all );
use List::MoreUtils qw( first_index );
use POSIX qw( ceil floor );
use FreeScore::Forms::Para::Schedule::Block;
use Scalar::Util qw( blessed );
use Data::Dumper;

our $UTC = '%Y-%m-%dT%H:%M:%S%z';

# ============================================================
sub new {
# ============================================================
	my ($class)  = map { ref || $_ } shift;
	my $input    = shift;
	my $config   = shift || {};
	my $self     = {};

	if( ref( $input )) {
		$self->{ divisions } = $input;
		bless $self, $class;

	} elsif( -e $input ) {
		my $contents    = read_file( $input );
		my $json        = new JSON::XS();
		$self           = bless $json->decode( $contents ), $class;
		$self->{ file } = $input;

	} else {
		$self->{ file } = $input;
		bless $self, $class;
	}

	$self->{ settings }{ time }{ recognized } = $config->{ time }{ recognized } || 2.5;
	$self->{ settings }{ time }{ freestyle  } = $config->{ time }{ freestyle }  || 5;

	$self->{ rules }{ name }                  = $config->{ rules }              || 'usat';
	$self->{ rules }{ recognized }            = $config->{ recognized }         || { prelim => [ 20, 40, 60 ], semfin => 'half', finals => 8 };
	$self->{ rules }{ freestyle  }            = $config->{ freestyle }          || { prelim => 20, semfin => 'half', finals => 12 };
	$self->init_conflicts( $config );
	$self->init();

	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self      = shift;
	my $divisions = $self->{ divisions };
	my @blocks    = ();

	if( exists $self->{ blocks } && int( keys %{$self->{ blocks }}) > 0 ) {
		foreach my $blockid (keys %{ $self->{ blocks }}) {
			my $block = $self->{ blocks }{ $blockid };
			$self->{ blocks }{ $blockid } = bless $block, 'FreeScore::Forms::Para::Schedule::Block' unless( blessed $block )
		}
		return;
	}

	# ===== BUILD ALL BLOCKS AND ASSIGN PRECONDITIONS
	foreach my $division (@$divisions) {
		my $prelim = [];
		my $semfin = undef;
		my $n      = $division->{ athletes };
		if( $self->{ teams } =~ /individual/i ) {
			if( $division->{ description } =~ /freestyle/i ) {
				if( $division->{ description } =~ /pair/i ) { $n = ceil( $n/2 ); }
				if( $division->{ description } =~ /team/i ) { $n = ceil( $n/5 ); }
			} else {
				if( $division->{ description } =~ /pair/i ) { $n = ceil( $n/2 ); }
				if( $division->{ description } =~ /team/i ) { $n = ceil( $n/3 ); }
			}
		}

		# ===== FREESTYLE EVENT
		if( exists $division->{ freestyle } && $division->{ freestyle }) {
			my $f = $self->{ freestyle }{ finals }; # Max num. of athletes in the final round
			if( $n >= $self->{ freestyle }{ prelim }) {
				my $prelim = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $n, 'prelim' );
				my $k      = ceil( $n/2 );
				my $semfin = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $k, 'semfin' );
				my $finals = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $f, 'finals' );

				$semfin->preconditions( $prelim );
				$finals->preconditions( $semfin );
				push @blocks, $prelim, $semfin, $finals;

			} elsif( $n > $f ) {
				my $semfin = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $n, 'semfin' );
				my $finals = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $f, 'finals' );

				$finals->preconditions( $semfin );
				push @blocks, $semfin, $finals;

			} else {
				my $finals = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $n, 'finals' );
				push @blocks, $finals;
			}

		# ===== START WITH FLIGHTED PRELIMINARY ROUND
		} elsif( $division->{ round } eq 'prelim' && ( $n > $self->{ recognized }{ prelim }[ 0 ] || exists( $division->{ flight }))) {
			if( exists( $division->{ flight })) {
				$division->{ name } =~ s/[A-Za-z]$//;

				my $flight = $division->{ flight };

				foreach my $flight (@$flight) {
					my $block    = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $flight->{ athletes }, 'prelim', $flight->{ id } );
					push @$prelim, $block;
				}

				$n = sum map { ceil( $_->{ athletes }/2) } @$prelim;
				$semfin = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $n, 'semfin' );
				$semfin->preconditions( @$prelim );

			} else {
				my $max = $self->{ recognized }{ prelim };
				my $f   = 2;
				if   ( $n <  $max[ 0 ] ) { $f = 2; } # 21-40 per USAT; WT splits 20-39 into 2 flights
				elsif( $n <= $max[ 1 ] ) { $f = 3; } # 41-60 per USAT; WT splits 40+ into 3 flights and has no provisions for 60+ sized divisions
				elsif( $n >  $max[ 2 ] ) { $f = 4; } # 61+   per USAT

				my $m = $n;
				for( my $i = 0; $i < $f; $i++ ) {
					my $j      = $f - $i;
					my $flight = chr( ord( 'a' ) + $i ); # a, b, c, d, etc.
					my $k      = ceil( $m/$j );          # Assign k athletes to this flight

					my $block  = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $k, 'prelim', $flight );
					push @$prelim, $block;
					$m -= $k;
				}
				$n = sum map { ceil( $_->{ athletes }/2) } @$prelim;
				$semfin = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $n, 'semfin' );
				$semfin->preconditions( @$prelim );
			}

			my $finals = new FreeScore::Forms::Para::Schedule::Block( $self, $division, 8, 'finals' );
			$finals->preconditions( $semfin );

			push @blocks, @$prelim;
			push @blocks, $semfin unless first { $_->{ id } eq $semfin->{ id } } @blocks;
			push @blocks, $finals unless first { $_->{ id } eq $finals->{ id } } @blocks;

		# ===== START WITH UNFLIGHTABLE PRELIMINARY ROUND (USAT ONLY)
		} elsif( $self->{ rules } eq 'usat' && $division->{ round } eq 'prelim' && $n == 20 ) {
			my $prelim = new FreeScore::Forms::Para::Schedule::Block( $self, $division, 20, 'prelim' );
			my $semfin = new FreeScore::Forms::Para::Schedule::Block( $self, $division, 10, 'semfin' );
			my $finals = new FreeScore::Forms::Para::Schedule::Block( $self, $division, 8,  'finals' );

			$semfin->preconditions( $prelim );
			$finals->preconditions( $semfin );

			push @blocks, $prelim, $semfin, $finals;

		# ===== START WITH SEMI-FINALS
		} elsif( $n > $self->{ recognized }{ finals }) {
			my $f = $self->{ recognized }{ finals };
			my $semfin = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $n, 'semfin' );
			$semfin->preconditions( @$prelim );

			my $finals = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $f, 'finals' );
			$finals->preconditions( $semfin );

			push @blocks, $semfin, $finals;

		# ===== START WITH FINALS
		} else {
			my $finals = new FreeScore::Forms::Para::Schedule::Block( $self, $division, $n, 'finals' );

			push @blocks, $finals;
		}
	}
	# ===== FIND ALL NONCONCURRENCES
	foreach my $block (@blocks) {
		$block->nonconcurrences( $self, $divisions );
	}

	$self->{ blocks } = { map { $_->{ id } => $_ } @blocks }
}

# ============================================================
sub init_conflicts {
# ============================================================
	my $self = shift;
	my $config = shift;
	$self->{ conflicts } ||= $config->{ conflicts } ||
	{
		"male individual youth"               => [ "pair youth", "male team youth" ],
		"female individual youth"             => [ "pair youth", "female team youth" ],
		"male team youth"                     => [ "pair youth", "male individual youth" ],
		"female team youth"                   => [ "pair youth", "female individual youth" ],
		"pair youth"                          => [ "male individual youth", "female individual youth", "male team youth", "female team youth" ],
		"freestyle male individual under17"   => [ "male individual cadet", "pair cadet", "male team cadet", "male individual junior", "pair junior", "male team junior", "freestyle pair under17", "freestyle mixed team under17" ],
		"freestyle female individual under17" => [ "female individual cadet", "pair cadet", "female team cadet", "female individual junior", "pair junior", "female team junior", "freestyle pair under17", "freestyle mixed team under17" ],
		"freestyle pair under17"              => [ "male individual cadet", "female individual cadet", "pair cadet", "male team cadet", "female team cadet", "male individual junior", "female individual junior", "pair junior", "male team junior", "female team junior", "freestyle male individual under17", "freestyle female individual under17", "freestyle mixed team under17" ],
		"freestyle mixed team under17"        => [ "male individual cadet", "female individual cadet", "pair cadet", "male team cadet", "female team cadet", "male individual junior", "female individual junior", "pair junior", "male team junior", "female team junior", "freestyle male individual under17", "freestyle female individual under17", "freestyle pair under17" ],
		"male individual cadet"               => [ "pair cadet", "male team cadet", "freestyle male individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"female individual cadet"             => [ "pair cadet", "female team cadet", "freestyle female individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"male team cadet"                     => [ "pair cadet", "male individual cadet", "freestyle male individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"female team cadet"                   => [ "pair cadet", "female individual cadet", "freestyle female individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"pair cadet"                          => [ "male individual cadet", "female individual cadet", "male team cadet", "female team cadet", "freestyle male individual junior", "freestyle female individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"male individual junior"              => [ "pair junior", "male team junior", "freestyle male individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"female individual junior"            => [ "pair junior", "female team junior", "freestyle female individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"male team junior"                    => [ "pair junior", "male individual junior", "freestyle male individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"female team junior"                  => [ "pair junior", "female individual junior", "freestyle female individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"pair junior"                         => [ "male individual junior", "female individual junior", "male team junior", "female team junior", "freestyle male individual junior", "freestyle female individual junior", "freestyle pair junior", "freestyle mixed team under17" ],
		"freestyle male individual over17"    => [ "male individual under30", "pair under30", "male team under30", "male individual under40", "pair over30", "male team over30", "freestyle pair over17", "freestyle mixed team over17" ],
		"freestyle female individual over17"  => [ "female individual under30", "pair under30", "female team under30", "female individual under40", "pair over30", "female team over30", "freestyle pair over17", "freestyle mixed team over17" ],
		"freestyle pair over17"               => [ "male individual under30", "female individual under30", "pair under30", "male team under30", "female team under30", "male individual under40", "female individual under40", "pair over30", "male team over30", "female team over30", "freestyle male individual over17", "freestyle female individual over17", "freestyle mixed team over17" ],
		"freestyle mixed team over17"         => [ "male individual under30", "female individual under30", "pair under30", "male team under30", "female team under30", "male individual under40", "female individual under40", "pair over30", "male team over30", "female team over30", "freestyle male individual over17", "freestyle female individual over17", "freestyle pair over17" ],
		"male individual under30"             => [ "pair under30", "male team under30" ],
		"female individual under30"           => [ "pair under30", "female team under30" ],
		"male team under30"                   => [ "pair under30", "male individual under30" ],
		"female team under30"                 => [ "pair under30", "female individual under30" ],
		"pair under30"                        => [ "male individual under30", "female individual under30", "male team under30", "female team under30" ],
		"male individual under40"             => [ "pair over30", "male team over30" ],
		"female individual under40"           => [ "pair over30", "female team over30" ],
		"male team over30"                    => [ "pair over30", "male individual under40", "male individual under50", "male individual under60", "male individual under70", "male individual over65" ],
		"female team over30"                  => [ "pair over30", "female individual under40", "female individual under50", "female individual under60", "female individual under70", "female individual over65" ],
		"pair over30"                         => [ "male individual under40", "female individual under40", "male individual under50", "female individual under50", "male individual under60", "female individual under60", "male individual under70", "female individual under70", "male individual over65", "female individual over65", "male team over30", "female team over30" ],
		"male individual under50"             => [ "pair over30", "male team over30" ],
		"female individual under50"           => [ "pair over30", "female team over30" ],
		"male individual under60"             => [ "pair over30", "male team over30" ],
		"female individual under60"           => [ "pair over30", "female team over30" ],
		"male individual under70"             => [ "pair over30", "male team over30" ],
		"female individual under70"           => [ "pair over30", "female team over30" ],
		"male individual over65"              => [ "pair over30", "male team over30" ],
		"female individual over65"            => [ "pair over30", "female team over30" ]
	};
}

# ============================================================
sub build {
# ============================================================
	my $self         = shift;
	$self->{ debug } ||= shift;
	my $build = { ok => 1, errors => [], warnings => [] };
	$self->clear();

	foreach my $i (0 .. $#{$self->{ days }}) {
		my $day       = $self->{ days }[ $i ];
		my $j         = $i + 1;
		my $start     = _parse_utc( $UTC, $day->{ start });
		my $d         = $start->printf( '%b %d, %Y' ); # Month day, year; eg. Apr 09, 2020
		my $rings     = $day->{ rings };
		my @blocks    = @{ $day->{ blocks }};
		my $n         = int( @blocks );

		if( @$rings == 0 && @blocks ) { push @{ $build->{ errors }}, { cause => { reason => "No rings are available for day $j, yet $n blocks assigned" }}; next; }

		while( @blocks ) {
			my $blockid = shift @blocks;
			my $block   = $self->{ blocks }{ $blockid };
			my $cause   = undef;

			# ===== ATTEMPT TO PLACE THE BLOCK IN EACH RING AND TAKE THE BEST FINISH TIME
			my $best  = { ring => undef, finish => undef };
			foreach my $ring (@$rings) {
				print STDERR "  Attempting to place $block->{ id } to $ring->{ name } on day $j ($d), stop time: '$block->{ stop }'\n" if $self->{ debug };
				my $attempt = $self->place( $block, $i, $ring );
				if( $attempt->{ result } eq 'success' ) {
					my $a = defined $best->{ finish } ? _parse_utc( $best->{ finish }) : undef;
					my $b = _parse_utc( $block->{ stop } );
					if(( ! defined $a) || $a->cmp( $b ) > 0 ) {
						$best->{ ring }   = $ring;
						$best->{ finish } = $block->{ stop };
					}
				} else {
					$cause = { by => $attempt->{ by }, reason => $attempt->{ reason }};
				}
				$self->remove( $block, $ring );
			}

			if( $best->{ ring }) {

				# ===== THERE IS A BEST RING TO PLACE THE BLOCK
				my $attempt = $self->place( $block, $i, $best->{ ring });
				if( $attempt->{ result } eq 'success' ) {
					$block->{ attempts } = 0;
					push @{ $build->{ warnings }}, { block => $block->{ id }, cause => { reason => 'overtime' }} if( $block->overtime_for_day( $day ) || $block->overtime_for_ring( $best->{ ring }));

				# ===== THE BEST RING CANDIDATE IS INVALID (SHOULD NEVER HAPPEN)
				} else {
					$build->{ ok } = 0;
					push @{$build->{ errors }}, { block => $block->{ id }, ring =>  $best->{ ring }{ id }, cause => { reason => $attempt->{ reason }}};
				}

			} else {

				# ===== CANNOT FIT THE BLOCK; REINSERT IT AFTER THE NEXT BLOCK AND CONTINUE
				if( $block->{ attempts } < 3 ) {
					if( @blocks ) {
						splice @blocks, 1, 0, $block->{ id };
					} else {
						push @blocks, $block->{ id };
					}
					$block->{ attempts }++;

				# ===== CANNOT FIT THE BLOCK; REINSERT IT AT THE END AND CONTINUE
				} elsif( $block->{ attempts } < 4 ) {
					push @blocks, $block->{ id };
					$block->{ attempts }++;

				# ===== CANNOT FIT THE BLOCK AT ALL
				} else {
					$build->{ ok } = 0;
					push @{$build->{ errors }}, { block => $block->{ id }, cause => $cause };
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

		# ===== CATASTROPHIC ERRORS WHICH WARRANT A SCHEDULE REBUILD
		unless( exists $day->{ rings }) {
			push @{$check->{ errors }}, { cause => { day => $i, reason => 'no rings' }};
			$check->{ ok } = 0;
		}
		my $rings = $day->{ rings };

		if( all { ! exists( $_->{ plan }) || (int( @{ $_->{ plan }}) == 0 )} @$rings ) {
			push @{$check->{ errors }}, { cause => { reason => 'no plan' }};
			$check->{ ok } = 0;
		}

		# ===== ERRORS WHICH SHOULD BE MANUALLY CORRECTED (OR WARNINGS WHICH CAN BE IGNORED)
		foreach my $ring (@$rings) {
			my $plan = $ring->{ plan };

			foreach my $blockid (@$plan) {
				my $block = $lookup->{ $blockid };
				next unless exists $block->{ require };

				my $conflicts = $block->{ require }{ nonconcurrent };
				foreach my $otherid (@$conflicts) {
					my $other = $lookup->{ $otherid };
					next unless $block->is_concurrent( $other );

					push @{$check->{ errors }}, { block => $blockid, cause => { by => $otherid, reason => 'concurrency' }};
					$check->{ ok } = 0;
				}

				my $preconditions = $block->{ require }{ precondition };
				foreach my $otherid (@$preconditions) {
					my $other = $lookup->{ $otherid };
					next if $block->precondition_is_satisfied( $other );

					push @{$check->{ errors }}, { block => $blockid, cause => { by => $otherid, reason => 'precondition' }};
					$check->{ ok } = 0;
				}

				push @{ $check->{ warnings }}, { block => $block->{ id }, cause => { reason => 'overtime' }} if( $block->overtime_for_day( $day ) || $block->overtime_for_ring( $ring ));
			}
		}
	}

	delete $_->{ attempts } foreach values %{ $self->{ blocks }};

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
	delete $self->{ blocks }{ $_ } foreach grep { /^break/i } keys %{$self->{ blocks }};
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
	my $start = new Date::Manip::Date();

	# ===== IF THERE ARE PREVIOUSLY PLACED BLOCKS, ADD IT AFTER THE LAST BLOCK
	if( defined( $prev )) {
		my $other = $self->{ blocks }{ $prev };
		$start->parse_format( $UTC, $other->{ stop });

	# ===== IF THE BLOCK IS THE FIRST BLOCK OF THE DAY
	# ... and the rings all start at different times (using 12-hour clock notation)
	} elsif( defined( $ring->{ start })) {
		$start->parse_format( $UTC, $ring->{ start });

	# ... and the rings all start at the same time for that day (using UTC notation)
	} elsif( defined( $day->{ start })) {
		$start->parse_format( $UTC, $day->{ start });

	# ===== THE RING IS NOT AVAILABLE
	} else {
		return { result => 'fail', reason => 'ring not available' };
	}
	my $duration = new Date::Manip::Delta( "$block->{ duration } minutes" );
	my $stop     = $start->calc( $duration );
	$block->{ day }   = ($day_i + 1);
	$block->{ start } = _utc( $start );
	$block->{ stop  } = _utc( $stop );
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
	my $conflicts = $block->{ require }{ nonconcurrent };
	foreach my $blockid (@$conflicts) {
		my $other = $lookup->{ $blockid };
		return { result => 'fail', by => $blockid, reason => 'concurrency' } if( $block->is_concurrent( $other ));
	}

	# ===== CHECK TO SEE IF THERE ARE ANY MISSING PRECONDITIONS
	my $preconditions = $block->{ require }{ precondition };
	foreach my $blockid (@$preconditions) {
		my $other = $lookup->{ $blockid };
		return { result => 'fail', by => $blockid, reason => 'precondition' } unless $block->precondition_is_satisfied( $other );
	}

	return { result => 'success' };
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

# ============================================================
sub _parse_utc {
# ============================================================
	my $string   = shift;
	my $datetime = new Date::Manip::Date();
	$datetime->parse_format( $UTC, $string );
	return $datetime;
}

# ============================================================
sub _utc {
# ============================================================
# Date::Manip gets the timezone format wrong; PST is rendered
# as -0800, and it should properly be rendered as -08:00
	my $datetime = shift;
	my $string   = $datetime->printf( $UTC );
	$string =~ s/(\d{2})$/:\1/;
	return $string;
}

1;
