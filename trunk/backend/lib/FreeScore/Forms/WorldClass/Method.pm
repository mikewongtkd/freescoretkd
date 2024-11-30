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
	$self->{ round }    = $round;
}

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

	return new $class( $div, $round );
}

# ============================================================
sub rounds {
# ============================================================
	my $self   = shift;
	my $class  = ref( $self );
	my $rvar   = "\@$class::rounds";
	my @rounds = map { $_->{ code } } eval $rvar;

	return @rounds;
}

1;
