package FreeScore::Forms::WorldClass::Method;
use FreeScore::Forms::WorldClass::Method::Cutoff;
use FreeScore::Forms::WorldClass::Method::SideBySide;
use FreeScore::Forms::WorldClass::Method::SingleElimination;

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
	my $self  = shift;
	my $div   = shift;
	my $round = shift;

	$self->{ division } = $div;
	$self->{ round }    = $round if $round;
}

# ============================================================
sub bracket {}
# ============================================================

# ============================================================
sub division { my $self = shift; return $self->{ division }; }
# ============================================================

# ============================================================
sub factory {
# ============================================================
	my $type  = shift;
	my $div   = shift;
	my $round = shift;

	my $dispatch = {
		cutoff => 'Cutoff',
		sbs    => 'SideBySide',
		se     => 'SingleElimination'
	};

	my $class = "FreeScore::Forms::WorldClass::Method::$dispatch->{ $type }";

	return $class->new( $div, $round );
}

# ============================================================
sub matches {}
# ============================================================

# ============================================================
sub round {
# ============================================================
	my $self  = shift;
	my $rcode = shift || $self->{ round };
	my $class  = ref( $self );
	my $rvar   = "\@$class::rounds";
	my @rounds = eval $rvar;

	die "No round specified for $class round() $!" unless $rcode;

	return first { $_->{ code } eq $rcode } @rounds;
}

# ============================================================
sub rounds {
# ============================================================
	my $self   = shift;
	my $mode   = shift || 'code';
	my $class  = ref( $self );
	my $rvar   = "\@$class::rounds";
	my @rounds = eval $rvar;

	if( $mode eq 'object' ) {
		return @rounds;

	} elsif( $mode =~ /^(?:code|name|min|max|matches)$/ ) {
		return map { $_->{ $mode } } @rounds;

	} else {
		die "Unrecognized mode request '$mode' $!";
	}

	return @rounds;
}

# ============================================================
sub _annotate {
# ============================================================
# Determines if a tie-breaking criteria is needed and adds them
# to the list for display
# ------------------------------------------------------------
	my $x = shift;
	my $y = shift;

	my $dcode = { disqualify => 'DSQ', withdraw => 'WDR' };
	if( $x->{ adjusted }{ total } == $y->{ adjusted }{ total } && $x->{ adjusted }{ total } != 0 ) {
		if( $x->{ adjusted }{ presentation } != $y->{ adjusted }{ presentation }) { 
			$x->{ tb }[ 0 ] = $x->{ adjusted }{ presentation }; 
			$y->{ tb }[ 0 ] = $y->{ adjusted }{ presentation }; 
		} else {
			if( $x->{ original }{ total } != $y->{ original }{ total } ) { 
				$x->{ tb }[ 1 ] = $x->{ original }{ total };
				$y->{ tb }[ 1 ] = $y->{ original }{ total };
			}
		}
	}
}

1;
