package FreeScore::Method::Cutoff;
use base qw( FreeScore::Method );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ name }     = 'cutoff';
	$self->{ displays } = { all => [ qw( score leaderboard )]};
	$self->{ rounds }   = [ qw( prelim semfin finals )];
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
sub first_round {
# ============================================================
#**
# @method ()
# @brief Returns the first relevant round, based on the number of athletes
# @details This can be overridden with the option key, e.g. option={"athletes":{"max":{"finals":12}}}
#*
	my $self     = shift;
	my $division = $self->parent();
	my $n        = int( @{ $division->{ athletes }});

	die "Division configuration error: no athletes registered $!" unless $n > 0;

	my $max      = { semfin => 20, finals => 8 };
	$max->{ semfin } = $division->{ option }{ athletes }{ max }{ semfin } if( exists $division->{ option } && exists $division->{ option }{ athlete }{ max }{ semfin });
	$max->{ prelim } = $division->{ option }{ athletes }{ max }{ prelim } if( exists $division->{ option } && exists $division->{ option }{ athlete }{ max }{ prelim });

	if    ( $n >= $max->{ semfin }) { return $division->round->select( 'prelim' ); }
	elsif ( $n >= $max->{ finals }) { return $division->round->select( 'semfin' ); }
	else                            { return $division->round->select( 'finals' ); }
}

# ============================================================
sub next_todo {
# ============================================================
#** 
# @method ()
# @brief Returns the next todo item or undef if there are no more todo items remaining
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
