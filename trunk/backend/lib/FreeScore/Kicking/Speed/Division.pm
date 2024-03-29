package FreeScore::Kicking::Speed::Division;
use FreeScore;
use FreeScore::Forms::Division;
use JSON::XS;
use List::Util qw( any min reduce shuffle );
use List::MoreUtils qw( all first_index last_index minmax part );
use Data::Structure::Util qw( unbless );
use File::Slurp qw( read_file );
use Math::Utils qw( ceil );
use Clone qw( clone );
use base qw( FreeScore::Forms::Division Clone );
use Data::Dumper;

# ============================================================
# File format is specified as follows:
# ============================================================
#
# +- athletes[]
#    +- name
#    +- info
#    +- original
#       +- round{}
#          +- count
#    +- decision
#    +- complete
#    +- penalty
#       +- round{}
#          +- time
#          +- bounds
#          +- other
#          +- restart
#          +- misconduct
#    +- pool
#       +- round{}
#          +- judges{}
#             +- count
#    +- scores
#       +- round{}
#          +- judges[]
#             +- count
#    +- time
#       +- round{} # e.g. finals
#          +- matchround[] # e.g. 1st round of match, 2nd round, etc.
#             +- start
#             +- stop
#          +- rest[]
#             +- start
#             +- stop
# +- current
# +- file
# +- judges
# +- name
# +- pending
# +- timers
#    +- cycle
#    +- pause
#       +- leaderboard
#       +- score
#    +- round
#    +- rest
# +- placements
# +- places
# +- state
# ------------------------------------------------------------

# ============================================================
sub assign {
# ============================================================
	my $self       = shift;
	my $i          = shift;
	my $round      = shift;

	# Do nothing if athlete is already assigned to the round
	return if( any { $_ == $i } @{ $self->{ order }{ $round }});
	push @{ $self->{ order }{ $round }}, $i;
}

# ============================================================
sub autopilot {
# ============================================================
	my $self  = shift;
	my $state = shift;

	if( defined $state ) {
		if( $state eq 'off' ) { delete $self->{ autopilot }; } else { $self->{ autopilot } = $state; }
	}

	return $self->{ autopilot } if exists $self->{ autopilot };
	return undef;
}

# ============================================================
sub current_athlete {
# ============================================================
	my $self    = shift;
	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	return $athlete;
}

# ============================================================
sub edit_athletes {
# ============================================================
	my $self     = shift;
	my $edits    = shift;
	my $athletes = [];
	foreach my $i ( 0 .. $#$edits ) {
		my $edit  = $edits->[ $i ];
		my $j     = $edit->{ order };
		my $found = $j > 0 && $j < @{ $self->{ athletes }} ? $self->{ athletes }[ $j ] : undef;
		my $entry = $found ? $found : {};

		$entry->{ name } = $edit->{ name };
		push @$athletes, $entry;
	};
	$self->{ athletes } = $athletes;
}

# ============================================================
sub read {
# ============================================================
	my $self     = shift;
	my $json     = new JSON::XS();
	my $round    = 'finals';
	my $athletes = {};
	my $context  = '';

	open my $fh, '<', $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <$fh> ) {
		chomp;
		next if( /^$/ );

		# ===== READ HEADER INFORMATION
		if( /^#\s*(\w+)=(.*?)$/ ) {
			$key   = $1;
			$value = $2; # Either a scalar, a JSON object, or a JSON array
			$value = $json->decode( $value ) if( $value =~ /^[\[\{]/ );
			$self->{ $key } = $value;

		# ===== ROUND SECTION START
		} elsif( /^# (prelim|semfin|finals|ro\d+)/ ) {
			$round = $1;

		# ===== ATHLETE NAME AND INFO
		} elsif( /^[A-Za-z0-9]+/ ) {
			my @info = split /\t/;
			my $name = shift @info;
			my $info = {};
			$context = $name;

			# Parse out athlete info using same approach as parsing headers
			foreach my $item (@info) {
				my ($key, $value) = split /=/, $item, 2;
				$value = $json->decode( $value ) if( $value =~ /^[\[\{]/ );
				$info->{ $key } = $value;
			}
			$athletes->{ $name }{ info } = $info;
			push @{$order->{ $round }}, $name;

		# ===== ATHLETE SCORE
		} elsif( /^\tscore\t(?:r|j\d)\t/ ) {
			my ($blank, $rowtype, $judge, $score) = split /\t/, $_, 4;
			$score = $json->decode( $score );
			my $i  = $judge eq 'r' ? 0 : $judge; $i =~ s/^j//; $i = int( $i );
			$athletes->{ $context }{ scores }{ $round }[ $i ] = $score;

		# ===== ATHLETE SCORE FROM JUDGE POOL
		} elsif( /^\tpool\t\w+\t/ ) {
			my ($blank, $rowtype, $jid, $score) = split /\t/, $_, 4;
			$score = $json->decode( $score );
			$athletes->{ $context }{ pool }{ $round }{ $jid } = $score;
		}
	}
	close $fh;

	bless $self, 'FreeScore::Kicking::Speed::Division';

	sub by_match_size {
		my $a = shift;
		my $b = shift;
		my $asize = $a; $asize =~ s/^ro//;
		my $bsize = $b; $bsize =~ s/^ro//;
		return int( $bsize ) <=> int( $asize );
	}
	my @matches = sort by_match_size grep { /^ro/ } keys %$order;

	my $aids = []; # Athlete IDs
	foreach my $earliest (qw( prelim semfin finals ), @matches ) {
		next unless exists $order->{ $earliest };
		$self->{ order }{ $earliest } = [];
		while( my $name = shift @{ $order->{ $earliest }}) {
			my $athlete = $athletes->{ $name };
			push @$aids, { name => $name, id => int( @$aids ), info => $athlete->{ info }, scores => $athlete->{ scores }, pool => $athlete->{ pool }};
			delete $athletes->{ $name };
			push @{$self->{ order }{ $earliest }}, $#$aids unless any { $_ == $#$aids } @{ $self->{ order }{ $earliest }} ;
		}
		last unless int( keys %$athletes ) > 0;
	}

	$self->{ athletes } = $aids;
	$self->{ current } ||= 0;
	$self->{ judges }  ||= 5; # Default value
	$self->{ places }  ||= [ { place => 1, medals => 1 }, { place => 2, medals => 1 }, { place => 3, medals => 2 } ];
	$self->{ state }   ||= 'score';
	$self->{ file }    = $self->{ file };
	$self->{ path }    = $self->{ file }; $self->{ path } =~ s/\/[^\/]*?$//;

	$self->update();
}

# ============================================================
sub calculate_placements {
# ============================================================
	my $self     = shift;
	my $round    = shift || $self->{ round } or return;
	my $athletes = $self->{ athletes };

	my ($pending, $complete) = part { $athletes->[ $_ ]{ complete }{ $round } ? 1 : 0 } @{ $self->{ order }{ $round }};

	my $placements = [ sort {
		my $i = $athletes->[ $a ];
		my $j = $athletes->[ $b ];

		my $i_ori = $i->{ original }{ $round };
		my $j_ori = $j->{ original }{ $round };

		my $i_ori_total      = _real( $i_ori->{ technical }{ count });
		my $j_ori_total      = _real( $j_ori->{ technical }{ count });

		my $original_total   = $j_ori_total <=> $i_ori_total;

		# Add tiebreaker notations
		if( $original_total == 0 ) {
			$i->{ tied }{ $b } = 1;
			$j->{ tied }{ $a } = 1;
		}

		$original_total;
	} @$complete ];

	$self->{ placements } = {} if not exists $self->{ placements };
	$self->{ pending }    = {} if not exists $self->{ pending };

	$self->{ placements }{ $round } = $placements;
	$self->{ pending }{ $round }    = $pending;
}

# ============================================================
sub calculate_round {
# ============================================================
# Implement bracketing later
# ------------------------------------------------------------
	my $self     = shift;
	my $athletes = $self->{ athletes };
	my $order    = {};
	my $round    = 'finals';
	$order->{ $round } = [( 0 .. $#$athletes )];
	$self->{ order } = $order;
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self  = shift;
	my $round = shift || $self->{ round } or return;
	my $order = $self->{ order }{ $round };
	my $ranks = [];

	foreach my $i (0 .. $#$order) {
		my $j         = $order->[ $i ];
		my $athlete   = $self->{ athletes }[ $j ];
		my $original  = $athlete->{ original }{ $round } = {};
		my $penalties = reduce { $athlete->{ info }{ penalty }{ $round } } (qw( timelimit bounds other restart ));
		my $decision  = exists $athlete->{ decision } && exists $athlete->{ decision }{ $round } ? $athlete->{ decision }{ $round } : '';
		my $scores    = undef;

		# ===== INITIALIZE ATHLETE SCORES
		$athlete->{ scores }           = {} unless exists $athlete->{ scores };
		$athlete->{ scores }{ $round } = [] unless exists $athlete->{ scores }{ $round };
		$scores = $athlete->{ scores }{ $round };
		foreach my $j ( 0 .. $self->{ judges } - 1 ) { $scores[ $j ] = {} unless $scores[ $j ]; }

		# ===== CALCULATE PENALTY DEDUCTIONS
		my $penalty = 0;
		$penalty += $penalties->{ $_ } foreach ( sort keys %{ $penalties });

		# ===== A SCORE IS COMPLETE WHEN ALL JUDGES HAVE SENT THEIR SCORES OR A PUNITIVE DECISION IS GIVEN
		my $all_scores_received = @$scores == $self->{ judges } && all { defined $_ } @$scores;
		my $decided             = $decision eq 'withdraw' || $decision eq 'disqualify';
		if( $all_scores_received || $decided ) { $athlete->{ complete }{ $round } = 1; } else { delete $athlete->{ complete }{ $round }; next; }

		# ===== CALCULATE CONSENSUS AND MEANS
		my $tech = $self->judge_technical_consensus( $scores );

		$original->{ technical }    = $tech;
	}
}

# ============================================================
sub from_json {
# ============================================================
#** @method ( json_division_data )
#   @brief  Class method that returns an instance using the given JSON division data
#   Call as my $division = FreeScore::Kicking::Speed->from_json( $json )
#*
	my $class = shift;
	my $data  = shift;
	return bless $data, $class;
}

# ============================================================
sub judge_technical_consensus {
# ============================================================
	my $self   = shift;
	my $scores = shift;
	my $total  = 0;

	my @counts    = sort { $a <=> $b } map { int } grep { defined } map { $_->{ count } } @$scores;
	my $j         = int((int( @counts ) + 1)/2) - 1; # At least half of the judges agree
	my $consensus = $counts[ $j ];

	# count: judge consensus on count
	return { count => $consensus };
}

# ============================================================
sub navigate {
# ============================================================
	my $self   = shift;
	my $object = shift;
	my $i      = shift;

	local $_ = $object;
	if( /^athlete$/ ) {
		return unless $i >= 0 && $i < @{$self->{ athletes }};
		$self->{ current } = int( $i );
		return $self->current_athlete();
	}

	return;
}

# ============================================================
sub next_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next athlete; will wrap-around from the last to the first
#*
	my $self     = shift;
	my $i        = $self->{ current };
	my $round    = $self->{ round };
	my $order    = $self->{ order }{ $round };
	my $j        = first_index { $_ == $i } @$order;

	$self->{ state }   = 'score';
	$self->{ current } = $j < $#$order ? $order->[ $j + 1 ] : $order->[ 0 ];
	return $self->current_athlete();
}

# ============================================================
sub next_available_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the next athlete that needs a score and has not been withdrawn or disqualified
#*
	my $self  = shift;
	my $round = $self->{ round };
	my $order = $self->{ order }{ $round };

	for( my $i = 0; $i < $#$order; $i++ ) {
		my $athlete = $self->next_athlete();
		my $available = ! $athlete->{ complete }{ $round };
		last if $available;
	}
	return $self->current_athlete();
}

# ============================================================
sub next_round {
# ============================================================
	my $self   = shift;
	my $round  = $self->{ round };

	if    ( $round eq 'prelim' ) { $self->{ round } = 'semfin'; }
	elsif ( $round eq 'semfin' ) { $self->{ round } = 'finals'; }

	$self->{ state } = 'score';
	$self->{ current } = $self->{ order }{ $self->{ round }}[ 0 ];
}

# ============================================================
sub pool_judge_ready {
# ============================================================
#** @method ( size, judge )
#   @brief Indicates that the judge is ready to start scoring accuracy
#*
	my $self    = shift;
	my $size    = shift;
	my $judge   = shift;

	my $n       = $self->{ poolsize } = $size;
	my $round   = $self->{ round };
	my $k       = $self->{ judges };
	my $athlete = $self->current_athlete();
	my $jid     = $judge->{ id };

	$athlete->{ pool }{ $round } = {} unless( exists $athlete->{ pool }{ $round });

	my $pool = $athlete->{ pool }{ $round };

	$pool->{ $jid } = { judge => $judge, status => 'ready' };

	my $ready  = [ grep { $pool->{ $_ }{ status } eq 'ready'  } keys %$pool ];
	my $scored = [ grep { $pool->{ $_ }{ status } eq 'scored' } keys %$pool ];
	my $p      = int( @$ready );

	return { have => $p, want => $k, all => $n, ready => $ready, scored => $scored, responded => [ @$ready, @$scored ] };
}

# ============================================================
sub record_pool_score {
# ============================================================
#** @method ( score_object )
#   @brief Records the given score within a judge's pool for online tournaments
#*
	my $self    = shift;
	my $score   = shift;

	return unless $score->{ judge }{ id };

	my $judge     = $score->{ judge };
	my $round     = $self->{ round };
	my $k         = $self->{ judges };
	my $n         = $self->{ poolsize };
	my $athlete   = $self->current_athlete();
	my $pool      = exists $athlete->{ pool }{ $round } ? $athlete->{ pool }{ $round } : ($athlete->{ pool }{ $round } = {});
	my $safety    = { margin => ($n - $k)};

	$self->{ state } = 'score'; # Return to the scoring state when any judge scores
	$score->{ status } = 'scored';
	$pool->{ $judge->{ id }} = $score;

	my $dsq       = [ grep { $_->{ video }{ feedback } eq 'dsq' } values %$pool ];
	my $bad       = [ grep { $_->{ video }{ feedback } eq 'bad' } values %$pool ];
	my $ok        = [ grep { $_->{ video }{ feedback } eq 'ok'  } values %$pool ];
	my $valid     = [ @$ok, @$dsq ];
	my $responses = int( @$dsq ) + int( @$bad ) + int( @$ok );
	my $pending   = $timeout ? 0 : $n - $responses;
	my $dropped   = $timeout ? $n - $responses : 0;

	my $votes = {
		have => {
			dsq       => int( @$dsq ),
			ok        => int( @$ok ),
			bad       => int( @$bad ),
			valid     => int( @$valid ),
			responses => $responses,
			pending   => $pending,
			dropped   => $dropped
		},
		want => $k,
		max  => $n
	};

	my $have = int( grep { $pool->{ $_ }{ status } eq 'scored' } keys %$pool);

	if( $have == $n ) {
		my $result = $self->resolve_pool();
		return $result;
	} else {
		return { status => 'in-progress', votes => $votes }
	}
}

# ============================================================
sub resolve_pool {
# ============================================================
#** @method ()
#   @brief Resolves the pool scoring in the cases: (1) all judges have
#   responded; or (2) manual intervention by the computer operator
#*
	my $self      = shift;
	my $timeout   = shift || 0;
	my $round     = $self->{ round };
	my $n         = $self->{ poolsize };
	my $k         = $self->{ judges };
	my $athlete   = $self->current_athlete();
	my $pool      = exists $athlete->{ pool }{ $round } ? $athlete->{ pool }{ $round } : ($athlete->{ pool }{ $round } = {});
	my $safety    = { margin => ($n - $k)};
	my $dsq       = [ grep { $_->{ video }{ feedback } eq 'dsq' } values %$pool ];
	my $bad       = [ grep { $_->{ video }{ feedback } eq 'bad' } values %$pool ];
	my $ok        = [ grep { $_->{ video }{ feedback } eq 'ok'  } values %$pool ];
	my $valid     = [ @$ok, @$dsq ];
	my $responses = int( @$dsq ) + int( @$bad ) + int( @$ok );
	my $pending   = $timeout ? 0 : $n - $responses;
	my $dropped   = $timeout ? $n - $responses : 0;

	my $votes = {
		have => {
			dsq       => int( @$dsq ),
			ok        => int( @$ok ),
			bad       => int( @$bad ),
			valid     => int( @$valid ),
			responses => $responses,
			pending   => $pending,
			dropped   => $dropped
		},
		want => $k,
		max  => $n
	};

	# ===== CASE 1: AT LEAST ONE DSQ VOTE HAS BEEN RAISED
	# DSQ votes are also valid scores, but raise an alarm so the Ring Captain
	# can discuss and make a decision. A DSQ decision must then be manually
	# given by the ring computer operator.
	if( $votes->{ have }{ dsq } >= 1 ) {
		return { status => 'fail', solution => 'discuss-disqualify', votes => $votes };

	# ===== CASE 2: SUFFICIENT SCORES
	} elsif( $votes->{ have }{ ok } >= $k ) {

		# ===== IF THE POOL HAS BEEN PREVIOUSLY RESOLVED, KEEP PREVIOUS RESULTS AND RETURN VOTES
		if( $athlete->{ complete }{ $round }) { return { status => 'success', votes => $votes }; }

		# ===== IF THE POOL HAS NOT BEEN PREVIOUSLY RESOLVED, RESOLVE NOW
		my @valid = shuffle (@$valid);    # Randomize
		@valid = splice( @valid, 0, $k ); # Take $k scores
		foreach my $i ( 0 .. $#valid ) {
			my $pool_score = $valid[ $i ];
			$pool_score->{ as } = $i;
			my $score = clone( $pool_score );
			delete $score->{ $_ } foreach qw( judge as status ring video );
			$self->record_score( $i, $score );
		}
		return { status => 'success', votes => $votes };

	# ===== CASE 3: ENOUGH JUDGES DISCONNECT OR DEEM VIDEO OR NETWORK BAD TO EXHAUST SAFETY MARGIN
	} elsif( $votes->{ bad } + $votes->{ dropped } > $safety->{ margin } ) {
		my @valid  = map { $_->{ judge }{ id } } (@$valid);
		my @repeat = map { $_->{ judge }{ id } } (@$bad);

		return { status => 'fail', solution => 'replay', lockout => [ @valid ], rescore => [ @repeat ], votes => $votes };

	# ===== CASE 4: SHOULD NEVER HAPPEN
	} else {
		my @valid  = map { $_->{ judge }{ id } } (@$valid);
		my @repeat = map { $_->{ judge }{ id } } (@$bad);
		print STDERR Dumper \@valid;

		return { status => 'fail', details => 'Invalid count of dropped judges', solution => 'replay', lockout => [ @valid ], rescore => [ @repeat ], votes => $votes };
	}
}

# ============================================================
sub previous_athlete {
# ============================================================
#** @method ()
#   @brief Navigates the division to the previous athlete
#*
	my $self     = shift;
	my $athletes = $self->{ athletes };
	my $i        = $self->{ current };

	$self->{ state }   = 'score';
	$self->{ current } = $i > 0 ? $i - 1 : $#$athletes;
	return $athletes->[ $self->{ current }];
}

# ============================================================
sub previous_round {
# ============================================================
	my $self  = shift;
	my $round = $self->{ round };
	my $order = $self->{ order };

	if    ( $round eq 'finals' && exists $order->{ semfin } && @{ $order->{ semfin }} > 0 ) { $self->{ round } = 'semfin'; }
	elsif ( $round eq 'semfin' && exists $order->{ prelim } && @{ $order->{ prelim }} > 0 ) { $self->{ round } = 'prelim'; }

	$self->{ state } = 'score';
	$self->{ current } = $self->{ order }{ $self->{ round }}[ 0 ];
}

# ============================================================
sub record_decision {
# ============================================================
#** @method ()
#   @brief Updates punitive decisions
#*
	my $self     = shift;
	my $decision = shift;
	my $i        = shift;
	my $athletes = $self->{ athletes };
	my $round    = $self->{ round };

	return unless $i >= 0 && $i < @$athletes;
	$athletes->[ $i ]{ decision }{ $round } = $decision;
	$athletes->[ $i ]{ complete }{ $round } = 1;
}

# ============================================================
sub record_penalty {
# ============================================================
#** @method ()
#   @brief Updates penalties
#*
	my $self     = shift;
	my $penalty  = shift;
	my $i        = shift;
	my $athletes = $self->{ athletes };
	my $round    = $self->{ round };

	return unless $i >= 0 && $i < @$athletes;
	$athletes->[ $i ]{ info }{ penalty }{ $round } = $penalty;
}

# ============================================================
sub record_score {
# ============================================================
#** @method ()
#   @brief Updates a score
#*
	my $self  = shift;
	my $judge = shift;
	my $score = shift;
	my $round = $self->{ round };

	$self->{ state } = 'score';
	my $athlete = $self->current_athlete();
	$athlete->{ scores }{ $round }[ $judge ] = $score;
}

# ============================================================
sub remove_athlete {
# ============================================================
	my $self = shift;
	my $i    = shift;
	return unless $i >= 0 && $i < @{$self->{ athletes }};
	my $athlete = splice @{$self->{ athletes }}, $i, 1;
	foreach my $list ( qw( order placement pending )) {
		next unless exists $self->{ $list };
		my $j = first_index { $_ == $i } @{ $self->{ list }};
		splice( @{ $self->{ list }}, $j, 1 );
	}
	return $athlete;
}

# ============================================================
sub update {
# ============================================================
	my $self  = shift;

	$self->calculate_scores();
	$self->calculate_placements();
	$self->calculate_round();
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	my $json  = new JSON::XS();

	$self->update();

	open my $fh, ">$self->{ file }" or die "Database Write Error: Can't write to '$self->{ file }' $!";

	# ===== WRITE DIVISION HEADER
	foreach my $header (sort keys %{$self}) {
		next if $header =~ /^(?:athletes|cache|path|file|ring|name)$/;
		my $value = $self->{ $header };
		$value = $json->canonical->encode( $value ) if( ref( $value ));
		print $fh "# $header=$value\n";
	}

	# ===== WRITE EACH ROUND SECTION
	sub by_match_size {
		my $a = shift;
		my $b = shift;
		my $asize = $a; $asize =~ s/^ro//;
		my $bsize = $b; $bsize =~ s/^ro//;
		return int( $asize ) <=> int( $bsize );
	}
	my @matches = sort by_match_size grep { /^ro\d+$/ } keys %{ $self->{ order }};
	foreach my $round ( @matches, qw( finals semfin prelim )) {
		next unless exists $self->{ order }{ $round };
		print $fh "# ------------------------------------------------------------\n";
		print $fh "# $round\n";
		print $fh "# ------------------------------------------------------------\n";

		# ===== WRITE EACH ATHLETE
		foreach my $aid (@{$self->{ order }{ $round }}) {
			my $athlete = $self->{ athletes }[ $aid ];

			# Concatenate the athlete information
			my @info = ();
			foreach my $key (sort keys %{ $athlete->{ info }}) {
				my $value = $athlete->{ info }{ $key };
				$value = $json->canonical->encode( $value ) if ref( $value );
				push @info, "$key=$value";
			}
			my $info = @info ? "\t" . join( "\t", @info ) : '';

			print $fh "$athlete->{ name }$info\n";

			# WRITE DECISIONS
			if( exists $athlete->{ decision } && exists $athlete->{ decision }{ $round }) {
				printf $fh "\tdecision\t$athlete->{ decision }{ $round }\n";
			}

			# WRITE EACH SCORE
			if( exists $athlete->{ scores }{ $round } && ref( $athlete->{ scores }{ $round }) =~ /^array/i && @{ $athlete->{ scores }{ $round }}) {
				foreach my $i ( 0 .. $#{$athlete->{ scores }{ $round }}) {
					my $judge = $i == 0 ? 'r' : "j$i";
					my $score = $athlete->{ scores }{ $round }[ $i ];
					printf $fh "\tscore\t%s\t%s\n", $judge, $json->canonical->encode( $score );
				}
			}

			# WRITE EACH POOL SCORE
			if( exists $athlete->{ pool }{ $round } && ref( $athlete->{ pool }{ $round }) =~ /^hash/i && (keys %{ $athlete->{ pool }{ $round }}) > 0 ) {
				foreach my $jid (sort keys %{ $athlete->{ pool }{ $round }}) {
					my $score = clone( $athlete->{ pool }{ $round }{ $jid });
					delete $score->{ judge }{ $_ } foreach grep { !/(?:fname|lname|id|noc)/ } keys %{$score->{ judge }}; # White list of pool properties
					printf $fh "\tpool\t%s\t%s\n", $jid, $json->canonical->encode( $score );
				}
			}
		}
		print $fh "\n";
	}
	close $fh;
	chmod 0666, $self->{ file };

	return 1;
}

# ============================================================
sub _not_disqualified {
# ============================================================
	my $athletes = shift;
	my $group    = shift;
	return grep {
		my $athlete = $athletes->[ $_ ];
		! exists $athlete->{ decision } || ! $athlete->{ decision } =~ /^disqual/i
	} @$group;
}

# ============================================================
sub _real {
# ============================================================
	my $value = shift;
	return 0 + sprintf( "%.2f", $value );
}

# ============================================================
sub _tabulate_votes {
# ============================================================
	my $ballots = shift;
	my $a       = shift;
	my $b       = shift;

	my $count = 0;
	foreach my $judge ( 0 .. $#ballots ) {
		my $votes       = $ballots->[ $judge ];
		my $score_for_a = first { $_->{ athlete } == $a } @$votes;
		my $score_for_b = first { $_->{ athlete } == $b } @$votes;
		$count++ if( $score_for_a > $score_for_b );
	}
	return $count;
}

sub display          { my $self = shift; $self->{ state } = 'display'; }
sub is_display       { my $self = shift; return $self->{ state } eq 'display'; }
sub score            { my $self = shift; $self->{ state } = 'score'; }
sub list             { my $self = shift; $self->{ state } = 'list'; }

1;
