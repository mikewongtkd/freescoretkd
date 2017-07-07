package FreeScore::Setup::RequestManager;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::Repository;
use FreeScore::Tournament;
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::Util (qw( first ));
use List::MoreUtils (qw( first_index ));
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use Clone qw( clone );

our $DEBUG = 0;

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
	my $self               = shift;
	$self->{ _client }     = shift;
	$self->{ _json }       = new JSON::XS();
	$self->{ _watching }   = {};
	$self->{ software }    = {
		check_updates      => \&handle_software_check_updates,
		update             => \&handle_software_update
	};
	$self->{ setup }  = {
		read               => \&handle_setup_read,
		write              => \&handle_setup_write,
	};
}


# ============================================================
sub handle_software_check_updates {
# ============================================================
	my $self    = shift;
	my $request = shift;
	my $setup   = shift;
	my $clients = shift;
	my $client  = $self->{ _client };

	try {
		my $repo    = new FreeScore::Repository();
		my $latest  = $repo->latest_release();
		my $current = $repo->local_version();
		my $update  = $current < $latest;

		$client->send( { json => { type => $request->{ type }, action => 'updates', available => $update, version => $latest, current => $current  }});

	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_software_update {
# ============================================================
	my $self    = shift;
	my $request = shift;
	my $setup   = shift;
	my $clients = shift;
	my $client  = $self->{ _client };

	try {
		my $repo = new FreeScore::Repository();
		$repo->update_local_to_latest();
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_setup_read {
# ============================================================
	my $self       = shift;
	my $request    = shift;
	my $setup      = shift;
	my $clients    = shift;
	my $client     = $self->{ _client };
	my $tournament = $setup->{ tournament };

	$self->send_setup_response( $request, $tournament, $clients );
}

# ============================================================
sub handle_setup_write {
# ============================================================
	my $self       = shift;
	my $request    = shift;
	my $setup      = shift;
	my $clients    = shift;
	my $client     = $self->{ _client };
	my $tournament = $setup->{ tournament };

	if( exists $request->{ edits } ) {
		$setup->update_rings( $request->{ edit }{ rings } ) if( exists $request->{ edits }{ rings } );
	}
	$setup->write();

	$self->send_setup_response( $request, $tournament, $clients );
}

# ============================================================
sub send_setup_response {
# ============================================================
 	my $self       = shift;
	my $request    = shift;
	my $setup      = shift;
	my $clients    = shift;
	my $client     = $self->{ _client };
	my $json       = $self->{ _json };
	my $unblessed  = undef;

	my $message    = clone( $setup );
	my $unblessed  = unbless( $message ); 
	my $encoded    = $json->canonical->encode( $unblessed );
	my $digest     = sha1_hex( $encoded );

	$client->send( { json => { type => 'setup', action => 'update', digest => $digest, tournament => $unblessed, request => $request }});
	$self->{ _last_state } = $digest;
}

1;
