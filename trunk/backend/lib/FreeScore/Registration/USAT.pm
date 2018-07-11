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
	my $self   = shift;
	my $file   = { male => shift || 'male.csv', female => shift || 'female.csv' };
	my $female = $self->read( $file->{ female } );
	my $male   = $self->read( $file->{ male } );

	foreach my $subevent (keys %$female) {
		next if $subevent =~ /sparring/;
		foreach my $division (keys %{$female->{ $subevent }}) {
			$self->{ $subevent }{ $division } = $female->{ $subevent }{ $division };
		}
	}
	foreach my $subevent (keys %$male) {
		next if $subevent =~ /sparring/;
		foreach my $division (keys %{$male->{ $subevent }}) {
			$self->{ $subevent }{ $division } = $male->{ $subevent }{ $division };
		}
	}
}

# ============================================================
sub breaking {
# ============================================================
	my $self     = shift;
	my $json     = new JSON::XS();
	my $breaking = { map { $_ => $self->{ $_ } } sort grep { /breaking/i } keys %$self };

	return $json->canonical->encode( $breaking );
}

# ============================================================
sub demonstration_team {
# ============================================================
	my $self      = shift;
	my $json      = new JSON::XS();
	my $demo_team = { map { $_ => $self->{ $_ } } sort grep { /demonstration team/i } keys %$self };

	return $json->canonical->encode( $demo_team );
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
	my $json      = new JSON::XS();
	my $freestyle = { map { $_ => $self->{ $_ } } sort grep { /freestyle/i } keys %$self };

	return $json->canonical->encode( $freestyle );
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
	my $json    = new JSON::XS();
	my $poomsae = { map { $_ => $self->{ $_ } } sort grep { !/(?:sparring|breaking|demonstration team|freestyle|para)/i } keys %$self };

	return $json->canonical->pretty->encode( $poomsae );
}

# ============================================================
sub read {
# ============================================================
	my $self = shift;
	my $file = shift;
	open FILE, $file or die $!;
	my $first_line = <FILE>; chomp $first_line;
	my $header     = [ map { lc } split /,/, $first_line ];
	my $gender     = $file =~ /female/i ? 'female' : 'male';
	my $subevent   = undef;
	my $division   = undef;
	while( <FILE> ) {
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
		$entry->{ gender } = substr( $gender, 0, 1 );
		delete $entry->{ 'total in division' };
		delete $entry->{ 'total in subevent' };
		delete $entry->{ status };
		delete $entry->{ country };
		delete $entry->{ subevent };
		delete $entry->{ division };
		push @{$self->{ $subevent }{ $division }}, $entry;
	}
	close FILE;
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
	my $json    = new JSON::XS();
	my $poomsae = { map { $_ => $self->{ $_ } } sort grep { /world class/i } grep { !/(?:sparring|breaking|demonstration team|freestyle|para)/i } keys %$self };

	return $json->canonical->pretty->encode( $poomsae );
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
