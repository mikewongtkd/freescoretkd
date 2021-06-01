package FreeScore::Component;

#**
# Software component base class for object composition
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

1;
