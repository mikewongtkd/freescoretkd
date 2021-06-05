package FreeScore::Event::Recognized::Score;
use base qw( FreeScore::Component );
use List::Util qw( all any reduce );

our @ACCURACY     = qw( major minor );
our @PRESENTATION = qw( power rhythm energy );
our @CATEGORIES   = ( @ACCURACY, @PRESENTATION );

# ============================================================
sub accuracy {
# ============================================================
#**
# @method ()
# @brief Calculates the accuracy subtotal
	my $self = shift;

	# Cast values as numerical
	$self->{ $_ } = 0.0 + sprintf( "%.1f", $self->{ $_ } foreach (@ACCURACY);
	my $accuracy = 4.0 - (reduce { $a + $b } map { $self->{ $_ } } @ACCURACY);
	$accuracy = $accuracy > 4 ? 4 : $accuracy;
	$accuracy = $accuracy < 0 ? 0 : $accuracy;
	return $accuracy;
}


# ============================================================
sub complete {
# ============================================================
#**
# @method ()
# @brief A Recognized Poomsae score is complete if all fields have valid values
#*
	my $self         = shift;
	my $accuracy     = all { defined $self->{ $_ } && $self->{ $_ } >= 0 } @ACCURACY;
	my $presentation = all { defined $self->{ $_ } && $self->{ $_ } >= 0.5 && $self->{ $_ } <= 2.0 } @PRESENTATION;
	my $complete     = $accuracy && $presentation;

	return $complete;
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
sub presentation {
# ============================================================
#**
# @method ()
# @brief Calculates the presentation subtotal
	my $self = shift;

	# Cast values as numerical
	$self->{ $_ } = 0.0 + sprintf( "%.1f", $self->{ $_ } foreach (@PRESENTATION);

	my $presentation = (reduce { $a + $b } map { $self->{ $_ } } @PRESENTATION);
	$presentation = $presentation < 1.5 ? 1.5 : $presentation;
	$presentation = $presentation > 6   ? 6   : $presentation;
	return $presentation;
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
