package FreeScore::Forms::WorldClass::RequestManager;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::Repository;
use FreeScore::Forms::WorldClass;
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::Util (qw( first ));
use List::MoreUtils (qw( first_index ));
use Data::Dumper;
use Data::Structure::Util qw( unbless );

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
	$self->{ _autopilot }  = shift;
	$self->{ _json }       = new JSON::XS();
	$self->{ _watching }   = {};
	$self->{ software }    = {
		check_updates      => \&handle_software_check_updates,
		update             => \&handle_software_update
	};
	$self->{ division }    = {
		athlete_delete     => \&handle_division_athlete_delete,
		athlete_next       => \&handle_division_athlete_next,
		athlete_prev       => \&handle_division_athlete_prev,
		award_penalty      => \&handle_division_award_penalty,
		award_punitive     => \&handle_division_award_punitive,
		display            => \&handle_division_display,
		edit_athletes      => \&handle_division_edit_athletes,
		edit_header        => \&handle_division_edit_header,
		form_next          => \&handle_division_form_next,
		form_prev          => \&handle_division_form_prev,
		judge_departure    => \&handle_division_judge_departure,
		judge_query        => \&handle_division_judge_query,
		judge_registration => \&handle_division_judge_registration,
		navigate           => \&handle_division_navigate,
		read               => \&handle_division_read,
		round_next         => \&handle_division_round_next,
		round_prev         => \&handle_division_round_prev,
		score              => \&handle_division_score,
		write              => \&handle_division_write,
	};
	$self->{ ring }        = {
		division_next      => \&handle_ring_division_next,
		division_prev      => \&handle_ring_division_prev,
		read               => \&handle_ring_read,
		transfer           => \&handle_ring_transfer,
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

	print STDERR "  Broadcasting division information to:\n";
	foreach my $id (sort keys %$clients) {
		my $broadcast = $clients->{ $id };
		my $is_judge  = exists $broadcast->{ judge } && defined $broadcast->{ judge };
		my $unblessed = unbless ( $is_judge ? $division->get_only( $broadcast->{ judge } ) : $division ); 
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );

		print STDERR "    user: $id digest: $digest\n";
		$broadcast->{ device }->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});
		$self->{ _last_state } = $digest if $client_id eq $id;
	}
	print STDERR "\n";
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

	print STDERR "  Broadcasting ring information to:\n";
	foreach my $id (sort keys %$clients) {
		my $broadcast = $clients->{ $id };
		my $is_judge  = exists $broadcast->{ judge } && defined $broadcast->{ judge };
		my $unblessed = unbless ( $is_judge ? $division->get_only( $broadcast->{ judge } ) : $progress ); 
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );
		my $response  = $is_judge ? { type => 'division', action => 'update', digest => $digest, division => $unblessed } : { type => 'ring', action => 'update', digest => $digest, ring => $unblessed };

		print STDERR "    user: $id digest: $digest\n";
		$broadcast->{ device }->send( { json => $response });
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
	my $judges   = shift;
	my $action   = $request->{ action }; $action =~ s/\s+/_/g;
	my $type     = $request->{ type };   $type =~ s/\s+/_/g;

	my $dispatch = $self->{ $type }{ $action } if exists $self->{ $type } && exists $self->{ $type }{ $action };
	return $self->$dispatch( $request, $progress, $clients, $judges ) if defined $dispatch;
}

# ============================================================
sub handle_division_award_penalty {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
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
sub handle_division_award_punitive {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Award punitive decision $request->{ decision } to $request->{ athlete_id }.\n";

	try {
		$division->record_decision( $request->{ decision }, $request->{ athlete_id });
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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Next athlete.\n";

	try {
		$division->autopilot( 'off' );
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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Previous athlete.\n";

	try {
		$division->autopilot( 'off' );
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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Change display.\n";

	try {
		$division->autopilot( 'off' );
		if( $division->is_display() ) { $division->score();   } 
		else                          { $division->display(); }
		$division->write();

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}
# ============================================================
sub handle_division_edit_athletes {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };

	print STDERR "Editing division athletes.\n";

	try {
		my $division = $progress->find( $request->{ divid } ) or die "Can't find division " . uc( $request->{ divid }) . " $!";
		$division->edit_athletes( $request->{ athletes }, $request->{ round } );
		$division->write();

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_edit_header {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Editing division header.\n";

	try {
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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Next form.\n";

	try {
		$division->autopilot( 'off' );
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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Previous form.\n";

	try {
		$division->autopilot( 'off' );
		$division->previous_form();
		$division->write();
		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_judge_departure {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Requesting judge departure.\n";

	my $id = $request->{ cookie }{ id };
	my $i  = first_index { $_->{ id } eq $id; } @$judges;
	$judges->[ $i ] = {} unless $i < 0;
	$client->send( { json => { type => 'division', action => 'judge goodbye' }});
	my $name = $i < 0 ? '' : $i == 0 ? 'Referee' : 'Judge ' . $i;

	print STDERR "Goodbye $name\n";
}

# ============================================================
sub handle_division_judge_query {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $n        = $division->{ judges };

	# ===== INITIALIZE IF NOT PREVIOUSLY SET
	if( @$judges != $n ) { 
		foreach ( 1 .. $n ) { push @$judges, {}; }
		print STDERR "Initializing $n judges\n";
	}

	print STDERR "Requesting judge information.\n";

	$client->send( { json => { type => 'division', action => 'judges', judges => $judges }} );
}

# ============================================================
sub handle_division_judge_registration {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $id       = $request->{ id };
	my $num      = $request->{ num };
	my $judge    = $num == 0 ? 'Referee' : 'Judge ' + $num;

	print STDERR "Requesting $judge registration.\n";

	$judges->[ $num ]{ id } = $id;

	print STDERR "  Broadcasting judge registration information to:\n";
	foreach my $id (sort keys %$clients) {
		my $broadcast = $clients->{ $id };

		print STDERR "    user: $id\n";
		$broadcast->{ device }->send( { json => { type => $request->{ type }, action => 'judges', judges => $judges }});
	}
	print STDERR "\n";

}

# ============================================================
sub handle_division_navigate {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	my $object = $request->{ target }{ destination };
	my $i      = exists $request->{ target }{ divid } ? $request->{ target }{ divid } : int( $request->{ target }{ index } );

	print STDERR "Navigating to $object $i.\n";

	try {
		if( $object =~ /^division$/i ) { 
			$progress->navigate( $i ); 
			$progress->write();
			$division = $progress->current();
			$division->autopilot( 'off' );
			$division->write();
			$self->broadcast_ring_response( $request, $progress, $clients );
		}
		elsif( $object =~ /^(?:athlete|round|form)$/i ) { 
			$division->navigate( $object, $i ); 
			$division->autopilot( 'off' );
			$division->write();
			$self->broadcast_division_response( $request, $progress, $clients );
		}
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
	my $judges   = shift;

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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Next round.\n";

	try {
		$division->autopilot( 'off' );
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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Previous round.\n";

	try {
		$division->autopilot( 'off' );
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
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Send score.\n";

	try {
		$division->record_score( $request->{ cookie }{ judge }, $request->{ score } );
		$division->write();
		my $round         = $division->{ round };
		my $form          = $division->{ form };
		my $athlete       = $division->{ athletes }[ $division->{ curent } ];
		my $form_complete = $athlete->{ scores }{ $round }->form_complete( $form );

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		my $autopilot = $self->{ _autopilot }->( $division ) if $form_complete;
		die $autopilot->{ error } if exists $autopilot->{ error };

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_write {
# ============================================================
	my $self       = shift;
	my $request    = shift;
	my $progress   = shift;
	my $clients    = shift;
	my $judges     = shift;
	my $client     = $self->{ _client };
	my $tournament = $self->{ _tournament };
	my $ring       = $self->{ _ring };

	print STDERR "Writing division data.\n";

	my $valid = { map { ( $_ => 1 ) } qw( athletes description forms judges name ring round ) };

	try {
		my $division = FreeScore::Forms::WorldClass::Division->from_json( $request->{ division } );
		foreach my $key (keys %$division) { delete $division->{ $key } unless exists $valid->{ $key }; }
		$division->{ file } = sprintf( "%s/%s/%s/ring%02d/div.%s.txt", $FreeScore::PATH, $tournament, $FreeScore::Forms::WorldClass::SUBDIR, $ring, $division->{ name } );

		if( -e $division->{ file } && ! exists $request->{ overwrite } ) {
			$client->send( { json => {  type => 'division', action => 'write error', error => "File '$division->{ file }' exists.", division => $division }});

		} else {
			$division->normalize();
			$progress->update_division( $division );
			$division->write();

			# ===== NOTIFY THE CLIENT OF SUCCESSFUL WRITE
			$client->send( { json => {  type => 'division', action => 'write ok', division => $division }});

			# ===== BROADCAST THE UPDATE
			$self->broadcast_ring_response( $request, $progress, $clients );
		}
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
	my $judges   = shift;
	my $client   = $self->{ _client };

	print STDERR "Next division.\n";

	try {
		$progress->next();
		$progress->write();
		$self->broadcast_ring_response( $request, $progress, $clients );
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
	my $judges   = shift;
	my $client   = $self->{ _client };

	print STDERR "Previous division.\n";

	try {
		$progress->previous();
		$progress->write();
		$self->broadcast_ring_response( $request, $progress, $clients );
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
	my $judges   = shift;

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
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $division  = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();
	my $unblessed = undef;
	my $is_judge  = exists $request->{ cookie }{ judge } && int( $request->{ cookie }{ judge } ) >= 0;
	my $judge     = $is_judge ? int($request->{ cookie }{ judge }) : undef;
	my $id        = sprintf "%s", sha1_hex( $client );

	my $unblessed = unbless ($is_judge ? $division->get_only( $judge ) : $division);
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );

	my $jname     = [ qw( R 1 2 3 4 5 6 ) ];
	print STDERR "  Sending division response to " . ($is_judge ? $judge == 0 ? "Referee" : "Judge $judge" : "client") . "\n";
	print STDERR "    user: $id digest: $digest\n";

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
	my $judges    = shift;
	my $client    = $self->{ _client };
	my $json      = $self->{ _json };
	my $unblessed = undef;
	my $is_judge  = exists $request->{ cookie }{ judge } && int( $request->{ cookie }{ judge } ) >= 0;
	my $judge     = $is_judge ? int( $request->{ cookie }{ judge }) : undef;
	my $id        = sprintf "%s", sha1_hex( $client );

	my $unblessed = unbless $progress;
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );

	my $jname     = [ qw( R 1 2 3 4 5 6 ) ];
	print STDERR "  Sending ring response to " . ($is_judge ? "Judge " . $jname->[ $judge ] : "client") . "\n";
	print STDERR "    user: $id digest: $digest\n";

	$client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, ring => $unblessed, request => $request }});
	$self->{ _last_state } = $digest;
}

# ============================================================
sub handle_ring_transfer {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $divid    = $request->{ name };
	my $transfer = $request->{ transfer };

	my $destination = $transfer eq 'staging' ? $transfer : sprintf( "Ring %d", $transfer );
	print STDERR "Transfer division $divid to $destination.\n";

	try {
		$progress->transfer( $divid, $transfer );

		$self->broadcast_ring_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_software_check_updates {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };

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
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };

	try {
		my $repo = new FreeScore::Repository();
		$repo->update_local_to_latest();
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

1;
