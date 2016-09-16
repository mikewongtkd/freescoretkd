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
		read         => \&handle_division_read,
		athlete_next => \&handle_division_athlete_next,
		athlete_prev => \&handle_division_athlete_prev,
		form_next    => \&handle_division_form_next,
		form_prev    => \&handle_division_form_prev,
		round_next   => \&handle_division_round_next,
		round_prev   => \&handle_division_round_prev,
	};
}

# ============================================================
sub broadcast_response {
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
		$division->write();
		$division->next_athlete();
		$division->write();

		$self->broadcast_response( $request, $progress, $clients );
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
		$division->write();
		$division->previous_athlete();
		$division->write();

		$self->broadcast_response( $request, $progress, $clients );
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
}

# ============================================================
sub handle_division_form_prev {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();
}

# ============================================================
sub handle_division_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;

	$self->send_response( $request, $progress, $clients );
}

# ============================================================
sub handle_division_round_next {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();
}

# ============================================================
sub handle_division_round_prev {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $division = $progress->current();
}

# ============================================================
sub handle_file_change {
# ============================================================
	my $self     = shift;
	my $clients  = shift;
	my $division = $progress->current();
}


# ============================================================
sub send_response {
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

	$client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});
	$self->{ _last_state } = $digest;
}

# ============================================================
sub watch_files {
# ============================================================
	my $self     = shift; 
	return if exists $self->{ _watcher } && defined $self->{ _watcher };

	my $judge    = shift;
	my $is_judge = defined( $judge ) && int( $judge ) >= 0;
	my $path     = sprintf( "/Volumes/ramdisk/%s/forms-worldclass/ring%02d", $self->{ _tournament }, $self->{ _ring } );
	my $json     = $self->{ _json };
	my $client   = $self->{ _client };
	my $id        = sprintf "%s", sha1_hex( $client );

	print STDERR "  Watching $path\n";

	$self->{ _watcher } = new AnyEvent::Filesys::Notify(
		dirs     => [ $path ],
		interval => 2.0,
		cb       => sub {
			my $event = shift;
			return if $event->is_modified(); # Each request is responsible for broadcasting modifications; this avoids interval latency

			# ===== READ NEW PROGRESS 
			my $tournament = $self->{ _tournament };
			my $ring       = $self->{ _ring };
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
	print STDERR "\n";
	push @{$watch->{ $path }{ group }}, $self->{ _client };
}

1;
