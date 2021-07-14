package FreeScore::Ring;
use base qw( FreeScore::Component );
use FreeScore::Clock;
use FreeScore::DB;
use FreeScore::Division;
use FreeScore::Metadata::Info;
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
	$self->{ _info }    = new FreeScore::Metadata::Info( $self );
	$self->{ _round }   = new FreeScore::Round( $self );

}
1;
