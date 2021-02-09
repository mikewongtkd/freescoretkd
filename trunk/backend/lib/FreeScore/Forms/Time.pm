package FreeScore::Forms::Time;
use Time::Piece;
use Statistics::Descriptive;

our $UTC_TIME_FORMAT = '%Y-%m-%dT%H:%M:%sZ'; # YYYY-MM-DDTHH:MM:SSZ

=pod

API usage: 

my $time = $division->time( [$round] );

Internal usage:

my $time = new FreeScore::Forms::Time( complete => [ <timestamps> ], pending => int );

=cut

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
	my $forms = { @_ };

	$self->{ complete } = $forms->{ complete };
	$self->{ pending }  = $forms->{ pending };

	$self->_calc_stats();
}

# ============================================================
sub estimated_remaining {
# ============================================================
# Returns the estimated time (s) remaining
# ------------------------------------------------------------
	my $self = shift;
	my $x    = $self->mean_per_form;
	return int( $self->forms_pending() * $x );
}

# ============================================================
sub forms_completed {
# ============================================================
# Returns the number of forms performed so far
# ------------------------------------------------------------
	my $self = shift;
	return int( @{$self->{ complete }});
}

# ============================================================
sub forms_pending {
# ============================================================
# Returns the number of forms yet to be performed
# ------------------------------------------------------------
	my $self = shift;
	return $self->{ pending };
}

# ============================================================
sub forms_total {
# ============================================================
# Returns the total number of forms for this round
# ------------------------------------------------------------
	my $self = shift;
	return $self->forms_completed() + $self->forms_pending();
}

# ============================================================
sub latest {
# ============================================================
# Returns the timestamp for the last completed form
# ------------------------------------------------------------
	my $self   = shift;

	return undef if( @{ $self->{ complete }} == 0 );

	my $sorted = [ sort { $b - $a } map { Time::Piece->strptime( $_, $UTC_TIME_FORMAT ) } @{ $self->{ complete }}];
	my $latest = $sorted->[ -1 ];
	return $latest;
}

# ============================================================
sub percent {
# ============================================================
# Returns the percentage of forms completed
# ------------------------------------------------------------
	my $self = shift;
	my $c = $self->forms_completed();
	my $t = $self->forms_total();
	return 0 + sprintf( "%d", int( 100 * $c/$t ));
}

# ============================================================
sub per_form {
# ============================================================
# Returns the mean time (s) per form in this round of the division
# ------------------------------------------------------------
	my $self = shift;
	return $self->{ stats }->mean();
}

# ============================================================
sub taken {
# ============================================================
# Returns the amount of time (s) the division has taken so far
# ------------------------------------------------------------
	my $self = shift;
	return $self->{ stats }->sample_range();
}

# ============================================================
sub standard_deviation_per_form {
# ============================================================
# Returns the standard deviation of time (s) per form in this round of the division
# ------------------------------------------------------------
	my $self = shift;
	return $self->{ stats }->standard_deviation();
}

# ============================================================
sub _calc_stats {
# ============================================================
	my $self = shift;

	my $stats = $self->{ stats } = new Statistics::Descriptive::Full();
	if( @{$self->{ complete }} < 2 ) { return; }

	my $sorted = [ sort { $b - $a } map { Time::Piece->strptime( $_, $UTC_TIME_FORMAT ) } @{ $self->{ complete }}];
	$self->{ _sorted } = $sorted;
	
	foreach my $i ( 0 .. $#$sorted - 1 ) {
		my $j = $i + 1;
		my $a = $sorted->[ $i ];
		my $b = $sorted->[ $j ];
		my $s = $b - $a;
		my $duration = $s->seconds();
		$stats->add_data( $duration );
	}
}

1;
