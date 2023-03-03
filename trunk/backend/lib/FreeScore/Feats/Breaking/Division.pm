package FreeScore::Feats::Breaking::Division;
use FreeScore;
use FreeScore::Feats::Division;
use JSON::XS;
use base qw( FreeScore::Feats::Division Clone );
use POSIX qw( ceil );
use List::Util qw( all any first max min sum );
use List::MoreUtils qw( first_index );
use Try::Tiny;
use Date::Manip;
use Data::Dumper;

# ============================================================
sub read {
# ============================================================
	my $self  = shift;
	my $json  = new JSON::XS();
	my $index = 0;
	$self->{ judges } = 3; # Default value

	$self->{ round }  = 'fin';

	open FILE, $self->{ file } or die "Database Read Error: Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/, $_, 2;
			$self->{ $key } = _safe_json_decode( $value );
			next;
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns   = split /\t/;
		my $athlete   = shift @columns;
		my $info      = _safe_json_decode( shift @columns );
		my $n         = $self->{ judges } - 1;
		my @scores    = ();
		foreach ( 0 .. $n ) { my $value = shift @columns; push @scores, $value ? _safe_json_decode( $value ) : ''; }
		push @{ $self->{ athletes }}, { name => $athlete, info => $info, 'index' => $index, scores => [ @scores ]};
		$index++;
	}
	close FILE;

	$self->calculate_scores();
	$self->calculate_placements();
}

# ============================================================
sub calculate_placements {
# ============================================================
	my $self       = shift;
	my $n          = $#{ $self->{ athletes }};
	my @sorted     = sort { $self->compare( $a, $b ) } ( 0 .. $n );
	my $placements = [];
	my $place      = 1;

	return [] if $n == 0;

	while( @sorted ) {
		my $i = shift @sorted;
		my $j = $sorted[ 0 ];
		my $a = $self->{ athletes }[ $i ];
		my $b = $self->{ athletes }[ $j ];

		push @$placements, { place => $place, athletes => [ $i ], show => []};

		return $placements unless defined $j;

		while( $a->{ trimmed }{ total } > 0 && $a->{ trimmed }{ total } == $b->{ trimmed }{ total }) {
			$j = shift @sorted;
			$b = $self->{ athletes }[ $j ];

			my $previous = $placements->[ -1 ];
			push @{$previous->{ show }}, 'tb1';

			# If needed, show tiebreaker 1
			if( $a->{ tb1 } == $b->{ tb1 }) {
				push @{$previous->{ show }}, 'tb2';

				# If it's a true tie, the rules say that multiple medals are to be given
				if( $a->{ tb2 } == $b->{ tb2 }) {
					push @{$previous->{ athletes }}, $j;

				# Otherwise tiebreaker 2 resolves the tie
				} else {
					$place += int( @{$previous->{ athletes }});
					push @$placements, { place => $place, athletes => [ $j ], show => [ 'tb1', 'tb2' ]};
				}

			} else {
				$place += int( @{$previous->{ athletes }});
				push @$placements, { place => $place, athletes => [ $j ], show => [ 'tb1' ]};
			}

			# Peek at the next athlete
			$j = $sorted[ 0 ];
			$b = $self->{ athletes }[ $j ];
		}
	}
}

# ============================================================
sub calculate_scores {
# ============================================================
	my $self     = shift;
	my $judges   = $self->{ judges };
	my $complete = (all { _athlete_scores_complete( $_ )} @{ $self->{ athletes }}) ? 1 : 0;

	$self->trim_scores( $_ ) foreach @{ $self->{ athletes }};
	$self->{ complete } = $complete;
}

# ============================================================
sub compare {
# ============================================================
	my $self = shift;
	my $a    = shift;
	my $b    = shift;
	my $x    = $self->{ athletes }[ $a ];
	my $y    = $self->{ athletes }[ $b ];
	my $dx   = exists $x->{ info } && exists $x->{ info }{ decision } ? $x->{ info }{ decision } : '';
	my $dy   = exists $y->{ info } && exists $y->{ info }{ decision } ? $y->{ info }{ decision } : '';

	# Ranking criteria for DSQ or WDR decisions
	# Note: perl sort: 1 means swap, -1 means no swap, 0 means next criteria
	if( $dx || $dy ) {
		if( $dx eq $dy    ) { return $x->{ name } cmp $y->{ name }; } # Same decision: Sort by name
		if( $dx =~ /dsq/i ) { return  1; } # DSQ goes last; DSQ is lower ranking (higher priority) than WDR
		if( $dy =~ /dsq/i ) { return -1; } # DSQ stays last; DSQ is lower ranking (higher priority) than WDR
		if( $dx =~ /wdr/i ) { return  1; } # WDR goes last
		if( $dy =~ /wdr/i ) { return -1; } # WDR stays last
	}

	# Ranking criteria as per 2020 USATKD rules
	# - Scores: Higher trimmed mean score
	# - TB1: Higher untrimmed mean score (highs & lows added back)
	# - TB2: Lower technical deductions
	my $scores = $y->{ trimmed }{ total } <=> $x->{ trimmed }{ total };
	my $tb1    = $y->{ tb1 } <=> $x->{ tb1 };
	my $tb2    = $x->{ tb2 } <=> $y->{ tb2 };

	return $scores || $tb1 || $tb2;
}

# ============================================================
sub navigate {
# ============================================================
	my $self  = shift;
	my $index = shift;

	$self->{ current } = $index;
}

# ============================================================
sub next {
# ============================================================
	my $self = shift;
	$self->SUPER::next();
}

# ============================================================
sub previous {
# ============================================================
	my $self = shift;
	$self->SUPER::previous();
}

# ============================================================
sub record_decision {
# ============================================================
	my $self     = shift;
	my $decision = shift;
	my $n      = int( @{ $self->{ athletes }});

	return 0 if( $id < 0 || $id > $n );
	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	return 0 unless $athlete;
	if( $decision eq 'clear' ) {
		delete $athlete->{ info }{ decision };
	} else {
		$athlete->{ info }{ decision } = $decision;
	}

	return 1;
}

# ============================================================
sub record_inspection {
# ============================================================
	my $self   = shift;
	my $id     = shift;
	my $boards = shift;
	my $n      = int( @{ $self->{ athletes }});

	return 0 if( $id < 0 || $id > $n );
	my $athlete = $self->{ athletes }[ $id ];
	
	return 0 unless $athlete;
	$athlete->{ info }{ boards } = $boards;

	return 1;
}

# ============================================================
sub record_score {
# ============================================================
	my $self   = shift;
	my $judge  = shift;
	my $score  = shift;
	my $judges = $self->{ judges };

	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	$athlete->{ scores }[ $judge ] = $score;

	# Score is complete when all judges have scored
	return 1 if _athlete_scores_complete( $athlete );
	return 0;
}

# ============================================================
sub time_reset {
# ============================================================
	my $self    = shift;
	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	delete $athlete->{ info }{ time };

	return 1;
}

# ============================================================
sub time_start {
# ============================================================
	my $self    = shift;
	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	my $now = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
	$athlete->{ info }{ time }{ start } = $now;

	return 1;
}

# ============================================================
sub time_stop {
# ============================================================
	my $self    = shift;
	my $i       = $self->{ current };
	my $athlete = $self->{ athletes }[ $i ];

	my $now = (new Date::Manip::Date( 'now GMT' ))->printf( '%O' ) . 'Z';
	$athlete->{ info }{ time }{ stop } = $now;

	return 1;
}

# ============================================================
sub trim_scores {
# ============================================================
#
# {
# 	"technical" : {
# 		"difficulty" : <float>,
# 		"deductions" : { # Referee only
# 			"major" : <float>,
# 			"minor" : <float>,
# 		}
# 	},
# 	"procedural" : { # Referee only
# 		"deductions" : <float>
# 	},
# 	"presentation" : {
# 		"technique" : <float>,
# 		"rhythm" : <float>,
# 		"style" : <float>,
# 		"creativity" : <float>
# 	}
# }
	my $self    = shift;
	my $athlete = shift;
	my $judges  = $self->{ judges };

	return unless $athlete->{ complete };
	return if( exists $athlete->{ info }{ decision } && $athlete->{ info }{ decision });

	my $hi = {};
	my $lo = {};

	my $scores       = $athlete->{ scores };
	my $boards       = exists $athlete->{ info } && exists $athlete->{ info }{ boards } ? int( $athlete->{ info }{ boards }) : 0;
	my $technical    = [ map { 0.0 + $_->{ technical }{ difficulty } } @$scores ];
	my $presentation = [ map { 0.0 + sum @{$_}{ qw( technique rhythm style creativity )} } map { $_->{ presentation } } @$scores ];

	if( $judges == 5 ) {
		# Find high & low for technical & presentation values
		$hi->{ tv } = max @$technical;
		$lo->{ tv } = min @$technical;
		$hi->{ pv } = max @$presentation;
		$lo->{ pv } = min @$presentation;

		# Find high & low indices (i.e. which judge gave the high value & which judge gave the low value)
		$hi->{ ti } = first_index { $_ == $hi->{ tv }                      } @$technical;
		$lo->{ ti } = first_index { $_ == $lo->{ tv } && $_ != $hi->{ tv } } @$technical;
		$hi->{ pi } = first_index { $_ == $hi->{ pv }                      } @$presentation;
		$lo->{ pi } = first_index { $_ == $lo->{ pv } && $_ != $hi->{ pv } } @$presentation;

		$athlete->{ trimmed }{ hilo }{ technical }{ hi }    = { judge => $hi->{ ti }, value => $hi->{ tv }};
		$athlete->{ trimmed }{ hilo }{ technical }{ lo }    = { judge => $lo->{ ti }, value => $lo->{ tv }};
		$athlete->{ trimmed }{ hilo }{ presentation }{ hi } = { judge => $hi->{ pi }, value => $hi->{ pv }};
		$athlete->{ trimmed }{ hilo }{ presentation }{ lo } = { judge => $lo->{ pi }, value => $lo->{ pv }};

	} elsif( $judges == 3 ) {
		$hi->{ $_ } = $lo->{ $_ } = 0 foreach (qw( tv pv ));

	} else {
		die "Invalid number of judges for division ($judges) $!";
	}
	
	# Calculate trimmed mean
	my $referee    = $scores->[ 0 ];
	my $deductions = {
		technical    => $referee->{ technical }{ deductions }{ major } + $referee->{ technical }{ deductions }{ minor },
		procedural   => $referee->{ procedural }{ deductions }
	};
	my $mean       = {
		technical    => 0.0 + sprintf( "%.2f", ((sum @$technical)    - ( $hi->{ tv } + $lo->{ tv }))/3 ),
		presentation => 0.0 + sprintf( "%.2f", ((sum @$presentation) - ( $hi->{ pv } + $lo->{ pv }))/3 )
	};

	$athlete->{ trimmed }{ technical }      = $mean->{ technical } + ($boards * 0.2) - $deductions->{ technical };
	$athlete->{ trimmed }{ presentation }   = $mean->{ presentation };
	$athlete->{ trimmed }{ subtotal }       = sum @{$athlete->{ trimmed }}{ qw( technical presentation )};
	$athlete->{ trimmed }{ total }          = $athlete->{ trimmed }{ subtotal } - $deductions->{ procedural };

	# Calculate mean with highs & lows included
	my $sum = {
		technical    => 0.0 + sprintf( "%.2f", (sum @$technical   )/$judges ),
		presentation => 0.0 + sprintf( "%.2f", (sum @$presentation)/$judges )
	};

	$athlete->{ untrimmed }{ technical }    = $sum->{ technical } + ($boards * 0.2) - $deductions->{ technical };
	$athlete->{ untrimmed }{ presentation } = $sum->{ presentation };
	$athlete->{ untrimmed }{ subtotal }     = sum @{$athlete->{ untrimmed }}{ qw( technical presentation )};
	$athlete->{ untrimmed }{ total }        = $athlete->{ untrimmed }{ subtotal } - $deductions->{ procedural };

	# Calculate tiebreaker values
	$athlete->{ tb1 } = $athlete->{ untrimmed }{ total };
	$athlete->{ tb2 } = $deductions->{ technical };

	return $athlete;
}

# ============================================================
sub write {
# ============================================================
	my $self     = shift;

	$self->calculate_scores();
	$self->calculate_placements();

	my $json     = new JSON::XS();

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# round=$self->{ round }\n" if exists $self->{ round };
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# description=$self->{ description }\n" if exists $self->{ description };
	print FILE "# placements=" . $json->canonical->encode( $self->{ placements }) . "\n" if( exists $self->{ placements } && @{ $self->{ placements }});
	print FILE "# pending=" . $json->canonical->encode( $self->{ pending }) . "\n" if( exists $self->{ pending } && @{ $self->{ pending }});
	foreach my $athlete (@{ $self->{ athletes }}) {
		my $info = $athlete->{ info } ? $json->canonical->encode( $athlete->{ info }) : '';
		print FILE join( "\t", $athlete->{ name }, $info, map { $_ ? $json->canonical->encode( $_ ) : '' } @{ $athlete->{ scores }} ), "\n";
	}
	close FILE;
	chmod 0666, $self->{ file };

	return 1;
}

# ============================================================
sub _athlete_scores_complete {
# ============================================================
	my $athlete = shift;
	return 0 unless $athlete;

	$athlete->{ complete } = all { ref( $_ ) ? 1 : 0 } @{ $athlete->{ scores }};
	return $athlete->{ complete };
}

# ============================================================
sub _safe_json_decode {
# ============================================================
	my $value = shift;
	my $json  = new JSON::XS();
	try {
		return $json->decode( $value );
	} catch {
		return $value;
	}
}

1;
