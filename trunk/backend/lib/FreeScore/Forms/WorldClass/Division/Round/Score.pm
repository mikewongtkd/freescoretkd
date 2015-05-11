package FreeScore::Forms::WorldClass::Division::Round::Score;
use List::Util qw( all );
use FreeScore;
use JSON::XS;

our @criteria = qw( major minor rhythm power ki );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift || { major => 0.0, minor => 0.0, rhythm => 0.0, power => 0.0, ki => 0.0, complete => 0 };
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
sub clear_minmax {
# ============================================================
	my $self = shift;

	foreach my $minmax (qw( minacc maxacc minpre maxpre )) { 
		$self->{ $minmax } = JSON::XS::false; 
	}
}

# ============================================================
sub mark_minmax {
# ============================================================
	my $self   = shift;
	my $minmax = shift;

	$self->{ $minmax } = JSON::XS::true;
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
	$complete &&= all { defined $_ && $_ >= 0.0              } @{ $self }{ qw( major minor ) };
	$complete &&= all { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( rhythm power ki ) };
	$self->{ complete } = $complete;
	return $complete;
}

1;
