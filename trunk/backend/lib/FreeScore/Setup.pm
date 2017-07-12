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
	my $self  = shift;
	my $rings = shift;

	my $wanted = { map {( $_ => 1 )} @$rings };

	my $root = "/usr/local/freescore/data/$self->{ tournament }{ db }";
	foreach my $competition (keys %{ $self->{ events }}) {
		foreach my $event (@{$self->{ events }{ $competition }}) {
			my $subpath = join( "-", $competition, $event );
			my $path = "$path/$subpath";
			my $have = [ split /\n/, `ls -d $path/ring*` ];
			$have = { map {( $_ => 1 )} @$have };
			my $both = { $wanted, $have };

			foreach my $ring (keys %$both) {
				my $ring_name = sprintf( "ring%02d", $ring );
				if( exists $wanted->{ $ring } && exists $have->{ $ring } ) { } # do nothing
				elsif( exists $wanted->{ $ring } ) { mkdir "$path/$ring_name";  }
				elsif( exists $have->{ $ring }   ) { `rm -rf $path/$ring_name`; }
			}
			mkdir "$path/staging" unless -e "$path/$staging";
		}
	}
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;
	$self->{ tournament }->write();
}

1;
