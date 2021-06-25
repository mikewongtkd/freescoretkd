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
