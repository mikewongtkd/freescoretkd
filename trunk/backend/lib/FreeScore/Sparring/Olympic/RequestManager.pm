package FreeScore::Sparring::Olympic::RequestManager;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::RCS;
use FreeScore::Forms::WorldClass;
use FreeScore::Registration::USAT;
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::Util (qw( first shuffle ));
use List::MoreUtils (qw( first_index ));
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use Clone qw( clone );
use File::Slurp qw( read_file );
use Encode qw( encode );

our $DEBUG = 1;

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
	$self->{ _tournament } = shift;
	$self->{ _ring }       = shift;
	$self->{ _client }     = shift;
	$self->{ _json }       = new JSON::XS();
	$self->{ _watching }   = {};
	$self->{ division }    = {
	};
	$self->{ ring }        = {
	};
	$self->{ registration } = {
		import             => \&handle_registration_import,
		upload             => \&handle_registration_upload,
		read               => \&handle_registration_read
	}
}

# ============================================================
sub broadcast_division_response {
# ============================================================
# Broadcasts to ring
# ------------------------------------------------------------
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $division  = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();
	my $client_id = sprintf "%s", sha1_hex( $client );

	print STDERR "  Broadcasting division information to:\n" if $DEBUG;

	foreach my $id (sort keys %$clients) {
		my $user      = $clients->{ $id };
		my $is_judge  = exists $user->{ judge } && defined $user->{ judge };
		my $message   = clone( $is_judge ? $division->get_only( $user->{ judge } ) : $division );
		my $unblessed = unbless( $message ); 
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );

		printf STDERR "    user: %s (%s) message: %s\n", $user->{ role }, substr( $id, 0, 4 ), substr( $digest, 0, 4 ) if $DEBUG;
		$user->{ device }->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed, request => $request }});
		$self->{ _last_state } = $digest if $client_id eq $id;
	}
	print STDERR "\n" if $DEBUG;
}

# ============================================================
sub broadcast_ring_response {
# ============================================================
# Broadcasts to ring
# ------------------------------------------------------------
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $division  = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();
	my $client_id = sprintf "%s", sha1_hex( $client );

	print STDERR "  Broadcasting ring information to:\n" if $DEBUG;
	foreach my $id (sort keys %$clients) {
		my $user      = $clients->{ $id };
		my $is_judge  = exists $user->{ judge } && defined $user->{ judge };
		my $message   = clone( $is_judge ? $division->get_only( $user->{ judge } ) : $progress );
		my $unblessed = unbless( $message ); 
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );
		my $response  = $is_judge ? { type => 'division', action => 'update', digest => $digest, division => $unblessed, request => $request } : { type => 'ring', action => 'update', digest => $digest, ring => $unblessed, request => $request };

		printf STDERR "    user: %s (%s) message: %s\n", $user->{ role }, substr( $id, 0, 4 ), substr( $digest, 0, 4 ) if $DEBUG;
		$user->{ device }->send( { json => $response });
		$self->{ _last_state } = $digest if $client_id eq $id;
	}
	print STDERR "\n" if $DEBUG;
}

# ============================================================
sub handle {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $action   = $request->{ action }; $action =~ s/\s+/_/g;
	my $type     = $request->{ type };   $type =~ s/\s+/_/g;

	my $dispatch = $self->{ $type }{ $action } if exists $self->{ $type } && exists $self->{ $type }{ $action };
	return $self->$dispatch( $request, $progress, $clients, $judges ) if defined $dispatch;
	print STDERR "Unknown request $type, $action\n";
}

# ============================================================
sub handle_registration_import {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $client   = $self->{ _client };

	print STDERR "Importing USAT Registration information\n" if $DEBUG;
	
	my $path = "$progress->{ path }/../..";
	my $json = new JSON::XS();
	return if( ! -e "$path/registration.female.txt" || ! -e "$path/registration.male.txt" );

	my $draws = $progress->{ draws };

	try {
		my $female       = read_file( "$path/registration.female.txt" );
		my $male         = read_file( "$path/registration.male.txt" );
		my $registration = new FreeScore::Registration::USAT( $female, $male );
		my $divisions    = $registration->sparring();
		my $copy         = clone( $request ); delete $copy->{ data };

		foreach my $subevent (keys %$divisions) {
			foreach my $key (keys %{$divisions->{ $subevent }}) {
				my $divid                      = FreeScore::Registration::USAT::divid( $subevent, $key );
				my $athletes                   = $divisions->{ $subevent }{ $key };
				my ($description, $draw)       = FreeScore::Registration::USAT::description( $subevent, $key );
				my $division                   = $progress->create_division( $divid ); 
				$division->{ athletes }        = [ shuffle map { { name => join( " ", map { ucfirst } split /\s+/, $_->{ first }) . ' ' . uc( $_->{ last }), info => { state => $_->{ state }} }} @$athletes ];
				$division->{ description }     = $description;

				print STDERR "  $divid: $description\n" if $DEBUG;
				$division->write();
			}
		}
		$client->send({ json => { request => $copy, result => 'success' }});
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_registration_upload {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $client   = $self->{ _client };

	print STDERR "Uploading USAT Registration $request->{ gender } information\n" if $DEBUG;
	
	my $gender = $request->{ gender } =~ /^(?:fe)?male$/ ? $request->{ gender } : undef;
	return unless defined $gender;

	my $json = new JSON::XS();

	try {
		$client->send({ json => { type => 'registration', action => 'read', result => "$gender division file received" }});

	} catch {
		print STDERR "Error: $_\n";
		$client->send( { json => { error => "$_" }});
	}
	return if( ! -e "$path/registration.female.txt" || ! -e "$path/registration.male.txt" );

	try {
		my $female       = read_file( "$path/registration.female.txt" );
		my $male         = read_file( "$path/registration.male.txt" );
		my $registration = new FreeScore::Registration::USAT( $female, $male );
		my $divisions    = $registration->sparring();
		my $copy         = clone( $request ); delete $copy->{ data };

		$client->send({ json => { request => $copy, divisions => $divisions }});
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_registration_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $client   = $self->{ _client };

	print STDERR "Reading USAT Registration information\n" if $DEBUG;
	
	my $path = "$progress->{ path }/../..";

	try {
		my $female    = "$path/registration.female.txt";
		my $male      = "$path/registration.male.txt";
		my $copy      = clone( $request );
		my @divisions = ();
		if( -e $male && -e $female ) {
			$female = read_file( $female );
			$male   = read_file( $male );
			my $registration = new FreeScore::Registration::USAT( $female, $male );
			my $sparring     = $registration->sparring();
			@divisions       = ( divisions => $sparring );
			$copy->{ action } = 'upload';

			$female = \1;
			$male   = \1;
		} 
		elsif( -e $male   ) { $female = \0; $male = \1; }
		elsif( -e $female ) { $female = \1; $male = \0; }
		else                { $female = \0; $male = \0; }
		$client->send({ json => { request => $copy, male => $male, female => $female, @divisions }});
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}


