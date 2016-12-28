package FreeScore::Forms::FreeStyle::Division;
use FreeScore;
use FreeScore::Forms::Division;
use JSON::XS();
use Clone qw( clone );
use List::Util qw( reduce );
use List::MoreUtils qw( last_index minmax part );
use Data::Structure::Util qw( unbless );
use base qw( FreeScore::Forms::Division );

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
	# MW
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

	my $contents = '';
	open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <FILE> ) { chomp; $contents .= $_; }
	close FILE;
	my $data = bless $json->decode( $contents ), 'FreeScore::Forms::FreeStyle::Division';
	$self->{ $_ } = $data->{ $_ } foreach (keys %$data);

	$self->{ judges } ||= 5; # Default value
	$self->{ places } ||= [ { place => 1, medals => 1 }, { place => 2, medals => 1 }, { place => 3, medals => 2 } ];

	$self->calculate_scores();
	$self->calculate_placements();
}

# ============================================================
sub calculate_placements {
# ============================================================
	my $self       = shift;
	my $athletes   = $self->{ athletes };

	my ($pending, $complete) = part { $athletes->[ $_ ]{ complete } ? 0 : 1 } ( 0 .. $#$athletes );

	my $placements = [ sort { 
		$a = $athletes->[ $a ];
		$b = $athletes->[ $b ];

		$b->{ adjusted }{ subtotal  } <=> $a->{ adjusted }{ subtotal  } ||
		$b->{ adjusted }{ technical } <=> $a->{ adjusted }{ technical } ||
		$b->{ original }{ subtotal  } <=> $a->{ original }{ subtotal  }
	} @$complete ];

	$self->{ placements } = $placements;
	$self->{ pending }    = $pending;
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self     = shift;
	my $k        = $self->{ judges };
	my $n        = $k <= 3 ? $k : $k - 2;

	foreach my $athlete (@{$self->{ athletes }}) {
		my $scores   = $athlete->{ scores };
		my $original = $athlete->{ original } = { deductions => 0.0, presentation => 0.0, technical => 0.0 };
		my $adjusted = $athlete->{ adjusted } = { deductions => 0.0, presentation => 0.0, technical => 0.0 };
		my $findings = $athlete->{ findings } = {};

		# ===== A SCORE IS COMPLETE WHEN ALL JUDGES HAVE SENT THEIR SCORES
		if( @$scores >= $k ) { $athlete->{ complete } = 1; } else { next; }

		foreach my $score (@$scores) {
			$original->{ $_ } += _sum( $scores->{ $_ } ) foreach (qw( presentation technical deductions ));
		}
		$original->{ subtotal } = $original->{ technical } + $original->{ presentation } - $original->{ deductions };

		# ===== LEAVE SCORES AS THEY ARE FOR SMALL COURTS (3 JUDGES)
		if( $n == $k ) { 
			$adjusted->{ $_ } = $original->{ $_ } foreach (qw( presentation technical deductions subtotal )); 

		# ===== ADJUST SCORES FOR LARGER COURTS
		} else { 
			($adjusted->{ $_ }, $findings->{ $_ }{ min }, $findings->{ $_ }{ max }) = _drop_hilo( $scores, $_, $n ) foreach (qw( presentation technical ));
			($adjusted->{ deductions }, $findings->{ deductions }) = _consensus( $scores, $n );
			$adjusted->{ subtotal } = $adjusted->{ technical } + $adjusted->{ presentation } - $adjusted->{ deductions };
		}
	}
}

# ============================================================
sub navigate {
# ============================================================
	my $self   = shift;
	my $object = shift;
	my $i      = shift;

	local $_ = $object;
	if( /^athlete$/ ) {
		return unless $i > 0 && $i < @{$self->{ athletes }};
		$self->{ current } = $i;
		return $self->{ athletes }[ $i ];
	}

	return;
}

# ============================================================
sub record_decision {
# ============================================================
	my $self     = shift;
	my $decision = shift;
	my $i        = shift;

	return unless $i > 0 && $i < @{$self->{ athletes }};
	$self->{ athletes }[ $i ]{ decision } = $decision;
	$self->{ athletes }[ $i ]{ complete } = 1;
}

# ============================================================
sub record_score {
# ============================================================
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
	return unless $i > 0 && $i < @{$self->{ athletes }};
	splice @{$self->{ athletes }}, $i, 1;
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	my $json  = new JSON::XS();
	
	my $contents = $json->encode( unbless( clone( $self )));
	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write to '$self->{ file }' $!";
	print FILE $contents;
	close FILE;

	return 1;
}

# ============================================================
sub _consensus {
# ============================================================
	my $scores  = shift;
	my $n       = shift;
	my $agreed  = { minor => [], major => [] };
	my $stances = { map { $_ => 0 } @STANCES };

	foreach my $score (@$scores) {
		my $i = int( $score->{ deductions }{ minor } / 0.1 );
		$agreed->{ minor }[ $_ ]++ foreach ( 0 .. $i );

		my $j = int( $score->{ deductions }{ minor } / 0.3 );
		$agreed->{ major }[ $_ ]++ foreach ( 0 .. $i );

		foreach (@STANCES) { $stances->{ $_ }++ if $score->{ stances }{ $_ }; }
	}
	my $i = last_index { $_ >= $n } @{ $agreed->{ minor }};
	my $j = last_index { $_ >= $n } @{ $agreed->{ major }};

	$agreed->{ minor } = { deductions => ($i * 0.1), agree => $agree->{ minor }[ $i ] };
	$agreed->{ major } = { deductions => ($j * 0.3), agree => $agree->{ minor }[ $j ] };

	foreach (@STANCES) { delete $stances->{ $_ } if $stances->{ $_ } < $n; }
	my $sum = ($i * 0.1) + ($j * 0.3) + (int(keys %$stances) * 0.3);
	$agreed->{ stances } = $stances;
	return ($sum, $agreed);
}

# ============================================================
sub _drop_hilo {
# ============================================================
	my $scores   = shift;
	my $category = shift;
	my $n        = shift;

	my ($min, $max) = minmax map { $_->{ $category } } @$scores;
	my $i   = first_value { $scores->[ $_ ]{ $category } == $min } ( 0 .. $#$scores );
	my $j   = first_value { $scores->[ $_ ]{ $category } == $max } ( 0 .. $#$scores );
	my $sum = reduce { $a += $b->{ $category } } @$scores;
	$sum -= $min + $max;

	return ($sum, $i, $j);
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
