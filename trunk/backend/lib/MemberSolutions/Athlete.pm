package MemberSolutions::Athlete;
use Date::Calc qw( :all );
use Data::Dumper;

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
}

# ============================================================
sub competition_age {
# ============================================================
	my $self = shift;

	# ===== GET ATHLETE'S BIRTHDATE
	my ($month, $day, $year) = split /\//, $self->{ 'Date of Birth' };
	$year += $year > 13 ? 1900 : 2000;
	my @birthdate            = ($year, $month, $day);

	# ===== GET THE COMPETITION YEAR
	# If August 31st has passed, then it's the new AAU competition year
	my ($competition_year, $tournament_month, $tournament_day) = Today();
	my $ddays = Delta_Days( $competition_year, 8, 31, $competition_year, $tournament_month, $tournament_day );
	$competition_year += 1 if( $ddays > 0 );

	# ===== CALCULATE THE ATHLETE'S AGE AS OF AUGUST 31 OF THIS COMPETITION YEAR
	# As per Section II, Article D, Clause 2 of the AAU 2011 Handbook
	my @competition_date  = ($competition_year, 8, 31);
	my ($dy, $dm, $dd)    = Delta_YMD( @competition_date, @birthdate );

	return abs int( $dy + ($dm/12));
}

# ============================================================
sub events {
# ============================================================
	my $self = shift;
	return @{ $self->{ Events }};
}

# ============================================================
sub first_name {
# ============================================================
	my $self = shift;
	my $name = $self->{ 'First Name' };
	$name =~ s/"/""/g;
	return $name;
}

# ============================================================
sub last_name {
# ============================================================
	my $self = shift;
	my $name = $self->{ 'Last Name' };
	$name =~ s/"/""/g;
	return $name;
}
# ============================================================
sub name {
# ============================================================
	my $self = shift;
	return "$self->{ 'First Name' } $self->{ 'Last Name' }";
}

# ============================================================
sub short_name {
# ============================================================
	my $self = shift;
	my @first = split /\s+/, $self->{ 'First Name' };
	my $first = join ".", map { /^([A-Za-z])/; uc $1; } @first;

	return "$first. $self->{ 'Last Name' }";
}

# ============================================================
sub belt {
# ============================================================
	my $self = shift;

	my $belt = $self->{ Rank };
	if( $belt =~ /Black\s*(\d)/ ) {
		my $dan = $1;
		$belt = { 1 => '1st Dan', 2 => '2nd Dan', 3 => '3rd Dan', 4 => 'Master' }->{ $dan };
	} else {
		$belt = "$belt belt";
	}	

	return $belt
}

# ============================================================
sub weight {
# ============================================================
	my $self = shift;
	return $self->{ 'Weight' };
}

# ============================================================
sub gender {
# ============================================================
	my $self = shift;
	return $self->{ 'Gender' };
}

# ============================================================
sub id {
# ============================================================
	my $self = shift;
	return $self->{ 'id' };
}

# ============================================================
sub aau_membership {
# ============================================================
	my $self = shift;
	return uc( $self->{ 'AAU Membership Number' } );
}
1;
