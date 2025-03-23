package FreeScore::Forms::WorldClass::RequestManager;
use lib qw( /usr/local/freescore/lib );
use base FreeScore::RequestManager;
use Try::Tiny;
use FreeScore;
use FreeScore::RCS;
use FreeScore::Forms::WorldClass;
use FreeScore::Forms::WorldClass::Schedule;
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::Util (qw( first shuffle ));
use List::MoreUtils (qw( first_index ));
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use Clone qw( clone );
use File::Slurp qw( read_file );
use Encode qw( encode );
use Mojo::IOLoop;
use Mojo::IOLoop::Delay;

our $DEBUG = 1;

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
		award_min_score    => \&handle_division_award_min_score,
		award_penalty      => \&handle_division_award_penalty,
		award_punitive     => \&handle_division_award_punitive,
		clear_judge_score  => \&handle_division_clear_judge_score,
		display            => \&handle_division_display,
		draw               => \&handle_division_draw,
		draw_select_age    => \&handle_division_draw_select_age,
		edit_athletes      => \&handle_division_edit_athletes,
		form_next          => \&handle_division_form_next,
		form_prev          => \&handle_division_form_prev,
		history            => \&handle_division_history,
		judge_query        => \&handle_division_judge_query,
		navigate           => \&handle_division_navigate,
		read               => \&handle_division_read,
		restore            => \&handle_division_restore,
		round_next         => \&handle_division_round_next,
		round_prev         => \&handle_division_round_prev,
		score              => \&handle_division_score,
		write              => \&handle_division_write,
	};
	$self->{ ring }        = {
		division_delete    => \&handle_ring_division_delete,
		division_merge     => \&handle_ring_division_merge,
		division_next      => \&handle_ring_division_next,
		division_prev      => \&handle_ring_division_prev,
		division_split     => \&handle_ring_division_split,
		read               => \&handle_ring_read,
		transfer           => \&handle_ring_transfer,
	};
	$self->{ tournament } = {
		read               => \&handle_tournament_read,
		draws_delete       => \&handle_tournament_draws_delete,
		draws_write        => \&handle_tournament_draws_write,
	};
	$self->init_client_server();
}

# ============================================================
sub handle_division_award_penalty {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $i        = $division->{ current };
	my $athlete  = $division->{ athletes }[ $i ];
	my $penalty  = join( ", ", grep { $request->{ penalties }{ $_ } > 0 } sort keys %{ $request->{ penalties }} );
	my $message  = $penalty ? "Award $penalty penalty to $athlete->{ name }\n" : "Clear penalties for $athlete->{ name }\n";

	print STDERR $message if $DEBUG;

	try {
		$version->checkout( $division );
		$division->record_penalties( $request->{ penalties });
		$division->write();
		$version->commit( $division, $message );

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $i        = $request->{ athlete_id };
	my $athlete  = $division->{ athletes }[ $i ];
	my $decision = $request->{ decision };
	my $message  = "Award punitive decision $decision penalty to $athlete->{ name }\n";

	print STDERR $message if $DEBUG;

	try {
		$version->checkout( $division);
		$division->record_decision( $request->{ decision }, $request->{ athlete_id });
		$division->next_available_athlete() unless $request->{ decision } eq 'clear';
		$division->write();
		$version->commit( $division, $message );

		$self->broadcast_updated_division( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_award_min_score {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $i        = $division->{ current };
	my $round    = $division->{ round };
	my $forms    = int( @{$division->{ forms }{ $round }});
	my $n        = $division->{ judges };
	my $athlete  = $division->{ athletes }[ $i ];
	my $message  = "Award minimum score to $athlete->{ name }\n";
  my $method   = $division->method();

	print STDERR $message if $DEBUG;

	try {
		$version->checkout( $division);
		my $score = undef;
		if( $method->code() eq 'sbs' ) {
			my $match      = $method->matches->current();
			my $contestant = $match->{ chung } == $i ? 'chung' : 'hong';
			my $mnum       = $match->{ number };
			$score = { match => $mnum, $contestant => { index => $i, major => 0.0, minor => 4.0, power => 0.5, rhythm => 0.5, ki => 0.5 }};
		} else {
			$score = { major => 0.0, minor => 4.0, power => 0.5, rhythm => 0.5, ki => 0.5 };
		}
		my $form  = $division->{ form };
		foreach( my $k; $k < $forms; $k++ ) {
			$division->{ form } = $k;
			foreach( my $j = 0; $j < $n; $j++ ) { $division->record_score( $j, $score ); }
		}
		$division->{ form } = $form;
		$division->write();
		$version->commit( $division, $message );

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		my $complete = $method->matches->current->complete(); # Get the latest copy of the match
		print STDERR "Checking to see if we should engage autopilot: " . ($complete ? "Yes.\n" : "Not yet.\n") if $DEBUG;
		my $autopilot = $self->autopilot( $request, $progress, $group ) if $complete;
		die $autopilot->{ error } if exists $autopilot->{ error };

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $i        = $division->{ current };
	my $athlete  = $division->{ athletes }[ $i ];
	my $message  = "Deleting $athlete->{ name } from division\n";

	print STDERR $message if $DEBUG;

	try {
		$version->checkout( $division );
		$division->remove_athlete( $request->{ athlete_id } );
		$division->write();
		$version->commit( $division, $message );

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Next athlete.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		$division->next_athlete();
		$division->write();

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Previous athlete.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		$division->previous_athlete();
		$division->write();

		$self->broadcast_updated_division( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_clear_judge_score {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $i        = exists( $request->{ index }) ? $request->{ index } : $division->{ current };
	my $jname    = $request->{ judge } == 0 ? 'Referee' : 'Judge ' . $request->{ judge };
	my $message  = '';

	if( ref $i ) {
		my $athletes = join( ' and ', map { $division->{ athletes }[ $_ ]{ name } } @$i );
		$message = "Clearing $jname score for $athletes\n";

	} else {
		my $athlete = $division->{ athletes }[ $i ];
		$message = "Clearing $jname score for $athlete->{ name }\n";
	}

	print STDERR $message if $DEBUG;

	try {
		$version->checkout( $division );
		$division->clear_score( $request->{ judge }, $i );
		$division->write();
		$version->commit( $division, $message );

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Change display.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		$division->method->change_display();
		$division->write();

		$self->broadcast_updated_division( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_draw {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $draw     = $request->{ draw };
	my $round    = uc $division->{ round };
	my $match    = $division->method->matches->current();
	my $mnum     = $match->{ number };
	my $i        = $division->{ form };
	my $form     = $draw->{ form };
	my $complete = $draw->{ complete };
	my $ordinal  = $i == 0 ? '1st' : '2nd';

	if( $complete ) {
		print STDERR "Recording poomsae draw: $form for $round Match $mnum ($ordinal form)\n" if $DEBUG;
	} else {
		print STDERR "Teasing poomsae draw: $form\n" if $DEBUG;
	}

	try {
		$division->autopilot( 'off' );
		if( $complete ) {
			$division->{ state } = 'draw';
			$division->record_draw( $form );
			$division->write();

		} else {
			$division->{ state } = 'draw';
			$division->write();
		}

		$self->broadcast_updated_division( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_draw_select_age {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $age      = $request->{ age };
	my $divid    = uc $division->{ name };
	my $round    = $division->{ round };

	print STDERR "Recording poomsae draw age selection: $age for $divid\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		my $forms = $division->{ forms }{ $round };
		my $n     = int( @$forms );
		$forms->[ $_ ] = "draw-$age" foreach ( 0 .. $n );
		$division->write();

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };

	print STDERR "Editing division athletes.\n" if $DEBUG;

	try {
		my $division = $progress->find( $request->{ divid } ) or die "Can't find division " . uc( $request->{ divid }) . " $!";
		$division->edit_athletes( $request->{ athletes }, $request->{ round } );
		$division->write();

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Next form.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		$division->next_form();
		$division->write();
		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Previous form.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		$division->previous_form();
		$division->write();
		$self->broadcast_updated_division( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_history {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();

	print STDERR "Request history log\n" if $DEBUG;

	try {
		my @history = $version->history( $division );
		$division->{ history } = [ @history ];
		$self->broadcast_updated_division( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_judge_query {
# ============================================================
	my $self       = shift;
	my $request    = shift;
	my $progress   = shift;
	my $group      = shift;
	my $division   = $progress->current();
	my $n          = $division->{ judges };
	my $judges     = [];

	foreach my $i ( 0 .. $n - 1 ) {
		my $name = $i == 0 ? 'Referee' : "Judge $i";
		$judges[ $i ] = { cid => undef, jid => $i, name => $name };
	}

	foreach my $judge ($group->judges()) {
		my $jid  = $judge->jid();
		next if $jid >= $n;
		my $name = $jid == 0 ? 'Referee' : "Judge $jid";
		$judges[ $jid ] = { cid => $judge->cid(), jid => $judge->jid(), name => $name };
	}

	$client->send( { json => { type => 'division', action => 'judges', judges => $judges }} );
}

# ============================================================
sub handle_division_navigate {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	my $target = $request->{ target };
	my $object = $target->{ destination };
	my $i      = undef;
	if   ( exists $target->{ divid }) { $i = $target->{ divid }; }
	elsif( exists $target->{ round }) { $i = $target->{ round }; } 
	else                              { $i = int( $target->{ index }); }

	print STDERR "Navigating to $object $i.\n" if $DEBUG;

	try {
		if( $object =~ /^division$/i ) { 
			$progress->navigate( $i ); 
			$progress->write();
			$division = $progress->current();
			$division->autopilot( 'off' );
			$division->write();
			$self->broadcast_updated_ring( $request, $progress, $group );
		}
		elsif( $object =~ /^(?:athlete|form)$/i ) { 
			$division->navigate( $object, $i ); 
			$division->autopilot( 'off' );
			$division->{ state } = 'matches' if( $object eq 'athlete' && $division->method->code() eq 'sbs' );
			$division->write();
			$self->broadcast_updated_division( $request, $progress, $group );
		}
		elsif( $object =~ /^round$/i ) { 
			if   ( $i eq 'next' ) { $division->next_round(); } 
			elsif( $i eq 'prev' ) { $division->previous_round(); } 
			else                  { $division->navigate( $object, $i ); }
			$division->autopilot( 'off' );
			$division->write();
			$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;

	print STDERR "Request division data.\n" if $DEBUG;

	$self->broadcast_updated_division( $request, $progress, $group );
}

# ============================================================
sub handle_division_restore {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();

	print STDERR "Restoring division to version $request->{ version }\n" if $DEBUG;

	try {
		$version->restore( $division, $request->{ version } );
		$division->read();
		$progress->update_division( $division );

		$self->broadcast_updated_division( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_division_round_next {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Next round.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		$division->next_round();
		$division->write();
		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();

	print STDERR "Previous round.\n" if $DEBUG;

	try {
		$division->autopilot( 'off' );
		$division->previous_round();
		$division->write();
		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };
	my $division = $progress->current();
	my $version  = new FreeScore::RCS();
	my $i        = $division->{ current };
	my $athlete  = $division->{ athletes }[ $i ];
	my $jname    = $request->{ judge } == 0 ? 'Referee' : 'Judge ' . $request->{ judge };
	my $message  = '';

	if( exists $request->{ score }{ chung } || exists $request->{ score }{ hong }) {
		my @athletes = grep { defined $_ } map { $request->{ score }{ $_ }{ index } } grep { exists $request->{ score }{ $_ }} qw( chung hong );
		my $names = join( ' and ', map { $division->{ athletes }[ $_ ]{ name } } @athletes );
		$message = "  $jname score for $names\n";

	} else {
		$message = "  $jname score for $athlete->{ name }\n";
	}

	print STDERR $message if $DEBUG;

	try {
		my $score = clone( $request->{ score } );
		$version->checkout( $division );
		$division->record_score( $request->{ judge }, $score );
		$division->write();
		$version->commit( $division, $message );

		my $round    = $division->{ round };
		my $athlete  = $division->{ athletes }[ $division->{ current } ];
		my $form     = $athlete->{ scores }{ $round }{ forms }[ $division->{ form } ];
		my $complete = $athlete->{ scores }{ $round }->form_complete( $division->{ form } );

		# ====== INITIATE AUTOPILOT FROM THE SERVER-SIDE
		print STDERR "Checking to see if we should engage autopilot: " . ($complete ? "Yes.\n" : "Not yet.\n") if $DEBUG;
		my $autopilot = $self->autopilot( $request, $progress, $group ) if $complete;
		die $autopilot->{ error } if exists $autopilot->{ error };

		$self->broadcast_updated_division( $request, $progress, $group );
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
	my $group      = shift;
	my $client     = $self->{ _client };
	my $tournament = $self->{ _tournament };
	my $ring       = $self->{ _ring };

	print STDERR "Writing division data.\n" if $DEBUG;

	# ===== DIVISION HEADER WHITE LIST
	my $valid = { map { ( $_ => 1 ) } qw( athletes description flight forms judges name ring round ) };

	try {
		my $division = FreeScore::Forms::WorldClass::Division->from_json( $request->{ division } );
		foreach my $key (keys %$division) { delete $division->{ $key } unless exists $valid->{ $key }; }
		if( $ring eq 'staging' ) { $division->{ file } = sprintf( "%s/%s/%s/%s/div.%s.txt",       $FreeScore::PATH, $tournament, $FreeScore::Forms::WorldClass::SUBDIR, $ring, $division->{ name } ); } 
		else                     { $division->{ file } = sprintf( "%s/%s/%s/ring%02d/div.%s.txt", $FreeScore::PATH, $tournament, $FreeScore::Forms::WorldClass::SUBDIR, $ring, $division->{ name } ); }

		my $message   = clone( $division );
		my $unblessed = unbless( $message ); 

		if( -e $division->{ file } && ! exists $request->{ overwrite } ) {
			$client->send( { json => {  type => 'division', action => 'write error', error => "File '$division->{ file }' exists.", division => $unblessed }});

		} else {
			$division->normalize();
			$progress->update_division( $division );
			$division->write();

			# ===== NOTIFY THE CLIENT OF SUCCESSFUL WRITE
			$client->send( { json => {  type => 'division', action => 'write ok', division => $unblessed }});

			# ===== BROADCAST THE UPDATE
			$self->broadcast_updated_ring( $request, $progress, $group );
		}
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
	my $group    = shift;
	my $client   = $self->{ _client };

	print STDERR "Deleting division $request->{ divid }.\n" if $DEBUG;

	try {
		$progress->delete_division( $request->{ divid });
		$progress->write();
		$self->broadcast_updated_ring( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_division_merge {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };

	print STDERR "Merging flights for division $request->{ name }.\n" if $DEBUG;

	try {
		$progress->merge_division( $request->{ name });
		$progress->write();
		$self->broadcast_updated_ring( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };

	print STDERR "Next division.\n" if $DEBUG;

	try {
		$progress->next();
		$progress->write();
		$self->broadcast_updated_ring( $request, $progress, $group );
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
	my $group    = shift;
	my $client   = $self->{ _client };

	print STDERR "Previous division.\n" if $DEBUG;

	try {
		$progress->previous();
		$progress->write();
		$self->broadcast_updated_ring( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_ring_division_split {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $divid    = $request->{ name };
	my $flights  = $request->{ flights };

	print STDERR "Splitting division $divid into $flights flights.\n" if $DEBUG;

	try {
		$progress->split_division( $divid, $flights );
		$progress->write();
		$self->broadcast_updated_ring( $request, $progress, $group );
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
	my $group    = shift;
	my $ring     = $request->{ ring } eq 'staging' ? 'Staging' : sprintf( "Ring %02d", $request->{ ring } );

	print STDERR "Request $ring data.\n" if $DEBUG;

	$self->broadcast_updated_ring( $request, $progress, $group );
}

# ============================================================
sub handle_ring_transfer {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $divid    = $request->{ name };
	my $transfer = $request->{ transfer };

	my $destination = $transfer eq 'staging' ? $transfer : sprintf( "Ring %d", $transfer );
	print STDERR "Transfer division $divid to $destination.\n" if $DEBUG;

	try {
		$progress->transfer( $divid, $transfer );

		$self->broadcast_updated_ring( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_tournament_draws_delete {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };

	print STDERR "Deleting draws in database.\n" if $DEBUG;

	try {
		$progress->delete_draws();

		$self->broadcast_updated_ring( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_tournament_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $json     = $self->{ _json };
	my $client   = $self->{ _client };

	print STDERR "Reading all ring information\n" if $DEBUG;
	
	my $copy       = clone( $request );
	my $tournament = $request->{ tournament };
	my $all        = new FreeScore::Forms::WorldClass( $tournament );

	$divisions = unbless( $all->{ divisions } );
	try {
		$client->send({ json => { type => $request->{ type }, action => $request->{ action }, request => $copy, divisions => $divisions }});
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub handle_tournament_draws_write {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $client   = $self->{ _client };
	my $draws    = $request->{ draws };

	print STDERR "Writing draws to database.\n" if $DEBUG;

	try {
		$progress->write_draws( $draws );

		$self->broadcast_updated_ring( $request, $progress, $group );
	} catch {
		$client->send( { json => { error => "$_" }});
	}
}

# ============================================================
sub autopilot {
# ============================================================
#** @method( request, progress, group )
#   @brief Automatically advances to the next form/athlete/round/division
#   Called when judges finish scoring an athlete's form 
#*

	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $group    = shift;
	my $division = $progress->current();
	my $cycle    = $division->{ autodisplay } || 2;

	request->{ type } = 'autopilot';

	# ===== ENGAGE AUTOPILOT
	try {
		print STDERR "Engaging autopilot.\n" if $DEBUG;
		$division->autopilot( 'on' );
		$division->write();
	} catch {
		return { error => $_ };
	};

	my @steps = $division->method->autopilot_steps( $self, $request, $progress, $group );
	my $delay = new Mojo::IOLoop::Delay();
	$delay->steps( @steps );
	$delay->wait();
}

1;
