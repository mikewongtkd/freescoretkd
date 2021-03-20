package FreeScore::Forms::Para::Division::Round::Score;
use List::Util qw( all any );
use FreeScore;
use JSON::XS;

our @criteria = qw( stance technique rhythm power energy );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift || { stance => 0.0, technique => 0.0, rhythm => 0.0, power => 0.0, energy => 0.0, complete => 0 };
	my $self = bless $data, $class;
	$self->technical();
	$self->presentation();
	return $self;
}

# ============================================================
sub technical {
# ============================================================
	my $self = shift;
	return undef unless $self->complete();
	my $technical = $self->{ stance } + $self->{ technique };
	$self->{ technical } = $technical;
	return $technical;
}

# ============================================================
sub clear_minmax {
# ============================================================
	my $self = shift;

	foreach my $minmax (qw( mintec maxtec minpre maxpre )) {
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
	my $presentation = $self->{ rhythm } + $self->{ power } + $self->{ energy };
	$self->{ presentation } = $presentation;
	return $presentation;
}

# ============================================================
sub reinstantiate {
# ============================================================
	my $self = shift;

	if( ! defined $self ) {
		return new FreeScore::Forms::Para::Division::Round::Score();

	} elsif( eval { $self->can( "clear_minmax" ) } ) {
		return $self;

	} else {
		return new FreeScore::Forms::Para::Division::Round::Score( $self );
	}
}

# ============================================================
sub string {
# ============================================================
	my $self = shift;
	return join "\t", map { defined $_ ? sprintf( "%.1f", $_ ) : '' } @{ $self }{ @FreeScore::Forms::Para::Division::Round::Score::criteria };
}

# ============================================================
sub complete {
# ============================================================
# A score is complete when a judge has provided values for
# all criteria
#-------------------------------------------------------------
	my $self = shift;

	my $complete = { technical => 0, presentation => 0 };
	$complete->{ technical }    = all { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( stance technique )};
	$complete->{ presentation } = all { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( rhythm power energy )};
	$self->{ complete } = $complete->{ technical } && $complete->{ presentation };
	return $self->{ complete };
}

# ============================================================
sub started {
# ============================================================
	my $self = shift;
	my $started = { technical => 0, presentation => 0 };
	$started->{ technical }    = any { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( stance technique )};
	$started->{ presentation } = any { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( rhythm power energy )};
	$self->{ started } = $started->{ technical } || $started->{ presentation };
	return $self->{ started };
}
1;
