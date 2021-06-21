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

	# Default values
	$self->{ event }  = 'recognized' unless $self->{ event };
	$self->{ method } = 'cutoff'     unless $self->{ method };

	$self->{ _athlete } = new FreeScore::Athlete( $self );
	$self->{ _clock }   = new FreeScore::Clock( $self );
	$self->{ _db }      = new FreeScore::DB( $self );
	$self->{ _event }   = FreeScore::Event->factory( $self );
	$self->{ _method }  = FreeScore::Method->factory( $self );
	$self->{ _round }   = new FreeScore::Round( $self );

}
1;
