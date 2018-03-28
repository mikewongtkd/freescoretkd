package FreeScore::Forms::FreeStyle::Division;
use FreeScore;
use FreeScore::Forms::Division;
use JSON::XS();
use List::Util qw( min reduce shuffle );
use List::MoreUtils qw( all first_index last_index minmax part );
use Data::Structure::Util qw( unbless );
use File::Slurp qw( read_file );
use Math::Round qw( nearest_ceil );
use base qw( FreeScore::Forms::Division Clone );
use Data::Dumper;

our @STANCES = qw( hakdari-seogi beom-seogi dwigubi );

# ============================================================
# File format is specified as follows:
# ============================================================
#
# +- athletes[]
#    +- name
#    +- info
#    +- adjusted
#    +- findings
#    +- original
#    +- decision
#    +- complete
#    +- scores[]
#       +- technical
#          +- side kick
#          +- front kicks
#          +- turn kick
#          +- flip kick
#          +- basic movements
#       +- presentation
#          +- creativity
#          +- harmony
#          +- energy
#          +- choreography
#       +- deductions
#          +- stances[]
#          +- major
#          +- minor
#       +- timeline
# +- current
# +- file
# +- judges
# +- name
# +- pending
# +- placements
# +- places
# +- state
# ------------------------------------------------------------

# ============================================================
sub autopilot {
# ============================================================
	my $self  = shift;
	my $state = shift;
	
	if( defined $state ) {
		if( $state eq 'off' ) { delete $self->{ autopilot }; } else { $self->{ autopilot } = $state; }
	}

	return $self->{ autopilot } if exists $self->{ autopilot };
	return undef;
}

# ============================================================
sub edit_athletes {
# ============================================================
	my $self     = shift;
	my $edits    = shift;
	my $athletes = [];
	foreach my $i ( 0 .. $#$edits ) {
		my $edit  = $edits->[ $i ];
		my $j     = $edit->{ order };
		my $found = $j > 0 && $j < @{ $self->{ athletes }} ? $self->{ athletes }[ $j ] : undef;
		my $entry = $found ? $found : {};

		$entry->{ name } = $edit->{ name };
		push @$athletes, $entry;
	};
	$self->{ athletes } = $athletes;
}

# ============================================================
sub read {
# ============================================================
	my $self = shift;
	my $json = new JSON::XS();

	my $contents  = read_file( $self->{ file } ) or die "Database Read Error: Can't read '$self->{ file }' $!";
	my $data      = bless $json->decode( $contents ), 'FreeScore::Forms::FreeStyle::Division';
	$self->{ $_ } = $data->{ $_ } foreach (keys %$data);

	$self->{ current } ||= 0;
	$self->{ judges }  ||= 5; # Default value
	$self->{ places }  ||= [ { place => 1, medals => 1 }, { place => 2, medals => 1 }, { place => 3, medals => 2 } ];
	$self->{ file }    = $self->{ file };
	$self->{ path }    = $self->{ file }; $self->{ path } =~ s/\/.*$//;

	foreach my $i ( 0 .. $#{ $self->{ athletes }}) {
		my $athlete = $self->{ athletes }[ $i ];
		$athlete->{ id } = $i;
	}

	$self->update();
}

# ============================================================
sub calculate_placements {
# ============================================================
	my $self       = shift;
	my $athletes   = $self->{ athletes };
	my $round      = $self->{ round };

	my ($pending, $complete) = part { $athletes->[ $_ ]{ complete } ? 1 : 0 } ( 0 .. $#$athletes );

	my $placements = [ sort { 
		my $i = $athletes->[ $a ];
		my $j = $athletes->[ $b ];

		$j->{ adjusted }{ subtotal  } <=> $i->{ adjusted }{ subtotal  } ||
		$j->{ adjusted }{ technical } <=> $i->{ adjusted }{ technical } ||
		$j->{ original }{ subtotal  } <=> $i->{ original }{ subtotal  }
	} @$complete ];

	$self->{ placements } = {} if not exists $self->{ placements };
	$self->{ pending }    = {} if not exists $self->{ pending };

	$self->{ placements }{ $round } = $placements;
	$self->{ pending }{ $round }    = $pending;
}

# ============================================================
sub calculate_round {
# ============================================================
	my $self     = shift;
	my $athletes = $self->{ athletes };

	# ===== CALCULATE CURRENT ROUND
	if( ! exists $self->{ round } || ! defined $self->{ round } ) {
		my $n = int( @$athletes );
		if    ( $n <= 8  ) { $self->{ round } = 'finals'; }
		elsif ( $n <= 20 ) { $self->{ round } = 'semfin'; }
		else               { $self->{ round } = 'prelim'; }
	}

	# ===== CALCULATE ORDER
	my $round = $self->{ round };
	my $order = $self->{ order } || {};
	if( ! exists $order->{ $round } || ! defined $order->{ $round } || @{$order->{ $round }} == 0 ) {
		if      ( $round eq 'prelim' ) { 
			$order->{ $round } = [( 0 .. $#$athletes )]; 

		} elsif ( $round eq 'semfin' ) { 

			# Advance athletes from previous round
			if( exists $order->{ 'prelim' } && ref( $order->{ 'prelim' }) eq 'ARRAY' && @{ $order->{ 'prelim' }} ) {
				my @eligible       = _not_disqualified( $self->{ athletes }, $self->{ placements }{ $round } );
				my $n              = nearest_ceil( 1, int( @eligible )/2 ); # Advance the top half of division, rounded up
				@eligible          = splice( @eligible, 0, $n );
				$order->{ $round } = [ shuffle( @eligible ) ];

			# Starting round
			} else {
				$order->{ $round } = [( 0 .. $#$athletes )];
			}

		}  elsif ( $round eq 'finals' ) {

			# Advance athletes from previous round
			if( exists $order->{ 'semfin' } && ref( $order->{ 'semfin' }) eq 'ARRAY' && @{ $order->{ 'semfin' }} ) {
				my @eligible       = _not_disqualified( $self->{ athletes }, $self->{ placements }{ $round } );
				@eligible          = splice( @eligible, 0, 8 );
				$order->{ $round } = [ reverse @eligible ];

			# Starting round
			} else {
				$order->{ $round } = [( 0 .. $#$athletes )];
			}
		}
	}
	$self->{ order } = $order;
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self = shift;
	my $k    = $self->{ judges };
	my $n    = $k <= 3 ? $k : $k - 2;

	foreach my $athlete (@{$self->{ athletes }}) {
		my $scores    = exists $athlete->{ scores } ? $athlete->{ scores } : [];
		my $original  = $athlete->{ original }  = { presentation => 0.0, technical => 0.0 };
		my $adjusted  = $athlete->{ adjusted }  = { presentation => 0.0, technical => 0.0 };
		my $consensus = $athlete->{ consensus } = {};

		# ===== A SCORE IS COMPLETE WHEN ALL JUDGES HAVE SENT THEIR SCORES
		if( @$scores == $k && all { defined $_ } @$scores ) { $athlete->{ complete } = 1; } else { delete $athlete->{ complete }; next; }

		foreach my $score (@$scores) {
			$original->{ $_ } += _sum( $score->{ $_ } ) foreach (qw( presentation technical ));
		}
		$consensus->{ deductions } = _consensus( $scores, $n );
		$original->{ subtotal } = ($original->{ technical } + $original->{ presentation }) / $k;

		# ===== LEAVE SCORES AS THEY ARE FOR SMALL COURTS (3 JUDGES)
		if( $n == $k ) { 
			$adjusted->{ $_ } = $original->{ $_ } foreach (qw( presentation technical deductions subtotal )); 

		# ===== ADJUST SCORES FOR LARGER COURTS
		} else { 
			($adjusted->{ $_ }, $consensus->{ $_ }{ min }, $consensus->{ $_ }{ max }) = _drop_hilo( $scores, $_, $n ) foreach (qw( presentation technical ));
			$adjusted->{ subtotal } = $adjusted->{ technical } + $adjusted->{ presentation };
		}
	}
}

# ============================================================
sub from_json {
# ============================================================
#** @method ( json_division_data )
#   @brief  Class method that returns an instance using the given JSON division data
#   Call as my $division = FreeScore::Forms::FreeStyle->from_json( $json )
#*
	my $class = shift;
	my $data  = shift;
	return bless $data, $class;
}

# ============================================================
sub navigate {
# ============================================================
	my $self   = shift;
	my $object = shift;
	my $i      = shift;

	local $_ = $object;
	if( /^athlete$/ ) {
		return unless $i >= 0 && $i < @{$self->{ athletes }};
		$self->{ current } = int( $i );
		return $self->{ athletes }[ $i ];
	}

	return;
}

# ============================================================
sub next_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next athlete
#*
	my $self     = shift;
	my $athletes = $self->{ athletes };
	my $i        = $self->{ current };

	$self->{ state }   = 'score';
	$self->{ current } = $i < $#$athletes ? $i + 1 : 0;
	return $athletes->[ $self->{ current }];
}

# ============================================================
sub next_available_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next athlete that needs a score and has not been withdrawn or disqualified
#*
	my $self      = shift;
	my $round     = $self->{ round };
	my $available = undef;
	do {
		my $athlete = $self->next_athlete();
		$available = ! $athlete->{ complete };
	} while( ! $available );
	return $athletes->[ $self->{ current }];
}

# ============================================================
sub previous_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the previous athlete
#*
	my $self     = shift;
	my $athletes = $self->{ athletes };
	my $i        = $self->{ current };

	$self->{ state }   = 'score';
	$self->{ current } = $i > 0 ? $i - 1 : $#$athletes;
	return $athletes->[ $self->{ current }];
}

# ============================================================
sub record_decision {
# ============================================================
#** @method ()
#   @brief Updates punitive decisions
#*
	my $self     = shift;
	my $decision = shift;
	my $i        = shift;
	my $athletes = $self->{ athletes };

	return unless $i >= 0 && $i < @$athletes;
	$athletes->[ $i ]{ decision } = $decision;
	$athletes->[ $i ]{ complete } = 1;
}

# ============================================================
sub record_penalty {
# ============================================================
#** @method ()
#   @brief Updates penalties
#*
	my $self     = shift;
	my $penalty  = shift;
	my $i        = shift;
	my $athletes = $self->{ athletes };

	return unless $i >= 0 && $i < @$athletes;
	$athletes->[ $i ]{ penalty } = $penalty;
}

# ============================================================
sub record_score {
# ============================================================
#** @method ()
#   @brief Updates a score
#*
	my $self  = shift;
	my $judge = shift;
	my $score = shift;
	my $i     = $self->{ current };

	my $athlete = $self->{ athletes }[ $i ];
	$athlete->{ scores }[ $judge ] = $score;
}

# ============================================================
sub remove_athlete {
# ============================================================
	my $self = shift;
	my $i    = shift;
	return unless $i >= 0 && $i < @{$self->{ athletes }};
	my $athlete = splice @{$self->{ athletes }}, $i, 1;
	foreach my $list ( qw( order placement pending )) {
		next unless exists $self->{ $list };
		my $j = first_index { $_ == $i } @{ $self->{ list }};
		splice( @{ $self->{ list }}, $j, 1 );
	}
	return $athlete;
}

# ============================================================
sub update {
# ============================================================
	my $self  = shift;

	$self->calculate_scores();
	$self->calculate_placements();
	$self->calculate_round();
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	my $json  = new JSON::XS();
	
	$self->update();

	my $contents = $json->pretty->canonical->encode( unbless( $self->clone()));
	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write to '$self->{ file }' $!";
	print FILE $contents;
	close FILE;
	chmod 0666, $self->{ file };

	return 1;
}

# ============================================================
sub _consensus {
# ============================================================
	my $scores  = shift;
	my $n       = shift;
	my $agreed  = { minor => [], major => [] };
	my $stances = { map { $_ => 0 } @STANCES };
	my $time    = { under => [], over => [] };

	# ===== COUNT ALL VOTES FOR DEDUCTIONS FROM EACH JUDGE
	foreach my $score (@$scores) {
		my $i = int( $score->{ deductions }{ minor } / 0.1 );
		$agreed->{ minor }[ $_ ]++ foreach ( 0 .. $i );

		my $j = int( $score->{ deductions }{ minor } / 0.3 );
		$agreed->{ major }[ $_ ]++ foreach ( 0 .. $i );

		my $timing   = $score->{ deductions }{ timing };
		my $start    = exists $timing->{ start } ? int( $timing->{ start }{ time } ) : 0;
		my $stop     = exists $timing->{ stop  } ? int( $timing->{ stop  }{ time } ) : $start + 65_000; # Default; assume no penalty
		my $duration = ($stop - $start) / 1000;

		if   ( $duration < 60 ) { push @{$time->{ under }}, 60 - $duration; } # A vote for under time
		elsif( $duration > 70 ) { push @{$time->{ over  }}, $duration - 70; } # A vote for over time

		foreach (@STANCES) { $stances->{ $_ }++ if $score->{ stances }{ $_ }; }
	}

	# ===== TALLY ALL SIMPLE DEDUCTIONS
	my $i = last_index { $_ >= $n } @{ $agreed->{ minor }};
	my $j = last_index { $_ >= $n } @{ $agreed->{ major }};

	# ===== TALLY ALL STANCE DEDUCTIONS AND ADD THEM AS MAJORS
	foreach (@STANCES) { delete $stances->{ $_ } if $stances->{ $_ } < $n; }
	$agreed->{ stances } = $stances; # Report each missing stance to display to the audience
	$j += int( keys %$stances );

	# ===== TALLY TIMING DEDUCTIONS AND ADD THEM ACCORDINGLY
	# For each second under/over time, if less than 3 seconds total then a
	# minor penalty; for more than 3 seconds, a major penalty for each second. 
	# Bear in mind athlete has +/- 5 seconds free time if they aim for 65
	# second performance.
	if   ( @{ $time->{ under }} > $n ) { $time->{ penalty } = min @{ $time->{ under }}; $agreed->{ timing } = - $time->{ penalty }; }
	elsif( @{ $time->{ over  }} > $n ) { $time->{ penalty } = min @{ $time->{ over  }}; $agreed->{ timing } =   $time->{ penalty }; }
	if( $time->{ penalty } < 3 ) { $i += $time->{ penalty }; } else { $j += $time->{ penalty } - 2; }

	$agreed->{ minor }  = { count => $i, subtotal => ($i * 0.1), agree => $agreed->{ minor }[ $i ] };
	$agreed->{ major }  = { count => $j, subtotal => ($j * 0.3), agree => $agreed->{ major }[ $j ] };

	return $agreed;
}

# ============================================================
sub _drop_hilo {
# ============================================================
	my $scores   = shift;
	my $category = shift;
	my $n        = shift;

	my @subtotals = map { my $criteria = $_->{ $category }; reduce { $a += $criteria->{ $b }; } 0.0, keys %$criteria } @$scores;
	my ($min, $max) = minmax @subtotals;
	my $i   = first_index { int( $_ * 10 ) == int( $min * 10 ) } @subtotals;
	my $j   = first_index { int( $_ * 10 ) == int( $max * 10 ) } @subtotals;
	my $sum = reduce { $a += $b } @subtotals;
	$sum -= $min + $max;

	return (($sum / $n), $i, $j);
}

# ============================================================
sub _not_disqualified {
# ============================================================
	my $athletes = shift;
	my $group    = shift;
	return grep {
		my $athlete = $athletes->[ $_ ];
		! exists $athlete->{ decision } || ! $athlete->{ decision } =~ /^disqual/i
	} @$group;
}

# ============================================================
sub _sum {
# ============================================================
	my $first = shift;
	my $stack = [ $first ];
	my $sum   = 0.0;
	while( @$stack ) {
		my $node = shift @$stack;
		if( ref( $node )) { push @$stack, $node->{ $_ } foreach (keys %$node); }
		else              { $sum += $node; }
	}
	return $sum;
}

sub display          { my $self = shift; $self->{ state } = 'display'; }
sub is_display       { my $self = shift; return $self->{ state } eq 'display'; }
sub next_athlete     { my $self = shift; $self->{ current } = $self->{ current } < @{ $self->{ athletes }} ? $self->{ current } + 1 : 0;  my $i = $self->{ current }; return $self->{ athletes }[ $i ]; }
sub previous_athlete { my $self = shift; $self->{ current } = $self->{ current } > 0 ? $self->{ current } - 1 : $#{ $self->{ athletes }}; my $i = $self->{ current }; return $self->{ athletes }[ $i ]; }
sub score            { my $self = shift; $self->{ state } = 'score'; }

1;
