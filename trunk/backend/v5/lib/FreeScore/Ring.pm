package FreeScore::Ring;
use FreeScore::Division;
use FreeScore::Round;

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
	my $self   = shift;
	my $parent = shift;

	$self->{ _clock }   = new FreeScore::Clock( $self );
	$self->{ _db }      = new FreeScore::DB( $self );

}
1;
