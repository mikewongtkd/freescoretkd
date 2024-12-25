package FreeScore::Forms::WorldClass::Method::SingleElimination::Matches;
use FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any );
use List::MoreUtils qw( first_index );

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
	my $self    = shift;
	my $method  = shift;
	my $matches = shift;

	@$matches = map { new FreeScore::Forms::WorldClass::Method::SingleElimination::Match( $_ ) } @$matches;

	$self->{ method }  = $method;
	$self->{ matches } = $matches;
}

# ============================================================
sub current {
# ============================================================
	my $self    = shift;
	my $round   = $self->{ division }{ round };
	my $athlete = $self->{ division }{ current };
	my $current = first { $_->has( $athlete ) } @{$self->{ matches }};

	return $current;
}

# ============================================================
sub first {
# ============================================================
	my $self = shift;

	foreach my $match (@{ $self->{ matches }}) {
		return $match if $match->valid();
	}
}

# ============================================================
sub is_last {
# ============================================================
	my $self = shift;
	my $current = $self->current();
	my $last    = $self->last();
	return int( @$current ) == int( @$last ) && join( ',', @$current ) eq join( ',', @$last );
}

# ============================================================
sub last {
# ============================================================
	my $self = shift;

	foreach my $match (reverse @{ $self->{ matches }}) {
		return $match if $match->valid();
	}
}

# ============================================================
sub list {
# ============================================================
	my $self = shift;

	return @{ $self->{ matches }};
}

# ============================================================
sub match {
# ============================================================
	my $self = shift;
	my $i    = shift;

	my $error = sprintf( "Invalid index %d for %s %s (%d matches)\n", $i, uc $self->{ method }{ division }{ name }, uc $self->{ method }{ round });
	die $error if( $i < 0 || $i > $#{$self->{ matches }});

	return $self->{ matches }[ $i ];
}

# ============================================================
sub match_with_athlete {
# ============================================================
	my $self = shift;
	my $i    = shift;
	foreach my $match (@{$self->{ matches }}) {
		return $match if $match->has( $i );
	}

	return undef;
}

# ============================================================
sub next {
# ============================================================
	my $self    = shift;
	my $current = first_index { $_->has( $athlete ) } @{$self->{ matches }};
	my $i       = $current;
	my $k       = $#{$self->{ matches }};
	my $checked = 0;

	while( $checked < $k ) {
		$i = $i < $k ? $i + 1 : 0;
		my $next = $self->{ matches }[ $i ];
		return $next if $next->valid();
		$checked++;
	}

	return undef;
}

# ============================================================
sub prev {
# ============================================================
	my $self    = shift;
	my $current = first_index { $_->has( $athlete ) } @{$self->{ matches }};
	my $i       = $current;
	my $k       = $#{$self->{ matches }};
	my $checked = 0;

	while( $checked < $k ) {
		$i = $i > 0 ? $i - 1 : $k;
		my $prev = $self->{ matches }[ $i ];
		return $prev if $prev->valid();
		$checked++;
	}

	return undef;
}

1;
