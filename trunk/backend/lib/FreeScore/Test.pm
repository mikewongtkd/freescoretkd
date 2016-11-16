package FreeScore::Test;
use LWP::UserAgent;
use JSON::XS;
use parent qw( Exporter );

our @EXPORT_OK = qw( roll highest lowest sum score_grassroots score_worldclass );

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
		my $php  = `cat include/php/config.php include/php/vars.php | php`;
		my ($host, $tournament) = @{ $json->decode( $php )};
		$self->{ host }       = $host;
		$self->{ tournament } = $tournament;
		$self->{ json }       = $json;
	}
	$self->{ ua } = new LWP::UserAgent();
}

# ============================================================
sub grassroots {
# ============================================================
	my $self    = shift;
	my $command = shift;
	my $ring    = shift || 1;
	return $self->get( ":3080", $command, $ring );
}

# ============================================================
sub worldclass {
# ============================================================
	my $self    = shift;
	my $command = shift;
	my $ring    = shift || 1;
	return $self->get( ":3088", $command, $ring ); # AJAX calls deprecated in favor of websockets
}

# ============================================================
sub get {
# ============================================================
	my $self    = shift;
	my $port    = shift;
	my $command = shift;
	my $ring    = shift;
	my $ua      = $self->{ ua };

	$ua->timeout( 5 );
	my $url = "http://$self->{ host }$port/$self->{ tournament }{ db }/$ring/$command";

	my $response = $ua->get( $url );
	if( $response->is_success ) {
		return $self->{ json }->decode( $response->decoded_content );
	} else {
		die "Network Error: Failed to get a response for command '$url'; " . $response->status_line;
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

# ============================================================
sub score_grassroots {
# ============================================================
	my $performance = shift;
	my $score       = undef;

	if   ( not defined $performance ) { $score = (sum 69, roll "5d6")/10; }
	elsif( $performance eq 'tie'    ) { $score = (sum 87, lowest( 1, roll "20d6" ))/10; }
	elsif( $performance eq 'best'   ) { $score = (sum 75, roll "1d6", highest( 3, roll "10d6"))/10; }
	elsif( $performance eq 'better' ) { $score = (sum 69, roll "3d6", highest( 2, roll "4d6"))/10; }
	elsif( $performance eq 'good'   ) { $score = (sum 69, roll "3d6", lowest( 2, roll "4d6"))/10; }
	elsif( $performance eq 'ok'     ) { $score = (sum 72, lowest 3, roll "6d6")/10; }

	return $score;
}

# ============================================================
sub score_worldclass {
# ============================================================
	my $performance = shift;
	my $score       = undef;

	if     ( not defined $performance ) {
		$score = {
			major  => ((sum lowest 1, roll "2d8")  -1)/10,
			minor  => ((sum lowest 2, roll "3d20") -2)/10,
			rhythm => ((sum lowest 5, roll "6d4")/10),
			power  => ((sum lowest 5, roll "6d4")/10),
			ki     => ((sum lowest 5, roll "6d4")/10),
		};

	} elsif( $performance eq 'tie'    ) { # Mean = 6.40, SD = 0.11
		$score = {
			major  => ((sum lowest( 2, roll "12d4"),  -2)/10),
			minor  => ((sum lowest( 2, roll "12d4"), + 10)/10),
			rhythm => ((sum lowest( 2, roll "12d4"), + 10)/10),
			power  => ((sum lowest( 2, roll "12d4"), + 10)/10),
			ki     => ((sum lowest( 2, roll "12d4"), + 10)/10),
		};

	} elsif( $performance eq 'best'   ) { # Mean = 7.28, SD = 0.53
		$score = {
			major  => ((sum lowest( 2, roll "8d4"), - 2)/10),
			minor  => ((sum lowest( 5, roll "8d6"), - 5)/10),
			rhythm => ((sum highest( 1, roll "2d6"), lowest( 2, roll "4d4"), + 6)/10),
			power  => ((sum highest( 1, roll "2d6"), lowest( 2, roll "4d4"), + 6)/10),
			ki     => ((sum highest( 1, roll "2d6"), lowest( 2, roll "4d4"), + 6)/10),
		};

	} elsif( $performance eq 'better' ) { # Mean = 6.29, SD = 0.66
		$score = {
			major  => ((sum lowest( 3, roll "8d4" ), -3)/10),
			minor  => ((sum lowest( 6, roll "8d6" ), -6)/10),
			rhythm => ((sum lowest( 2, roll "4d6" ), +8)/10),
			power  => ((sum lowest( 2, roll "4d6" ), +8)/10),
			ki     => ((sum lowest( 2, roll "4d6" ), +8)/10),
		};

	} elsif( $performance eq 'good'   ) { # Mean = 4.62, SD = 0.79
		$score = {
			major  => ((sum lowest( 3, roll "8d6" ), -3)/10),
			minor  => ((sum lowest( 6, roll "10d8"), -6)/10),
			rhythm => ((sum lowest( 2, roll "6d4" ), +6)/10),
			power  => ((sum lowest( 2, roll "6d4" ), +6)/10),
			ki     => ((sum lowest( 2, roll "6d4" ), +6)/10),
		};

	} elsif( $performance eq 'ok'     ) { # Mean = 3.09, SD = 1.06
		$score = {
			major  => ((sum lowest( 3, roll "5d6"), - 3)/10),
			minor  => ((sum lowest( 6, roll "8d8"))/10),
			rhythm => ((sum lowest( 4, roll "8d6"))/10),
			power  => ((sum lowest( 4, roll "8d6"))/10),
			ki     => ((sum lowest( 4, roll "8d6"))/10),
		};

	}

	# ===== ASSURE PRESENTATION SCORE BOUNDS
	foreach (qw( rhythm power ki )) { 
		$score->{ $_ } < 0.5 ? $score->{ $_ } = 0.5 : $score->{ $_ }; 
		$score->{ $_ } > 2.0 ? $score->{ $_ } = 2.0 : $score->{ $_ }; 
	}

	$score->{ major } = $score->{ major } * 3;
	$score->{ minor } = $score->{ major } + $score->{ minor } > 40 ? (40 - $score->{ major }) : $score->{ minor };

	$score->{ accuracy }     = 4.0 - ($score->{ major } + $score->{ minor });
	$score->{ presentation } = $score->{ rhythm } + $score->{ power } + $score->{ ki };

	return $score;
}


1;
