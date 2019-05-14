package FreeScore::Forms::WorldClass::Schedule::Block;

use List::Util qw( uniq );
use Date::Manip;
use FreeScore::Forms::WorldClass::Schedule;

sub by_priority($$);

# ============================================================
sub by_priority($$) {
# ============================================================
	my $a = shift;
	my $b = shift;

	return 0 ||
		int( @{ $b->{ require }{ nonconcurrent }}) <=> int( @{ $a->{ require }{ nonconcurrent }}) ||
		int( @{ $a->{ require }{ precondition }})  <=> int( @{ $b->{ require }{ precondition }})  ||
		$a->age() <=> $b->age();
		
}

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
	my $self     = shift;
	my $division = shift;
	my $athletes = shift;
	my $round    = shift;
	my $flight   = shift;
	my @id       = ();

	$self->{ athletes }    = $athletes;
	$self->{ division }    = $division->{ name };
	$self->{ description } = $division->{ description };
	$self->{ round }       = $round;
	$self->{ flight }      = $flight || '';

	$self->{ duration } = ($round eq 'finals') ? (2 * $FreeScore::Forms::WorldClass::Schedule::TIME_PER_FORM * $athletes) : ($FreeScore::Forms::WorldClass::Schedule::TIME_PER_FORM * $athletes);

	my $key = $self->match(); $key =~ s/\s+/-/g;
	push @id, $division->{ name }, $key, $round, (defined( $flight ) ? $flight : ());
	$self->{ id } = join '|', @id;

	$division->{ blocks } = [ uniq( @{ $division->{ blocks }}, $self->{ id } )];
}

# ============================================================
sub precondition_is_satisfied {
# ============================================================
	my $self  = shift;
	my $other = shift;

	return 0 unless $other->{ day } && $other->{ start } && $other->{ stop }; # Precondition isn't even planned yet
	return 0 if( $self->{ day } < $other->{ day }); # Impossible if the precondition is scheduled for the following day

	# print STDERR "PRECON TIMES: $self->{ start } $self->{ stop } $other->{ start } $other->{ stop }\n";

	my $a   = new Date::Manip::Date( $self->{ start }); die "Bad timestamp '$self->{ start }'" unless $a;
	my $b   = new Date::Manip::Date( $other->{ stop }); die "Bad timestamp '$other->{ stop }'" unless $b;
	my $cmp = $a->cmp( $b );

	# ===== PRECONDITION DEBUGGING
	# printf STDERR "%-40s%-10s%-10s needs %-40s%-10s%-10s => %s\n", @{$self}{qw( id start stop )}, @{$other}{qw( id start stop )}, ($cmp >= 0) ? 'OK' : 'UNFULFILLED';

	return $cmp >= 0;
}

# ============================================================
sub is_concurrent {
# ============================================================
	my $self  = shift;
	my $other = shift;

	return 0 unless $other->{ start } && $other->{ stop }; # Other has not yet been planned
	return 0 unless ( $self->{ day } == $other->{ day });  # Different day, no problems here

	# print STDERR "CONCUR TIMES: $self->{ start } $self->{ stop } $other->{ start } $other->{ stop }\n";
	
	my $a_start = new Date::Manip::Date( $self->{ start });  die "Bad timestamp '$self->{ start }'"  unless $a_start;
	my $a_stop  = new Date::Manip::Date( $self->{ stop });   die "Bad timestamp '$self->{ stop }'"   unless $a_stop;
	my $b_start = new Date::Manip::Date( $other->{ start }); die "Bad timestamp '$other->{ start }'" unless $b_start;
	my $b_stop  = new Date::Manip::Date( $other->{ stop });  die "Bad timestamp '$other->{ stop }'"  unless $b_stop;

	# my $a_while_b = ($self->{ start }  >= $other->{ start } && $self->{ start }  < $other->{ stop });
	# my $b_while_a = ($other->{ start } >= $self->{ start }  && $other->{ start } < $self->{ stop });
	my $a_while_b = $a_start->cmp( $b_start ) >= 0 && $a_start->cmp( $b_stop ) < 0;
	my $b_while_a = $b_start->cmp( $a_start ) >= 0 && $b_start->cmp( $a_stop ) < 0;

	# ===== CONCURRENCY DEBUGGING
	# printf STDERR "%-40s%-10s%-10s vs. %-40s%-10s%-10s => %s\n", @{$self}{qw( id start stop )}, @{$other}{qw( id start stop )}, ($a_while_b || $b_while_a) ? 'OVERLAP' : 'INDEPENDENT';

	return $a_while_b || $b_while_a;
}

# ============================================================
sub match {
# ============================================================
	my $self    = shift;
	my $targets = shift;

	my $regex = {
		# ===== GENDERS
		coed       => { rank => 0, pattern => qr/coed/i },
		male       => { rank => 0, pattern => qr/\bmale/i },
		female     => { rank => 0, pattern => qr/\bfemale/i },

		# ===== EVENTS
		individual => { rank => 1, pattern => qr/individual/i },
		pair       => { rank => 1, pattern => qr/pair/i },
		team       => { rank => 1, pattern => qr/team/i },
		freestyle  => { rank => 2, pattern => qr/freestyle/i },

		# ===== AGES
		youth      => { rank => 3, pattern => qr/10-11|youth/i },
		cadet      => { rank => 3, pattern => qr/12-14|cadet/i },
		junior     => { rank => 3, pattern => qr/15-17|12-17|junior/i },
		under30    => { rank => 3, pattern => qr/18-30|under\s*30|-30|30-|senior(?!\s*(?:[2-9]\d*|0*1\d+))|senior\s*1/i },
		over30     => { rank => 3, pattern => qr/31-99|over\s*30|30\+/i },
		under40    => { rank => 3, pattern => qr/31-40|under\s*40|-40|40-|senior 2/i },
		under50    => { rank => 3, pattern => qr/41-50|under\s*50|-50|50-/i },
		under60    => { rank => 3, pattern => qr/51-60|under\s*60|-60|60-/i },
		under65    => { rank => 3, pattern => qr/61-65|under\s*65|-65|65-/i },
		over65     => { rank => 3, pattern => qr/66-99|over\s*65|65\+|66\+/i }
	};

	if( ! defined( $targets )) { $targets = [ $self ]; }

	my $lookup = {};
	foreach my $target (@$targets) {
		my $description = [];
		foreach $key (keys %$regex) {
			if( $target->{ description } =~ $regex->{ $key }{ pattern }) {
				push @$description, { text => $key, rank => $regex->{ $key }{ rank }};
			} 
		}
		$description = join ' ', map { $_->{ text } } sort { $a->{ rank } <=> $b->{ rank } } @$description;
		$lookup->{ $description } = $target;
	}
	if( $targets->[ 0 ] == $self ) {
		my $key = (keys %$lookup)[ 0 ];
		return $key;
	} else {
		return $lookup;
	}
}


# ============================================================
sub age {
# ============================================================
	my $self    = shift;

	my $regex = {
		youth      => { age => 10, pattern => qr/10-11|youth/i },
		cadet      => { age => 12, pattern => qr/12-14|cadet/i },
		junior     => { age => 15, pattern => qr/15-17|12-17|junior/i },
		under30    => { age => 18, pattern => qr/18-30|under\s*30|-30|30-|senior(?!\s*(?:[2-9]\d*|0*1\d+))|senior\s*1/i },
		over30     => { age => 31, pattern => qr/31-99|over\s*30|30\+/i },
		under40    => { age => 31, pattern => qr/31-40|under\s*40|-40|40-|senior 2/i },
		under50    => { age => 41, pattern => qr/41-50|under\s*50|-50|50-/i },
		under60    => { age => 51, pattern => qr/51-60|under\s*60|-60|60-/i },
		under65    => { age => 61, pattern => qr/61-65|under\s*65|-65|65-/i },
		over65     => { age => 66, pattern => qr/66-99|over\s*65|65\+|66\+/i }
	};
	foreach $key (keys %$regex) {
		return $regex->{ $key }{ age } if( $self->{ description } =~ $regex->{ $key }{ pattern });
	}
}

# ============================================================
sub overtime_for_day {
# ============================================================
	my $self = shift;
	my $day  = shift;

	return 0 unless exists $day->{ stop };

	my $day_stop   = new Date::Manip::Date( $day->{ stop });
	my $block_stop = new Date::Manip::Date( $self->{ stop });
	my $overtime = $day_stop->cmp( $block_stop ) > 0;

	return 1 if( $overtime );
}

# ============================================================
sub overtime_for_ring {
# ============================================================
	my $self = shift;
	my $ring = shift;

	return 0 unless defined $ring;
	return 0 unless exists $ring->{ stop };

	my $ring_stop  = new Date::Manip::Date( $ring->{ stop });
	my $block_stop = new Date::Manip::Date( $block->{ stop });
	my $overtime = $ring_stop->cmp( $block_stop ) > 0;

	return 1 if( $overtime );
}

# ============================================================
sub preconditions {
# ============================================================
	my $self   = shift;
	my @blocks = @_;

	push @{$self->{ require }{ precondition }}, map { $_->{ id } } @blocks;
}

# ============================================================
sub nonconcurrences {
# ============================================================
	my $self      = shift;
	my $divisions = shift;

	my $key       = $self->match();
	my $lookup    = $self->match( $divisions );

	my $nonconcurrencies = {
		"male individual youth"        => [ "pair youth", "male team youth" ],
		"female individual youth"      => [ "pair youth", "female team youth" ],
		"male team youth"              => [ "pair youth", "male individual youth" ],
		"female team youth"            => [ "pair youth", "female individual youth" ],
		"pair youth"                   => [ "male individual youth", "female individual youth", "male team youth", "female team youth" ],
		"male individual cadet"        => [ "pair cadet", "male team cadet" ],
		"female individual cadet"      => [ "pair cadet", "female team cadet" ],
		"male team cadet"              => [ "pair cadet", "male individual cadet" ],
		"female team cadet"            => [ "pair cadet", "female individual cadet" ],
		"pair cadet"                   => [ "male individual cadet", "female individual cadet", "male team cadet", "female team cadet" ],
		"male individual junior"       => [ "pair junior", "male team junior" ],
		"female individual junior"     => [ "pair junior", "female team junior" ],
		"male team junior"             => [ "pair junior", "male individual junior" ],
		"female team junior"           => [ "pair junior", "female individual junior" ],
		"pair junior"                  => [ "male individual junior", "female individual junior", "male team junior", "female team junior" ],
		"male individual under30"      => [ "pair under30", "male team under30" ],
		"female individual under30"    => [ "pair under30", "female team under30" ],
		"male team under30"            => [ "pair under30", "male individual under30" ],
		"female team under30"          => [ "pair under30", "female individual under30" ],
		"pair under30"                 => [ "male individual under30", "female individual under30", "male team under30", "female team under30" ],
		"male individual under40"      => [ "pair over30", "male team over30" ],
		"female individual under40"    => [ "pair over30", "female team over30" ],
		"male team over30"             => [ "pair over30", "male individual under40", "male individual under50", "male individual under60", "male individual under70", "male individual over65" ],
		"female team over30"           => [ "pair over30", "female individual under40", "female individual under50", "female individual under60", "female individual under70", "female individual over65" ],
		"pair over30"                  => [ "male individual under40", "female individual under40", "male individual under50", "female individual under50", "male individual under60", "female individual under60", "male individual under70", "female individual under70", "male individual over65", "female individual over65", "male team over30", "female team over30" ],
		"male individual under50"      => [ "pair over30", "male team over30" ],
		"female individual under50"    => [ "pair over30", "female team over30" ],
		"male individual under60"      => [ "pair over30", "male team over30" ],
		"female individual under60"    => [ "pair over30", "female team over30" ],
		"male individual under70"      => [ "pair over30", "male team over30" ],
		"female individual under70"    => [ "pair over30", "female team over30" ],
		"male individual over65"       => [ "pair over30", "male team over30" ],
		"female individual over65"     => [ "pair over30", "female team over30" ]
	};

	my $nonconcurrents = $nonconcurrencies->{ $key };
	foreach my $nonconcurrent (@$nonconcurrents) {
		my $division = $lookup->{ $nonconcurrent };
		push @{$self->{ require }{ nonconcurrent }}, @{$division->{ blocks }};
	}
}

1;
