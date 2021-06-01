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
# @brief Factory method for instantiating objects
#*
	my $self  = shift;
	my $item  = shift;
	my $class = ref $self;

	if( ! $item ) {
		return $self if $self->{ _context };
		return $self->current();
	}

	return $item if( ref $item eq $class );
	$item->{ _parent }  = $self->{ _parent };
	$item->{ _context } = 1;
	return bless $item, $class;
}

1;
