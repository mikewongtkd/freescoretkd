package FreeScore::Event::Recognized::Scores;
use base qw( FreeScore::Component );
use List::Util qw( any );

our @CATEGORIES = qw( major minor power rhythm energy );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	my $score  = shift;
	$self->SUPER::init( $parent );

	if( $score ) { return $self->context( $score ); } 
	else         { return $self; }
}

# ============================================================
sub parse {
# ============================================================
	my $self   = shift;
	my @values = @_;
	
	if( @values == 1 ) { 
		my $ref = ref $values[ 0 ];

		# String of tab-separated values
		if( ! $ref )             { @values = split /\t/, $values[ 0 ]; }

		# Array of values
		elsif( $ref eq 'ARRAY' ) { @values = @{ $values[ 0 ]}; }

		# Hash of values
		elsif( $ref eq 'HASH')   { 
			my $hash = $values[ 0 ];
			foreach my $key (keys %$hash) {
				die "Score Error: Invalid category $key $!" unless any { $key eq $_ } @CATEGORIES;
				$self->{ $key } = 0 + $hash->{ $key };
			}
			return;
		}
	}

	# Process string or array of values
	foreach my $category (@CATEGORIES) {
		my $value = shift @values;
		next unless( defined $value );
		$value = 0 + $value;
		$self->{ $category } = $value;
	}
}

# ============================================================
sub string {
# ============================================================
	my $self = shift;

	my @tsv = ();
	foreach my $category (@CATEGORIES) {
		if( exists $self->{ $category }) { push @tsv, 0 + $self->{ $category }; } 
		else                             { push @tsv, '-'; }
	}
	return join "\t", @tsv;
}

1;
