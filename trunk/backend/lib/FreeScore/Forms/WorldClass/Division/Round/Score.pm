package FreeScore::Forms::WorldClass::Division::Round::Score;
use FreeScore;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift;
	my $self = bless $data, $class;
	$self->accuracy();
	$self->presentation();
	return $self;
}

# ============================================================
sub accuracy {
# ============================================================
	my $self = shift;
	return undef unless $self->complete();
	my $penalties = $self->{ major } + $self->{ minor };
	my $accuracy  = $penalties > 4.0 ? 0 : (4.0 - $penalties);
	$self->{ accuracy } = $accuracy;
	return $accuracy;
}

# ============================================================
sub presentation {
# ============================================================
	my $self = shift;
	return undef unless $self->complete();
	my $presentation = $self->{ rhythm } + $self->{ power } + $self->{ ki };
	$self->{ presentation } = $presentation;
	return $presentation;
}

# ============================================================
sub complete {
# ============================================================
# A score is complete when a judge has provided values for
# all criteria
#-------------------------------------------------------------
	my $self = shift;
	my $complete = 1;
	my @criteria = qw( major minor rhythm power ki );

	$complete &&= (defined $_) foreach @{ $self }{ @criteria };
	$self->{ complete } = $complete;
	return $complete;
}

1;
