package FreeScore::Forms::WorldClass::DispatchTable;
use lib qw( /usr/local/freescore/lib );
use Try::Tiny;
use FreeScore;
use FreeScore::Forms::WorldClass;
use JSON::XS;
use Digest::SHA1 qw( sha1_hex );
use List::MoreUtils (qw( firstidx ));
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
	my $self            = shift;
	$self->{ _client }  = shift;
	$self->{ _json }    = new JSON::XS();
	$self->{ division } = {
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
 	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $client   = $self->{ _client };
	my $json     = $self->{ _json };
	my $division = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();

	foreach my $client (@$clients) {
		my ($unblessed, $encoded, $digest);
		if( exists $client->{ judge } ) {
			$unblessed = unbless $division->get_only( $judge );
			$encoded   = $json->canonical->encode( $unblessed );
			$digest    = sha1_hex( $encoded );
		} else {
			$unblessed = unbless $division;
			$encoded   = $json->canonical->encode( $unblessed );
			$digest    = sha1_hex( $encoded );
		}
		try   { $client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});}
		catch { $client->send( { json => { error => "$_" }}); }
	}
}

# ============================================================
sub dispatch {
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
	my $division = $progress->current();
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
sub send_response {
# ============================================================
 	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $client   = $self->{ _client };
	my $json     = $self->{ _json };
	my $division = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();

	if( exists $request->{ judge } && defined $request->{ judge } ) {
		my $unblessed = unbless $division->get_only( $request->{ judge } );
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );

		$client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});

	} else {
		my $unblessed = unbless $division;
		my $encoded   = $json->canonical->encode( $unblessed );
		my $digest    = sha1_hex( $encoded );

		$client->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});
	}
}

1;
