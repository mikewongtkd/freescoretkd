package FreeScore::Sparring::Olympic;
use FreeScore;
use FreeScore::Sparring;
use FreeScore::Sparring::Olympic::Division;
use base qw( FreeScore::Sparring Clone );
use Data::Dumper;

our $SUBDIR = "sparring-olympic";

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;
	my @path       = ($FreeScore::PATH, $tournament, $SUBDIR, $ring || 'staging' );

	if( defined $ring ) {
		$self->{ path } = $ring eq 'staging' ? join( "/", @path ) : sprintf( "%s/%s/%s/ring%02d", @path );
		$self->{ name } = $ring;
		my $divisions = $self->load_ring( $ring );
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			my $file = sprintf( "%s/div.%s.txt", $self->{ path }, $id );
			next unless -e $file;
		}
	} else {
		$self->{ path } = sprintf( "%s/%s/%s", @path[ ( 0 .. 2 ) ]);
		my ($divisions, $rings) = $self->load_all();
		
	}
}

# ============================================================
sub create_division {
# ============================================================
	my $self     = shift;
	my $divid    = shift;
	my $division = new FreeScore::Sparring::Olympic::Division( $self->{ path }, $divid );

	return $division;
}

