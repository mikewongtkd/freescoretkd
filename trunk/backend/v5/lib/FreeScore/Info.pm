package FreeScore::Current;
use base qw( FreeScore::Component );

sub athlete { my $self = shift; my $value = shift; if( defined $value ) { return $self->set( 'athlete', $value ); } else { return $self->get( 'athlete' ); }}
sub divid   { my $self = shift; my $value = shift; if( defined $value ) { return $self->set( 'divid',   $value ); } else { return $self->get( 'divid' ); }}
sub form    { my $self = shift; my $value = shift; if( defined $value ) { return $self->set( 'form',    $value ); } else { return $self->get( 'form' ); }}
sub fight   { my $self = shift; my $value = shift; if( defined $value ) { return $self->set( 'fight',   $value ); } else { return $self->get( 'fight' ); }}
sub round   { my $self = shift; my $value = shift; if( defined $value ) { return $self->set( 'round',   $value ); } else { return $self->get( 'round' ); }}

# ============================================================
sub get {
# ============================================================
	my $self    = shift;
	my $key     = shift;
	my $info    = $self->parent();
	my $current = $info->get( 'current' );
	return $current->{ $key } if( $current && exists $current->{ $key });
	return undef;
}

# ============================================================
sub set {
# ============================================================
	my $self    = shift;
	my $key     = shift;
	my $value   = shift;
	my $info    = $self->parent();
	my $current = $info->get( 'current' );
	if( $current && exists $current->{ $key }) { $current->{ $key } = $value; return $value; }
	return undef;
}

1;
package FreeScore::Info;
use base qw( FreeScore::Component FreeScore::Clonable );
use JSON::XS;

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ _json }    = new JSON::XS();
	$self->{ _current } = new JSON::XS();
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
