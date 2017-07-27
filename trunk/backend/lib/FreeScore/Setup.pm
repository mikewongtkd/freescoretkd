package FreeScore::Setup;
use JSON::XS();
use FreeScore::Tournament;
use FreeScore::Setup::Wifi;
use Data::Dumper;

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

	$self->{ tournament } = new FreeScore::Tournament();
	$self->{ events }     = { forms => [ qw( worldclass freestyle grassroots )]};
	$self->{ wifi }       = new FreeScore::Setup::Wifi();
}

# ============================================================
sub tournament {
# ============================================================
	my $self = shift;
	return $self->{ tournament };
}

# ============================================================
sub update_rings {
# ============================================================
	my $self   = shift;
	my $wanted = shift;

	$wanted    = { map {( $_ => 1 )} @$wanted };

	my $root = "/usr/local/freescore/data/$self->{ tournament }{ tournament }{ db }";
	foreach my $competition (keys %{ $self->{ events }}) {
		foreach my $event (@{$self->{ events }{ $competition }}) {
			my $subpath = join( "-", $competition, $event );
			my $path = "$root/$subpath";
			my $have = [ map { my ($r) = reverse split /\//, $_; $r =~ s/ring//; int( $r ); } split /\n/, `ls -d $path/ring*` ];
			$have = { map {( $_ => 1 )} @$have };
			my $rings = {( %$wanted, %$have )};
			$rings = [ sort { $a <=> $b } keys %$rings ];

			foreach my $ring (@$rings) {
				my $ring_name = sprintf( "ring%02d", $ring );
				my $ring_path = "$path/$ring_name";
				if( exists $wanted->{ $ring } && exists $have->{ $ring } ) { 

				} elsif( exists $wanted->{ $ring } ) { 
					mkdir $ring_path; 
					`touch $ring_path/progress.txt`; 

				} elsif( exists $have->{ $ring }   ) { 
					`rm -f $ring_path/progress.txt $ring_path/div.*.txt $ring_path/.*.swp $ring_path/.DS_Store`; 
					`rmdir $ring_path`; 
				}
			}
			mkdir "$path/staging" unless -e "$path/$staging";
		}
	}
}

# ============================================================
sub update_wifi {
# ============================================================
	my $self  = shift;
	my $edits = shift;

	$self->{ wpa_passphrase } = $edits->{ pass }    if $edits->{ pass };
	$self->{ ssid }           = $edits->{ ssid }    if $edits->{ ssid };
	$self->{ channel }        = $edits->{ channel } if $edits->{ channel };
	$self->{ wifi }->write_config();
	$self->{ wifi }->restart();
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;
	$self->{ tournament }->write();
}

1;
