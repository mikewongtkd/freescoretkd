package FreeScore::Forms::FreeStyle::Division;
use FreeScore;
use FreeScore::Forms::Division;
use JSON::XS();
use Clone qw( clone );
use List::Util qw( reduce );
use List::MoreUtils qw( last_index minmax );
use Data::Structure::Util qw( unbless );
use base qw( FreeScore::Forms::Division );

our @STANCES = qw( hakdari-seogi beom-seogi dwigubi );

# ============================================================
# File format is specified as follows:
# ============================================================
#
# +- athletes[]
#    +- name
#    +- adjusted
#    +- findings
#    +- original
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
sub read {
# ============================================================
	my $self = shift;
	my $json = new JSON::XS();

	my $contents = '';
	open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <FILE> ) { chomp; $contents .= $_; }
	close FILE;
	$self = bless $json->parse( $contents ), 'FreeScore::Forms::FreeStyle::Division';

	$self->{ judges } = 3; # Default value
	$self->{ places } = [ { place => 1, medals => 1 }, { place => 2, medals => 1 }, { place => 3, medals => 2 } ];

	$self->calculate_scores();
	$self->calculate_placements();
}

# ============================================================
sub calculate_placements {
# ============================================================
	my $self       = shift;
	my $placements = [];
	@$placements = sort { 
		$b->{ adjusted }{ subtotal }  <=> $a->{ adjusted }{ subtotal }  ||
		$b->{ adjusted }{ technical } <=> $a->{ adjusted }{ technical } ||
		$b->{ original }{ subtotal }  <=> $a->{ original }{ subtotal }
	} @{ $self->{ athletes }};

	$self->{ placements } = $placements;
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

1;