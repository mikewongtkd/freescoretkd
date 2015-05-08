package FreeScore::Forms::WorldClass::Division::Round::Score;
use List::Util qw( all );
use FreeScore;

our @criteria = qw( major minor rhythm power ki );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift;
	my $self = bless $data, $class;
	foreach my $criteria (@FreeScore::Forms::WorldClass::Division::Round::Score::criteria) {
		$data->{ $criteria } ||= undef;
	}
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
	my $complete &&= all { defined $_ && $_ >= 0.0              } @{ $self }{ qw( major minor ) };
	my $complete &&= all { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( rhythm power ki ) };
	$self->{ complete } = $complete;
	return $complete;
}

1;
