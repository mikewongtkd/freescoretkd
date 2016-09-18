package FreeScore::Forms::WorldClass::RequestManager;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::Forms::WorldClass;
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::MoreUtils (qw( firstidx ));
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use AnyEvent::Filesys::Notify;
use AnyEvent;

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
		athlete_next  => \&handle_division_athlete_next,
		athlete_prev  => \&handle_division_athlete_prev,
		award_penalty => \&handle_division_award_penalty,
		form_next     => \&handle_division_form_next,
		form_prev     => \&handle_division_form_prev,
		read          => \&handle_division_read,
		round_next    => \&handle_division_round_next,
		round_prev    => \&handle_division_round_prev,
		score         => \&handle_division_score,
		display       => \&handle_division_display,
	};
	$self->{ ring }        = {
		division_next => \&handle_ring_division_next,
		division_prev => \&handle_ring_division_prev,
		read          => \&handle_ring_read,
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
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $division  = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();
	my $client_id = sprintf "%s", sha1_hex( $client );

	print STDERR "  Broadcasting to:\n";
	foreach my $id (sort keys %$clients) {
		my $broadcast = $clients->{ $id };
		my $unblessed;
		my $is_judge = exists $broadcast->{ judge } && defined $broadcast->{ judge };

		if( $is_judge ) { $unblessed = unbless $division->get_only( $broadcast->{ judge } ); } 
		else            { $unblessed = unbless $division; }
		my $encoded = $json->canonical->encode( $unblessed );
		my $digest  = sha1_hex( $encoded );

		print STDERR "    user: $id digest: $digest\n";
		$broadcast->{ device }->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});
		$self->{ _last_state } = $digest if $client_id eq $id;
	}
	print STDERR "\n";
}

# ============================================================
sub handle {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $action   = $request->{ action }; $action =~ s/\s+/_/g;
	my $type     = $request->{ type };   $type =~ s/\s+/_/g;

	my $dispatch = $self->{ $type }{ $action } if exists $self->{ $type } && exists $self->{ $type }{ $action };
	return $self->$dispatch( $request, $progress, $clients ) if defined $dispatch;
}

# ============================================================
sub handle_division_award_penalty {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Award penalty.\n";

	try {
		$division->record_penalties( $request->{ penalties });
		$division->write();

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_athlete_next {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Next athlete.\n";

	try {
		$division->autopilot( 0 );
		$division->next_athlete();
		$division->write();

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_athlete_prev {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Previous athlete.\n";

	try {
		$division->autopilot( 0 );
		$division->previous_athlete();
		$division->write();

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_display {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Change display.\n";

	try {
		$division->autopilot( 0 );
		if( $division->is_display() ) { $division->score();   } 
		else                          { $division->display(); }
		$division->write();

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_form_next {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();

	print STDERR "Next form.\n";

	try {
		$division->autopilot( 0 );
		$division->next_form();
		$division->write();
		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_form_prev {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();

	print STDERR "Previous form.\n";

	try {
		$division->autopilot( 0 );
		$division->previous_form();
		$division->write();
		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;

	print STDERR "Request division data.\n";

	$self->send_division_response( $request, $progress, $clients );
}

# ============================================================
sub handle_division_round_next {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();

	print STDERR "Next round.\n";

	try {
		$division->autopilot( 0 );
		$division->next_round();
		$division->write();
		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_round_prev {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();

	print STDERR "Previous round.\n";

	try {
		$division->autopilot( 0 );
		$division->previous_round();
		$division->write();
		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_score {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();

	print STDERR "Send score.\n";

	try {
		$division->record_score( $request->{ judge }, $request->{ score } );
		$division->write();
		my $round   = $division->{ round };
		my $form    = $division->{ form };
		my $athlete = $division->{ athletes }[ $division->{ curent } ];
		my $form_complete = $athlete->{ scores }{ $round }->form_complete( $form );

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		$self->{ _autopilot }( $division, $judge ) if $form_complete;

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_division_next {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;

	print STDERR "Next division.\n";

	try {
		$progress->next();
		$progress->write();
		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_division_prev {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;

	print STDERR "Previous division.\n";

	try {
		$progress->previous();
		$progress->write();
		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;

	print STDERR "Request ring data.\n";

	$self->send_ring_response( $request, $progress, $clients );
}

# ============================================================
sub send_division_response {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $division  = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();
	my $unblessed = undef;
	my $is_judge  = exists $request->{ judge } && int( $request->{ judge } ) >= 0;
	my $judge     = $is_judge ? int( $request->{ judge }) : undef;
	my $id        = sprintf "%s", sha1_hex( $client );

	my $unblessed = unbless ($is_judge ? $division->get_only( $judge ) : $division);
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );

	print STDERR "  Sending response\n";
	print STDERR "    user: $id digest: $digest\n\n";

	$client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed, request => $request }});
	$self->{ _last_state } = $digest;
}

# ============================================================
sub send_ring_response {
# ============================================================
 	my $self      = shift;
	my $request   = shift;
	my $progress  = shift;
	my $clients   = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $unblessed = undef;
	my $is_judge  = exists $request->{ judge } && int( $request->{ judge } ) >= 0;
	my $judge     = $is_judge ? int( $request->{ judge }) : undef;
	my $id        = sprintf "%s", sha1_hex( $client );

	my $unblessed = unbless $progress;
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );

	print STDERR "  Sending response\n";
	print STDERR "    user: $id digest: $digest\n\n";

	$client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, ring => $unblessed, request => $request }});
	$self->{ _last_state } = $digest;
}

# ============================================================
sub watch_files {
# ============================================================
	my $self     = shift; 
	return if exists $self->{ _watcher } && defined $self->{ _watcher };

	my $judge      = shift;
	my $is_judge   = defined( $judge ) && int( $judge ) >= 0;
	my $tournament = $self->{ _tournament };
	my $ring       = $self->{ _ring };
	my $path       = sprintf( "/Volumes/ramdisk/%s/forms-worldclass/ring%02d", $tournament, $ring );
	my $json       = $self->{ _json };
	my $client     = $self->{ _client };
	my $id         = sprintf "%s", sha1_hex( $client );

	printf STDERR "Watching '%s/ring%02d' ", $tournament, $ring;

	$self->{ _watcher } = new AnyEvent::Filesys::Notify(
		dirs     => [ $path ],
		interval => 2.0,
		cb       => sub {
			my $event = shift;
			return if $event->is_modified();     # Each request is responsible for broadcasting modifications; this avoids interval latency
			return if $event->path() =~ /\.swp/; # Ignore vim swap files

			# ===== READ NEW PROGRESS 
			my $progress   = undef;
			try   { $progress = new FreeScore::Forms::WorldClass( $tournament, $ring ); } 
			catch { $self->{ _client }->send( { json => { error => "Error reading database '$tournament', ring $ring: $_" }}); return; };
			my $division = $progress->current();

			print STDERR "\n  Notifying file changes in '" . $event->path() . "' to:\n";
			my $unblessed = unbless ($is_judge ? $division->get_only( $judge ) : $division );
			my $encoded   = $json->canonical->encode( $unblessed );
			my $digest    = sha1_hex( $encoded );

			if( $self->{ _last_state } eq $digest ) { print STDERR "    user: $id judge: $judge digest: $digest NO CHANGE; SKIP\n"; }
			else                                    { print STDERR "    user: $id judge: $judge digest: $digest\n"; }
			$client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }})
				unless $self->{ _last_state } eq $digest;
			$self->{ _last_state } = $digest;
			print STDERR "\n";
		}
	);
	push @{$watch->{ $path }{ group }}, $self->{ _client };
}

1;
