package FreeScore::Client::Group;
use lib qw( /usr/local/freescore/lib );
use Mojolicious::Controller;

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
	my $self       = shift;
	my $websocket  = shift;
	my $tournament = $websocket->param( 'tournament' );
	my $ring       = $websocket->param( 'ring' );

	local $_ = $ring;
	if( /^ring\d{2}$/i ) {
		$self->{ gid } = lc "$tournament-$ring";

	} elsif( /^\d+$/ ) {
		$self->{ gid } = sprintf( "%s-ring%02d", lc $tournament, $ring );

	} elsif( /^staging$/i ) {
		$self->{ gid } = lc "$tournament-staging";

	} else {
		die "Invalid ring '$ring' for tournament $tournament $!";
	}

	$self->{ client } = {};
}

# ============================================================
sub add {
# ============================================================
	my $self   = shift;
	my $client = shift;
	my $cid    = $client->id();
	$self->{ client }{ $cid } = $client;
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
sub id {
# ============================================================
	my $self = shift;
	return $self->{ id };
}

# ============================================================
sub remove {
# ============================================================
	my $self   = shift;
	my $client = shift;
	my $cid    = undef;

	$cid = ref $client ? $client->id() : $client;
	delete $self->{ client }{ $cid };
}

1;
