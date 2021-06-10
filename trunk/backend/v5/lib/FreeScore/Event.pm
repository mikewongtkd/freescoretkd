package FreeScore::Event;
use base qw( FreeScore::Component );
use List::Util qw( any );
use FreeScore::Event::Recognized;
use FreeScore::Event::Freestyle;
use FreeScore::Event::Open;
use FreeScore::Event::VirtualSparring;

# ============================================================
sub max_forms {
# ============================================================
	my $self = shift;
	my $rid  = shift;
	die "Stub method Event::max_forms() called $!";
}

# ============================================================
sub factory {
# ============================================================
#**
# @method ( division )
# @brief Factory method for instantiating correct event based on event header. Default is Recognized.
#
# Currently recognizes:
# | event            | Class                |
# | ---------------- |--------------------- |
# | recognized       | Recognized (default) |
# | freestyle        | Freestyle            |
# | open             | Open                 |
# | virtual-sparring | VirtualSparring      |
#*
	my $division = shift;
	my $event    = exists $division->{ event } ? $division->{ event } : 'recognized';
	my $class    = 'FreeScore::Event::' . join( '', map { ucfirst } split /\-/, $event );
	my @loaded   = map { s/\//::/g; s/\.pm$//; } grep { /^FreeScore\/Event/ } keys %INC;

	die "Division configuration error: Event type '$event' not defined or loaded $!" unless ( any { $class eq $_ } @loaded );
	my $self        = new $class( $division );
	$self->{ name } = $event;

	return $self;
}

# ============================================================
sub name {
# ============================================================
	my $self = shift;
	return $self->{ name };
}

# ============================================================
sub ranking {
# ============================================================
	my $self    = shift;
	my $ranking = shift;
	die "Stub method Event::ranking() called $!";
}

# ============================================================
sub score {
# ============================================================
	my $self  = shift;
	my $score = shift;
	die "Stub method Event::score() called $!";
}
