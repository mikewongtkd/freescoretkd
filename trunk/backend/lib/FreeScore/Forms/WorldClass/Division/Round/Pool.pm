package FreeScore::Forms::WorldClass::Division::Round::Pool;
use List::Util qw( all any shuffle );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round;
use Digest::SHA1 qw( sha1_hex );
use JSON::XS;
use List::Util qw( all );
use base qw( Clone );
use Data::Structure::Util qw( unbless );
use Data::Dumper;

our $JSON = new JSON::XS();

# ============================================================
# The structure for the Pool is similar to Round
#
# - forms 
#   - [ form index]
#     - scores
#       - <judge id>
#         - accuracy
#           - major
#           - minor
#         - presentation
#           - power
#           - rhythm
#           - energy # MW: not ki! Need to go back and fix this later
#         - status ( ready | scoring | waiting )
# ============================================================

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $data    = shift || { forms => [], size => undef, want => 0 };
	my $self    = bless $data, $class;
	return $self;
}

# ============================================================
sub ready {
# ============================================================
	my $self   = shift;
	my $formid = shift;
	my $judge  = shift;

	my $key    = "$judge->{ fname }|$judge->{ lname }|$judge->{ noc }";
	my $id     = $judge->{ id } || substr( sha1_hex( $key ), 0, 8 );

	$self->{ forms }[ $formid ]                  = {} unless defined $self->{ forms }[ $formid ];
	$self->{ forms }[ $formid ]{ scores }        = {} unless defined $self->{ forms }[ $formid ]{ scores };
	$self->{ forms }[ $formid ]{ scores }{ $id } = {} unless defined $self->{ forms }[ $formid ]{ scores }{ $id };
	my $judges                                   = $self->{ forms }[ $formid ]{ scores };
	my $j                                        = $self->{ forms }[ $formid ]{ scores }{ $id };
	
	$j->{ status } = 'ready';
	$j->{ judge }  = $judge;

	my $k      = $self->{ want };
	my $n      = $self->{ size };
	my $p      = int( grep { $_ eq 'ready' } map { $judges->{ $_ }{ status } } keys %$judges);
	my $first  = $p == 1;
	my $enough = $p >= $k;
	my $last   = $p == $n;

	if    ( $first  ) { return 'first';   }
	elsif ( $last   ) { return 'last';    }
	elsif ( $enough ) { return 'enough';  }
	else              { return 'waiting'; }
}

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $form  = shift;
	my $score = shift;

	my $judge = $score->{ judge };
	my $key   = "$judge->{ fname }|$judge->{ lname }|$judge->{ noc }";
	my $id    = $judge->{ id } || substr( sha1_hex( $key ), 0, 8 );
	$self->{ forms }[ $form ]{ scores }{ $id } = $score;

	my @scores = values %{ $self->{ forms }[ $form ]{ scores }};
	my $k      = $self->{ want };                           # Number of judges in court
	my $n      = $self->{ size };                           # Number of judges in pool
	my $p      = int( grep { _have_scored( $_ )} @scores ); # Number of judges that have scored

	my $first  = $p == 1;
	my $enough = $p >= $k;
	my $last   = $p == $n;

	if    ( $first  ) { return 'one';        }
	elsif ( $last   ) { return 'full';       }
	elsif ( $enough ) { return 'sufficient'; }
	else              { return 'low';        }
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
	my @dsq    = grep { $_->{ video }{ feedback } eq 'dsq' } @scores;
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
			my $s   = $ok[ $i ];
			my $acc = $s->{ accuracy };
			my $pre = $s->{ presentation };
			$s->{ as } = $i;
			my $score = { major => - $acc->{ major }, minor => - $acc->{ minor }, power => $pre->{ power }, rhythm => $pre->{ rhythm }, ki => $pre->{ energy }, complete => 1 };
			$round->record_score( $form, $i, $score );
		}
		return { status => 'success' };

	# ===== CASE 2: ENOUGH JUDGES DISCONNECT OR DEEM VIDEO OR NETWORK BAD TO EXHAUST SAFETY MARGIN
	} elsif( @bad > $safety ) {
		return { status => 'fail', solution => 'rescore' };

	# ===== CASE 3: MAJORITY OF POOL JUDGES DEEM VIDEO FAULTY DUE TO ATHLETE ERROR
	} elsif( @dsq > $half ) {
		return { status => 'fail', solution => 'disqualify' };
	}
}

# ============================================================
sub scoring {
# ============================================================
	my $self   = shift;
	my $formid = shift;
	my $judge  = shift;

	my $key    = "$judge->{ fname }|$judge->{ lname }|$judge->{ noc }";
	my $id     = $judge->{ id } || substr( sha1_hex( $key ), 0, 8 );

	$self->{ forms }[ $formid ]                  = {} unless defined $self->{ forms }[ $formid ];
	$self->{ forms }[ $formid ]{ scores }        = {} unless defined $self->{ forms }[ $formid ]{ scores };
	$self->{ forms }[ $formid ]{ scores }{ $id } = {} unless defined $self->{ forms }[ $formid ]{ scores }{ $id };
	my $judges                                   = $self->{ forms }[ $formid ]{ scores };
	my $j                                        = $self->{ forms }[ $formid ]{ scores }{ $id };
	
	$j->{ status } = 'scoring';
	$j->{ judge }  = $judge;

	my $k      = $self->{ want };
	my $n      = $self->{ size };
	my $p      = int( grep { $_ eq 'scoring' } map { $judges->{ $_ }{ status } } keys %$judges);
	my $first  = $p == 1;
	my $enough = $p >= $k;
	my $last   = $p == $n;

	if    ( $first  ) { return 'first';   }
	elsif ( $last   ) { return 'last';    }
	elsif ( $enough ) { return 'enough';  }
	else              { return 'waiting'; }
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

# ============================================================
sub _have_scored {
# ============================================================
	my $score = shift;
	my $acc = $score->{ accuracy };
	my $pre = $score->{ presentation };
	return $acc->{ minor } >= 0 && $acc->{ major } >= 0 && $pre->{ power } >= 0.5 && $pre->{ rhythm } >= 0.5 && $pre->{ energy } >= 0.5;
}

1;
