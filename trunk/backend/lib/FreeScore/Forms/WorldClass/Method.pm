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
sub factory {
# ============================================================
	my $type  = shift;
	my $div   = shift;
	my $round = shift;

	my $dispatch = {
		cutoff => 'Cutoff',
		sbs    => 'SideBySide',
		se     => 'SingleElimination',
	};

	return undef unless( exists $dispatch->{ $type });
	my $class = "FreeScore::Forms::WorldClass::Method::$code";

	return new $class->( $div, $round );
}

# ============================================================
sub matches {}
# ============================================================

# ============================================================
sub round {
# ============================================================
	my $self  = shift;
	my $rcode = shift;
	my $class  = ref( $self );
	my $rvar   = "\@$class::rounds";
	my @rounds = eval $rvar;

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

1;
