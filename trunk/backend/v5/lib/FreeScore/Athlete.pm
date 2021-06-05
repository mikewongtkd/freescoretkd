package FreeScore::Athlete;
use base qw( FreeScore::Component );
use List::MoreUtils qw( first_index );

# ============================================================
sub current {
# ============================================================
#** @method ()
#   @brief Returns the current athlete
#*
	my $self     = shift;
	my $division = $self->parent();
	my $divid    = $division->{ name };
	my $aid      = $division->{ current }{ athlete };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid, $divid, $rid ) unless $i >= 0;

	return $self->select( $aid );
}

# ============================================================
sub first {
# ============================================================
#** @method ( [ rid ] )
#   @brief Returns the first athlete for the given round (current round is the default)
#*
	my $self     = shift;
	my $division = $self->parent();
	my $round    = $self->{ _round };
	my $rid      = shift || $round->id();
	my $order    = $division->{ order }{ $rid };

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
sub goto {
# ============================================================
#** 
# @method ( aid )
# @param
# @brief Returns the athlete ID (aid)
#*
	my $self     = shift;
	my $aid      = shift;
	my $division = $self->parent();
	my $divid    = $division->{ name };
	my $rid      = $division->{ current }{ round };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;
	my $n        = $#$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid->[ $i ], $divid, $rid ) unless $i >= 0;
	return undef if( $i >= $n );
	my $athlete  = $self->select( $aid );
	my $fid      = $division->event->form->first->id();
	$division->{ current }{ athlete } = $aid;
	$division->{ current }{ form }    = $fid;

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
sub info {
# ============================================================
#**
# @method ( key => value, ... )
# @param {...key-value-pair} key => value - One or more key-value pairs
# @param {string} key - Request value for a given key
# @param no parameters - Request the info hash (all info values)
# @brief Sets form info if information key-value pairs are provided. Returns a single value if a single key is provided. Returns all form info if no parameters given.
#*
	my $self = shift;
	my @info = @_;

	$self->{ info } = {} unless exists $self->{ info };

	if( @info == 0 ) {
		return $self->{ info };

	} elsif( @info == 1 ) {
		my $name = shift @info;
		return undef unless exists $self->{ info }{ $name };
		return $self->{ info }{ $name };

	} else {
		my %info = @info;
		foreach $name (keys %info) {
			my $value = $info{ $name };
			if( $value eq '' ) { delete $self->{ info }{ $name };   } 
			else               { $self->{ info }{ $name } = $value; }
		}
		return $self->{ info };
	}
}

# ============================================================
sub last_name {
# ============================================================
	my $self  = shift;
	my $name  = $self->{ name };
	my @names = split /\s/, $name;
	my @last  = grep { $_ eq uc( $_ ) } @names;

	return join ' ', @first;
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
	my $divid    = $division->{ name };
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;
	my $n        = $#$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid->[ $i ], $divid, $rid ) unless $i >= 0;
	return undef if( $i >= $n );
	my $j        = $i + 1;
	my $naid     = $order->[ $j ]; # next athlete ID
	my $athlete  = $self->select( $naid );
	my $fid      = $division->event->form->first->id();
	$division->{ current }{ athlete } = $naid;
	$division->{ current }{ form }    = $fid;

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
	my $divid    = $division->{ name };
	my $aid      = $division->{ current }{ athlete };
	my $rid      = $division->{ current }{ round };
	my $order    = $division->{ order }{ $rid };
	my $i        = first_index { $_ == $aid } @$order;

	die sprintf( "Division configuration error: Current athlete ID is '%d', who is not in the ordering for %s %s", $aid, $divid, $rid ) unless $i >= 0;
	return undef if( $i == 0 );
	my $j        = $i - 1;
	my $paid     = $order->[ $j ]; # previous athlete ID
	my $athlete  = $self->select( $paid );
	$division->{ current }{ athlete } = $paid;
	$division->{ current }{ form }    = $fid;

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

1;
