package FreeScore::Client::Registry;
use lib qw( /usr/local/freescore/lib );
use FreeScore::Client::Group;
use FreeScore::Client;

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
	my $self = shift;
	$self->{ client } = {};
	$self->{ group }  = {};
}

# ============================================================
sub add {
# ============================================================
	my $self       = shift;
	my $websocket  = shift;
  my $tournament = shift;
  my $ring       = shift;
	my $client     = new FreeScore::Client( $websocket );
	my $group      = new FreeScore::Client::Group( $tournament, $ring );
	my $gid        = $group->id();

  print STDERR "Adding client to group '$gid'\n"; # MW

	$self->{ tournament } = exists $self->{ tournament } ? $self->{ tournament } : $client->tournament();

	if( exists $self->{ group }{ $gid }) { $group = $self->{ group }{ $gid } } 
	else                                 { $self->{ group }{ $gid } = $group; }

	$group->add( $client );
	$self->{ client }{ $id } = $client;
	$client->group( $group );

	return $client;
}

# ============================================================
sub client {
# ============================================================
	my $self      = shift;
	my $id        = shift;
	my $client    = exists $self->{ client }{ $id } ? $self->{ client }{ $id } : undef;
	return $client;
}

# ============================================================
sub clients {
# ============================================================
	my $self    = shift;
	my $filter  = shift;
	my @clients = sort { $a->description() cmp $b->description() } values %{ $self->{ client }};

	if( $filter ) {
		@clients = grep { $_->role() =~ /^$filter/ } @clients;
	}

	return @clients;
}

# ============================================================
sub remove {
# ============================================================
	my $self       = shift;
	my $client     = shift;
	my $id         = undef;
	my $group      = undef;

	if( ref $client ) { $id = $client->id(); } 
	else {
		$id     = $client;
		$client = $self->{ client }{ $id };
	}
	my $user = $client->description();
	print STDERR "$user connection closed.\n";

	$group = $client->group();

	if( $group ) {
		$group->remove( $id );
		my $gid = $group->id();
		delete $self->{ group }{ $gid } if( int( $group->clients()) == 0 );
	}
	delete $self->{ client }{ $id } if exists $self->{ client }{ $id };
}

1;
