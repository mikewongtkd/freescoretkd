package FreeScore::Client::Ping;
use lib qw( /usr/local/freescore/lib );
use List::Util qw( sum );
use Date::Manip;
use Mojolicious::Controller;
use Mojo::IOLoop;
use Statistics::Descriptive;
use Try::Tiny;

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
	my $self   = shift;
	my $client = shift;

	$self->{ pings }       = {};
	$self->{ client }      = $client;
	$client->{ timedelta } = 0;
	$self->{ timestats }   = new Statistics::Descriptive::Full();
}

# ============================================================
sub fast {
# ============================================================
	my $self = shift;
	$self->go( 15 );
}

# ============================================================
sub faster {
# ============================================================
	my $self = shift;
	$self->go( 5 );
}

# ============================================================
sub fastest {
# ============================================================
	my $self = shift;
	$self->go( 1 );
}

# ============================================================
sub go {
# ============================================================
	my $self     = shift;
	my $interval = shift;
	return if $self->{ interval } == $interval;

	$self->stop();
	$self->start( 30 );
}

# ============================================================
sub health {
# ============================================================
	my $self = shift;
	my $dropped = int( keys %{$self->{ pings }});

	return 'strong' if( $dropped <= 5 );
	return 'good'   if( $dropped <= 10 );
	return 'weak'   if( $dropped <= 20 );
	return 'bad'    if( $dropped <= 30 );
	return 'dead'   if( $dropped >  30 );
}

# ============================================================
sub normal {
# ============================================================
	my $self = shift;
	$self->go( 30 );
}

# ============================================================
sub pong {
# ============================================================
	my $self      = shift;
	my $server_ts = shift;
	my $client_ts = shift;
	my $client    = $self->{ client };

	delete $self->{ pings }{ $server_ts } if( exists $self->{ pings }{ $server_ts });

	try {
		my $date1     = new Date::Manip::Date( $server_ts );
		my $date2     = new Date::Manip::Date( $client_ts );
		my $delta     = $date1->calc( $date2 );

		print STDERR "Server: $server_ts, Client: $client_ts\n"; # MW

		$self->{ timestats }->add_data( _total_seconds( $delta ));
		$client->{ timedelta } = $self->{ timestats }->mean();
	} catch {

		print STDERR "One or more invalid dates ($server_ts, $client_ts) $_";
	};

	my $health = $self->health();

	if(    $health eq 'strong' ) { $self->normal();  }
	elsif( $health eq 'good'   ) { $self->fast();    }
	elsif( $health eq 'weak'   ) { $self->faster();  }
	elsif( $health eq 'bad '   ) { $self->fastest(); }
	elsif( $health eq 'dead'   ) { $self->stop();    }

	$self->{ health } = $health;
}

# ============================================================
sub quit {
# ============================================================
	my $self   = shift;
	my $client = $self->{ client };
	my $id     = $self->{ id };

	return unless $id;

	Mojo::IOLoop->remove( $id );
	delete $self->{ id };
	delete $client->{ ping };
}

# ============================================================
sub start {
# ============================================================
	my $self     = shift;
	my $interval = shift || 30;
	my $ws       = $self->{ client }{ websocket };

	$self->{ interval } = $interval;

	$self->{ id } = Mojo::IOLoop->recurring( $interval => sub ( $ioloop ) {
		my $now = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
		$self->{ pings }{ $now } = 1;
		my $ping = { type => 'server', action => 'ping', server => { timestamp => $now }};
		$ws->send({ json => $ping });
	});
}

# ============================================================
sub stop {
# ============================================================
	my $self   = shift;
	my $id     = $self->{ id };

	return unless $id;

	Mojo::IOLoop->remove( $id );
	delete $self->{ id };
}

# ============================================================
sub _total_seconds {
# ============================================================
	my $delta = shift;
	my $weight = { h => 3600, m => 60, s => 1 };
	return sum map { int( $delta->printf( "\%$_\v" )) * $weight->{ $_ } } qw( h m s );
}

1;
