package FreeScore::Forms::WorldClass::Division::Round::Pool;
use List::Util qw( all any shuffle );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round;
use Digest::SHA1 qw( sha1_hex );
use JSON::XS;
use base qw( Clone );
use Data::Structure::Util qw( unbless );
use Data::Dumper;

our $JSON = new JSON::XS();

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

	my $judge = $score->{ judge };
	my $key   = "$judge->{ name }|$judge->{ noc }";
	my $id    = $judge->{ id } || substr( sha1_hex( $key ), 0, 8 );
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
	my @ok     = grep { $_->{ video }{ feedback } eq 'ok' || $_->{ video }{ feedback } eq 'good' } @scores; 
	my @bad    = grep { $_->{ video }{ feedback } eq 'bad' } @scores;
	my @err    = grep { $_->{ video }{ feedback } eq 'dsq' } @scores;
	my $half   = int( $self->{ size }/2 );
	my $safety = $self->{ size } - $self->{ want };

	# Judges in pool that do not submit a score are likely disconnected (dropped)
	my $drops  = $self->{ size } - int( @scores );
	push @bad, { video => 'drop' } foreach ( 1 .. $drops );

	# ===== CASE 1: SUFFICIENT SCORES
	if( @ok >= $k ) {
		@ok = shuffle @ok;          # Randomize
		@ok = splice( @ok, 0, $k ); # Take $k scores
		print STDERR "  Randomly selecting $#ok scores\n"; # MW
		foreach my $i ( 0 .. $#ok ) {
			my $s   = $ok[ $i ];
			my $acc = $s->{ accuracy };
			my $pre = $s->{ presentation };
			$s->{ as } = $i;
			my $score = { major => - $acc->{ major }, minor => - $acc->{ minor }, power => $pre->{ power }, rhythm => $pre->{ rhythm }, energy => $pre->{ energy }, complete => 1 };
			print STDERR "  Recording Judge $i score for $form " . (new JSON::XS()->canonical->encode( $score )) . "\n"; # MW
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
sub string {
# ============================================================
	my $self   = shift;
	my $round  = shift;
	my $forms  = shift;
	my $json   = $FreeScore::Forms::WorldClass::Division::Round::Pool::JSON;
	my $copy   = unbless( $self->clone());
	my @string = ();

	for( my $i = 0; $i < $forms; $i++ ) {
		my $form_id = 'f' . ($i + 1);

		my $scores = [ sort keys %{ $copy->{ forms }[ $i ]{ scores }} ];
		for( my $j = 0; $j < int( @$scores ); $j++ ) {
			my $judge_id = 'o' . ($j + 1);
			my $judge    = $scores->[ $j ];
			my $score    = $copy->{ forms }[ $i ]{ scores }{ $judge };
			my $line     = join( "\t", ( '', $round, $form_id, $judge_id, $json->canonical->encode( $score ))) . "\n";
			push @string, $line;
		}
	}
	return @string;
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
