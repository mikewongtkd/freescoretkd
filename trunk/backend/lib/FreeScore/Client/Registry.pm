package FreeScore::Client::Registry;
use lib qw( /usr/local/freescore/lib );
use Clone qw( clone );
use Data::Structure::Util qw( unbless );
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
	my $cid        = $client->id();
	my $gid        = $group->id();

	$self->{ tournament } = exists $self->{ tournament } ? $self->{ tournament } : $client->tournament();

	if( exists $self->{ group }{ $gid }) { $group = $self->{ group }{ $gid } } 
	else                                 { $self->{ group }{ $gid } = $group; }

	$group->add( $client );
	$self->{ client }{ $cid } = $client;
	$client->{ registry } = $self;
	$client->group( $group );

	return $client;
}

# ============================================================
sub client {
# ============================================================
	my $self      = shift;
	my $cid       = shift;
	my $client    = exists $self->{ client }{ $cid } ? $self->{ client }{ $cid } : undef;
	return $client;
}

# ============================================================
sub clients {
# ============================================================
	my $self    = shift;
	my $filter  = shift;
	my @clients = sort { $a->description() cmp $b->description() } values %{ $self->{ client }};

	@clients = grep { $_->role() =~ /^$filter/ } @clients if $filter;

	return @clients;
}

# ============================================================
sub remove {
# ============================================================
	my $self       = shift;
	my $client     = shift;
	my $cid        = undef;
	my $group      = undef;

	if( ref $client ) { $cid = $client->id(); } 
	else {
		$cid    = $client;
		$client = $self->{ client }{ $cid };
	}
	my $user = $client->description();
	print STDERR "$user connection closed.\n";

	$group = $client->group();

	if( $group ) {
		$group->remove( $cid );
		my $gid = $group->id();
		delete $self->{ group }{ $gid } if( int( $group->clients()) == 0 );
	}
	delete $self->{ client }{ $cid } if exists $self->{ client }{ $cid };
}

# ============================================================
sub report {
# ============================================================
	my $self = shift;
	my $copy = unbless( clone( $self ));

	# Break circular references between clients and groups
	foreach my $cid (sort keys %{$copy->{ client }}) {
		my $client = $copy->{ client }{ $cid };
		my $group  = $client->{ group };
		$client->{ group } = $group->{ id };

		my $ping = $clone->{ ping };
		$clone->{ ping } = [ sort keys %{$ping->{ sent }}];

		delete $client->{ $_ } foreach qw( device websocket );
	}

	# Break circular references between groups and clients
	foreach my $gid (sort keys %{$copy->{ group }}) {
		my $group = $copy->{ group }{ $gid };
		$group->{ clients } = [ keys %{ $group->{ client }}];
		delete $group->{ client };
	}

	return $copy;
}

1;
