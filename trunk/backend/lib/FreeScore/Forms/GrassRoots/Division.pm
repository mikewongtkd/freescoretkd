package FreeScore::Forms::GrassRoots::Division;
use FreeScore;
use FreeScore::Forms::Division;
use base qw( FreeScore::Forms::Division );

# ============================================================
sub read {
# ============================================================
	my $self  = shift;
	my $index = 0;
	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			$self->{ $key } = $value;
			next;
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns = split /\t/;
		my $athlete = shift @columns;
		my $rank    = shift @columns;
		my $n       = $#columns < 2 ? 2 : $#columns;
		my @scores  = ();
		foreach my $i ( 0 .. $n ) {
			$scores[ $i ] = $columns[ $i ] eq '' ? -1.0 : $columns[ $i ];
		}
		push @{ $self->{ division }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ] };
		$index++;
	}
	close FILE;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	foreach my $athlete (@{ $self->{ division }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @{ $athlete->{ scores }} ), "\n";
	}
	close FILE;
}
1;
