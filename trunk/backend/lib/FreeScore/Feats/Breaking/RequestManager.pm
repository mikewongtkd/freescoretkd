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
		decision           => \&handle_division_decision,
		inspection         => \&handle_division_inspection,
		navigate           => \&handle_division_navigate,
		read               => \&handle_division_read,
		score              => \&handle_division_score,
		time_start         => \&handle_division_time_start,
		time_stop          => \&handle_division_time_stop,
		time_reset         => \&handle_division_time_reset
	};
	$self->{ ring }        = {
		read               => \&handle_ring_read,
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
sub broadcast_updated_ring {
# ============================================================
# Broadcasts updated ring information to the ring
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
sub handle_division_decision {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
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
		autopilot( $self, $request, $progress, $division, $clients );

		$self->broadcast_updated_division( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_inspection {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $id        = $request->{ athlete };
	my $boards    = int( $request->{ boards });
	my $division  = $progress->current();
	my $n         = int( @{$self->{ athletes }});
	my $client    = $self->{ _client };
	my $athlete   = $division->{ athletes }[ $id ];

	if( $id < 0 || $id > $n ) {
		my $error = "Invalid athlete ID $id for division $division->{ name }";
		print STDERR "$error\n";
		$client->send({ json => { error => $error }});
		return;
	}

	print STDERR "Inspection complete for $athlete->{ name }, who has $boards boards\n" if $DEBUG;

	try {
		$division->record_inspection( $id, $boards );
		$division->write();
		
		$self->broadcast_updated_division( $request, $progress, $clients );

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
			
		$self->broadcast_updated_ring( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $json     = $self->{ _json };
	my $client   = $self->{ _client };
	my $division = $progress->current();

	if( $DEBUG ) {
		print STDERR "Client requesting information for division " . uc( $division->{ name }) . "\n";
	}

	my $clone = unbless( $division->clone());
	try {
		$client->send({ json => { request => $request, division => $clone }});

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
			print STDERR "$name scores: " . $json->canonical->encode( $score ) . "\n";
		}
	}

	try {
		my $complete = $division->record_score( $judge, $score );
		$division->write();
		autopilot( $self, $request, $progress, $division, $clients ) if $complete;
			
		$self->broadcast_updated_division( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_time_reset {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $division  = $progress->current();

	if( $DEBUG ) {
		print STDERR "Time reset\n";
	}

	try {
		my $complete = $division->time_reset();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_time_start {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $division  = $progress->current();

	if( $DEBUG ) {
		print STDERR "Time started\n";
	}

	try {
		my $complete = $division->time_start();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_time_stop {
# ============================================================
	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $division  = $progress->current();

	if( $DEBUG ) {
		print STDERR "Time stopped\n";
	}

	try {
		my $complete = $division->time_stop();
		$division->write();
			
		$self->broadcast_updated_division( $request, $progress, $clients );

	} catch {
		$client->send({ json => { error => "$_" }});
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
sub autopilot {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $division = shift;
	my $clients  = shift;
	my $delay    = new Mojo::IOLoop::Delay();
	my $pause    = { score => 9, leaderboard => 5, brief=> 4, next => 1 };

	$request->{ type } = 'autopilot';

	my $show  = {
		score => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ score } => $delay->begin() );
			if ( $division->is_display() ) { $division->score(); }
			$division->write();
			$request->{ action } = 'score';
			$request->{ delay }  = $pause->{ score };

			$self->broadcast_updated_division( $request, $progress, $clients );
		},
		leaderboard => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ leaderboard } => $delay->begin() );
			if ( $division->is_score() ) { $division->display(); }
			$division->write();
			$request->{ action } = 'display';
			$request->{ delay }  = $pause->{ leaderboard };

			$self->broadcast_updated_division( $request, $progress, $clients );
		},
		next => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ next } => $delay->begin() );
			if ( $division->is_display() ) { $division->score(); }
			$division->write();
			$request->{ action } = 'next';
			$request->{ delay }  = $pause->{ next };

			$self->broadcast_updated_division( $request, $progress, $clients );
		}
	};
	my $go = {
		next => sub {
			my $delay = shift;
			Mojo::IOLoop->timer( $pause->{ brief } => $delay->begin() );
			$division->next();
			$division->write();

			$self->broadcast_updated_division( $request, $progress, $clients );
		}
	};

	my @steps = ( $show->{ score }, $show->{ leaderboard } );
	push @steps, $go->{ next }, $show->{ next } unless( $division->{ complete } );

	$delay->steps( @steps )->catch( sub {} )->wait();
}


