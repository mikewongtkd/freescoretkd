package FreeScore::Forms::WorldClass::Method::SingleElimination::Matches;
use FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any );
use List::MoreUtils qw( first_index );
use base qw( Clone );
use Data::Structure::Util qw( unbless );
use Data::Dumper;

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

	$self->{ method }  = $method;
	$self->{ matches } = [ map { 
		my $match = $matches->[ $_ ]; 
		new FreeScore::Forms::WorldClass::Method::SingleElimination::Match( $match, $_ + 1, $self ) 
	} ( 0 .. $#$matches)];
}

# ============================================================
sub complete {
# ============================================================
	my $self = shift;
	return all { $_->complete() } $self->list();
}

# ============================================================
sub current {
# ============================================================
	my $self    = shift;
	my $round   = $self->{ method }{ division }{ round };
	my $athlete = $self->{ method }{ division }{ current };
	my $i       = first_index { $_->has( $athlete ) } @{$self->{ matches }};

	die "Matches: No match found with athlete ID $athlete in round $round\n" if( $i < 0 );

	return $self->{ matches }[ $i ];
}

# ============================================================
sub data {
# ============================================================
	my $self    = shift;
	my $clone   = unbless( $self->clone());
	my $matches = $clone->{ matches };
	delete $_->{ matches } foreach (@$matches); # Break self-referential circles

	return $matches;
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
	my $current = $self->current();
	my $i       = $current->{ number } - 1;
	my $k       = $#{$self->{ matches }};

	while( $i < $k ) {
		$i++;
		my $next = $self->{ matches }[ $i ];
		return $next if $next->valid();
	}

	return undef;
}

# ============================================================
sub prev {
# ============================================================
	my $self    = shift;
	my $current = $self->current();
	my $i       = $current->{ number } - 1;
	my $k       = $#{$self->{ matches }};

	while( $i > 0 ) {
		$i--;
		my $prev = $self->{ matches }[ $i ];
		return $prev;
	}

	return undef;
}

1;
