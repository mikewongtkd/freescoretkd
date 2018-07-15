package FreeScore::Registration::USAT;

use JSON::XS;
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use base qw( Clone );

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
	my $self         = shift;
	$self->{ _uniq } = {};
	
	my $data   = { female => shift, male => shift };
	my $female = $self->parse( 'female', $data->{ female } );
	my $male   = $self->parse( 'male',   $data->{ male } );

	delete $self->{ _uniq };
}

# ============================================================
sub breaking {
# ============================================================
	my $self     = shift;
	my $breaking = { map { $_ => $self->{ $_ } } sort grep { /breaking/i } keys %$self };

	return $breaking;
}

# ============================================================
sub demonstration_team {
# ============================================================
	my $self      = shift;
	my $demo_team = { map { $_ => $self->{ $_ } } sort grep { /demonstration team/i } keys %$self };

	return $demo_team;
}

# ============================================================
sub events {
# ============================================================
	my $self = shift;
	return sort keys %$self;
}

# ============================================================
sub freestyle {
# ============================================================
	my $self      = shift;
	my $freestyle = { map { $_ => $self->{ $_ } } sort grep { /freestyle/i } keys %$self };

	return $freestyle;
}

# ============================================================
sub parse {
# ============================================================
	my $self   = shift;
	my $gender = shift;
	my $data   = shift;
	my @data   = split /\n/, $data;
	my $first_line = shift @data; chomp $first_line;
	my $header     = [ map { lc } split /,/, $first_line ];
	my $subevent   = undef;
	my $division   = undef;
	my $uniq       = $self->{ _uniq };
	my $json       = new JSON::XS();

	while( @data ) {
		local $_ = shift @data;
		chomp;
		my @fields = map { lc } split /,/, $_;
		my $entry = {};
		foreach my $key (@$header) { 
			$entry->{ $key } = shift @fields; 
			delete $entry->{ $key } unless $entry->{ $key };
		}
		$entry->{ division } = $self->parse_event( $entry->{ division });
		$entry->{ division } ||= $division; $division = $entry->{ division };
		$entry->{ subevent } ||= $subevent; $subevent = $entry->{ subevent };
		$entry->{ gender } = substr( $gender, 0, 1 ); delete $entry->{ gender } if( $division =~ /coed/i );
		delete $entry->{ 'total in division' };
		delete $entry->{ 'total in subevent' };
		delete $entry->{ status };
		delete $entry->{ country };
		delete $entry->{ subevent };
		delete $entry->{ division };
		my $key = $json->canonical->encode( $entry );
		push @{$self->{ $subevent }{ $division }}, $entry unless exists $uniq->{ $subevent }{ $division }{ $key };
		$uniq->{ $subevent }{ $division }{ $key } = 1;
	}
	close FILE;
}

# ============================================================
sub parse_event {
# ============================================================
	my $self = shift;
	local $_ = shift;

	my ($age, $gender, $belt, $weight, $comment) = /^(\d+(?:\-\d+)?(?: & under)?)\s+(male|female|coed)\s+([\w\s\/]+?)\s*(all|over \d+\.\d kg|\d+\.\d+ - \d+\.\d+ kg|\d+\.\d kg & under)/i;
	$weight =~ s/\s//g;
	if( $weight =~ /over/ ) { $weight =~ s/over//i; $weight .= '+'; }
	if( $weight =~ /\&\s*under/ ) { $weight =~ s/\&\s*under//i; $weight .= '-'; }
	$belt = 'black' if $belt =~ /black/i;
	if( $age ) {
		my $d = { age => $age, gender => $gender, belt => $belt, weight => $weight, comment => $comment };
		return "$d->{ age } $d->{ gender } $d->{ belt } $d->{ weight }";
	} else {
		print STDERR "$_\n" if $_;
		return $_;
	}
}

# ============================================================
sub poomsae {
# ============================================================
	my $self    = shift;
	my $poomsae = { map { $_ => $self->{ $_ } } sort grep { !/(?:sparring|breaking|demonstration team|freestyle|para)/i } keys %$self };

	return $poomsae;
}

# ============================================================
sub sparring {
# ============================================================
	my $self = shift;
	return map { $_ => $self->{ $_ } } sort grep { /sparring/i } keys %$self;
}

# ============================================================
sub world_class_poomsae {
# ============================================================
	my $self    = shift;
	my $poomsae = { map { $_ => $self->{ $_ } } sort grep { /world class/i } grep { !/(?:sparring|breaking|demonstration team|freestyle|para)/i } keys %$self };

	return $poomsae;
}

# ============================================================
sub write {
# ============================================================
	my $self         = shift;
	my $json         = new JSON::XS();
	my $registration = unbless( $self->clone() );
	
	open FILE, ">registration.json" or die $!;
	print FILE $json->canonical->pretty->encode( $registration );
	close FILE;
}

1;
