package FreeScore::Clock;
use base qw( FreeScore::Component );
use Time::Piece;
use Time::Seconds;

# ============================================================
sub init {
# ============================================================
	my $self = shift;
	$self->SUPER::init( @_ );
	$self->{ utc_format } = '%Y-%m-%dT%H:%M:%sZ'; # YYYY-MM-DDTHH:MM:SSZ
}

# ============================================================
sub time {
# ============================================================
#**
# @method ( [ utc_string ] )
# @brief Returns the current time in UTC format; if an UTC string is given, returns the corresponding Time::Piece object
#*
	my $self  = shift;
	my $input = shift;

	if( $input ) {
		my $t = Time::Piece->strptime( $input, $self->{ utc_format });
		return $t;
	}

	my $t = localtime;
	return $t->strftime( $self->{ utc_format });
}

1;
