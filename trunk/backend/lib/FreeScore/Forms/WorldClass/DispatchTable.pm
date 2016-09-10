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
	$self->{ _socket }  = shift;
	$self->{ _json }    = new JSON::XS();
	$self->{ division } = {
		read         => \&handle_division_read,
		next_athlete => \&handle_division_next_athlete,
		prev_athlete => \&handle_division_prev_athlete,
		next_form    => \&handle_division_next_form,
		prev_form    => \&handle_division_prev_form,
		next_round   => \&handle_division_next_round,
		prev_round   => \&handle_division_prev_round,
	};
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
sub handle_division_read {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $socket   = $self->{ _socket };
	my $json     = $self->{ _json };
	my $division = defined $request->{ divid } ? $progress->find( $request->{ divid } ) : $progress->current();

	print STDER "TEST";

	if( exists $request->{ judge } && defined $request->{ judge } ) {
		$unblessed = unbless $division->get_only( $request->{ judge } );
		$encoded   = $json->canonical->encode( $unblessed );
		$digest    = sha1_hex( $encoded );
		$socket->tx()->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});
	} else {
		$unblessed = unbless $division;
		$encoded   = $json->canonical->encode( $unblessed );
		$digest    = sha1_hex( $encoded );
		$socket->tx()->send( { json => { type => $request->{ type }, action => 'update', digest => $digest, division => $unblessed }});
	}
}

# ============================================================
sub handle_division_next_athlete {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $socket   = $self->{ _socket };
	my $json     = $self->{ _json };
	my $division = $progress->current();
}

# ============================================================
sub handle_division_prev_athlete {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $socket   = $self->{ _socket };
	my $json     = $self->{ _json };
	my $division = $progress->current();
}

# ============================================================
sub handle_division_next_form {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $socket   = $self->{ _socket };
	my $json     = $self->{ _json };
	my $division = $progress->current();
}

# ============================================================
sub handle_division_prev_form {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $socket   = $self->{ _socket };
	my $json     = $self->{ _json };
	my $division = $progress->current();
}

# ============================================================
sub handle_division_next_round {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $socket   = $self->{ _socket };
	my $json     = $self->{ _json };
	my $division = $progress->current();
}

# ============================================================
sub handle_division_prev_round {
# ============================================================
	my $self     = shift;
	my $request  = shift;
	my $progress = shift;
	my $clients  = shift;
	my $socket   = $self->{ _socket };
	my $json     = $self->{ _json };
	my $division = $progress->current();
}

1;
