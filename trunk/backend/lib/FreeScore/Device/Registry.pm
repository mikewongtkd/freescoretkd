package FreeScore::Device::Registry;
use lib qw( /usr/local/freescore/lib );
use FreeScore;
use Digest::SHA1 qw( sha1_hex );

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
sub client {
# ============================================================
	my $self      = shift;
	my $id        = shift;
	my $client    = exists $self->{ client }{ $id } ? $self->{ client }{ $id } : undef;
	return $client;
}

# ============================================================
sub deregister {
# ============================================================
	my $self       = shift;
	my $websocket  = shift;
	my $connection = $websocket->tx();
	my $groupid    = $self->groupid( $websocket );
	my $id         = sha1_hex( $connection );

	delete $self->{ group }{ $groupid }{ $id } if( exists $self->{ group }{ $groupid } && exists $self->{ group }{ $groupid }{ $id });
	delete $self->{ group }{ $groupid } if( int( keys %{ $self->{ group }{ $groupid }}) == 0 );
	delete $self->{ client }{ $id } if exists $self->{ client }{ $id };
}

# ============================================================
sub groupid {
# ============================================================
	my $self       = shift;
	my $param      = shift;
	my $tournament = $websocket->param( 'tournament' );
	my $ring       = $websocket->param( 'ring' );

	if( /^ring\d{2}$/i ) {
		return lc "$tournament-$ring";

	} elsif( /^\d+$/ ) {
		return sprintf( "%s-ring%02d", lc $tournament, $ring );

	} elsif( /^staging$/i ) {
		return lc "$tournament-staging";

	} else {
		die "Invalid ring '$ring' for tournament $tournament $!";
	}
}

# ============================================================
sub group {
# ============================================================
	my $self      = shift;
	my $param     = shift;
	my $groupid   = undef;

	if( ref $param ) {
		my $websocket = $param;
		$groupid   = $self->groupid( $websocket );

	} else {
		my $ring = $param;
	}
	my $clients   = exists
}

# ============================================================
sub register {
# ============================================================
	my $self       = shift;
	my $websocket  = shift;
	my $connection = $websocket->tx();
	my $tournament = $websocket->param( 'tournament' );
	my $ring       = $websocket->param( 'ring' );
	my $role       = $websocket->param( 'role' );
	my $groupid    = $self->groupid( $websocket );
	my $sessid     = $websocket->cookie( 'freescore-session' );
	my $id         = sha1_hex( $connection );
	my $client     = { id => $id, tournament => $tournament, ring => $ring, sessid => $sessid, role => $role, device => $connection };

	$self->{ tournament } = exists $self->{ tournament } ? $self->{ tournament } : $tournament;
	if( exists $self->{ group }{ $groupid }) { $self->{ group }{ $groupid }{ $id } = $client; } 
	else                                     { $self->{ group }{ $groupid } = { $id => $client }; }
	$self->{ client }{ $id } = $client;
}


1;
