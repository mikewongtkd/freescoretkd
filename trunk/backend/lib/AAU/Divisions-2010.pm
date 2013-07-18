package AAU::Divisions;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self = shift;
	$self->{ divisions } = {};
	my $context;
	my $header = <DATA>;
	while( <DATA> ) {
		chomp;
		my ($event, $gender, $min_age, $max_age, $weight_class, $min_weight, $max_weight, $belt) = split /\t/;
		my $age_range    = age_range_string( $min_age, $max_age );
		my $weight_range = weight_range_string( $min_weight, $max_weight );
		$self->{ divisions }{ $event }{ $gender }{ $age_range }{ $weight_range }{ $belt } = [];
	}
}

# ============================================================
sub add_athlete {
# ============================================================
	my $self    = shift;
	my $athlete = shift;
	foreach my $event (keys %{ $self->{ divisions }}) {
		foreach my $gender (keys %{ $self->{ divisions }{ $event }}) {
			next unless $athlete->{ gender } =~ /$gender/i;
			my $official_age_group = 0;
			foreach my $age_group (keys %{ $self->{ divisions }{ $event }{ $gender }}) { 
				if( is_in_age_group( $age_group, $athlete->{ age } )) {
					$official_age_group = 1;

					my $official_weight_group = 0;
					foreach my $weight_group (keys %{ $self->{ divisions }{ $event }{ $gender }{ $age_group }}) { 
						if( is_in_weight_group( $weight_group, $athlete->{ weight } )) {
						}
						foreach my $belt (keys %{ $self->{ divisions }{ $event }{ $gender }{ $age_group }{ $weight_group }}) { 
						}
					}
					if( not $official_weight_group ) {
						die "Athlete $athlete->{ name } does not have a valid weight '$athlete->{ weight }' $!";
					}
				}
			}
			if( not $official_age_group ) {
				# Create a new division
			}
		}
	}
}

# ============================================================
sub get_divisions {
# ============================================================
	my $self = shift;
}

# ============================================================
sub age_range_values {
# ============================================================
	local $_ = shift;

	if( /^(\d+) year olds/ ) {
		return ($1, $1);
	} elsif( /^(\d+) and older/ ) {
		return ($1, 0);
	} elsif( /^(\d+) to (\d+) year olds/ ) {
		return ($1, $2);
	} else {
		die "Bad age range string '$_'; does not match any known pattern $!";
	}
}

# ============================================================
sub age_range_string {
# ============================================================
	my $min = shift;
	my $max = shift;

	my $age_range = '';
	if( $min == $max ) {
		$age_range = "$min year olds"
	} elsif( $max == 0 ) {
		$age_range = "$min and older"
	} else {
		$age_range = "$min to $max year olds";
	}
	return $age_range;
}

# ============================================================
sub weight_range_string {
# ============================================================
	my $min = shift;
	my $max = shift;

	my $weight_range = '';
	if( $min == 0 ) {
		$weight_range = "$max lbs and under"
	} elsif( $max == 0 ) {
		$weight_range = "$min lbs and over"
	} else {
		$weight_range = "$min to $max lbs";
	}
	return $weight_range;
}

# ============================================================
sub is_in_age_group {
# ============================================================
	local $_ = shift;
	my $age  = shift;
	my $min  = 0;
	my $max  = 0;

	if( /^(\d+) year olds/ ) {
		$min = $1;
		$max = $1;
	} elsif( /^(\d+) and older/ ) {
		$min = $1;
	} elsif( /^(\d+) to (\d+) year olds/ ) {
		$min = $1;
		$max = $2;
	} else {
		die "Bad age range string '$_'; does not match any known pattern $!";
	}

	return ( $age >= $min && ( $age <= $max || $max == 0 ));
}

# ============================================================
sub is_in_weight_group {
# ============================================================
	local $_   = shift;
	my $weight = shift;
	my $min    = 0;
	my $max    = 0;

	if( /^(\d+) lbs and under/ ) {
		$max = $1;
	} elsif( /^(\d+) lbs and over/ ) {
		$min = $1;
	} elsif( /^(\d+) to (\d+) lbs/ ) {
		$min = $1;
		$max = $2;
	} else {
		die "Bad weight range string '$_'; does not match any known pattern $!";
	}

	return (( $weight > $min || $min == 0) && ( $weight <= $max || $max == 0 ));
}

# ============================================================
sub is_in_belt_group {
# ============================================================
	local $_ = shift;
	my $belt = shift;

	return 1 if( /^All$/ );
	return 1 if( /^Black$/ && $belt =~ /dan/i );
	return 1 if( /^Color$/ && $belt !~ /dan/i );
	return 0;
}

__DATA__
Event	Gender	MinAge	MaxAge	WeightClass	MinWeight	MaxWeight	Belt
Point Sparring	Male	5	5	Light	0	45	All
Point Sparring	Male	5	5	Heavy	45	0	All
Point Sparring	Male	6	7	Light	0	45	All
Point Sparring	Male	6	7	Middle	45	55.9	All
Point Sparring	Male	6	7	Heavy	55.9	0	All
Point Sparring	Male	8	9	Light	0	60	All
Point Sparring	Male	8	9	Middle	60	70.9	All
Point Sparring	Male	8	9	Heavy	70.9	0	All
Point Sparring	Male	10	11	Light	0	75	All
Point Sparring	Male	10	11	Middle	75	85.9	All
Point Sparring	Male	10	11	Heavy	85.9	0	All
Point Sparring	Male	12	13	Light	0	100	All
Point Sparring	Male	12	13	Middle	100	115.9	All
Point Sparring	Male	12	13	Heavy	115.9	0	All
Point Sparring	Male	14	15	Light	0	115	All
Point Sparring	Male	14	15	Middle	115	145.9	All
Point Sparring	Male	14	15	Heavy	145.9	0	All
Point Sparring	Male	16	17	Light	0	135	All
Point Sparring	Male	16	17	Middle	135	165.9	All
Point Sparring	Male	16	17	Heavy	165.9	0	All
Point Sparring	Male	18	34	Light	0	125	All
Point Sparring	Male	18	34	Welter	125	155.9	All
Point Sparring	Male	18	34	Middle	155.9	185.9	All
Point Sparring	Male	18	34	Heavy	185.9	0	All
Point Sparring	Male	35	44	Light	0	125	All
Point Sparring	Male	35	44	Welter	125	155.9	All
Point Sparring	Male	35	44	Middle	155.9	185.9	All
Point Sparring	Male	35	44	Heavy	185.9	0	All
Point Sparring	Male	45	0	Light	0	125	All
Point Sparring	Male	45	0	Welter	125	155.9	All
Point Sparring	Male	45	0	Middle	155.9	185.9	All
Point Sparring	Male	45	0	Heavy	185.9	0	All
Point Sparring	Female	5	5	Light	0	45	All
Point Sparring	Female	5	5	Heavy	45	0	All
Point Sparring	Female	6	7	Light	0	45	All
Point Sparring	Female	6	7	Middle	45	55.9	All
Point Sparring	Female	6	7	Heavy	55.9	0	All
Point Sparring	Female	8	9	Light	0	60	All
Point Sparring	Female	8	9	Middle	60	70.9	All
Point Sparring	Female	8	9	Heavy	70.9	0	All
Point Sparring	Female	10	11	Light	0	80	All
Point Sparring	Female	10	11	Middle	80	90.9	All
Point Sparring	Female	10	11	Heavy	90.9	0	All
Point Sparring	Female	12	13	Light	0	105	All
Point Sparring	Female	12	13	Middle	105	120.9	All
Point Sparring	Female	12	13	Heavy	120.9	0	All
Point Sparring	Female	14	15	Light	0	110	All
Point Sparring	Female	14	15	Middle	110	140.9	All
Point Sparring	Female	14	15	Heavy	140.9	0	All
Point Sparring	Female	16	17	Light	0	115	All
Point Sparring	Female	16	17	Middle	115	145.9	All
Point Sparring	Female	16	17	Heavy	145.9	0	All
Point Sparring	Female	18	34	Light	0	110	All
Point Sparring	Female	18	34	Welter	110	125.9	All
Point Sparring	Female	18	34	Middle	125.9	155.9	All
Point Sparring	Female	18	34	Heavy	155.9	0	All
Point Sparring	Female	35	44	Light	0	110	All
Point Sparring	Female	35	44	Welter	110	125.9	All
Point Sparring	Female	35	44	Middle	125.9	155.9	All
Point Sparring	Female	35	44	Heavy	155.9	0	All
Point Sparring	Female	45	0	Light	0	110	All
Point Sparring	Female	45	0	Welter	110	125.9	All
Point Sparring	Female	45	0	Middle	125.9	155.9	All
Point Sparring	Female	45	0	Heavy	155.9	0	All
Olympic Sparring	Male	14	17	Fly	0	105.7	Color
Olympic Sparring	Male	14	17	Feather	105.7	121	Color
Olympic Sparring	Male	14	17	Welter	121	138.6	Color
Olympic Sparring	Male	14	17	Middle	138.6	160.6	Color
Olympic Sparring	Male	14	17	Heavy	160.6	0	Color
Olympic Sparring	Male	14	17	Fin	0	99	Black
Olympic Sparring	Male	14	17	Fly	99	105.6	Black
Olympic Sparring	Male	14	17	Bantam	105.6	112.2	Black
Olympic Sparring	Male	14	17	Feather	112.2	121	Black
Olympic Sparring	Male	14	17	Light	121	129.8	Black
Olympic Sparring	Male	14	17	Welter	129.8	138.6	Black
Olympic Sparring	Male	14	17	Light Middle	138.6	149.6	Black
Olympic Sparring	Male	14	17	Middle	149.6	160.6	Black
Olympic Sparring	Male	14	17	Light Heavy	160.6	171.6	Black
Olympic Sparring	Male	14	17	Heavy	171.6	0	Black
Olympic Sparring	Male	18	34	Fly	0	127.7	Color
Olympic Sparring	Male	18	34	Feather	127.7	147.4	Color
Olympic Sparring	Male	18	34	Welter	147.4	171.6	Color
Olympic Sparring	Male	18	34	Heavy	171.6	0	Color
Olympic Sparring	Male	18	34	Fin	0	119.1	Black
Olympic Sparring	Male	18	34	Fly	119.1	127.9	Black
Olympic Sparring	Male	18	34	Bantam	127.9	138.9	Black
Olympic Sparring	Male	18	34	Feather	138.9	149.9	Black
Olympic Sparring	Male	18	34	Light	149.9	163.1	Black
Olympic Sparring	Male	18	34	Welter	163.1	176.4	Black
Olympic Sparring	Male	18	34	Middle	176.4	191.8	Black
Olympic Sparring	Male	18	34	Heavy	191.8	0	Black
Olympic Sparring	Male	35	44	Fly	0	127.7	All
Olympic Sparring	Male	35	44	Feather	127.7	147.4	All
Olympic Sparring	Male	35	44	Welter	147.4	171.6	All
Olympic Sparring	Male	35	44	Heavy	171.6	0	All
Olympic Sparring	Male	45	0	Fly	0	127.7	All
Olympic Sparring	Male	45	0	Feather	127.7	147.4	All
Olympic Sparring	Male	45	0	Welter	147.4	171.6	All
Olympic Sparring	Male	45	0	Heavy	171.6	0	All
Olympic Sparring	Female	14	17	Fly	0	96.9	Color
Olympic Sparring	Female	14	17	Feather	96.9	107.8	Color
Olympic Sparring	Female	14	17	Welter	107.8	121	Color
Olympic Sparring	Female	14	17	Middle	121	138.6	Color
Olympic Sparring	Female	14	17	Heavy	138.6	0	Color
Olympic Sparring	Female	14	17	Fin	0	92.4	Black
Olympic Sparring	Female	14	17	Fly	92.4	96.8	Black
Olympic Sparring	Female	14	17	Bantam	96.8	101.2	Black
Olympic Sparring	Female	14	17	Feather	101.2	107.8	Black
Olympic Sparring	Female	14	17	Light	107.8	114.4	Black
Olympic Sparring	Female	14	17	Welter	114.4	121	Black
Olympic Sparring	Female	14	17	Light Middle	121	129.8	Black
Olympic Sparring	Female	14	17	Middle	129.8	138.6	Black
Olympic Sparring	Female	14	17	Light Heavy	138.6	149.6	Black
Olympic Sparring	Female	14	17	Heavy	149.6	0	Black
Olympic Sparring	Female	18	34	Fly	0	112.3	Color
Olympic Sparring	Female	18	34	Feather	112.3	129.8	Color
Olympic Sparring	Female	18	34	Welter	129.8	147.4	Color
Olympic Sparring	Female	18	34	Heavy	147.4	0	Color
Olympic Sparring	Female	18	34	Fin	0	101.5	Black
Olympic Sparring	Female	18	34	Fly	101.5	108	Black
Olympic Sparring	Female	18	34	Bantam	108	116.9	Black
Olympic Sparring	Female	18	34	Feather	116.9	125.7	Black
Olympic Sparring	Female	18	34	Light	125.7	136.7	Black
Olympic Sparring	Female	18	34	Welter	136.7	147.7	Black
Olympic Sparring	Female	18	34	Middle	147.7	160.9	Black
Olympic Sparring	Female	18	34	Heavy	160.9	0	Black
Olympic Sparring	Female	35	44	Fly	0	112.3	All
Olympic Sparring	Female	35	44	Feather	112.3	129.8	All
Olympic Sparring	Female	35	44	Welter	129.8	147.4	All
Olympic Sparring	Female	35	44	Heavy	147.4	0	All
Olympic Sparring	Female	45	0	Fly	0	112.3	All
Olympic Sparring	Female	45	0	Feather	112.3	129.8	All
Olympic Sparring	Female	45	0	Welter	129.8	147.4	All
Olympic Sparring	Female	45	0	Heavy	147.4	0	All

