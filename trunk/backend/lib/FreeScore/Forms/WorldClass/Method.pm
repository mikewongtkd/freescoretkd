package FreeScore::Forms::WorldClass::Method;
use FreeScore::Forms::WorldClass::Method::Cutoff;
use FreeScore::Forms::WorldClass::Method::SideBySide;
use FreeScore::Forms::WorldClass::Method::SingleElimination;
use base qw( Clone );
use List::Util qw( first );

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
	my $self  = shift;
	my $div   = shift;
	my $round = shift;

	$self->{ division } = $div;
	$self->{ round }    = $round if $round;
}

# ============================================================
sub bracket {}
# ============================================================

# ============================================================
sub change_display {}
# ============================================================

# ============================================================
sub division { my $self = shift; return $self->{ division }; }
# ============================================================

# ============================================================
sub factory {
# ============================================================
	my $type  = shift;
	my $div   = shift;
	my $round = shift;

	my $dispatch = {
		cutoff => 'Cutoff',
		sbs    => 'SideBySide',
		se     => 'SingleElimination'
	};

	my $class = "FreeScore::Forms::WorldClass::Method::$dispatch->{ $type }";

	return $class->new( $div, $round );
}

# ============================================================
sub initialize {}
# ============================================================

# ============================================================
sub matches {}
# ============================================================

# ============================================================
sub rcode {
# ============================================================
	my $self  = shift;
	my $round = $self->round();
	my $rcode = $round->{ code };

	return $rcode;
}

# ============================================================
sub round {
# ============================================================
	my $self  = shift;
	my $rcode = shift || $self->{ round };
	my $class  = ref( $self );
	my $rvar   = "\@$class\:\:rounds";
	my @rounds = eval $rvar;

	die "No round specified for $class round() $!" unless $rcode;
	my $round  = first { $_->{ code } eq $rcode } @rounds;

	return $round if $round;
	die "Round $rcode not found in $rvar\n";
}

# ============================================================
sub rounds {
# ============================================================
	my $self   = shift;
	my $mode   = shift || 'code';
	my $class  = ref( $self );
	my $rvar   = "\@$class::rounds";
	my @rounds = eval $rvar;

	if( $mode eq 'object' ) {
		return @rounds;

	} elsif( $mode =~ /^(?:code|name|min|max|matches)$/ ) {
		return map { $_->{ $mode } } @rounds;

	} else {
		die "Unrecognized mode request '$mode' $!";
	}

	return @rounds;
}

# ============================================================
sub state {
# ============================================================
	my $self    = shift;
	my $state   = lc shift;
	my $div     = $self->{ division };
	my $class   = ref( $self );
	my $svar    = "\@$class\:\:states";
	my @states  = eval $svar;
	my $method  = (split /::/, $class)[ -1 ];
	my $allowed = join( ', ', @states );

	die "Unknown state '$state' for method $method (allowed: $allowed) $!" unless( grep { $state eq $_ } @states);
	$div->{ state } = $state;
}

# ============================================================
sub _annotate {
# ============================================================
# Determines if a tie-breaking criteria is needed and adds them
# to the list for display
# ------------------------------------------------------------
	my $x = shift;
	my $y = shift;

	my $dcode = { disqualify => 'DSQ', withdraw => 'WDR' };
	if( $x->{ adjusted }{ total } == $y->{ adjusted }{ total } && $x->{ adjusted }{ total } != 0 ) {
		if( $x->{ adjusted }{ presentation } != $y->{ adjusted }{ presentation }) { 
			$x->{ tb }[ 0 ] = $x->{ adjusted }{ presentation }; 
			$y->{ tb }[ 0 ] = $y->{ adjusted }{ presentation }; 
		} else {
			if( $x->{ original }{ total } != $y->{ original }{ total } ) { 
				$x->{ tb }[ 1 ] = $x->{ original }{ total };
				$y->{ tb }[ 1 ] = $y->{ original }{ total };
			}
		}
	}
}

1;
