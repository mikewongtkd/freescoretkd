package FreeScore::Metadata::Info;
use FreeScore::Metadata::Current;
use base qw( FreeScore::Component FreeScore::Clonable );
use JSON::XS;

#**
# Manage metadata
#
# The Metadata::Info interface gives programmatic access to an
# associative array, allowing developers to store and retrieve
# data to be associated with the holonymic (containing) class.
# This allows semi-structured data.
#
# For example, Division has-a Info; Info manages metadata
# associated with each Division 
#
#*

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ _json }    = new JSON::XS();
	$self->{ _current } = new FreeScore::Current( $self );
}

# ============================================================
sub clear {
# ============================================================
	my $self = shift;
	my @info = @_;

	while( @info ) {
		my $name = shift @info;
		delete $self->{ $name } if exists $self->{ $name };
	}
}

# ============================================================
sub get {
# ============================================================
#**
# @method ( key, ... )
# @param {string} key - Metadata key (i.e. a free-form string)
# @brief Returns a single value if a single key is provided. Returns all form info if no parameters given. Returns an array of values if more than one key is provided
#*
	my $self  = shift;
	my @info  = @_;
	my $clone = $self->clone();

	if( @info == 0 ) {
		return $clone;

	} elsif( @info == 1 ) {
		my $name  = shift @info;
		return undef unless exists $clone->{ $name };
		return $self->_decode( $clone->{ $name } );

	} else {
		my @requested = ();
		while( @info ) {
			my $name = shift @info;
			if( exists $clone->{ $name }) { push @requested, $self->_decode( $clone->{ $name }); } 
			else                          { push @requested, undef;                              }
		}
		return @requested;
	}
}

# ============================================================
sub set {
# ============================================================
#**
# @method ( key => value, ... )
# @param {...key-value-pair} key => value - One or more key-value pairs
# @param {string} key - Request value for a given key
# @param no parameters - Request the info hash (all info values)
# @brief Sets form info if information key-value pairs are provided. 
#*
	my $self = shift;
	my %info = @_;

	my %info = @info;
	foreach $name (keys %info) {
		my $value = $info{ $name };
		$self->{ $name } = $self->_encode( $value );
	}
	return $self->clone();
}

# ============================================================
sub _decode {
# ============================================================
	my $self  = shift;
	my $value = shift;
	my $json  = $self->{ _json };
	if( $value =~ /^[\[{]/ ) { return $json->decode( $value ); }
	else                     { return $value; }
}

# ============================================================
sub _encode {
# ============================================================
	my $self  = shift;
	my $value = shift;
	my $json  = $self->{ _json };
	if( ref $value ) { return $json->canonical->encode( $value ); }
	else             { return $value; }
}

# ============================================================
# COMPONENTS
# ============================================================
sub current { my $self = shift; return $self->{ _current }; }

1;
