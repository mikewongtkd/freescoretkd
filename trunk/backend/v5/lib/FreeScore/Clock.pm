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
sub now {
# ============================================================
#**
# @method ()
# @brief Returns the current time in UTC format
#*
	my $self = shift;
	my $t    = localtime;
	return $t->strftime( $self->{ utc_format });
}

# ============================================================
sub parse {
# ============================================================
#**
# @method ( time_utc )
# @param {string} [ time_utc ] - time in UTC format
# @brief Returns a Time::Piece object for now; if an UTC string is given, returns the corresponding Time::Piece object
# @details Time::Piece objects may be sorted, subtracted to get a difference in seconds, etc.
#*
	my $self  = shift;
	my $input = shift;
	my $t     = undef;

	if( $input ) { $t = Time::Piece->strptime( $input, $self->{ utc_format }); }
	else         { $t = Time::Piece->strptime( $self->now(), $self->{ utc_format }); }
	return $t;
}

1;
