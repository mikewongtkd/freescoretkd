package FreeScore::Forms::Para::Division::Round::Score;
use List::Util qw( all any );
use FreeScore;
use JSON::XS;

our @criteria = qw( major minor rhythm power ki deduction bonus );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift || { major => 0.0, minor => 0.0, rhythm => 0.0, power => 0.0, ki => 0.0, deduction => 0.0, bonus => 0.0, complete => 0 };
	my $self = bless $data, $class;
	$self->accuracy();
	$self->presentation();
	$self->choice();
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
sub choice {
# ============================================================
	my $self = shift;
	return undef unless $self->complete();
	my $choice = $self->{ deduction } + $self->{ bonus };
	$self->{ choice } = $choice;
	return $choice;
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

	my $complete = { accuracy => 0, presentation => 0, choice => 0 };
	$complete->{ accuracy }     = all { defined $_ && $_ >= 0.0              } @{ $self }{ qw( major minor )};
	$complete->{ presentation } = all { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( rhythm power ki )};
	$complete->{ choice }       = all { defined $_                           } @{ $self }{ qw( deduction bonus )};
	$self->{ complete } = $complete->{ accuracy } && $complete->{ presentation } && $complete->{ choice };
	return $self->{ complete };
}

# ============================================================
sub started {
# ============================================================
	my $self = shift;
	my $started = { accuracy => 0, presentation => 0, choice => 0 };
	$started->{ accuracy }     = any { defined $_ && $_ >  0.0              } @{ $self }{ qw( major minor )};
	$started->{ presentation } = any { defined $_ && $_ >= 0.5 && $_ <= 2.0 } @{ $self }{ qw( rhythm power ki )};
	$started->{ choice }       = all { defined $_                           } @{ $self }{ qw( deduction bonus )};
	$self->{ started } = $started->{ accuracy } || $started->{ presentation } && $started->{ choice };
	return $self->{ started };
}
1;
