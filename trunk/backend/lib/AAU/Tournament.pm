package AAU::Tournament;
use YAML;

our $YEAR = 2013;

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
	my $file = shift;

	$self->{ _events } = {};
	
	if( -e $file ) {
		my $info = YAML::LoadFile( $file );
		foreach my $key (keys %$info) { $self->{ $key } = $info->{ $key }; }
	}

	# ===== PARSE DIVISION INFORMATION
	my $header = <DATA>;
	while( <DATA> ) {
		chomp;
		next if /^$/;
		my ($event, $gender, $min_age, $max_age, $weight_class, $min_weight, $max_weight, $belt) = split /\t/;
		my $age_group    = age_group_description( $min_age, $max_age );
		my $weight_group = weight_group_description( $weight_class, $min_weight, $max_weight );
		my @belt_groups  = belt_groups( $belt, $event, $max_age );

		# ===== CREATE PLACEHOLDERS FOR DIVISIONS
		foreach my $belt_group (@belt_groups) {
			$self->{ _events }{ $event }{ $gender }{ $age_group }{ $belt_group }{ $weight_group } = [];
		}
	}
}

# ============================================================
sub add {
# ============================================================
	my $self    = shift;
	my $athlete = shift;

	my $age    = $athlete->competition_age();
	my $belt   = $athlete->{ 'Highest rank in your team' } || $athlete->{ Rank };
	my $name   = $athlete->name();
	my $weight = $athlete->weight();

	EVENT: foreach my $event ($athlete->events()) {
		$gender  = ($athlete->{ Gender } =~ /^M/) ? 'Male' : 'Female';

		# ===== AGE GROUPS
		my $age_group  = undef;
		my @age_groups = $self->ages( $event, $gender );
		AGE: foreach my $group (@age_groups) {
			if( is_in_age_group( $group, $age )) {
				$age_group = $group;
				last AGE;
			}
		}

		# ===== BELT GROUPS
		my $belt_group  = undef;
		my @belt_groups = $self->belts( $event, $gender, $age_group );
		BELT: foreach my $group (@belt_groups) {
			if( is_in_belt_group( $group, $belt )) {
				$belt_group = $group;
				last BELT;
			}
		}

		# ==== WEIGHT GROUP
		my $weight_group  = undef;
		my @weight_groups = $self->weights( $event, $gender, $age_group, $belt_group );
		WEIGHT: foreach $group (@weight_groups) {
			if( is_in_weight_group( $group, $weight )) {
				$weight_group = $group;
				last WEIGHT;
			}
		}

		next EVENT unless( defined $age_group && defined $belt_group && defined $weight_group );
		push @{ $self->{ _events }{ $event }{ $gender }{ $age_group }{ $belt_group }{ $weight_group }}, $athlete;
	}
}

# ============================================================
sub ages {
# ============================================================
	my $self   = shift;
	my $event  = shift;
	my $gender = shift;
	return sort { $a <=> $b } keys %{ $self->{ _events }{ $event }{ $gender }};
}

# ============================================================
sub athletes {
# ============================================================
	my $self         = shift;
	my $event        = shift;
	my $gender       = shift;
	my $age_group    = shift;
	my $belt_group   = shift;
	my $weight_group = shift;
	return @{ $self->{ _events }{ $event }{ $gender }{ $age_group }{ $belt_group }{ $weight_group }};
}

# ============================================================
sub belts {
# ============================================================
	my $self      = shift;
	my $event     = shift;
	my $gender    = shift;
	my $age_group = shift;
	my $sequence  = { Novice => 1, Intermediate => 2, Advanced => 3, Black => 4, Black1 => 5, Black2 => 6, Black2up => 7, Black3 => 8, Black3up => 9, Black4up => 10 };
	return sort {
		$sequence->{ $a } <=> $sequence->{ $b };
	} keys %{ $self->{ _events }{ $event }{ $gender }{ $age_group }};
}

# ============================================================
sub belt_groups {
# ============================================================
	my $belt    = shift;
	my $event   = shift;
	my $max_age = shift;

	my @belt_groups = ();
	if( $belt eq 'All' ) {
		push @belt_groups, qw( Novice Intermediate Advanced );

		if( $event =~ /(?:forms|breaking)/i ) {
			if   ( $max_age <= 9 )                    { push @belt_groups, qw( Black );                         }
			elsif( $max_age >= 11 && $max_age <= 17 ) { push @belt_groups, qw( Black1 Black2up );               }
			elsif( $max_age == 32 || $max_age == 0 )  { push @belt_groups, qw( Black1 Black2 Black3up );        }
			elsif( $max_age == 42 )                   { push @belt_groups, qw( Black1 Black2 Black3 Black4up ); }

		} elsif( $event =~ /sparring/i ) {
			push @belt_groups, qw( Black );
		}

	} elsif( $belt eq 'Color' ) {
		@belt_groups = qw( Novice Intermediate Advanced );

	} elsif( $belt eq 'Black' ) {
		if( $event =~ /(?:team)/i ) {
				push @belt_groups, qw( Black );

		} elsif( $event =~ /(?:forms|breaking)/i ) {
			if   ( $max_age <= 9 )                    { push @belt_groups, qw( Black );                         }
			elsif( $max_age >= 11 && $max_age <= 17 ) { push @belt_groups, qw( Black1 Black2up );               }
			elsif( $max_age == 32 || $max_age == 0 )  { push @belt_groups, qw( Black1 Black2 Black3up );        }
			elsif( $max_age == 42 )                   { push @belt_groups, qw( Black1 Black2 Black3 Black4up ); }

		} elsif( $event =~ /sparring/i ) {
			push @belt_groups, qw( Black );
		}
	}

	return @belt_groups;
}

# ============================================================
sub events {
# ============================================================
	my $self = shift;
	return sort keys %{ $self->{ _events }};
}

# ============================================================
sub genders {
# ============================================================
	my $self   = shift;
	my $event = shift;
	return sort keys %{ $self->{ _events }{ $event }};
}

# ============================================================
sub weights {
# ============================================================
	my $self       = shift;
	my $event      = shift;
	my $gender     = shift;
	my $age_group  = shift;
	my $belt_group = shift;
	return sort { 
		my ($a_min) = $a =~ /\((\d+(?:\.\d+)?)/;
		my ($b_min) = $b =~ /\((\d+(?:\.\d+)?)/;
		$a_min <=> $b_min;
	} keys %{ $self->{ _events }{ $event }{ $gender }{ $age_group }{ $belt_group }};
}

# ============================================================
sub get_divisions {
# ============================================================
	my $self = shift;
}

# ============================================================
sub age_group_description {
# ============================================================
	my $min = shift;
	my $max = shift;

	my $age_group = '';
	if( $min == 0 && $max == 0 ) {
		$age_group = "All ages";
	} elsif( $min == $max ) {
		$age_group = "$min year old";
	} elsif( $max == 0 ) {
		$age_group = "$min and older";
	} else {
		$age_group = "$min to $max year old";
	}
	return $age_group;
}

# ============================================================
sub weight_group_description {
# ============================================================
	my $class = shift;
	my $min   = shift;
	my $max   = shift;

	my $weight_group = '';
	if( $min == 0 && $max == 0 ) {
		$weight_group = "All weights";
	} elsif( $min == 0 ) {
		$weight_group = "$class ($max lbs and under)";
	} elsif( $max == 0 ) {
		$weight_group = "$class ($min lbs and over)";
	} else {
		$weight_group = "$class ($min to $max lbs)";
	}
	return $weight_group;
}

# ============================================================
sub is_in_age_group {
# ============================================================
	local $_ = shift;
	my $age  = shift;
	my $min  = 0;
	my $max  = 0;

	if( /^All ages/ ) {
		return 1;
	} elsif( /^(\d+) year old/ ) {
		$min = $1;
		$max = $1;
	} elsif( /^(\d+) and older/ ) {
		$min = $1;
	} elsif( /^(\d+) to (\d+) year old/ ) {
		$min = $1;
		$max = $2;
	} else {
		return 0;
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

	if( /^All weights/ ) {
		return 1;
	} elsif( /\((\d+(?:\.\d+)?) lbs and under\)/ ) {
		$max = $1;
	} elsif( /\((\d+(?:\.\d+)?) lbs and over\)/ ) {
		$min = $1;
	} elsif( /\((\d+(?:\.\d+)?) to (\d+(?:\.\d+)?) lbs\)/ ) {
		$min = $1;
		$max = $2;
	} else {
		return 0;
	}

	return (( $weight > $min || $min == 0) && ( $weight <= $max || $max == 0 ));
}

# ============================================================
sub is_in_belt_group {
# ============================================================
	local $_ = shift;
	my $belt = shift;

	if( /^Novice$/ ) {
		return (
			$belt eq 'White' ||
			$belt eq 'Yellow' ||
			$belt eq 'Orange'
		);
	} elsif( /^Intermediate$/ ) {
		return (
			$belt eq 'Green' ||
			$belt eq 'Blue' ||
			$belt eq 'Purple'
		);
	} elsif( /^Advanced$/ ) {
		return (
			$belt eq 'Brown' ||
			$belt eq 'Red'
		);
	} elsif( /^Black1$/ ) {
		return ( $belt =~ /Black/ && $belt =~ /1/ );

	} elsif( /^Black2up$/ ) {
		return ( $belt =~ /Black/ && $belt =~ /(?:2|3|4)/ );

	} elsif( /^Black2$/ ) {
		return ( $belt =~ /Black/ && $belt =~ /2/ );

	} elsif( /^Black3up$/ ) {
		return ( $belt =~ /Black/ && $belt =~ /(?:3|4)/ );

	} elsif( /^Black3$/ ) {
		return ( $belt =~ /Black/ && $belt =~ /3/ );

	} elsif( /^Black4up$/ ) {
		return ( $belt =~ /Black/ && $belt =~ /4/ );

	} elsif( /^Black$/ ) {
		return ( $belt =~ /Black/ );
	}

	return 0;
}

# ============================================================
sub divisions {
# ============================================================
	my $self             = shift;
	my $belt_description = { Black => "Black Belt (1st Dan & higher)", Black1 => "Black Belt (1st Dan)", Black2 => "Black Belt (2nd Dan)", Black2up => "Black Belt (2nd Dan & higher)", Black3 => "Black Belt (3rd Dan)", Black3up => "Black Belt (3rd Dan & higher)", Black4up => "Black Belt (4th Dan & higher)" };
	my $divisions        = {};

	my $id = 1000;
	foreach my $event ( $self->events() ) {
		my @genders = $self->genders( $event );
		foreach my $gender (@genders) {
			my @age_groups = $self->ages( $event, $gender );
			foreach my $age_group (@age_groups) {
				my @belt_groups = $self->belts( $event, $gender, $age_group );
				foreach my $belt_group (@belt_groups) {
					my $belt = exists $belt_description->{ $belt_group } ? $belt_description->{ $belt_group } : $belt_group;

					my @weight_groups = $self->weights( $event, $gender, $age_group, $belt_group );
					foreach my $weight_group ( @weight_groups ) {
						my @athletes = $self->athletes( $event, $gender, $age_group, $belt_group, $weight_group );
						next unless @athletes;
						push @{ $divisions->{ $event }}, {
							id          => $id,
							event       => $event,
							gender      => $gender,
							age         => $age_group,
							belt        => $belt,
							weight      => ($weight_group eq 'All weights' ? '' : $weight_group),
							athletes    => \@athletes
						};
						$id++;
					}
				}
			}
		}
		$id = (1000 * (int($id/1000) + 1));
	}
	return $divisions;
}

1;

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
Point Sparring	Male	18	32	Light	0	125	All
Point Sparring	Male	18	32	Welter	125	155.9	All
Point Sparring	Male	18	32	Middle	155.9	185.9	All
Point Sparring	Male	18	32	Heavy	185.9	0	All
Point Sparring	Male	33	42	Light	0	125	All
Point Sparring	Male	33	42	Welter	125	155.9	All
Point Sparring	Male	33	42	Middle	155.9	185.9	All
Point Sparring	Male	33	42	Heavy	185.9	0	All
Point Sparring	Male	43	0	Light	0	125	All
Point Sparring	Male	43	0	Welter	125	155.9	All
Point Sparring	Male	43	0	Middle	155.9	185.9	All
Point Sparring	Male	43	0	Heavy	185.9	0	All
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
Point Sparring	Female	18	32	Light	0	110	All
Point Sparring	Female	18	32	Welter	110	125.9	All
Point Sparring	Female	18	32	Middle	125.9	155.9	All
Point Sparring	Female	18	32	Heavy	155.9	0	All
Point Sparring	Female	33	42	Light	0	110	All
Point Sparring	Female	33	42	Welter	110	125.9	All
Point Sparring	Female	33	42	Middle	125.9	155.9	All
Point Sparring	Female	33	42	Heavy	155.9	0	All
Point Sparring	Female	43	0	Light	0	110	All
Point Sparring	Female	43	0	Welter	110	125.9	All
Point Sparring	Female	43	0	Middle	125.9	155.9	All
Point Sparring	Female	43	0	Heavy	155.9	0	All
Olympic Sparring	Male	5	5	Light	0	45	All
Olympic Sparring	Male	5	5	Heavy	45.1	0	All
Olympic Sparring	Male	6	7	Fly	0	40	All
Olympic Sparring	Male	6	7	Feather	40.1	52	All
Olympic Sparring	Male	6	7	Light	52.1	65	All
Olympic Sparring	Male	6	7	Middle	65.1	78	All
Olympic Sparring	Male	6	7	Light Heavy	78.1	90	All
Olympic Sparring	Male	6	7	Heavy	90	0	All
Olympic Sparring	Male	8	9	Fly	0	55	All
Olympic Sparring	Male	8	9	Feather	55.1	67	All
Olympic Sparring	Male	8	9	Light	67.1	80	All
Olympic Sparring	Male	8	9	Middle	80.1	92	All
Olympic Sparring	Male	8	9	Light Heavy	92.1	105	All
Olympic Sparring	Male	8	9	Heavy	105.1	0	All
Olympic Sparring	Male	10	11	Fly	0	65	All
Olympic Sparring	Male	10	11	Feather	65.1	78	All
Olympic Sparring	Male	10	11	Light	78.1	90	All
Olympic Sparring	Male	10	11	Middle	90.1	102	All
Olympic Sparring	Male	10	11	Light Heavy	102.1	115	All
Olympic Sparring	Male	10	11	Heavy	115.1	0	All
Olympic Sparring	Male	12	14	Fly	0	81.6	Color
Olympic Sparring	Male	12	14	Feather	81.7	99.2	Color
Olympic Sparring	Male	12	14	Welter	99.3	116.8	Color
Olympic Sparring	Male	12	14	Middle	116.9	134.5	Color
Olympic Sparring	Male	12	14	Heavy	134.6	0	Color
Olympic Sparring	Male	12	14	Fin	0	72.8	Black
Olympic Sparring	Male	12	14	Fly	72.9	81.6	Black
Olympic Sparring	Male	12	14	Bantam	81.7	90.4	Black
Olympic Sparring	Male	12	14	Feather	90.5	99.2	Black
Olympic Sparring	Male	12	14	Light	99.3	108	Black
Olympic Sparring	Male	12	14	Welter	108.1	116.8	Black
Olympic Sparring	Male	12	14	Light Middle	116.9	125.7	Black
Olympic Sparring	Male	12	14	Middle	125.8	134.5	Black
Olympic Sparring	Male	12	14	Light Heavy	134.6	143.3	Black
Olympic Sparring	Male	12	14	Heavy	143.4	0	Black
Olympic Sparring	Male	15	17	Fly	0	105.9	Color
Olympic Sparring	Male	15	17	Feather	106.0	121.3	Color
Olympic Sparring	Male	15	17	Welter	121.4	138.9	Color
Olympic Sparring	Male	15	17	Middle	139	160.9	Color
Olympic Sparring	Male	15	17	Heavy	161	0	Color
Olympic Sparring	Male	15	17	Fin	0	99.2	Black
Olympic Sparring	Male	15	17	Fly	99.3	105.8	Black
Olympic Sparring	Male	15	17	Bantam	105.9	112.4	Black
Olympic Sparring	Male	15	17	Feather	112.5	121.3	Black
Olympic Sparring	Male	15	17	Light	121.4	130.1	Black
Olympic Sparring	Male	15	17	Welter	130.2	138.9	Black
Olympic Sparring	Male	15	17	Light Middle	139	149.9	Black
Olympic Sparring	Male	15	17	Middle	150	160.9	Black
Olympic Sparring	Male	15	17	Light Heavy	161	172	Black
Olympic Sparring	Male	15	17	Heavy	172.1	0	Black
Olympic Sparring	Male	18	32	Fly	0	129.9	Color
Olympic Sparring	Male	18	32	Feather	130	149.9	Color
Olympic Sparring	Male	18	32	Welter	150	176.4	Color
Olympic Sparring	Male	18	32	Heavy	176.5	0	Color
Olympic Sparring	Male	18	32	Fin	0	119.1	Black
Olympic Sparring	Male	18	32	Fly	119.1	127.9	Black
Olympic Sparring	Male	18	32	Bantam	127.9	138.9	Black
Olympic Sparring	Male	18	32	Feather	138.9	149.9	Black
Olympic Sparring	Male	18	32	Light	149.9	163.1	Black
Olympic Sparring	Male	18	32	Welter	163.1	176.4	Black
Olympic Sparring	Male	18	32	Middle	176.4	191.8	Black
Olympic Sparring	Male	18	32	Heavy	191.8	0	Black
Olympic Sparring	Male	33	42	Fly	0	129.9	All
Olympic Sparring	Male	33	42	Feather	130	149.9	All
Olympic Sparring	Male	33	42	Welter	150	176.4	All
Olympic Sparring	Male	33	42	Heavy	176.5	0	All
Olympic Sparring	Male	43	0	Fly	0	129.9	All
Olympic Sparring	Male	43	0	Feather	130	149.9	All
Olympic Sparring	Male	43	0	Welter	150	176.4	All
Olympic Sparring	Male	43	0	Heavy	176.5	0	All
Olympic Sparring	Female	5	5	Light	0	45	All
Olympic Sparring	Female	5	5	Heavy	45.1	0	All
Olympic Sparring	Female	6	7	Fly	0	40	All
Olympic Sparring	Female	6	7	Feather	40.1	52	All
Olympic Sparring	Female	6	7	Light	52.1	65	All
Olympic Sparring	Female	6	7	Middle	65.1	78	All
Olympic Sparring	Female	6	7	Light Heavy	78.1	90	All
Olympic Sparring	Female	6	7	Heavy	90	0	All
Olympic Sparring	Female	8	9	Fly	0	55	All
Olympic Sparring	Female	8	9	Feather	55.1	67	All
Olympic Sparring	Female	8	9	Light	67.1	80	All
Olympic Sparring	Female	8	9	Middle	80.1	92	All
Olympic Sparring	Female	8	9	Light Heavy	92.1	105	All
Olympic Sparring	Female	8	9	Heavy	105.1	0	All
Olympic Sparring	Female	10	11	Fly	0	65	All
Olympic Sparring	Female	10	11	Feather	65.1	78	All
Olympic Sparring	Female	10	11	Light	78.1	90	All
Olympic Sparring	Female	10	11	Middle	90.1	102	All
Olympic Sparring	Female	10	11	Light Heavy	102.1	115	All
Olympic Sparring	Female	10	11	Heavy	115.1	0	All
Olympic Sparring	Female	12	14	Fly	0	72.8	Color
Olympic Sparring	Female	12	14	Feather	72.9	90.4	Color
Olympic Sparring	Female	12	14	Welter	90.4	103.6	Color
Olympic Sparring	Female	12	14	Middle	103.7	121.3	Color
Olympic Sparring	Female	12	14	Heavy	121.4	0	Color
Olympic Sparring	Female	12	14	Fin	0	65.9	Black
Olympic Sparring	Female	12	14	Fly	66	72.8	Black
Olympic Sparring	Female	12	14	Feather	81.7	90.4	Black
Olympic Sparring	Female	12	14	Light	90.5	97	Black
Olympic Sparring	Female	12	14	Welter	97.1	103.6	Black
Olympic Sparring	Female	12	14	Light Middle	103.7	112.4	Black
Olympic Sparring	Female	12	14	Middle	112.5	121.3	Black
Olympic Sparring	Female	12	14	Light Heavy	121.4	130.1	Black
Olympic Sparring	Female	12	14	Heavy	130.2	0	Black
Olympic Sparring	Female	15	17	Fly	0	97	Color
Olympic Sparring	Female	15	17	Feather	97.1	108	Color
Olympic Sparring	Female	15	17	Welter	108.1	121.3	Color
Olympic Sparring	Female	15	17	Middle	121.4	138.9	Color
Olympic Sparring	Female	15	17	Heavy	139	0	Color
Olympic Sparring	Female	15	17	Fin	0	92.6	Black
Olympic Sparring	Female	15	17	Fly	92.7	97	Black
Olympic Sparring	Female	15	17	Bantam	97.1	101.4	Black
Olympic Sparring	Female	15	17	Feather	101.5	108	Black
Olympic Sparring	Female	15	17	Light	108.1	114.6	Black
Olympic Sparring	Female	15	17	Welter	114.7	121.3	Black
Olympic Sparring	Female	15	17	Light Middle	121.4	130.1	Black
Olympic Sparring	Female	15	17	Middle	130.2	138.9	Black
Olympic Sparring	Female	15	17	Light Heavy	139	149.9	Black
Olympic Sparring	Female	15	17	Heavy	150	0	Black
Olympic Sparring	Female	18	32	Fly	0	107.9	Color
Olympic Sparring	Female	18	32	Feather	108	125.7	Color
Olympic Sparring	Female	18	32	Welter	125.8	147.7	Color
Olympic Sparring	Female	18	32	Heavy	147.8	0	Color
Olympic Sparring	Female	18	32	Fin	0	101.4	Black
Olympic Sparring	Female	18	32	Fly	101.5	107.9	Black
Olympic Sparring	Female	18	32	Bantam	108	116.7	Black
Olympic Sparring	Female	18	32	Feather	116.8	125.6	Black
Olympic Sparring	Female	18	32	Light	125.7	136.6	Black
Olympic Sparring	Female	18	32	Welter	136.7	147.6	Black
Olympic Sparring	Female	18	32	Middle	147.7	160.8	Black
Olympic Sparring	Female	18	32	Heavy	160.9	0	Black
Olympic Sparring	Female	33	42	Fly	0	107.9	All
Olympic Sparring	Female	33	42	Feather	108	125.7	All
Olympic Sparring	Female	33	42	Welter	125.8	147.7	All
Olympic Sparring	Female	33	42	Heavy	147.8	0	All
Olympic Sparring	Female	43	0	Fly	0	107.9	All
Olympic Sparring	Female	43	0	Feather	108	125.7	All
Olympic Sparring	Female	43	0	Welter	125.8	147.7	All
Olympic Sparring	Female	43	0	Heavy	147.8	0	All
Traditional Forms	Male	5	5	All	0	0	All
Traditional Forms	Male	6	7	All	0	0	All
Traditional Forms	Male	8	9	All	0	0	All
Traditional Forms	Male	10	11	All	0	0	All
Traditional Forms	Male	12	13	All	0	0	All
Traditional Forms	Male	14	17	All	0	0	All
Traditional Forms	Male	18	32	All	0	0	All
Traditional Forms	Male	33	42	All	0	0	All
Traditional Forms	Male	43	0	All	0	0	All
Traditional Forms	Female	5	5	All	0	0	All
Traditional Forms	Female	6	7	All	0	0	All
Traditional Forms	Female	8	9	All	0	0	All
Traditional Forms	Female	10	11	All	0	0	All
Traditional Forms	Female	12	13	All	0	0	All
Traditional Forms	Female	14	17	All	0	0	All
Traditional Forms	Female	18	32	All	0	0	All
Traditional Forms	Female	33	42	All	0	0	All
Traditional Forms	Female	43	0	All	0	0	All
Team Forms	All	0	17	All	0	0	Black
Team Forms	All	18	0	All	0	0	Black
Creative Forms	Male	5	5	All	0	0	Black
Creative Forms	Male	6	7	All	0	0	Black
Creative Forms	Male	8	9	All	0	0	Black
Creative Forms	Male	10	11	All	0	0	Black
Creative Forms	Male	12	13	All	0	0	Black
Creative Forms	Male	14	17	All	0	0	Black
Creative Forms	Male	18	32	All	0	0	Black
Creative Forms	Male	33	42	All	0	0	Black
Creative Forms	Male	43	0	All	0	0	Black
Creative Forms	Female	5	5	All	0	0	Black
Creative Forms	Female	6	7	All	0	0	Black
Creative Forms	Female	8	9	All	0	0	Black
Creative Forms	Female	10	11	All	0	0	Black
Creative Forms	Female	12	13	All	0	0	Black
Creative Forms	Female	14	17	All	0	0	Black
Creative Forms	Female	18	32	All	0	0	Black
Creative Forms	Female	33	42	All	0	0	Black
Creative Forms	Female	43	0	All	0	0	Black
