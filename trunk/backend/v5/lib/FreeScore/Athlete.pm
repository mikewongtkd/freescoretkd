package FreeScore::Athlete;
use base qw( FreeScore::Component );
use List::MoreUtils qw( first_index );
use JSON::XS;

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;

	$self->SUPER::init( $parent );

	$self->{ _info } = new FreeScore::Info( $self );
}

# ============================================================
sub current {
# ============================================================
#** 
# @method ( aid )
# @param {int} [ aid ] - Athlete ID
# @brief Returns the current athlete or sets the current athlete if athlete ID given
#*
	my $self     = shift;
	my $aid      = shift; $aid = $division->athlete->current->id() unless defined $aid;
	my $division = $self->parent();
	my $round    = $division->round();
	my $divid    = $division->{ name };
	my $order    = $round->info->get( 'order' );
	my $i        = first_index { $_ == $aid } @$order;

	$division->info->current->athlete( $aid );

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid, $divid, $rid ) unless $i >= 0;

	return $self->select( $aid );
}

# ============================================================
sub first {
# ============================================================
#** 
# @method ( rid )
# @param {string} [rid] - Round ID
# @brief Returns the first athlete for the given round (current round is the default)
#*
	my $self     = shift;
	my $division = $self->parent();
	my $round    = $self->{ _round };
	my $order    = $round->info->get( 'order' );

	die "Division configuration error: No athletes assigned to $rid $!" if( @$order == 0 );

	my $aid = $order->[ 0 ];

	return $self->select( $aid );
}

# ============================================================
sub first_name {
# ============================================================
	my $self  = shift;
	my $name  = $self->{ name };
	my @names = split /\s/, $name;
	my @first = grep { $_ ne uc( $_ ) } @names;

	return join ' ', @first;
}

# ============================================================
sub form {
# ============================================================
#** @method ( rid, fid )
#   @brief Returns the requested form, or undef if it doesn't exist
#*
	my $self     = shift;
	my $rid      = shift;
	my $fid      = shift;
	my $division = $self->parent();
	my $athlete  = $self->current();
	my $form     = $division->{ _form };

	$rid = ref $rid ? $rid->id() : $rid;
	$fid = ref $fid ? $fid->id() : $fid;

	return undef unless( exists $athlete->{ scores }{ $rid })
	return undef unless defined $athlete->{ scores }{ $rid }{ forms }[ $fid ];

	return $form->context( $athlete->{ scores }{ $rid }{ forms }[ $fid ]);
}

# ============================================================
sub forms {
# ============================================================
#** 
# @method ( rid )
# @param {string} rid - Round ID
# @brief Returns the forms for the given round
#*
	my $self = shift;
	return $self->{ scores }{ $rid }{ forms };
}

# ============================================================
sub goto {
# ============================================================
#** 
# @method ( aid )
# @param {int} aid - Athlete ID
# @brief Returns the athlete ID (aid)
#*
	my $self     = shift;
	my $aid      = shift;
	my $division = $self->parent();
	my $ring     = $division->parent();
	my $divid    = $division->{ name };
	my $rid      = $ring->round->current->id();
	my $order    = $round->info->get( 'order' );
	my $i        = first_index { $_ == $aid } @$order;
	my $n        = $#$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid->[ $i ], $divid, $rid ) unless $i >= 0;
	return undef if( $i >= $n );
	my $athlete  = $self->select( $aid );
	my $fid      = $division->event->form->first->id();
	$division->athlete->current->id( $aid );
	$division->form->current->id( $fid );

	return $athlete;
}

# ============================================================
sub id {
# ============================================================
#** 
# @method ()
# @brief Returns the athlete ID (aid)
#*
	my $self = shift;
	return $self->{ id };
}

# ============================================================
sub last_name {
# ============================================================
	my $self  = shift;
	my $name  = $self->{ name };
	my @names = split /\s/, $name;
	my @last  = grep { $_ eq uc( $_ ) } @names;

	return join ' ', @last;
}

# ============================================================
sub name {
# ============================================================
	my $self = shift;
	return $self->{ name };
}

# ============================================================
sub next {
# ============================================================
#** 
# @method ()
# @brief Navigates to and returns the next athlete in the current round
#*
	my $self     = shift;
	my $division = $self->parent();
	my $ring     = $division->parent();
	my $divid    = $division->{ name };
	my $aid      = $division->athlete->current->id();
	my $rid      = $ring->round->current->id();
	my $order    = $round->info->get( 'order' );
	my $i        = first_index { $_ == $aid } @$order;
	my $n        = $#$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid->[ $i ], $divid, $rid ) unless $i >= 0;
	return undef if( $i >= $n );
	my $j        = $i + 1;
	my $naid     = $order->[ $j ]; # next athlete ID
	my $athlete  = $self->select( $naid );
	my $fid      = $division->event->form->first->id();
	$division->athlete->current->id( $naid );
	$division->form->current->id( $fid );

	return $athlete;
}

# ============================================================
sub previous {
# ============================================================
#** 
# @method ()
# @brief Navigates to and returns the previous athlete in the current round
#*
	my $self     = shift;
	my $division = $self->parent();
	my $ring     = $division->parent();
	my $divid    = $division->{ name };
	my $aid      = $division->athlete->current->id();
	my $rid      = $ring->round->current->id();
	my $order    = $round->info->get( 'order' );
	my $i        = first_index { $_ == $aid } @$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid, $divid, $rid ) unless $i >= 0;
	return undef if( $i == 0 );
	my $j        = $i - 1;
	my $paid     = $order->[ $j ]; # previous athlete ID
	my $athlete  = $self->select( $paid );
	$division->athlete->current->id( $paid );
	$division->form->current->id( $fid );

	return $athlete;
}

# ============================================================
sub select {
# ============================================================
#** 
# @method ( aid )
# @brief Returns the athlete corresponding to the Athlete ID (aid). Does not change the current athlete.
#*
	my $self     = shift;
	my $aid      = shift;
	my $division = $self->parent();
	my $athletes = $division->{ athletes };
	die "Athlete::select() bounds error: $aid is beyond bounds [ 0, $#$athletes ] $!" if( $aid < 0 || $aid > $#$athletes );

	my $athlete  = $self->context( $athletes->[ $aid ]);

	$athlete->{ id } = $aid;

	return $athlete;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;
	my $fh   = shift;
	my $rid  = shift;

	my $json = new JSON::XS();
	my $info = $self->{ info };
	my $name = $self->{ name };

	if( ! $info ) { print $fh "$name\n"; }
	else          { printf $fh "%s\t%s\n", $name, $json->canonical->encode( $info ); }

	foreach my $form ( @{ $athlete->forms( $rid )}) { $form->write( $fh, $rid ); }
}

# ============================================================
# COMPONENTS
# ============================================================
sub info { my $self = shift; return $self->{ _info }; }

1;
