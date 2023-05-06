package FreeScore::Feats::Breaking::RequestManager;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::RCS;
use FreeScore::Feats::Breaking;
use FreeScore::Feats::Breaking::Division;
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::Util (qw( first shuffle ));
use List::MoreUtils (qw( first_index ));
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use Date::Manip;
use Clone qw( clone );
use PHP::Session;
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
		decision           => \&handle_division_decision,
		inspection         => \&handle_division_inspection,
		leaderboard        => \&handle_division_leaderboard,
		navigate           => \&handle_division_navigate,
		read               => \&handle_division_read,
		score              => \&handle_division_score,
		scoreboard         => \&handle_division_scoreboard,
		time_start         => \&handle_division_time_start,
		time_stop          => \&handle_division_time_stop,
		time_reset         => \&handle_division_time_reset
	};
	$self->{ ring }        = {
		read               => \&handle_ring_read,
	};
	$self->{ client }      = {
		pong               => \&handle_client_pong
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

		printf STDERR "    %s\n", $client->description() if $DEBUG;
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

		printf STDERR "    %s\n", $client->description() if $DEBUG;
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
	my $users     = [ map { { cid => $_->cid(), role => $_->role(), health => $_->ping->health() } } $group->clients() ];
	my $digest    = sha1_hex( $json->canonical->encode( $users ));
	my $mid       = substr( $digest, 0, 4 );

	print STDERR "  Broadcasting ring $ring user information (message ID: $mid) to:\n" if $DEBUG;

	foreach my $client ($group->clients()) {
		my $now       = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
		my $response  = { type => 'users', action => 'update', digest => $digest, time => $now, request => $request, users => $users };

		printf STDERR "    %s\n", $client->description() if $DEBUG;
		$client->send( { json => $response });
	}
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
	my $user      = $client->description();

	my $ping      = $request->{ server }{ ping };
	my $pong      = $request->{ client }{ pong };

	print STDERR "  Receiving pong for $user\n";

	$client->ping->pong( $ping->{ timestamp }, $pong->{ timestamp });

	$self->broadcast_updated_users( $request, $progress, $group );
}

# ============================================================
sub handle_division_decision {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $decision  = $request->{ decision };
	my $division  = $progress->current();

	if( $DEBUG ) {
		if( $decision eq 'clear' ) {
			print STDERR "Clearing all decisions\n";
		} else {
			print STDERR "Decision: $decision\n";
		}
	}

	try {
		$division->record_decision( $decision );
		$division->write();
		autopilot( $self, $request, $progress, $division, $group );

		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		my $client = $self->{ _client };
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_inspection {
# ============================================================
	my $self          = shift;
	my $request       = shift;
	my $progress      = shift;
	my $group         = shift;
	my $client        = $self->{ _client };
	my ($divid, $aid) = split /\|/, $request->{ athlete };
	my $boards        = int( $request->{ boards });
	my $division      = $progress->find( $divid );
	my $user          = $client->description();

	unless( $division ) { 
		my $error = "Division ID $divid not found";
		print STDERR "$error\n";
		$client->send({ json => { error => $error }});
		return;
	}

	my $n       = int( @{$division->{ athletes }});
	my $athlete = $division->{ athletes }[ $aid ];

	if( $aid < 0 || $aid >= $n ) {
		my $error = "Invalid athlete ID $aid for division $division->{ name }";
		print STDERR "$error\n";
		$client->send({ json => { error => $error }});
		return;
	}

	print STDERR "$user has inspected $athlete->{ name }, who has $boards boards\n" if $DEBUG;

	try {
		$division->record_inspection( $aid, $boards );
		$division->write();
		
		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_leaderboard {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $division  = $progress->current();

	if( $DEBUG ) {
		print STDERR "Showing leaderboard.\n";
	}

	try {
		$division->leaderboard();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		my $client = $self->{ _client };
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_navigate {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $target    = $request->{ target };
	my $dest      = $target->{ destination };
	my $id        = $target->{ id };
	my $division  = $progress->current();

	print STDERR "Navigating to $dest $id\n" if $DEBUG;

	try {
		if    ( $dest eq 'athlete' )  { $division->navigate( $id ); $division->write(); }
		elsif ( $dest eq 'division' ) { $progress->navigate( $id ); $progress->write(); }
			
		$self->broadcast_updated_ring( $request, $progress, $group );

	} catch {
		my $client = $self->{ _client };
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $now      = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
	my $user     = $client->description();
	my $divid    = uc( $division->{ name });

	print STDERR "$user requests division $divid data\n" if( $DEBUG );

	my $clone = unbless( $division->clone());
	try {
		$client->send({ json => { type => 'division', action => 'update', time => $now, request => $request, division => $clone }});

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
	my $group     = shift;
	my $json      = $self->{ _json };
	my $client    = $self->{ _client };
	my $judge     = $request->{ judge };
	my $score     = $request->{ score };
	my $division  = $progress->current();

	if( $DEBUG ) {
		my $name = $judge ? "Judge $judge" : "Referee";
		if( $score eq 'clear' ) {
			print STDERR "Computer Operator has cleared the score from $name.\n";

		} else {
			my $user = $client->description( $judge );
			print STDERR "$user scores: " . $json->canonical->encode( $score ) . "\n";
		}
	}

	try {
		my $complete = $division->record_score( $judge, $score );
		$division->write();
		autopilot( $self, $request, $progress, $division, $group ) if $complete;
			
		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_scoreboard {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $division  = $progress->current();

	print STDERR "Showing scoreboard.\n" if( $DEBUG );

	try {
		$division->scoreboard();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		my $client = $self->{ _client };
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_time_reset {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $division  = $progress->current();

	print STDERR "Time reset\n" if( $DEBUG );

	try {
		$division->time_reset();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		my $client = $self->{ _client };
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_time_start {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $division  = $progress->current();

	print STDERR "Time started\n" if( $DEBUG );

	try {
		$division->time_start();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		my $client = $self->{ _client };
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_time_stop {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $division  = $progress->current();

	if( $DEBUG ) {
		print STDERR "Time stopped\n";
	}

	try {
		$division->time_stop();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $group );

	} catch {
		my $client = $self->{ _client };
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_read {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $group     = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $ring      = $request->{ ring };
	my $user      = $client->description();

	print STDERR "$user requests ring $ring data.\n" if $DEBUG;

	my $clone = unbless( clone( $progress ));

	try {
		$client->send({ json => { type => $request->{ type }, action => $request->{ action }, ring => $clone }});

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
	my $division = shift;
	my $group    = shift;
	my $delay    = new Mojo::IOLoop::Delay();
	my $pause    = { score => 9, leaderboard => 5, brief=> 4, next => 1 };

	$request->{ type } = 'autopilot';

	my $show  = {
		score => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ score } => $delay->begin() );
			if ( $division->is_display() ) { $division->score(); }
			$division->write();
			$request->{ action } = 'scoreboard';
			$request->{ delay }  = $pause->{ score };

			$self->broadcast_updated_division( $request, $progress, $group );
		},
		leaderboard => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ leaderboard } => $delay->begin() );
			if ( $division->is_score() ) { $division->display(); }
			$division->write();
			$request->{ action } = 'leaderboard';
			$request->{ delay }  = $pause->{ leaderboard };

			$self->broadcast_updated_division( $request, $progress, $group );
		},
		next => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ next } => $delay->begin() );
			if ( $division->is_display() ) { $division->score(); }
			$division->write();
			$request->{ action } = 'next';
			$request->{ delay }  = $pause->{ next };

			$self->broadcast_updated_division( $request, $progress, $group );
		}
	};
	my $go = {
		next => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ brief } => $delay->begin() );
			$division->next();
			$division->write();

			$self->broadcast_updated_division( $request, $progress, $group );
		}
	};

	my @steps = ( $show->{ score }, $show->{ leaderboard } );
	push @steps, $go->{ next }, $show->{ next } unless( $division->{ complete } );

	$delay->steps( @steps )->catch( sub {} )->wait();
}

