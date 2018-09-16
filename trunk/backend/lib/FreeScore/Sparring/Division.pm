package FreeScore::Sparring::Division;
use FreeScore;
use File::Slurp qw( read_file );
use JSON::XS();

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
#** @method ( path, name, [ring] )
#   @brief Initializes the division with path, name, and ring information
#*
	my $self = shift;
	my $path = shift;
	my $name = shift;
	my $ring = shift || 'staging';

	$self->{ path } = $path;
	$self->{ ring } = $ring;
	$self->{ name } = $name;
	$self->{ file } = "$self->{ path }/div.$name.txt";
	die "Database Read Error: Can't find division at '$self->{ path }' $!" if( ! -e $self->{ path } );
	$self->read() if( -e $self->{ file } );
}

sub exists     { my $self = shift; return -e $self->{ file }; }
sub next       { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } + 1) % int(@{ $self->{ athletes }}); }
sub previous   { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } - 1) >= 0 ? ($self->{ current } -1) : $#{ $self->{ athletes }}; }
sub read       { my $self = shift; my $contents = read_file( $self->{ file }); my $json = new JSON::XS(); my $data = $json->decode( $contents ); $self->{ $_ } = $data->{ $_ } foreach (grep { defined $data->{ $_ } } keys %$data); return $self; }
sub write      { my $self = shift; my $json = new JSON::XS(); my $contents = $json->canonical->pretty->encode( $self ); open FILE, ">$self->{ file }" or die "Can't write to '$self->{ file }' $!"; print FILE $contents; close FILE; return -e $self->{ file }; }

1;

