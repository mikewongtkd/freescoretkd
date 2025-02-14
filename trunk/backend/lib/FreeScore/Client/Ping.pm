package FreeScore::Client::Ping;
use lib qw( /usr/local/freescore/lib );
use base qw( Clone );
use List::Util qw( sum );
use Data::Structure::Util qw( unbless );
use Date::Manip;
use JSON::XS;
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
	$self->{ speed } = { normal => 30, fast => 15, faster => 5, fastest => 1 };
}

# ============================================================
sub changed {
# ============================================================
	my $self = shift;
	return 0 unless exists $self->{ health };
	my $health = $self->health();

	return $self->{ health } eq $health;
}

# ============================================================
sub fast {
# ============================================================
	my $self = shift;
	$self->go( $self->{ speed }{ fast });
}

# ============================================================
sub faster {
# ============================================================
	my $self = shift;
	$self->go( $self->{ speed }{ faster });
}

# ============================================================
sub fastest {
# ============================================================
	my $self = shift;
	$self->go( $self->{ speed }{ fastest });
}

# ============================================================
sub go {
# ============================================================
	my $self     = shift;
	my $interval = shift;
	return if $self->{ interval } == $interval;

	$self->stop();
	$self->start( $interval );
}

# ============================================================
sub health {
# ============================================================
	my $self = shift;
	my $dropped = int( keys %{$self->{ pings }});

	return 'strong' if( $dropped <= 1  );
	return 'good'   if( $dropped <= 5  );
	return 'weak'   if( $dropped <= 10 );
	return 'bad'    if( $dropped <= 20 );
	return 'dead'   if( $dropped >  20 );
}

# ============================================================
sub normal {
# ============================================================
	my $self = shift;
	$self->go( $self->{ speed }{ normal });
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
	my $interval = shift || $self->{ speed }{ normal };
	my $client   = $self->{ client };
	my $ws       = $client->{ websocket };

	$self->{ interval } = $interval;

	$self->{ id } = Mojo::IOLoop->recurring( $interval => sub ( $ioloop ) {
		my $now = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
		$self->{ pings }{ $now } = 1;

		my $ping = { type => 'server', action => 'ping', ring => $client->ring(), server => { timestamp => $now }};
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
