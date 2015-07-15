package FreeScore::Forms::WorldClass;
use FreeScore;
use FreeScore::Forms;
use FreeScore::Forms::WorldClass::Division;
use base qw( FreeScore::Forms );
use List::Util qw( min max );

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;
	my $subdir     = "forms-worldclass";

	if( defined $ring ) { 
		# ===== LOAD THE DIVISIONS IN THE SPECIFIED RING
		$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); 
		my $divisions = $self->load_ring( $ring );
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			my $division = new FreeScore::Forms::WorldClass::Division( $self->{ path }, $id );
			$division->{ ring } = int( $ring );
			push @{ $self->{ divisions }}, $division;
		}

	} else { 
		# ==== LOAD THE DIVISIONS IN STAGING
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $subdir ); 
		my ($divisions, $rings) = $self->load_all();
		my $loaded = [];
		foreach my $id (@$divisions) {
			my $division = new FreeScore::Forms::WorldClass::Division( "$self->{ path }/staging", $id );
			$division->{ ring } = 'staging';
			push @$loaded, $division;
		}

		# ===== LOAD THE DIVISIONS IN EACH RING
		foreach my $ring (@$rings) {
			$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); 
			my $ring_divisions = $self->load_ring( $ring );
			foreach my $id (@$ring_divisions) {
				my $division = new FreeScore::Forms::WorldClass::Division( $self->{ path }, $id );
				$division->{ ring } = int( $ring );
				push @$loaded, $division;
			}
		}
		$self->{ divisions } = $loaded;

		# ===== RESTORE THE CURRENT PATH
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $subdir ); 
	}
}

# ============================================================
sub create_division {
# ============================================================
	my $self = shift;
	my $ring = shift;
	my $id   = $self->next_available();

	my $file = sprintf( "%s/div.%s.txt", $self->{ path }, $id );
	open FILE, ">$file" or die "Database Error: Can't write '$file' $!";
	print FILE<<EOF;
# state=score
# current=0
# form=0
# judges=5
# round=finals
# forms=finals:None;
First Athlete
EOF
	close FILE;

	my $division = new FreeScore::Forms::WorldClass::Division( $self->{ path }, $id );
	$division->{ ring } = $ring;

	return $division;
}

# ============================================================
sub get_only {
# ============================================================
	my $self     = shift;
	my $judge    = shift;
	my $i        = $self->{ current };
	my $division = $self->{ divisions }[ $i ];
	$self->{ divisions } = [ $division ];
	$division->get_only( $judge );
}

# ============================================================
sub navigate {
# ============================================================
	my $self  = shift;
	my $value = shift;
	$self->{ current } = $value;
}

# ============================================================
sub next_available {
# ============================================================
	my $self      = shift;
	my $requested = shift || undef;
	my $divisions = {};
	my $path      = $self->{ path };
	$path =~ s/\/?ring\d+\/?// if( $path =~ /ring\d+/ );

	# Read all divisions in the database
	my @div_ids = map { s/$path\/(?:ring\d+|staging)\/div\.//; s/\.txt//; $_; } split /\n/, `ls $path/ring*/div*.txt $path/staging/div*.txt 2>/dev/null`;

	foreach my $id (@div_ids) {
		my ($type, $number) = $id =~ /^([A-Za-z]+)(\d+)$/;
		$number = int( $number );
		$divisions->{ $type }{ $number } = 1;
	}

	foreach my $type (sort keys %$divisions) {
		my @numbers   = keys %{ $divisions->{ $type }};
		my $min       = min @numbers;
		my $max       = max @numbers;
		my @available = ();

		for my $i ( $min .. ($max + 1)) {
			next if exists $divisions->{ $type }{ $i };
			push @available, $i;
		}

		$divisions->{ $type } = [ sort { $a <=> $b } @available ];
	}

	if( defined $requested && exists $divisions->{ $requested } ) {
		return sprintf( "%s%02d", $requested, (shift @{ $divisions->{ $requested }}));

	} else {
		# Find the type with the largest available division number
		my ($largest) = sort { 
			$divisions->{ $b }[ -1 ] <=> $divisions->{ $a }[ -1 ];
		} keys %$divisions;
		return sprintf( "%s%02d", $largest, (shift @{ $divisions->{ $largest }}));
	}
}

# ============================================================
sub next { 
# ============================================================
	my $self = shift; 
	my $i = $self->{ current }; 
	my $division = $self->current();
	$i = ($i + 1) % int(@{ $self->{ divisions }}); 
	$self->{ current } = $i; 
}

# ============================================================
sub previous { 
# ============================================================
	my $self = shift; 
	my $i = $self->{ current }; 
	$i = ($i - 1) >= 0 ? ($i -1) : $#{ $self->{ divisions }}; 
	$self->{ current } = $i; 
}

1;
