package FreeScore::Method::Cutoff;
use base qw( FreeScore::Method );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ name }   = 'cutoff';
	$self->{ rounds } = [ qw( prelim semfin finals )];
}

# ============================================================
sub advance {
# ============================================================
	my $self       = shift;
	my $placements = shift;
	my $rid        = shift;
	my $division   = $self->parent();

	die "Division advancement error: Can't advance to the preliminary round $!" if $rid eq 'prelim';

	my $order = [];

	if( $rid eq 'semfin' ) {


	} elsif( $rid eq 'finals' ) {

	}
	return $order;
}

# ============================================================
sub next_todo {
# ============================================================
#** @method ()
#   @brief Returns the next todo item or undef if there are no more todo items remaining
#*
	my $self = shift;
	die "Stub method Method::next_todo() called $!";
}

# ============================================================
sub previous_todo {
# ============================================================
#** @method ()
#   @brief Returns the previous todo item or undef if there are no prior todo items
#*
	my $self = shift;
	die "Stub method Method::previous_todo() called $!";
}

1;
