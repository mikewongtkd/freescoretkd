package FreeScore::Forms::FreeStyle::RequestManager;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::RCS;
use FreeScore::Forms::FreeStyle;
use FreeScore::Forms::WorldClass;
use FreeScore::Forms::WorldClass::Division;
use FreeScore::Registration::USAT;
use File::Slurp qw( read_file );
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::Util (qw( first shuffle ));
use List::MoreUtils (qw( first_index ));
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use Clone qw( clone );

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
		athlete_delete     => \&handle_division_athlete_delete,
		athlete_next       => \&handle_division_athlete_next,
		athlete_prev       => \&handle_division_athlete_prev,
		award_penalty      => \&handle_division_award_penalty,
		award_punitive     => \&handle_division_award_punitive,
		display            => \&handle_division_display,
		edit_athletes      => \&handle_division_edit_athletes,
		filter_athletes    => \&handle_division_filter_athletes,
		judge_departure    => \&handle_division_judge_departure,
		judge_query        => \&handle_division_judge_query,
		judge_registration => \&handle_division_judge_registration,
		navigate           => \&handle_division_navigate,
		pool_judge_ready   => \&handle_division_pool_judge_ready,
		pool_resolve       => \&handle_division_pool_resolve,
		pool_score         => \&handle_division_pool_score,
		round_next         => \&handle_division_round_next,
		round_prev         => \&handle_division_round_prev,
		read               => \&handle_division_read,
		score              => \&handle_division_score,
		view_next          => \&handle_division_view_next,
		write              => \&handle_division_write,
	};
	$self->{ registration } = {
		import             => \&handle_registration_import,
		read               => \&handle_registration_read,
		upload             => \&handle_registration_upload,
	};
	$self->{ ring }        = {
		division_delete    => \&handle_ring_division_delete,
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

	print STDERR "  Broadcasting division information to:\n" if $DEBUG;

	foreach my $id (sort keys %$clients) {
		my $broadcast = $clients->{ $id };
		my $message   = $division->clone();
		my $unblessed = unbless( $message ); 
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );
		my $role      = $broadcast->{ role };

		print STDERR "    user: " . substr( $id, 0, 4 ) . " digest: " . substr( $digest, 0, 4 ) . " $role\n" if $DEBUG;
		$broadcast->{ device }->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, request => $request, division => $unblessed }});
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
		my $broadcast = $clients->{ $id };
		my $is_judge  = exists $broadcast->{ judge } && defined $broadcast->{ judge };
		my $message   = $progress->clone();
		my $unblessed = unbless( $message ); 
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );
		my $response  = $is_judge ? { type => 'division', action => 'update', digest => $digest, division => $unblessed, request => $request } : { type => 'ring', action => 'update', digest => $digest, ring => $unblessed, request => $request };
		my $role      = $broadcast->{ role };

		print STDERR "    user: " . substr( $id, 0, 4 ) . " digest: " . substr( $digest, 0, 4 ) . " $role\n" if $DEBUG;
		$broadcast->{ device }->send( { json => $response });
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

	my $round    = $division->{ round };
	my $athlete  = $division->{ athletes }[ $request->{ athlete_id } ];
	my $have     = $athlete->{ penalty }{ $round };
	my $add      = clone( $request->{ penalty }{ $round });

	foreach my $penalty (keys %$have) { delete $add->{ $penalty } if exists $add->{ $penalty }; }
	if( keys %$add ) {
		print STDERR "Award penalty: " . join( ' ', sort keys %$add ) . " to $athlete->{ name }.\n" if $DEBUG;
	} else {
		print STDERR "Clear penalties for $athlete->{ name }.\n" if $DEBUG;
	}

	try {
		$division->record_penalty( $request->{ penalty }{ $round }, $request->{ athlete_id });
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

	print STDERR "Award punitive decision $request->{ decision } to $request->{ athlete_id }.\n" if $DEBUG;

	try {
		$division->record_decision( $request->{ decision }, $request->{ athlete_id });
		$division->write();

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		my $athlete  = $division->{ athletes }[ $request->{ athlete_id }];
		my $round    = $division->{ round };
		my $complete = $athlete->{ complete }{ $round };
		print STDERR "Checking to see if we should engage autopilot: " . ($complete ? "Yes.\n" : "Not yet.\n") if $DEBUG;
		my $autopilot = $self->autopilot( $request, $progress, $clients, $judges ) if $complete;
		die $autopilot->{ error } if exists $autopilot->{ error };

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_athlete_delete {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Deleting athlete.\n" if $DEBUG;

	try {
		$division->remove_athlete( $request->{ athlete_id } );
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

	print STDERR "Next athlete.\n" if $DEBUG;

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

	print STDERR "Previous athlete.\n" if $DEBUG;

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

	print STDERR "Change display.\n" if $DEBUG;

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

	print STDERR "Editing division athletes.\n" if $DEBUG;

	try {
		my $division = $progress->find( $request->{ divid } ) or die "Can't find division " . uc( $request->{ divid }) . " $!";
		$division->edit_athletes( $request->{ athletes } );
		$division->write();

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_filter_athletes {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $version  = new FreeScore::RCS();
	my $client   = $self->{ _client };

	my $message = sprintf( "Filtering division athletes to: %s.", join( ', ', map { $_->{ name } } @{$request->{ athletes }}));
	print STDERR "$message\n" if $DEBUG;

	try {
		my $division = $progress->find( $request->{ divid } ) or die "Can't find division " . uc( $request->{ divid }) . " $!";
		$version->checkout( $division );
		$division->filter_athletes( $request->{ athletes }) && $division->write();
		$version->commit( $division, $message );

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

	print STDERR "Requesting judge departure.\n" if $DEBUG;

	my $id = $request->{ cookie }{ id };
	my $i  = first_index { $_->{ id } eq $id; } @$judges;
	$judges->[ $i ] = {} unless $i < 0;
	$client->send( { json => { type => 'division', action => 'judge goodbye' }});
	my $name = $i < 0 ? '' : $i == 0 ? 'Referee' : 'Judge ' . $i;

	print STDERR "Goodbye $name\n" if $DEBUG;
}

# ============================================================
sub handle_division_judge_query {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift || [];
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $n        = $division->{ judges };
	my $j        = @$judges;

	# ===== INITIALIZE IF NOT PREVIOUSLY SET
	if( $j < $n ) { 
		foreach my $i ( 0 .. ($n - 1)) { $judges->[ $i ] ||= {}; }
		print STDERR "Initializing $n judges\n" if $DEBUG;

	# ===== IF THE NUMBER OF JUDGES HAS BEEN REDUCED, REMOVE THE EXTRA JUDGES
	} elsif( $j > $n ) {
		splice( @$judges, 0, $n );
	}

	print STDERR "Requesting judge information.\n" if $DEBUG;

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

	print STDERR "Requesting $judge registration.\n" if $DEBUG;

	$judges->[ $num ]{ id } = $id;

	print STDERR "  Broadcasting judge registration information to:\n" if $DEBUG;
	foreach my $id (sort keys %$clients) {
		my $broadcast = $clients->{ $id };

		print STDERR "    user: " . substr( $id, 0, 4 ) . "\n" if $DEBUG;
		$broadcast->{ device }->send( { json => { type => $request->{ type }, action => 'judges', judges => $judges }});
	}
	print STDERR "\n" if $DEBUG;

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

	print STDERR "Navigating to $object $i.\n" if $DEBUG;

	try {
		if( $object =~ /^division$/i ) { 
			$progress->navigate( $i ); 
			$progress->write();
			$division = $progress->current();
			$division->autopilot( 'off' );
			$division->write();
			$self->broadcast_ring_response( $request, $progress, $clients );
		}
		elsif( $object =~ /^athlete$/i ) { 
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
sub handle_division_pool_judge_ready {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $json     = $self->{ _json };
	my $division = $progress->current();
	my $athlete  = $division->current_athlete();
	my $timers   = exists $division->{ timers } && defined $division->{ timers } ? $json->decode( $division->{ timers }) : { cycle => 2, pause => {} };
	my $jname    = "$request->{ judge }{ fname } $request->{ judge }{ lname }";
	my $message  = "  $jname is ready to score athlete $athlete->{ name }\n";

	print STDERR $message if $DEBUG;

	try {
		my $size     = $request->{ size };          # Required parameter
		my $judge    = $request->{ judge };         # Required parameter
		my $timeout  = $timer->{ pause }{ ready } || $request->{ timeout } || 10;
		my $response = $division->pool_judge_ready( $size, $judge );

		print STDERR "    " . int( @{ $response->{ responded }}) . " out of $size ($response->{ want } wanted)\n" if $DEBUG;

		# ===== MIXED POOMSAE: CHECK IF ALL JUDGES ARE HERE
		if( $division->is_mixed() ) {
			my $worldclass = $division->mixed_recognized();
			my $all_here   = $response->{ responded } >= $size;

			# If all judges are in the Freestyle interface, then disable Recognized interface redirection
			if( $worldclass->redirect_clients() && $all_here ) {
				$worldclass->redirect_clients( 'off' );
				$worldclass->write();
			}
		}

		$division->write();

		$request->{ response } = $response;
		$self->broadcast_division_response( $request, $progress, $clients );

	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_pool_resolve {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $athlete  = $division->current_athlete();

	my $message  = "Manually invoking pool resolution\n";

	print STDERR $message if $DEBUG;

	try {
		my $score = clone( $request->{ score } );
		$version->checkout( $division );

		my $response = $division->resolve_pool();
		$request->{ response } = $response;

		my $round    = $division->{ round };
		my $complete = $athlete->{ complete }{ $round };

		$division->write();
		$version->commit( $division, $message );

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		print STDERR "Checking to see if we should engage autopilot: " . ($complete ? "Yes.\n" : "Not yet.\n") if $DEBUG;
		my $autopilot = $self->autopilot( $request, $progress, $clients, $judges ) if $complete;
		die $autopilot->{ error } if exists $autopilot->{ error };

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_pool_score {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $athlete  = $division->current_athlete();
	my $jname    = "$request->{ score }{ judge }{ fname } $request->{ score }{ judge }{ lname }";
	my $message  = "  $jname has scored for $athlete->{ name }\n";

	print STDERR $message if $DEBUG;

	try {
		my $score = clone( $request->{ score } );
		$version->checkout( $division );

		my $response = $division->record_pool_score( $score );
		$request->{ response } = $response;

		# ===== MIXED POOMSAE: CHECK IF ALL JUDGES ARE HERE
		if( $division->is_mixed() ) {
			my $worldclass = $division->mixed_recognized();

			if( $worldclass->redirect_clients()) {
				$worldclass->redirect_clients( 'off' );
				$worldclass->write();
			}
		}

		$division->write();
		$version->commit( $division, $message );

		# ===== SCORING IS IN PROGRESS; CONFIRM SCORE RECEIVED AND RECORDED
		if( $response->{ status } eq 'in-progress' ) { 
			$self->broadcast_division_response( $request, $progress, $clients );
			return; 

		} elsif( $response->{ status } eq 'fail' ) {
			# ===== POOL JUDGES REQUEST DISCUSSION TO DISQUALIFY ATHLETE
			if( $response->{ solution } eq 'discuss-disqualify' ) {
				print STDERR "  At least one judge has voted to disqualify\n";

			# ===== INSUFFICIENT JUDGES HAVE SCORED
			} elsif( $response->{ solution } eq 'replay' ) {
				print STDERR "  Insufficient judges have scored; rescore the video\n";
			}
			$self->broadcast_division_response( $request, $progress, $clients );
			return;

		} elsif( $response->{ status } eq 'error' ) {
			return;
		}

		my $round    = $division->{ round };
		my $complete = $athlete->{ complete }{ $round };

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		print STDERR "Checking to see if we should engage autopilot: " . ($complete ? "Yes.\n" : "Not yet.\n") if $DEBUG;
		my $autopilot = $self->autopilot( $request, $progress, $clients, $judges ) if $complete;
		die $autopilot->{ error } if exists $autopilot->{ error };

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
	my $judges   = shift;

	print STDERR "Request division data.\n" if $DEBUG;

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

	print STDERR "Next round.\n" if $DEBUG;

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

	print STDERR "Previous round.\n" if $DEBUG;

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
	my $version  = new FreeScore::RCS();
	my $i        = $division->{ current };
	my $athlete  = $division->{ athletes }[ $i ];
	my $jname    = $request->{ judge } ? "Judge $request->{ judge }" : "Referee";
	my $message  = "$jname score for $athlete->{ name }.\n";

	print STDERR "  $message" if $DEBUG;

	try {
		$version->checkout( $division );
		$division->record_score( $request->{ judge }, $request->{ score } );
		$division->write();
		$version->commit( $division, $message );
		my $complete = $athlete->{ complete }{ $division->{ round }};

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		print STDERR "Checking to see if we should engage autopilot: " . ($complete ? "Yes.\n" : "Not yet.\n") if $DEBUG;
		my $autopilot = $self->autopilot( $request, $progress, $clients, $judges ) if $complete;
		die $autopilot->{ error } if exists $autopilot->{ error };

		$self->broadcast_division_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_view_next {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Change display.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		local $_ = $division->{ state };
		if    ( /score/i   ) { $division->display(); }
		elsif ( /display/i ) { $division->list();    }
		elsif ( /list/i    ) { $division->score();   }
		$division->write();

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

	print STDERR "Writing division data.\n" if $DEBUG;

	try {
		my $division = FreeScore::Forms::FreeStyle::Division->from_json( $request->{ division } );
		$division->{ file } = sprintf( "%s/%s/%s/ring%02d/div.%s.txt", $FreeScore::PATH, $tournament, $FreeScore::Forms::FreeStyle::SUBDIR, $ring, $division->{ name } );

		my $message   = $division->clone();
		my $unblessed = unbless( $message ); 
			
		if( -e $division->{ file } && ! exists $request->{ overwrite } ) {
			$client->send( { json => {  type => 'division', action => 'write error', error => "File '$division->{ file }' exists.", division => $unblessed }});

		} else {
			$progress->update_division( $division );
			$division->write();

			# ===== NOTIFY THE CLIENT OF SUCCESSFUL WRITE
			$client->send( { json => {  type => 'division', action => 'write ok', division => $unblessed }});

			# ===== BROADCAST THE UPDATE
			$self->broadcast_ring_response( $request, $progress, $clients );
		}
	} catch {
		$client->send( { json => { error => "$_" }});
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
		my $divisions    = $registration->freestyle( $settings );
		my $copy         = clone( $request ); delete $copy->{ data };

		foreach my $subevent (keys %$divisions) {
			foreach my $key (keys %{$divisions->{ $subevent }}) {
				my $divid                      = FreeScore::Registration::USAT::divid( $subevent, $key );
				my $athletes                   = $divisions->{ $subevent }{ $key };
				my ($description, $draw)       = FreeScore::Registration::USAT::description( $subevent, $key );
				my $round                      = 'prelim'; if( @$athletes <= 8 ) { $round = 'finals'; } elsif( @$athletes < 20 ) { $round = 'semfin'; }
				my $division                   = $progress->create_division( $divid ); 
				$division->{ athletes }        = [ shuffle map { { name => join( " ", map { ucfirst } split /\s+/, $_->{ first }) . ' ' . uc( $_->{ last }), info => { state => $_->{ state }} }} @$athletes ];
				$division->{ current }         = 0;
				$division->{ description }     = $description;
				$division->{ judges }          = 5;
				$division->{ order }{ $round } = [ 0 .. $#$athletes ];
				$division->{ round }           = $round;

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
		my @divisions = ();
		if( -e $male && -e $female ) {
			$female = read_file( $female );
			$male   = read_file( $male );
			my $registration = new FreeScore::Registration::USAT( $female, $male );
			my $freestyle    = $registration->freestyle();
			@divisions       = ( divisions => $freestyle );
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
		my $divisions    = $registration->freestyle();
		my $copy         = clone( $request ); delete $copy->{ data };

		$client->send({ json => { request => $copy, divisions => $divisions }});
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_division_delete {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $client   = $self->{ _client };

	print STDERR "Deleting division $request->{ divid }.\n" if $DEBUG;

	try {
		$progress->delete_division( $request->{ divid });
		$progress->write();
		$self->broadcast_ring_response( $request, $progress, $clients );
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

	print STDERR "Next division.\n" if $DEBUG;

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

	print STDERR "Previous division.\n" if $DEBUG;

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

	print STDERR "Request ring $self->{ _ring } data.\n" if $DEBUG;

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
	my $division  = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current() or die "Division not in ring $!";
	my $unblessed = undef;
	my $is_judge  = exists $request->{ cookie }{ judge } && int( $request->{ cookie }{ judge } ) >= 0;
	my $judge     = $is_judge ? int($request->{ cookie }{ judge }) : undef;
	my $id        = sprintf "%s", sha1_hex( $client );

	my $message   = $division->clone();
	my $unblessed = unbless( $message ); 
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );

	$client = first { sha1_hex( $_->{ device }) eq $id } values %$clients;

	my $jname     = [ qw( R 1 2 3 4 5 6 ) ];
	print STDERR "  Sending division response to " . ($is_judge ? $judge == 0 ? "Referee" : "Judge $judge" : "client") . "\n" if $DEBUG;
	print STDERR "    user: " . substr( $client->{ id }, 0, 4 ) . " digest: " . substr( $digest, 0, 4 ) . " $client->{ role }\n" if $DEBUG;

	$client->{ device }->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed, request => $request }});
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

	my $message   = clone( $progress );
	my $unblessed = unbless( $message ); 
	my $encoded   = $json->canonical->encode( $unblessed );
	my $digest    = sha1_hex( $encoded );

	$client = first { sha1_hex( $_->{ device }) eq $id } values %$clients;

	my $jname     = [ qw( R 1 2 3 4 5 6 ) ];
	print STDERR "  Sending ring response to " . ($is_judge ? "Judge " . $jname->[ $judge ] : "client") . "\n" if $DEBUG;
	print STDERR "    user: " . substr( $client->{ id }, 0, 4 ) . " $client->{ role }\n" if $DEBUG;

	$client->{ device }->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, ring => $unblessed, request => $request }});
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
	print STDERR "Transfer division $divid to $destination.\n" if $DEBUG;

	try {
		$progress->transfer( $divid, $transfer );

		$self->broadcast_ring_response( $request, $progress, $clients );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub autopilot {
# ============================================================
#** @method( request, progress, clients, judges )
#   @brief Automatically advances to the next athlete/division
#   Called when judges finish scoring an athlete's form 
#*
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $judges   = shift;
	my $division = $progress->current();
	my $cycle    = $division->{ autodisplay } || 1;
	my $round    = $division->{ round };

	# ===== DISALLOW REDUNDANT AUTOPILOT REQUESTS
	if( my $locked = $division->autopilot() ) { print STDERR "Autopilot already engaged.\n" if $DEBUG; return { warning => 'Autopilot is already engaged.' }; }

	# ===== ENGAGE AUTOPILOT
	try {
		print STDERR "Engaging autopilot.\n" if $DEBUG;
		$division->autopilot( 'on' );
		$division->write();
	} catch {
		return { error => $_ };
	};

	my $pause = { leaderboard => 9, next => 12, brief => 1, redirect => 3 };
	my $j     = first_index { $division->{ current } == $_ } @{ $division->{ order }{ $round }};
	my $n     = $#{ $division->{ order }{ $round }};

	my $last = {
		athlete => ($j == $n),
		cycle   => (!(($j + 1) % $cycle)),
		round   => ($round eq 'finals'),
	};

	# ===== MIXED POOMSAE COMPETITION: REDIRECT CLIENTS TO RECOGNIZED INTERFACES
	my $athlete  = $division->current_athlete();
	my $round    = $division->{ round };
	my $complete = $athlete->{ complete }{ $round };
	my $mixed    = $division->is_mixed() && $complete;

	# ===== AUTOPILOT BEHAVIOR
	# Autopilot behavior comprises the two afforementioned actions in
	# serial, with delays between.
	my $delay = new Mojo::IOLoop::Delay();
	$delay->steps(
		sub {
			my $delay = shift;
			print STDERR "Showing scores.\n" if $DEBUG;
			Mojo::IOLoop->timer( $pause->{ leaderboard } => $delay->begin );
		},
		sub {
			my $delay = shift;

			die "Disengaging autopilot\n" unless $division->autopilot();

			if( $last->{ cycle } || $last->{ athlete }) { 
				print STDERR "Showing leaderboard.\n" if $DEBUG;
				$division->display() unless $division->is_display(); 
				$division->write(); 
				$self->broadcast_division_response( $request, $progress, $clients, $judges );
				Mojo::IOLoop->timer( $pause->{ next } => $delay->begin );

			} else {
				Mojo::IOLoop->timer( $pause->{ brief } => $delay->begin );
			}
		},
		sub {
			my $delay = shift;

			die "Disengaging autopilot\n" unless $division->autopilot();

			if( $mixed && ! $last->{ athlete }) {
				print STDERR "Allowing time for redirection.\n";
				Mojo::IOLoop->timer( $pause->{ redirect } => $delay->begin );
			} else {
				Mojo::IOLoop->timer( $pause->{ brief } => $delay->begin );
			}
		},
		sub {
			my $delay = shift;
			# Mixed poomsae competition: redirect all clients
			if( $mixed && ! $last->{ athlete }) {
				print STDERR "Redirecting ring to recognized for mixed poomsae.\n";
				$division->redirect_clients( 'recognized' );
				$division->write();
				$self->broadcast_division_response( $request, $progress, $clients, $judges );
			}
			Mojo::IOLoop->timer( $pause->{ brief } => $delay->begin );
		},
		sub {
			my $delay = shift;

			die "Disengaging autopilot\n" unless $division->autopilot();
			print STDERR "Advancing the division to next item.\n" if $DEBUG;

			my $go_next = { 
				round   =>   $last->{ athlete } && ! $last->{ round },
				athlete => ! $last->{ athlete }
			};

			if    ( $go_next->{ round }   ) { $division->next_round(); }
			elsif ( $go_next->{ athlete } ) { $division->next_athlete(); }

			print STDERR "Disengaging autopilot.\n" if $DEBUG;
			$division->autopilot( 'off' ); # Finished. Disengage autopilot for now.
			$division->write();

			$self->broadcast_division_response( $request, $progress, $clients, $judges );
		},
	)->catch( sub {
		my $delay = shift;
		my $error = shift;

	})->wait();
}

1;
