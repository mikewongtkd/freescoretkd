package FreeScore::Forms::GrassRoots::Schedule;

use base qw( Clone );
use JSON::XS;
use File::Slurp qw( read_file );
use Data::Structure::Util qw( unbless );
use Date::Manip;
use List::Util qw( first sum all );
use List::MoreUtils qw( first_index );
use POSIX qw( ceil floor );
use Scalar::Util qw( blessed );
use Data::Dumper;

# ============================================================
sub new {
# ============================================================
	my ($class)  = map { ref || $_ } shift;
	my $file     = shift;
	my $debug    = shift;
	my $contents = read_file( $file );
	my $json     = new JSON::XS();
	my $self     = bless $json->decode( $contents ), $class;

	$self->{ file }  = $file;
	$self->{ debug } = $debug;
	$self->init();

	return $self;
}

# ============================================================
sub data {
# ============================================================
	my $self  = shift;
	my $clone = $self->clone();
	return unbless( $clone );
}

# ============================================================
sub init {
# ============================================================
	my $self = shift;
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	my $file  = shift;
	my $json  = new JSON::XS();

	my $clone = unbless( $self->clone());
	$self->{ file } = $file if defined $file;

	open FILE, ">$self->{ file }" or die $!;
	print FILE $json->canonical->pretty->encode( $clone );
	close FILE;
}

1;
