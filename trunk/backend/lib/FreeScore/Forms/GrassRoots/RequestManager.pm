package FreeScore::Forms::GrassRoots::RequestManager;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::RCS;
use FreeScore::Forms::GrassRoots;
use FreeScore::Forms::GrassRoots::Schedule;
use FreeScore::Forms::GrassRoots::Division;
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
		display            => \&handle_division_display,
		disqualify         => \&handle_division_disqualify,
		navigate           => \&handle_division_navigate,
		read               => \&handle_division_read,
		readyup            => \&handle_division_readyup,
		score              => \&handle_division_score,
	};
	$self->{ ring }        = {
		read               => \&handle_ring_read,
	};
	$self->{ registration } = {
		import             => \&handle_registration_import,
		read               => \&handle_registration_read,
		upload             => \&handle_registration_upload,
	};
	$self->{ schedule }    = {
		call               => \&handle_schedule_call,
		checkin            => \&handle_schedule_checkin,
		read               => \&handle_schedule_read,
		stage              => \&handle_schedule_stage,
		write              => \&handle_schedule_write,
	};
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
		my $message   = $division->clone();
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
	my $client_id = sprintf "%s", sha1_hex( $client );
	my $ring      = $request->{ ring };

	print STDERR "  Broadcasting ring $ring information to:\n" if $DEBUG;
	foreach my $id (sort keys %$clients) {
		my $user      = $clients->{ $id };
		my $message   = clone( $progress );
		my $unblessed = unbless( $message ); 
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );
		my $response  = { type => 'ring', action => 'update', digest => $digest, ring => $unblessed, request => $request };

		printf STDERR "    user: %s (%s) message: %s\n", $user->{ role }, substr( $id, 0, 4 ), substr( $digest, 0, 4 ) if $DEBUG;
		$user->{ device }->send( { json => $response });
		$self->{ _last_state } = $digest if $client_id eq $id;
	}
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
sub handle_division_display {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $judge     = $request->{ judge };
	my $score     = $request->{ score };
	my $vote      = $request->{ vote };
	my $division  = $progress->current();

	print STDERR "Changing display for divison " . uc( $division->{ name }) . "\n" if $DEBUG;

	try {
		$division->change_display();
		$division->write();
		$self->broadcast_division_response( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_disqualify {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $division  = $progress->current();

	print STDERR "Changing display for divison " . uc( $division->{ name }) . "\n" if $DEBUG;

	try {
		$division->disqualify();
		$division->write();
		$self->broadcast_division_response( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_navigate {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $target    = $request->{ target };
	my $dest      = $target->{ destination };
	my $id        = $target->{ id };
	my $division  = $progress->current();
	my $client    = $self->{ _client };

	print STDERR "Navigating to $dest $id\n" if $DEBUG;

	try {
		if    ( $dest eq 'athlete' )  { $division->navigate( $id ); $division->write(); }
		elsif ( $dest eq 'division' ) { $progress->navigate( $id ); $progress->write(); }
			
		$self->broadcast_division_response( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_read {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $division  = $progress->current();

	print STDERR "Requesting divison " . uc( $division->{ name }) . " information\n" if $DEBUG;

	try {
		$self->broadcast_division_response( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_readyup {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $judge     = $request->{ judge };
	my $division  = $progress->current();
	my $jname     = $judge ? "Judge $judge" : "Referee";

	print STDERR "$jname is ready to score\n" if $DEBUG;

	try {

		$division->record_readyup( $judge );
		$division->write();
		$progress->write();
		$self->broadcast_division_response( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_score {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $judge     = $request->{ judge };
	my $score     = $request->{ score };
	my $vote      = $request->{ vote };
	my $division  = $progress->current();
	my $judges    = $division->{ judges };
	my $complete  = 0;

	if( $DEBUG ) {
		my $name = $judge ? "Judge $judge" : "Referee";
		if    ( $score ) { print STDERR "$name scores $score.\n" } 
		elsif ( $vote  ) { print STDERR "$name votes $vote.\n" }
	}

	try {
		if    ( $score ) { $complete = $division->record_score( $judge, $score ); }
		elsif ( $vote  ) { $complete = $division->record_vote( $judge, $vote ) && ! $division->is_single_elimination(); }
		$division->write();
		$progress->write();

		print STDERR "Checking to see if we need to engage autopilot... " . ($complete ? 'Yes; engaging autopilot.' : 'Not yet' ) . "\n";
		autopilot( $self, $request, $progress, $clients, $division ) if $complete;

		my $clone = unbless( $division->clone());
		$request->{ response } = { status => 'ok' };
			
		$self->broadcast_division_response( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_registration_import {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	
	print STDERR "Importing USAT Registration information.\n" if $DEBUG;

	my @path = split /\//, $progress->{ path }; @path = splice @path, 0, int( @path ) - 2;
	my $path = join '/', @path;
	my $json = new JSON::XS();
	return if( ! -e "$path/registration.female.txt" || ! -e "$path/registration.male.txt" );


	# ===== IMPORT
	try {
		my $settings     = $request->{ settings };
		my $female       = read_file( "$path/registration.female.txt" );
		my $male         = read_file( "$path/registration.male.txt" );
		my $registration = new FreeScore::Registration::USAT( $female, $male );
		my $divisions    = $registration->grassroots_poomsae( $settings );
		my $copy         = clone( $request ); delete $copy->{ data };

		foreach my $subevent (keys %$divisions) {
			foreach my $key (keys %{$divisions->{ $subevent }}) {
				my $divid                      = FreeScore::Registration::USAT::divid( $subevent, $key );
				my $athletes                   = $divisions->{ $subevent }{ $key };
				my ($description, $draw)       = FreeScore::Registration::USAT::description( $subevent, $key );
				my $division                   = $progress->create_division( $divid ); 
				$division->{ athletes }        = [ shuffle map { { name => join( " ", map { ucfirst } split /\s+/, $_->{ first }) . ' ' . uc( $_->{ last }), info => { state => $_->{ state }} }} @$athletes ];
				$division->{ current }         = 0;
				$division->{ description }     = $description;
				$division->{ judges }          = 3;

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
sub handle_registration_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $client   = $self->{ _client };

	print STDERR "Reading USAT Registration information\n" if $DEBUG;
	
	my @path = split /\//, $progress->{ path }; @path = splice @path, 0, int( @path ) - 2;
	my $path = join '/', @path;

	try {
		my $female    = "$path/registration.female.txt";
		my $male      = "$path/registration.male.txt";
		my $copy      = clone( $request );
		my $divisions = undef;
		if( -e $male && -e $female ) {
			$female = read_file( $female );
			$male   = read_file( $male );
			my $registration  = new FreeScore::Registration::USAT( $female, $male );
			$divisions        = $registration->grassroots_poomsae();
			$copy->{ action } = 'upload';

			$female = \1;
			$male   = \1;
		} 
		elsif( -e $male   ) { $female = \0; $male = \1; }
		elsif( -e $female ) { $female = \1; $male = \0; }
		else                { $female = \0; $male = \0; }
		$client->send({ json => { request => $copy, male => $male, female => $female, divisions => $divisions }});
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

	my @path = split /\//, $progress->{ path }; @path = splice @path, 0, int( @path ) - 2;
	my $path = join '/', @path;

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
		my $divisions    = $registration->grassroots_poomsae();
		my $copy         = clone( $request ); delete $copy->{ data };

		$client->send({ json => { request => $copy, divisions => $divisions }});
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_read {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $ring      = $request->{ ring };

	print STDERR "Request ring $ring data.\n" if $DEBUG;

	my $clone = unbless( clone( $progress ));

	try {
		$client->send({ json => { type => $request->{ type }, action => $request->{ action }, ring => $clone }});

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_schedule_call {
# ============================================================
}

# ============================================================
sub handle_schedule_checkin {
# ============================================================
}

# ============================================================
sub handle_schedule_read {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };

	print STDERR "Request schedule data.\n" if $DEBUG;

	my $path = "$progress->{ path }/..";
	my $file = "$path/schedule.json";
	try {
		unless( -e $file ) {
			$client->send({ json => { error => "Schedule file '$file' does not exist" }});
			return;
		}
		my $schedule = new FreeScore::Forms::GrassRoots::Schedule( $file );
		$client->send({ json => { type => $request->{ type }, action => $request->{ action }, schedule => $schedule->data() }});

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_schedule_stage {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $divid     = $request->{ division };
	my $ring      = $request->{ to };

	print STDERR "Sending division $divid from check-in to $ring.\n" if $DEBUG;

	my $file = "$progress->{ path }/../schedule.json";
	try {
		unless( -e $file ) {
			$client->send({ json => { error => "Schedule file '$file' does not exist" }});
			return;
		}
		my $schedule = new FreeScore::Forms::GrassRoots::Schedule( $file );
		$schedule->write( $request->{ schedule });

		my $path     = sprintf( "%s/%s", "$progress->{ path }/..", $ring eq 'staging' ? $ring : sprintf( "ring%02d", $ring ));
		my $data     = $json->decode( $request->{ schedule });
		my $division = $data->{ divisions }{ $divid };
		my $evid     = $division->{ event };
		my $event    = $data->{ events }{ $evid };
		my $div      = new FreeScore::Forms::GrassRoots::Division( $path, $divid, $ring );
		my @athletes = sort { $a->{ name } cmp $b->{ name } } map { $data->{ athletes }{ $_ } } grep { $data->{ checkin }{ $divid }{ $_ } } keys %{$data->{ checkin }{ $divid }};
		
		$div->{ current } = 0;
		$div->{ judges  } = 5;
		$div->{ mode }    = 'single-elimination' if $event->{ method } eq 'single elimination';
		@{ $div->{ athletes }} = @athletes;

		$div->write();

		$self->broadcast_ring_response( $request, $progress, $clients );
	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_schedule_write {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };

	print STDERR "Writing schedule data.\n" if $DEBUG;

	my $path = "$progress->{ path }/..";
	my $file = "$path/schedule.json";
	try {
		unless( -e $file ) {
			$client->send({ json => { error => "Schedule file '$file' does not exist" }});
			return;
		}
		my $schedule = new FreeScore::Forms::GrassRoots::Schedule( $file );
		$schedule->write( $request->{ schedule });
		$self->broadcast_ring_response( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub autopilot {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = shift;
	my $delay    = new Mojo::IOLoop::Delay();
	my $pause    = { score => 9, leaderboard => 5, brief=> 4, next => 1 };

	my $show  = {
		score => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ score } => $delay->begin() );
			if ( $division->is_display() ) { $division->score(); }
			$division->write();

			$request->{ action } = 'score-display';
			delete $request->{ judge };
			delete $request->{ score };
			delete $request->{ response };

			$self->broadcast_division_response( $request, $progress, $clients );
		},
		leaderboard => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ leaderboard } => $delay->begin() );
			if ( $division->is_score() ) { $division->display(); }
			$division->write();

			$request->{ action } = 'leaderboard-display';
			delete $request->{ judge };
			delete $request->{ score };
			delete $request->{ response };

			$self->broadcast_division_response( $request, $progress, $clients );
		},
		next => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ next } => $delay->begin() );
			if ( $division->is_display() ) { $division->score(); }
			$division->write();

			$self->broadcast_division_response( $request, $progress, $clients );
		}
	};
	my $go = {
		next => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ brief } => $delay->begin() );
			$division->next();
			$division->write();

			$request->{ action }  = 'navigate';
			$request->{ athlete } = $division->{ current };
			delete $request->{ judge };
			delete $request->{ score };
			delete $request->{ response };

			$self->broadcast_division_response( $request, $progress, $clients );
		}
	};

	my @steps = ( $show->{ score }, $show->{ leaderboard } );
	push @steps, $go->{ next }, $show->{ next } unless( $division->{ complete } );

	$delay->steps( @steps )->catch( sub {} )->wait();
}


