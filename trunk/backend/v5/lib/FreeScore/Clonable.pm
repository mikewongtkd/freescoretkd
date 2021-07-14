package FreeScore::Clonable;
use Clone qw( clone );
use Data::Structure::Util qw( unbless );
use JSON::XS;

# ============================================================
sub clone {
# ============================================================
#**
# @method ()
# @brief Clones the data without interfaces, caches, and class information
#*
	my $self   = shift;
	my $clone  = clone( $self );
	
	unbless( $clone );
	_remove_interfaces_and_caches( $clone );

	return $clone;
}

# ============================================================
sub json {
# ============================================================
#**
# @method ()
# @brief Returns a JSON string of the cloned data (sans interfaces, caches, etc.)
#*
	my $self  = shift;
	my $clone = $self->clone();
	my $json  = new JSON::XS();

	return $json->canonical->encode( $clone );
}

# ============================================================
sub _remove_interfaces_and_caches {
# ============================================================
#**
# @method ()
# @brief Removes interfaces and caches
#*
	my $root  = shift;
	my $stack = [ $root ];
	while( @$stack ) {
		my $node = shift @$stack;
		my $ref  = ref $node;
		if( $ref eq 'HASH' ) {
			foreach my $key (keys %$node) {
				if( $key =~ /^_/ ) { delete $node->{ $key }; } 
				else               { push @$stack, $node->{ $key }; }
			}

		} elsif( $ref eq 'ARRAY' ) {
			@$stack = (@$stack, @$node);
		}
	}
}

1;
