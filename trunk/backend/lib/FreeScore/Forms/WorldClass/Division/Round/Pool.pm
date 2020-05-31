package FreeScore::Forms::WorldClass::Division::Round::Pool;
use List::Util qw( all any shuffle );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round;
use JSON::XS;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift || { forms => [], size => undef, want => 0 };
	my $self    = bless $data, $class;
	return $self;
}

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $form  = shift;
	my $score = shift;

	my $id = $score->{ judge }{ id };
	$self->{ forms }[ $form ]{ scores }{ $id } = $score;

	my $n = $self->{ size };

	return( int( values %{ $self->{ forms }[ $form ]{ scores }}) == $n );
}

# ============================================================
sub resolve {
# ============================================================
	my $self   = shift;
	my $form   = shift;
	my $round  = shift;
	my $k      = $self->{ want };
	my @scores = values %{$self->{ forms }[ $form ]{ scores }};

	# Partition the scores based on judge video/network feedback
	my @ok     = grep { $_->{ video } eq 'ok' || $_->{ video } eq 'good' } @scores; 
	my @bad    = grep { $_->{ video } eq 'bad' } @scores;
	my @err    = grep { $_->{ video } eq 'error' } @scores;
	my $half   = int( $self->{ size }/2 );
	my $safety = $self->{ size } - $self->{ want };

	# Judges in pool that do not submit a score are likely disconnected (dropped)
	my $drops  = $self->{ size } - int( @scores );
	push @bad, { video => 'drop' } foreach ( 1 .. $drops );

	# ===== CASE 1: SUFFICIENT SCORES
	if( @ok >= $k ) {
		@ok = shuffle @ok;          # Randomize
		@ok = splice( @ok, 0, $k ); # Take $k scores
		foreach my $i ( 0 .. $#ok ) {
			my $score = $ok[ $i ];
			$score->{ as } = $i;
			$round->record_score( $form, $i, $score );
		}
		return { status => 'success' };

	# ===== CASE 2: ENOUGH JUDGES DISCONNECT OR DEEM VIDEO OR NETWORK BAD TO EXHAUST SAFETY MARGIN
	} elsif( @bad > $safety ) {
		return { status => 'fail', solution => 'rescore' };

	# ===== CASE 3: MAJORITY OF POOL JUDGES DEEM VIDEO FAULTY DUE TO ATHLETE ERROR
	} elsif( @err > $half ) {
		return { status => 'fail', solution => 'disqualify' };
	}
}

# ============================================================
sub size {
# ============================================================
# How many judges are in the pool
# ------------------------------------------------------------
	my $self = shift;
	my $n    = shift;
	
	return $self->{ size } if( $self->{ size });
	$self->{ size } = $n;
	return $n;
}

# ============================================================
sub want {
# ============================================================
# How many judges we want to have scoring
# ------------------------------------------------------------
	my $self = shift;
	my $k    = shift;
	
	return $self->{ want } if( $self->{ want });
	$self->{ want } = $k;
	return $k;
}


1;
