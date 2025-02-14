package FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any none );
use List::MoreUtils qw( first_index );
use FreeScore::Forms::WorldClass::Division::Round;
use base qw( Clone );
use Data::Structure::Util qw( unbless );
use Data::Dumper;

our $DEBUG = [ qw( declare_winner winner )];

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = {};
	bless $self, $class;
	$self->init( @_ );
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self     = shift;
	my $athletes = shift;
	my $number   = shift;
	my $matches  = shift;

	$self->{ order }   = [ map { defined $_ ? int( $_ ) : $_ } @$athletes ];
	$self->{ chung  }  = defined $athletes->[ 0 ] ? int( $athletes->[ 0 ]) : $athletes->[ 0 ];
	$self->{ hong  }   = defined $athletes->[ 1 ] ? int( $athletes->[ 1 ]) : $athletes->[ 1 ];
	$self->{ number }  = int( $number );
	$self->{ matches } = $matches;

	my $div      = $self->method->division();
	my $rcode    = $self->method->rcode();

	$div->calculate_totals();
	$self->winner() if( $self->complete());
}

# ============================================================
sub chung {
# ============================================================
	my $self = shift;
	return undef if $self->empty();
	return undef unless exists $self->{ chung } && defined $self->{ chung };
	return $self->{ chung };
}

# ============================================================
sub compare {
# ============================================================
	my $self   = shift;
	my $other  = shift;

	return $other->method->round() cmp $self->method->round() || $self->{ number } <=> $other->{ number };
}

# ============================================================
sub complete {
# ============================================================
	my $self     = shift;
	my $order    = $self->{ order };
	my $rcode    = $self->method->rcode();
	my $div      = $self->method->division();
	my $complete = all { $div->reinstantiate_round( $rcode, $_ )->complete(); } @$order;
	return $complete;
}

# ============================================================
sub contested {
# ============================================================
	my $self  = shift;
	return defined $self->{ chung } && defined $self->{ hong } ? 1 : 0;
}

# ============================================================
sub data {
# ============================================================
	my $self = shift;
	my $copy = $self->clone();
	my $data = unbless( $copy );
	delete $data->{ matches };
	return $data;
}

# ============================================================
sub declare_winner {
# ============================================================
	my $self   = shift;
	my $winner = shift;

	$self->{ winner } = $winner = ($winner eq 'none' || ! defined $winner) ? undef : int( $winner );

	if( grep { $_ eq 'declare_winner' } @$DEBUG ) {
		print STDERR "MATCH - DECLARE WINNER - Call Stack\n";
		print STDERR Dumper caller;
		my $rcode  = uc $self->method->rcode();
		print STDERR "----------------------------------------\n";
		print STDERR "MATCH - DECLARE WINNER - $rcode Match $self->{ number } - $winner\n";
		print STDERR "----------------------------------------\n";
	}

	return $winner;
}

# ============================================================
sub division {
# ============================================================
	my $self = shift;
	my $div  = $self->method->division();
}

# ============================================================
sub empty {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return 1 if int( @$order ) == 0;
	return 1 if none { defined $_ } @$order;

	return 0;
}

# ============================================================
sub first_athlete {
# ============================================================
	my $self  = shift;
	my $div   = $self->method->division();
	return undef if $self->empty();

	my ($first) = grep { defined $_ } ($self->{ chung }, $self->{ hong });
	return $first;
}

# ============================================================
sub has {
# ============================================================
	my $self  = shift;
	my $i     = shift;
	my $order = $self->{ order };
	return any { $_ == $i } @$order;
}

# ============================================================
sub hong {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return undef if $self->empty();
	return undef if int( @$order ) == 1;
	return undef unless exists $self->{ hong } && defined $self->{ hong };
	return $self->{ hong };
}

# ============================================================
sub is_last {
# ============================================================
	my $self = shift;
	my $last = $self->{ matches }->last();

	return $self->compare( $last ) == 0;
}

# ============================================================
sub last_athlete {
# ============================================================
	my $self  = shift;
	my $div   = $self->method->division();
	return undef if $self->empty();

	my ($last) = grep { defined $_ } ($self->{ hong }, $self->{ chung });

	return $last;
}

# ============================================================
sub matches {
# ============================================================
	my $self = shift;
	return $self->{ matches };
}

# ============================================================
sub method {
# ============================================================
	my $self   = shift;
	my $method = $self->{ matches }{ method };
	return $method;
}

# ============================================================
sub round {
# ============================================================
	my $self  = shift;
	my $round = $self->method->round();
	my $rcode = $round->{ code };

	return $rcode;
}

# ============================================================
sub started {
# ============================================================
	my $self     = shift;
	my $order    = $self->{ order };
	my $rcode    = $self->method->rcode();
	my $div      = $self->method->division();
	my $started  = none { $div->reinstantiate_round( $rcode, $_ )->started(); } @$order;
	return $started;
}

# ============================================================
sub valid {
# ============================================================
	my $self = shift;
	return ! $self->empty();
}

# ============================================================
sub winner {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	my $rcode = $self->method->rcode();
	my $div   = $self->method->division();
	my $debug = grep { $_ eq 'winner' } @$DEBUG;

	if( $debug ) {
		print STDERR "============================================================\n"; # MW
		print STDERR "MATCH - WINNER - match:\n"; # MW
		print STDERR Dumper $self->data(); # MW

		print STDERR "\nMATCH - WINNER - Anyone in this match? " . ((none { defined $_ } @$order) ? "Nope.\n" : "Yes.\n"); # MW
	}
	# If no-one advanced from the previous two matches
	return $self->declare_winner( 'none' ) if none { defined $_ } @$order;

	print STDERR "MATCH - WINNER - Is this match contested? " . ( $self->contested() ? "Yes.\n" : "No.\n") if $debug; # MW
	if( ! $self->contested()) {
		return $self->declare_winner( $self->{ chung }) if defined $self->{ chung };
		return $self->declare_winner( $self->{ hong })  if defined $self->{ hong };
		return $self->declare_winner( 'none' );
	}
	return undef unless( all { $div->reinstantiate_round( $rcode, $_ )->complete() } ($self->{ chung }, $self->{ hong }));

	print STDERR "MATCH - WINNER - Sorting.\n" if $debug; # MW
	my ($winner, $loser) = sort {
		my $x = $div->reinstantiate_round( $rcode, $a );
		my $y = $div->reinstantiate_round( $rcode, $b );

		print STDERR Dumper $a, $x->{ adjusted }, $b, $y->{ adjusted }, $x->compare( $y ) if $debug; # MW
		$x->compare( $y );
	} ($self->{ chung }, $self->{ hong });
	print STDERR "MATCH - WINNER - winner = $winner, loser = $loser.\n\n" if $debug; # MW

	my $punitive = {
		winner => defined $winner ? $div->reinstantiate_round( $rcode, $winner )->any_punitive_decision() : 0,
		loser  => defined $loser  ? $div->reinstantiate_round( $rcode, $loser )->any_punitive_decision()  : 0
	};

	print STDERR "MATCH - WINNER - punitive decisions?\n" if $debug; # MW
	print STDERR Dumper $punitive if $debug; # MW

	if( $punitive->{ winner }) {
		return $self->declare_winner( 'none' ) unless defined $loser; # Winner DSQ/WDR in this round, loser DSQ/WDR in previous round
		return $self->declare_winner( 'none' ) if $punitive->{ loser }; # Both contestants DSQ/WDR in this round

		return $self->declare_winner( $loser ); # Loser wins if the winner is DSQ'd or WDR'n
	}

	print STDERR "MATCH - WINNER - FINAL VERDICT - winner = $winner, loser = $loser.\n\n" if $debug; # MW
	return $self->declare_winner( $winner );
}

1
