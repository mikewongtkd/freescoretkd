package FreeScore::Registration::USAT;

use JSON::XS;
use Data::Dumper;
use Data::Structure::Util qw( unbless );
use List::Util qw( reduce );
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
sub description {
# ============================================================
	my $s    = shift;
	my $d    = shift;
	my $json = new JSON::XS();

	$d = $json->decode( $d );

	my $event = '';
	if   ( $s =~ /sparring/i ) { $event = $s;           }
	elsif( $s =~ /pair/i     ) { $event = 'Pair';       }
	elsif( $s =~ /team/i     ) { $event = 'Team';       }
	else                       { $event = 'Individual'; }

	my $gender = lc substr( $d->{ gender }, 0, 1 );
	if   ( $gender eq 'm' ) { $gender = 'Male '; }
	elsif( $gender eq 'f' ) { $gender = 'Female '; }
	else                    { $gender = ''; }

	if( $event =~ /sparring/i ) {
		my $age    = $d->{ age };
		my $weight = $d->{ weight };
	} else {
		my $age   = $d->{ age }; $age =~ s/\-99/+/;
		my $group = undef;
		if   ( $age eq '10-11' ) { $group = 'Youths'; }
		elsif( $age eq '12-14' ) { $group = 'Cadets'; }
		elsif( $age eq '15-17' ) { $group = 'Juniors'; }
		elsif( $age eq '18-30' ) { $group = 'Seniors'; }
		elsif( $age eq '31-40' ) { $group = 'Under 40'; }
		elsif( $age eq '41-50' ) { $group = 'Under 50'; }
		elsif( $age eq '51-60' ) { $group = 'Under 60'; }
		elsif( $age eq '61-65' ) { $group = 'Under 65'; }
		elsif( $age eq '66+'   ) { $group = 'Over 65'; }
		elsif( $age eq '31+'   ) { $group = 'Over 30'; }

		return ("$gender$event $group", { age => $age, event => $event, gender => lc substr( $d->{ gender }, 0, 1 ) || 'c' });
	}
}

# ============================================================
sub divid {
# ============================================================
	my $s    = shift;
	my $d    = shift;
	my $json = new JSON::XS();

	$d = $json->decode( $d );

	if( $s =~ /poomsae/i ) {
		my $id = {
			gender => { c => 0, m => 1, f => 2 },
			event  => { individual => 3, pair => 43, team => 73 },
			belt   => { yellow => 'y', green => 'g', blue => 'b', red => 'r', black => 'k' },
			rank   => { y => 400, g => 300, b => 200, r => 100, k => 0 }
		};
		my $gender  = lc substr( $d->{ gender }, 0, 1 ) || 'c';
		my ($event) = $s =~ /(pair|team)/i; $event ||= 'individual';
		my $age     = int( $d->{ age });

		$id->{ division } = 0;
		if( $event =~ /individual/i ) {
			my $index = { 
				'4' => 0, '6' => 1, '8' => 2, '10' => 3, '12' => 4, '15' => 5, 
				'18' => 6, '31' => 7, '41' => 8, '51' => 9, '61' => 10, '66' => 11 
			};
			$id->{ division } = $index->{ "$age" } * 3;
		} elsif( $event =~ /pair|team/i ) {
			my $index = { 
				'4' => 0, '6' => 1, '10' => 2, '12' => 3, 
				'15' => 4, '18' => 5, '31' => 6 
			};
			$id->{ division } = $index->{ "$age" } * 3;
		}

		$divid = 0;
		$divid -= int( $id->{ gender }{ $gender });
		$divid += int( $id->{ event }{ $event });
		$divid += int( $id->{ division });

		return sprintf( "p%03d", $divid );

	} elsif( $s =~ /sparring/i ) {
		# MW Figure out how to number sparring divisions
		my $id = {
			gender => { c => 0, m => 1, f => 2 },
			event  => { individual => 3, pair => 43, team => 73 },
			belt   => { yellow => 'y', green => 'g', blue => 'b', red => 'r', black => 'k' },
			rank   => { y => 400, g => 300, b => 200, r => 100, k => 0 }
		};
		my $gender  = lc substr( $d->{ gender }, 0, 1 ) || 'c';
		my ($event) = $s =~ /(pair|team)/i; $event ||= 'individual';
		my $age     = int( $d->{ age });

		$id->{ division } = 0;
		if( $event =~ /individual/i ) {
			my $index = { 
				'4' => 0, '6' => 1, '8' => 2, '10' => 3, '12' => 4, '15' => 5, 
				'18' => 6, '31' => 7, '41' => 8, '51' => 9, '61' => 10, '66' => 11 
			};
			$id->{ division } = $index->{ "$age" } * 3;
		} elsif( $event =~ /pair|team/i ) {
			my $index = { 
				'4' => 0, '6' => 1, '10' => 2, '12' => 3, 
				'15' => 4, '18' => 5, '31' => 6 
			};
			$id->{ division } = $index->{ "$age" } * 3;
		}

		$divid = 0;
		$divid -= int( $id->{ gender }{ $gender });
		$divid += int( $id->{ event }{ $event });
		$divid += int( $id->{ division });

		return sprintf( "p%03d", $divid );
	}
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

	return $_ unless $_;

	my ($age, $gender, $belt, $weight, $comment) = /
		^(\d+(?:\-\d+)?(?:\ &\ under)?)\s+ # Age
		(male|female|coed)\s+              # Gender
		([\w\s\/]+?)\s*                    # Belt
		  (all|                            # All weights
		  over\ \d+\.\d\ kg|               # Heavy weight
		  \d+\.\d+\ -\ \d+\.\d+\ kg|       # Weight range
		  \d+\.\d\ kg\ &\ under)\s*        # Under weight
		(\([^)]+\))?                       # Comment
	/ix;

	# Clean up after regex match
	$weight =~ s/\s//g;
	if( $weight =~ /over/i       ) { $weight =~ s/over//i;       $weight .= '+'; }
	if( $weight =~ /\&\s*under/i ) { $weight =~ s/\&\s*under//i; $weight .= '-'; }
	$belt = 'black' if $belt =~ /black/i;
	$comment =~ s/[\(\)]//g;

	# Provide a cleaned-up version of the USAT divisions
	if( $age && $gender ) {
		my $json = new JSON::XS();
		my $d = { age => $age, gender => $gender, belt => $belt, weight => $weight, comment => $comment };
		return $json->canonical->encode( $d );
	}

	return $_;
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
	return { map { $_ => $self->{ $_ } } sort grep { /sparring/i } keys %$self };
}

# ============================================================
sub world_class_poomsae {
# ============================================================
	my $self     = shift;
	my $settings = shift;
	my $poomsae  = { map { $_ => $self->{ $_ } } grep { /world class/ } sort grep { !/(?:sparring|breaking|demonstration team|freestyle|para)/i } keys %$self };
	my $count    = reduce { $a + int( keys %{ $poomsae->{ $b }}) } keys %$poomsae;
	my $json     = new JSON::XS();

	if( $count > 0 ) { return $poomsae; }
	return $poomsae if $count;

	my $min_age = $settings->{ 'youth-sport-poosmae' } ? 10 : 12;

	$poomsae = { map { 
		my $orig = $_; 
		my $key  = "world class $_"; 
		$key => { map { 
			$_ => $self->{ $orig }{ $_ } 
			} grep { 
				my $d    = $json->decode( $_ );
				my $age  = int( $d->{ age }); 
				my $belt = $d->{ belt };
				$belt =~ /black/ && $age >= $min_age;
			} keys %{$self->{ $_ }} 
		}} sort grep { !/(?:sparring|breaking|demonstration team|freestyle|para)/i } keys %$self };
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
