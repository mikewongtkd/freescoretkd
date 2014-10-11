package FreeScore::Forms::WorldClass::Division::Round::Score;
use FreeScore;

our @criteria = qw( major minor rhythm power ki );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift;
	my $self = bless $data, $class;
	return $self;
}


# ============================================================
sub accuracy {
# ============================================================
	my $self = shift;
	return $self->{ rhythm } + $self->{ power } + $self->{ ki };
}

# ============================================================
sub presentation {
# ============================================================
	my $self = shift;
	my $penalties = $self->{ major } + $self->{ minor };
	return $penalties > 4.0 ? 0 : (4.0 - $penalties);
}

# ============================================================
sub total {
# ============================================================
	my $self   = shift;
}

# ============================================================
sub valid {
# ============================================================
	my $self = shift;
	my $valid = 1;
	$valid ||= ($_ >= 0) foreach @{ $self }{ @criteria };
	return $valid;
}

1;
