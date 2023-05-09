package FreeScore::RequestManager;
use Clone qw( clone );
use Digest::SHA1 qw( sha1_hex );
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use Date::Manip;
use JSON::XS;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );
	return $self;
}

# ============================================================
sub init_client_server {
# ============================================================
	$self = shift;
	$self->{ client } = {
		pong          => \&handle_client_pong
	};
	$self->{ server } = {
		stop_ping     => \&handle_server_stop_ping
	};
}

# ============================================================
sub broadcast_updated_division {
# ============================================================
# Broadcasts updated division information to the ring
# ------------------------------------------------------------
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $json      = $self->{ _json };
	my $division  = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();
	my $message   = $division->clone();
	my $unblessed = unbless( $message ); 
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );
	my $mid       = substr( $digest, 0, 4 );

	print STDERR "  Broadcasting division information (message ID: $mid) to:\n" if $DEBUG;

	foreach my $client ($group->clients()) {
		my $now       = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
		my $response  = { type => $request->{ type }, action => 'update', digest => $digest, time => $now, division => $unblessed, request => $request };
		my $status    = $client->status();
		printf STDERR "    %-17s  %s  %s\n", $status->{ role }, $status->{ cid }, $status->{ health } if $DEBUG;
		$client->send( { json => $response });
	}
	print STDERR "\n" if $DEBUG;
}

# ============================================================
sub broadcast_updated_ring {
# ============================================================
# Broadcasts updated ring information to the ring
# ------------------------------------------------------------
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $json      = $self->{ _json };
	my $ring      = $request->{ ring };
	my $message   = clone( $progress );
	my $unblessed = unbless( $message ); 
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );
	my $mid       = substr( $digest, 0, 4 );

	print STDERR "  Broadcasting ring $ring information (message ID: $mid) to:\n" if $DEBUG;

	foreach my $client ($group->clients()) {
		my $now       = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
		my $response  = { type => 'ring', action => 'update', digest => $digest, time => $now, ring => $unblessed, request => $request };
		my $status    = $client->status();
		printf STDERR "    %-17s  %s  %s\n", $status->{ role }, $status->{ cid }, $status->{ health } if $DEBUG;
		$client->send( { json => $response });
	}
}

# ============================================================
sub broadcast_updated_users {
# ============================================================
# Broadcasts updated user information to the ring
# ------------------------------------------------------------
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $json      = $self->{ _json };
	my $ring      = $request->{ ring };
	my $status    = $group->status();
	my $digest    = sha1_hex( $json->canonical->encode( $status ));
	my $mid       = substr( $digest, 0, 4 );

	print STDERR "  Broadcasting user information (message ID: $mid) in ring $ring to:\n" if $DEBUG;

	foreach my $client ($group->clients()) {
		my $now       = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
		my $response  = { type => 'users', action => 'update', digest => $digest, time => $now, request => $request, users => $status };
		my $status    = $client->status();
		printf STDERR "    %-17s  %s  %s\n", $status->{ role }, $status->{ cid }, $status->{ health } if $DEBUG;
		$client->send( { json => $response });
	}
}

# ============================================================
sub client_health_check {
# ============================================================
	my $self  = shift;
	my $ring  = shift;
	my $group = shift;

	return unless $ring ne 'staging' && $group->changed();

	my $request = { type => 'users', action => 'update', ring => $ring };
	$self->broadcast_updated_users( $request, $progress, $group );
}

# ============================================================
sub handle {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $action   = $request->{ action }; $action =~ s/\s+/_/g;
	my $type     = $request->{ type };   $type =~ s/\s+/_/g;

	my $dispatch = $self->{ $type }{ $action } if exists $self->{ $type } && exists $self->{ $type }{ $action };
	return $self->$dispatch( $request, $progress, $group ) if defined $dispatch;
	print STDERR "Unknown request $type, $action\n";
}

# ============================================================
sub handle_client_pong {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $client    = $self->{ _client };

	my $ping      = $request->{ server }{ ping };
	my $pong      = $request->{ client }{ pong };

	$client->ping->pong( $ping->{ timestamp }, $pong->{ timestamp });
}

# ============================================================
sub handle_server_stop_ping {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $client    = $self->{ _client };
	my $user      = $client->description();

	print STDERR "$user requests server stop pinging them.\n" if $DEBUG;

	$client->ping->quit();

	my $request = { type => 'users', action => 'update', ring => $ring };
	$self->broadcast_updated_users( $request, $progress, $group );
}

1;
