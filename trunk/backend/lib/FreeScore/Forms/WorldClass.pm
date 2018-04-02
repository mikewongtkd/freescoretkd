package FreeScore::Forms::WorldClass;
use FreeScore;
use FreeScore::Forms;
use FreeScore::Forms::WorldClass::Division;
use Clone qw( clone );
use base qw( FreeScore::Forms );
use List::Util qw( first min max shuffle );
use List::MoreUtils qw( first_index );
use Math::Round qw( nearest_ceil );
use Data::Dumper;

our $SUBDIR = "forms-worldclass";

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;

	if( defined $ring ) { 
		# ===== LOAD THE DIVISIONS IN THE SPECIFIED RING
		# Note: the application may need to load both the ring and staging;
		# this is application specific, so we do not facilitate it here
		$self->{ path } = $ring eq 'staging' ? join( "/", $FreeScore::PATH, $tournament, $SUBDIR, $ring ) : sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
		$self->{ name } = $ring;
		my $divisions = $self->load_ring( $ring );
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			my $file = sprintf( "%s/div.%s.txt", $self->{ path }, $id );
			next unless -e $file;
			my $division = new FreeScore::Forms::WorldClass::Division( $self->{ path }, $id );
			$division->{ ring } = $ring eq 'staging' ? $ring : int( $ring );
			push @{ $self->{ divisions }}, $division;
		}

	} else { 
		# ==== LOAD THE DIVISIONS IN STAGING
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
		my ($divisions, $rings) = $self->load_all();
		my $loaded = [];
		foreach my $id (@$divisions) {
			my $division = new FreeScore::Forms::WorldClass::Division( "$self->{ path }/staging", $id );
			$division->{ ring } = 'staging';
			push @$loaded, $division;
		}

		# ===== LOAD THE DIVISIONS IN EACH RING
		foreach my $ring (@$rings) {
			$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
			my $ring_divisions = $self->load_ring( $ring );
			foreach my $id (@$ring_divisions) {
				my $division = new FreeScore::Forms::WorldClass::Division( $self->{ path }, $id );
				$division->{ ring } = int( $ring );
				push @$loaded, $division;
			}
		}
		$self->{ divisions } = $loaded;

		# ===== RESTORE THE CURRENT PATH
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
	}
}

# ============================================================
sub delete_division {
# ============================================================
	my $self     = shift;
	my $divid    = shift;
	my $i        = first_index { $_->{ name } eq $divid } @{ $self->{ divisions }};

	return unless $i >= 0;

	# Advance to next division if deleting the current division
	if( $divid eq $self->{ current } ) { $self->next(); }

	# Delete the division file
	my $division = splice @{ $self->{ divisions }}, $i, 1;
	unlink $division->{ file } if -e $division->{ file };

	# Delete the division history
	my $history = $division->{ file } . ",v";
	unlink $history if -e $history;
}

# ============================================================
sub get_only {
# ============================================================
	my $self     = shift;
	my $judge    = shift;
	my $i        = $self->{ current };
	my $division = $self->{ divisions }[ $i ];
	$self->{ divisions } = [ $division ];
	return $division->get_only( $judge );
}

# ============================================================
sub merge_division {
# ============================================================
	my $self     = shift;
	my $divid    = shift;
	my $flights  = shift;
	my $i        = first_index { $_->{ name } eq $divid } @{ $self->{ divisions }};

	return unless $i >= 0;
	my $division = $self->{ divisions }[ $i ]; return unless $division->is_flight();
	my @group    = @{$division->{ flight }{ group }};
	my @flights  = ();
	my @advance  = ();

	# Flight check: make sure all flights are in the same ring or in staging
	foreach my $id (@group) {
		my $i = first_index { $_->{ name } eq $id } @{ $self->{ divisions }};
		die "Flight $id not found" unless $i >= 0;

		my $flight = $self->{ divisions }[ $i ];
		die "Flight $id is still in progress" if $flight->{ flight }{ state } ne 'complete';

		push @flights, $flight;
	}

	# Only the top half of each flight advance
	foreach my $flight (@flights) {
		my $n        = nearest_ceil( 1, @{ $flight->{ athletes }}/2 ) - 1;
		my $top_half = [ @{$flight->{ placement }{ prelim }}[ 0 .. $n ] ];
		my @athletes = map { clone( $flight->{ athletes }[ $_ ]) } @$top_half;
		push @advance, @athletes;
		$flight->{ flight }{ state } = 'merged';
		$flight->write();
	}
	foreach my $athlete (@advance) { delete $athlete->{ scores }{ prelim }; }

	my $merged = $division->clone();
	$merged->{ name }    =~ s/$merged->{ flight }{ id }$//;
	$merged->{ file }    =~ s/$merged->{ flight }{ id }\.txt$/.txt/;
	$merged->{ round }   = 'semfin';
	$merged->{ current } = 0;
	$merged->{ order }   = { semfin => [ 0 .. $#advance ]};
	foreach my $key (qw( order placement pending forms )) {
		delete $merged->{ $key }{ prelim } if exists $merged->{ $key }{ prelim };
	}
	$merged->{ athletes } = [ shuffle @advance ]; # Merge athletes in random order
	delete $merged->{ flight }; # The merged division is no longer a flight;
	$merged->write();
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
		my ($type, $number, $letter) = $id =~ /^([A-Za-z]+)(\d+)(\w+)?$/;
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
sub split_division {
# ============================================================
	my $self     = shift;
	my $divid    = shift;
	my $flights  = shift;
	my $i        = first_index { $_->{ name } eq $divid } @{ $self->{ divisions }};

	return unless $i >= 0;
	my $division = $self->{ divisions }[ $i ];
	my @flights  = $division->split( $flights );

	$self->delete_division( $divid );
}

# ============================================================
sub update_division {
# ============================================================
	my $self     = shift;
	my $division = shift;

	my $i = first_index { $_->{ name } eq $division->{ name } } @{ $self->{ divisions }};
	# New division
	if( $i < 0 ) { 
		push @{ $self->{ divisions }}, $division; 

	# Merge with existing division
	} else { 
		my $previous = $self->{ divisions }[ $i ];
		my $score    = {};
		foreach my $athlete (@{ $previous->{ athletes }}) { $score->{ $athlete->{ name }} = $athlete; }
		foreach my $i (0 .. $#{ $division->{ athletes }}) {
			my $name = $division->{ athletes }[ $i ]{ name };
			$division->{ athletes }[ $i ] = $score->{ $name } if( exists $score->{ $name } );
			$division->{ athletes }[ $i ]{ id } = $i;
		}
		$self->{ divisions }[ $i ] = $division; 
	}
}

1;
