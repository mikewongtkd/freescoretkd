package FreeScore::Forms::Division;
use FreeScore;

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
	my $self     = shift;
	my $path     = shift;
	my $division = shift;
	my $ring     = shift || 'unassigned';

	$self->{ current } = 0;
	$self->{ state }   = 'display';

	$self->{ path } = $path;
	$self->{ ring } = $ring;
	$self->{ name } = $division;
	$self->{ file } = "$self->{ path }/div.$division.txt";
	$self->read();
}

sub display    { my $self = shift; $self->{ state } = 'display'; }
sub score      { my $self = shift; $self->{ state } = 'score';  }
sub next       { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } + 1) % int(@{ $self->{ athletes }}); }
sub previous   { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } - 1) >= 0 ? ($self->{ current } -1) : $#{ $self->{ athletes }}; }

sub is_display { my $self = shift; return $self->{ state } eq 'display'; }
sub is_score   { my $self = shift; return $self->{ state } eq 'score';  }
sub TO_JSON    { my $self = shift; return { %$self }; }

1;
