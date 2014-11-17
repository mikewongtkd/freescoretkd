package FreeScore::Test;
use LWP::UserAgent;
use JSON::XS;
use parent qw( Exporter );

our @EXPORT = qw( roll highest lowest sum );

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
	my $self = shift;
	{
		my $json = new JSON::XS();
		my ($host, $tournament) = @{ $json->decode( `php config.php` )};
		$self->{ host }       = $host;
		$self->{ tournament } = $tournament;
		$self->{ json }       = $json;
	}
	$self->{ ua } = new LWP::UserAgent();
}

# ============================================================
sub worldclass {
# ============================================================
	my $self    = shift;
	my $command = shift;
	my $ring    = shift || 1;
	return $self->get( "forms/worldclass/rest", $command, $ring );
}

# ============================================================
sub get {
# ============================================================
	my $self    = shift;
	my $app     = shift;
	my $command = shift;
	my $ring    = shift;
	my $ua      = $self->{ ua };

	$ua->timeout( 5 );
	my $url = "http://$self->{ host }/cgi-bin/freescore/$app/$self->{ tournament }{ db }/$ring/$command";
	my $response = $ua->get( $url );
	if( $response->is_success ) {
		return $self->{ json }->decode( $response->decoded_content );
	} else {
		die "Failed to get a response for command '$url'; " . $response->status_line;
	}
}

# ============================================================
# DICE ROLLING FUNCTIONS
# ============================================================
# Enables score distributions (see www.anydice.com for
# example distributions).
# ------------------------------------------------------------

# ============================================================
sub roll( $ ) {
# ============================================================
	my $dice             = shift;
	my ($number, $sides) = split /d/, $dice;
	my @rolls            = ();
	for( 0 .. ($number - 1)) {
		push @rolls, int( rand() * $sides ) + 1;
	}
	return @rolls;
}

# ============================================================
sub highest( $@ ) {
# ============================================================
	my $num = shift;
	my @dice = sort { $b <=> $a } @_;
	return splice( @dice, 0, $num );
}

# ============================================================
sub lowest( $@ ) {
# ============================================================
	my $num = shift;
	my @dice = sort { $a <=> $b } @_;
	return splice( @dice, 0, $num );
}

# ============================================================
sub sum( @ ) {
# ============================================================
	my $sum = 0.0;
	$sum += $_ foreach @_;
	return $sum;
}

1;
