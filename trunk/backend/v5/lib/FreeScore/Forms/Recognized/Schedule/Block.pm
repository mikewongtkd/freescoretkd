package FreeScore::Forms::WorldClass::Schedule::Block;

use List::MoreUtils qw( uniq );
use Date::Manip;
use FreeScore::Forms::WorldClass::Schedule;
use POSIX qw( ceil );

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
	my $schedule = shift;
	my $division = shift;
	my $athletes = shift;
	my $round    = shift;
	my $flight   = shift;
	my @id       = ();
	my $forms    = exists $division->{ forms } && defined $division->{ forms } && exists $division->{ forms }{ $round } ? int( @{$division->{ forms }{ $round }}) : 1;
	my $t        = $schedule->{ settings }{ time }{ recognized } * $athletes;

	if( exists $division->{ freestyle }) { $forms = 1; $t = $schedule->{ settings }{ time }{ freestyle } * $athletes; }

	$self->{ athletes }    = $athletes;
	$self->{ division }    = $division->{ name };
	$self->{ description } = $division->{ description };
	$self->{ round }       = $round;
	$self->{ flight }      = $flight || '';
	$self->{ duration }    = $forms * $t;
	$self->{ duration }    = 5 * ceil( $self->{ duration } / 5 ); # Round to nearest 5 minutes for rendering purposes

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

	# If the precondition hasn't been planned yet, then it is clearly not satisfied
	return 0 unless $other->{ day };

	# If the precondition is scheduled for a later date, then it is clearly not satisfied
	return 0 if( $self->{ day } < $other->{ day }); 

	my $a   = _parse_utc( $self->{ start });
	my $b   = _parse_utc( $other->{ start });
	my $cmp = $a->cmp( $b );

	return $cmp > 0;
}

# ============================================================
sub is_concurrent {
# ============================================================
	my $self  = shift;
	my $other = shift;

	return 0 unless $other->{ start } && $other->{ stop }; # Other has not yet been planned
	return 0 unless ( $self->{ day } == $other->{ day });  # Different day, no problems here
	
	my $a_start = _parse_utc( $self->{ start });
	my $a_stop  = _parse_utc( $self->{ stop });
	my $b_start = _parse_utc( $other->{ start });
	my $b_stop  = _parse_utc( $other->{ stop });

	my $a_while_b = $a_start->cmp( $b_start ) >= 0 && $a_start->cmp( $b_stop ) < 0;
	my $b_while_a = $b_start->cmp( $a_start ) >= 0 && $b_start->cmp( $a_stop ) < 0;

	return $a_while_b || $b_while_a;
}

# ============================================================
sub match {
# ============================================================
	my $self    = shift;
	my $targets = shift;

	my $regex = {
		# ===== EVENT
		freestyle  => { rank => 0, pattern => qr/freestyle/i },

		# ===== GENDERS
		mixed      => { rank => 1, pattern => qr/mixed/i },
		male       => { rank => 1, pattern => qr/\b(?:male|men)/i },
		female     => { rank => 1, pattern => qr/\b(?:female|women)/i },

		# ===== SUBEVENTS
		individual => { rank => 2, pattern => qr/individual/i },
		pair       => { rank => 2, pattern => qr/pair/i },
		team       => { rank => 2, pattern => qr/team/i },

		# ===== AGES
		under5     => { rank => 3, pattern => qr/4-5|under\s*5/i },
		under7     => { rank => 3, pattern => qr/6-7|under\s*7/i },
		under9     => { rank => 3, pattern => qr/8-9|under\s*9/i },
		under11    => { rank => 3, pattern => qr/10-11|youth|under\s*11/i },
		cadet      => { rank => 3, pattern => qr/12-14|cadet/i },
		junior     => { rank => 3, pattern => qr/15-17|12-17|junior/i },
		under17    => { rank => 3, pattern => qr/12-17|under\s*17|17\-|\-17/i },
		over17     => { rank => 3, pattern => qr/18-99|over\s*17|17\+/i },
		under30    => { rank => 3, pattern => qr/18-30|under\s*30|-30|30-|senior(?!\s*(?:[2-9]\d*|0*1\d+))|senior\s*1/i },
		over30     => { rank => 3, pattern => qr/31-99|over\s*30|30\+|31\+|\+30|\+31/i },
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
		junior     => { age => 15, pattern => qr/15-17|junior/i },
		under17    => { age => 15, pattern => qr/12-17|under\s*17/i },
		under30    => { age => 18, pattern => qr/18-30|under\s*30|-30|30-|senior(?!\s*(?:[2-9]\d*|0*1\d+))|senior\s*1/i },
		over17     => { age => 18, pattern => qr/18-99|over\s*17|17\+|18\+/i },
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

	return "under30"; # Default is Senior
}

# ============================================================
sub overtime_for_day {
# ============================================================
	my $self = shift;
	my $day  = shift;

	return 0 unless exists $day->{ stop } && exists $self->{ stop };

	my $day_stop   = _parse_utc( $day->{ stop });
	my $block_stop = _parse_utc( $self->{ stop });
	my $overtime   = $block_stop->cmp( $day_stop ) > 0;

	return 1 if( $overtime );
}

# ============================================================
sub overtime_for_ring {
# ============================================================
	my $self = shift;
	my $ring = shift;

	return 0 unless defined $ring;
	return 0 unless exists $ring->{ stop };

	my $ring_stop  = _parse_utc( $ring->{ stop });
	my $block_stop = _parse_utc( $self->{ stop });
	my $overtime   = $block_stop->cmp( $ring_stop ) > 0;

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
	my $schedule  = shift;
	my $divisions = shift;

	my $key       = $self->match();
	my $lookup    = $self->match( $divisions );

	my $criteria  = $schedule->{ conflicts }; 
	my $conflicts = $criteria->{ $key };
	foreach my $conflict (@$conflicts) {
		my $division = $lookup->{ $conflict };
		push @{$self->{ require }{ nonconcurrent }}, @{$division->{ blocks }};
	}
}

# ============================================================
sub _parse_utc {
# ============================================================
	my $datetime = shift;
	my $d        = new Date::Manip::Date();
	my $UTC      = $FreeScore::Forms::WorldClass::Schedule::UTC;

	$d->parse_format( $UTC, $datetime );
	return $d;
}

1;
