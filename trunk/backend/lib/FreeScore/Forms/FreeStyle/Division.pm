package FreeScore::Forms::FreeStyle::Division;
use FreeScore;
use FreeScore::Forms::Division;
use JSON::XS;
use List::Util qw( min reduce shuffle );
use List::MoreUtils qw( all first_index last_index minmax part );
use Data::Structure::Util qw( unbless );
use File::Slurp qw( read_file );
use Math::Round qw( nearest_ceil round );
use base qw( FreeScore::Forms::Division Clone );
use Data::Dumper;

# ============================================================
# File format is specified as follows:
# ============================================================
#
# +- athletes[]
#    +- name
#    +- info
#    +- adjusted
#    +- original
#    +- decision
#    +- complete
#    +- scores
#       +- round[]
#          +- technical
#             +- side kick
#             +- front kicks
#             +- turn kick
#             +- flip kick
#             +- basic movements
#          +- presentation
#             +- creativity
#             +- harmony
#             +- energy
#             +- choreography
#          +- deductions
#             +- stances[]
#             +- major
#             +- minor
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
	$self->{ state }   ||= 'score';
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

	my ($pending, $complete) = part { $athletes->[ $_ ]{ complete }{ $round } ? 1 : 0 } @{ $self->{ order }{ $round }};

	my $placements = [ sort { 
		my $i = $athletes->[ $a ];
		my $j = $athletes->[ $b ];

		$j->{ adjusted }{ $round }{ total  }    <=> $i->{ adjusted }{ $round }{ total  }    ||
		$j->{ adjusted }{ $round }{ technical } <=> $i->{ adjusted }{ $round }{ technical } ||
		$j->{ original }{ $round }{ total  }    <=> $i->{ original }{ $round }{ total  }
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
	my $round      = $self->{ round };
	my $order      = $self->{ order } || {};
	my $placements = $self->{ placements };
	if( ! exists $order->{ $round } || ! defined $order->{ $round } || @{$order->{ $round }} == 0 ) {
		if      ( $round eq 'prelim' ) { 
			$order->{ $round } = [( 0 .. $#$athletes )]; 

		} elsif ( $round eq 'semfin' ) { 

			# Advance athletes from previous round
			if( exists $order->{ 'prelim' } && ref( $order->{ 'prelim' }) eq 'ARRAY' && @{ $order->{ 'prelim' }} ) {
				my @eligible       = _not_disqualified( $self->{ athletes }, $placements->{ 'prelim' } );
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
				my @eligible       = _not_disqualified( $self->{ athletes }, $placements->{ 'semfin' } );
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
	my $self  = shift;
	my $k     = $self->{ judges };
	my $n     = $k <= 3 ? $k : $k - 2;
	my $round = $self->{ round };

	foreach my $athlete (@{$self->{ athletes }}) {
		my $scores    = exists $athlete->{ scores } ? $athlete->{ scores }{ $round } : [];
		my $original  = $athlete->{ original }{ $round }  = { presentation => 0.0, technical => 0.0, minor => 0.0, major => 0.0 };
		my $adjusted  = $athlete->{ adjusted }{ $round }  = { presentation => 0.0, technical => 0.0, minor => 0.0, major => 0.0 };

		# ===== A SCORE IS COMPLETE WHEN ALL JUDGES HAVE SENT THEIR SCORES
		if( @$scores == $k && all { defined $_ } @$scores ) { $athlete->{ complete }{ $round } = 1; } else { delete $athlete->{ complete }{ $round }; next; }

		foreach my $score (@$scores) {
			foreach my $category (qw( presentation technical )) {
				$original->{ $category } += reduce { $a += $score->{ $category }{ $b }; } keys %{$score->{ $category }};
			}
			$original->{ technical } -= $score->{ deductions }{ major } + $score->{ deductions }{ minor };
		}
		$original->{ total } = ($original->{ technical } + $original->{ presentation });

		# ===== LEAVE SCORES AS THEY ARE FOR SMALL COURTS (3 JUDGES)
		if( $n == $k ) { 
			foreach (qw( presentation technical total )) {
				$original->{ $_ } /= $n;
				$adjusted->{ $_ } = $original->{ $_ };
			}

		# ===== ADJUST SCORES FOR LARGER COURTS
		} else { 
			($adjusted->{ $_ }, $adjusted->{ min }{ $_ }, $adjusted->{ max }{ $_ }) = _drop_hilo( $scores, $_, $n ) foreach (qw( presentation technical ));
			$adjusted->{ total } = ($adjusted->{ technical } + $adjusted->{ presentation });
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
sub get_only {
# ============================================================
#** @method ( judge_index )
#   @brief Erases all scores except the given judge; used prior to sending updates to a judge
#*
	my $self  = shift;
	my $judge = shift;
	my $clone = $self->clone();
	my $round = $clone->{ round };

	foreach my $athlete (@{ $clone->{ athletes }}) {
		foreach my $score ( qw( scores original adjusted )) {
			$athlete->{ $score } = { $round => $athlete->{ $score }{ $round } }; # Prune all but the current round
		}
	}
	return $clone;
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
	my $round    = $self->{ round };
	my $order    = $self->{ order }{ $round };
	my $j        = first_index { $_ == $i } @$order;

	$self->{ state }   = 'score';
	$self->{ current } = $j < $#$order ? $order->[ $j + 1 ] : $order->[ 0 ];
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
	my $order     = $self->{ order }{ $round };
	my $available = undef;
	my $i         = 0;

	do {
		my $athlete = $self->next_athlete();
		$available = ! $athlete->{ complete }{ $round };
		$i++;
	} while((! $available ) && $i < $#$order);
	return $athletes->[ $self->{ current }];
}

# ============================================================
sub next_round {
# ============================================================
	my $self   = shift;
	my $round  = $self->{ round };

	if    ( $round eq 'prelim' ) { $self->{ round } = 'semfin'; }
	elsif ( $round eq 'semfin' ) { $self->{ round } = 'finals'; }

	$self->{ state } = 'score';
	$self->{ current } = $self->{ order }{ $self->{ round }}[ 0 ];
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
sub previous_round {
# ============================================================
	my $self  = shift;
	my $round = $self->{ round };
	my $order = $self->{ order };

	if    ( $round eq 'finals' && exists $order->{ semfin } && @{ $order->{ semfin }} > 0 ) { $self->{ round } = 'semfin'; }
	elsif ( $round eq 'semfin' && exists $order->{ prelim } && @{ $order->{ prelim }} > 0 ) { $self->{ round } = 'prelim'; }

	$self->{ state } = 'score';
	$self->{ current } = $self->{ order }{ $self->{ round }}[ 0 ];
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
	my $round    = $self->{ round };

	return unless $i >= 0 && $i < @$athletes;
	$athletes->[ $i ]{ decision }{ $round } = $decision;
	$athletes->[ $i ]{ complete }{ $round } = 1;
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
	my $round    = $self->{ round };

	return unless $i >= 0 && $i < @$athletes;
	$athletes->[ $i ]{ penalty }{ $round } = $penalty;
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
	my $round = $self->{ round };

	my $json = new JSON::XS();

	$self->{ state } = 'score';
	my $athlete = $self->{ athletes }[ $i ];
	$athlete->{ scores }{ $round }[ $judge ] = $score;
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
sub _drop_hilo {
# ============================================================
	my $scores   = shift;
	my $category = shift;
	my $n        = shift;

	my @subtotals = map { 
		my $subcats  = $_->{ $category }; 
		my $subtotal = reduce { $a += $subcats->{ $b }; } 0.0, keys %$subcats;
		if( $category eq 'technical' ) {
			my $major    = $_->{ deductions }{ major };
			my $minor    = $_->{ deductions }{ minor };
			$subtotal   -= ($major + $minor);
		}
		$subtotal;
	} @$scores;
	my ($min, $max) = minmax @subtotals;
	my $i   = first_index { int( $_ * 10 ) == int( $min * 10 ) } @subtotals;
	my $j   = first_index { int( $_ * 10 ) == int( $max * 10 ) } @subtotals;
	my $sum = reduce { $a += $b } 0, @subtotals;
	$sum -= $min + $max;
	$sum /= $n;

	return ($sum, $i, $j);
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
sub score            { my $self = shift; $self->{ state } = 'score'; }
sub list             { my $self = shift; $self->{ state } = 'list'; }

1;
