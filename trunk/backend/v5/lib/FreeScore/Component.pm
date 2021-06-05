package FreeScore::Component;

#**
# Software component base class for object composition using the factory pattern
#*

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
	my $self   = shift;
	my $parent = shift;

	$self->{ _parent } = $parent;
}

# ============================================================
sub context {
# ============================================================
#**
# @method ( data )
# @param {*} [data] - Data for context, defaults to calling object
# @brief Factory method for instantiating objects with the given data
#*
	my $self  = shift;
	my $data  = shift;
	my $class = ref $self;

	return $self if( ! $data );
	return $data if( ref $data eq $class );

	$data->{ _parent }  = $self->{ _parent };
	return bless $data, $class;
}

# ============================================================
sub parent {
# ============================================================
#**
# @method ()
# @brief Composition method returning the parent object
#*
	my $self = shift; 
	return $self->{ _parent }; 
}
1;
