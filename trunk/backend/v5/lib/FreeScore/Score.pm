package FreeScore::Score;
use base qw( FreeScore::Component );

# ============================================================
# NAVIGATION
# ============================================================
sub form     { my $self = shift; return $self->parent(); }
sub fight    { my $self = shift; return $self->parent(); }
sub athlete  { my $self = shift; return $self->parent->parent(); }
sub round    { my $self = shift; return $self->parent->parent->parent(); }
