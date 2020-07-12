package FreeScore::Forms::WorldClass::Division::Round::Pool;
use List::Util qw( all any shuffle );
use FreeScore;
use FreeScore::Forms::WorldClass::Division::Round;
use Digest::SHA1 qw( sha1_hex );
use JSON::XS;
use List::Util qw( all );
use base qw( Clone );
use Data::Structure::Util qw( unbless );
use Math::Round qw( nearest );
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
	my $data    = shift || { forms => [], size => undef, want => undef };
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

	my $json = new JSON::XS();
	print STDERR $json->canonical->encode( $judges );

	my $ready  = [ grep { $judges->{ $_ }{ status } eq 'ready'  } keys %$judges ];
	my $scored = [ grep { $judges->{ $_ }{ status } eq 'scored' } keys %$judges ];
	my $k      = $self->{ want };
	my $n      = $self->{ size };
	my $p      = int( @$ready );

	return { have => $p, want => $k, all => $n, ready => $ready, scored => $scored, responded => [ @$ready, @$scored ] };
}

# ============================================================
sub record_score {
# ============================================================
# Record pool score
# ------------------------------------------------------------
	my $self  = shift;
	my $form  = shift;
	my $score = shift;

	my $judge = $score->{ judge }; return 'error' unless $judge;
	my $key   = "$judge->{ fname }|$judge->{ lname }|$judge->{ noc }";
	my $id    = $judge->{ id } || substr( sha1_hex( $key ), 0, 8 );

	if( _have_scored( $score )) { $score->{ status } = "scored"; }
	$self->{ forms }[ $form ]{ scores }{ $id } = $score;

	my ($votes, $scores, $safety) = $self->votes( $form, 0 );

	return $votes;
}

# ============================================================
sub resolve {
# ============================================================
# Resolve pool scoring. This is triggered when either (1) all
# judges have responded; or (2) the pool scoring timer has
# elapsed.
# ------------------------------------------------------------
	my $self    = shift;
	my $form    = shift;
	my $round   = shift; # This is the Round object, not the roundID
	my $timeout = shift;
	my $k       = $self->{ want };
	my $n       = $self->{ size };

	my ($votes, $scores, $safety) = $self->votes( $form, $timeout );
	my $json   = $FreeScore::Forms::WorldClass::Division::Round::Pool::JSON;
	print STDERR "Votes: " . $json->canonical->encode( $votes ) . "\n"; # MW

	# ===== CASE 1: AT LEAST ONE DSQ VOTE HAS BEEN RAISED
	# DSQ votes are also valid scores, but raise an alarm so the Ring Captain
	# can discuss and make a decision. A DSQ decision must then be manually
	# given by the ring computer operator.
	if( $votes->{ have }{ dsq } >= 1 ) {
		return { status => 'fail', solution => 'discuss-disqualify', votes => $votes };

	# ===== CASE 2: SUFFICIENT SCORES
	} elsif( $votes->{ have }{ ok } >= $k ) {

		# ===== IF THE POOL HAS BEEN PREVIOUSLY RESOLVED, KEEP PREVIOUS RESULTS AND RETURN VOTES
		if( $round->form_complete( $form )) { return { status => 'success', votes => $votes }; }

		# ===== IF THE POOL HAS NOT BEEN PREVIOUSLY RESOLVED, RESOLVE NOW
		my @valid = shuffle (@{$scores->{ valid }});  # Randomize
		@valid = splice( @valid, 0, $k ); # Take $k scores
		foreach my $i ( 0 .. $#valid ) {
			my $s   = $valid[ $i ];
			my $acc = $s->{ accuracy };
			my $pre = $s->{ presentation };
			$s->{ as } = $i;
			my $score = { major => nearest( 0.3, - $acc->{ major }), minor => nearest( 0.1, - $acc->{ minor }), power => $pre->{ power }, rhythm => $pre->{ rhythm }, ki => $pre->{ energy }, complete => 1 };
			$round->record_score( $form, $i, $score );
		}
		return { status => 'success', votes => $votes };

	# ===== CASE 3: ENOUGH JUDGES DISCONNECT OR DEEM VIDEO OR NETWORK BAD TO EXHAUST SAFETY MARGIN
	} elsif( $votes->{ bad } + $votes->{ dropped } > $safety->{ margin } ) {
		my @valid  = map { $_->{ judge }{ id } } (@{$scores->{ ok }}, @{$scores->{ dsq }});
		my @repeat = map { $_->{ judge }{ id } } (@{$scores->{ bad }});

		return { status => 'fail', solution => 'replay', lockout => [ @valid ], rescore => [ @repeat ], votes => $votes };

	# ===== CASE 4: SHOULD NEVER HAPPEN
	} else {
		print STDERR "Invalid count of dropped judges.\n"; # MW
		my @valid  = map { $_->{ judge }{ id } } (@{$scores->{ ok }}, @{$scores->{ dsq }});
		my @repeat = map { $_->{ judge }{ id } } (@{$scores->{ bad }});

		return { status => 'fail', details => 'Invalid count of dropped judges', solution => 'replay', lockout => [ @valid ], rescore => [ @repeat ], votes => $votes };
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
	my $form   = shift;
	my $json   = $FreeScore::Forms::WorldClass::Division::Round::Pool::JSON;
	my $copy   = unbless( $self->clone());
	my @string = ();

	my $form_id = 'f' . ($form + 1);

	my $scores = [ sort keys %{ $copy->{ forms }[ $form ]{ scores }} ];
	for( my $j = 0; $j < int( @$scores ); $j++ ) {
		my $judge_id = 'o' . ($j + 1);
		my $judge    = $scores->[ $j ];
		my $score    = $copy->{ forms }[ $form ]{ scores }{ $judge };
		my $line     = join( "\t", ( '', $round, $form_id, $judge_id, $json->canonical->encode( $score ))) . "\n";
		push @string, $line;
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
sub votes {
# ============================================================
# Tally up the current voting status
# ------------------------------------------------------------
	my $self    = shift;
	my $form    = shift;
	my $timeout = shift;
	my @scores  = grep { exists $_->{ judge } } values %{$self->{ forms }[ $form ]{ scores }};

	# Partition the scores based on judge video/network feedback
	my $ok        = [ grep { _have_scored( $_ ) && ($_->{ video }{ feedback } eq 'ok' || $_->{ video }{ feedback } eq 'good') } @scores ]; 
	my $bad       = [ grep { _have_scored( $_ ) && $_->{ video }{ feedback } eq 'bad' } @scores ];
	my $dsq       = [ grep { _have_scored( $_ ) && $_->{ video }{ feedback } eq 'dsq' } @scores ];
	my $responses = int( @$ok ) + int( @$bad ) + int( @$dsq );
	my $valid     = int( @$ok ) + int( @$dsq );
	my $dropped   = $timeout ? $self->{ size } - $responses : 0;
	my $pending   = $timeout ? 0 : $self->{ size } - $responses;
	my $margin    = [ $self->{ size } - $self->{ want } ];

	# Judges in pool that do not submit a score are likely disconnected (dropped)
	my $votes     = { want => $self->{ want }, max => $self->{ size }, have => { responses => $responses, valid => $valid, ok => int( @$ok ), bad => int( @$bad ), dsq => int( @$dsq ), dropped => $dropped, pending => $pending}};
	my $scores    = { ok => $ok, bad => $bad, dsq => $dsq, valid => [ @$ok, @$dsq ]};
	my $safety    = { margin => $margin };

	return ($votes, $scores, $safety);
}

# ============================================================
sub _have_scored {
# ============================================================
	my $score  = shift;
	my $acc    = $score->{ accuracy };
	my $pre    = $score->{ presentation };
	my $scored = $acc->{ minor } <= 0 && $acc->{ major } <= 0 && $pre->{ power } >= 0.5 && $pre->{ rhythm } >= 0.5 && $pre->{ energy } >= 0.5;

	return $scored;
}

1;
