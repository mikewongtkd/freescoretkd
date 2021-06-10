package FreeScore::Division;
use base qw( FreeScore::Clonable );
use FreeScore;
use FreeScore::Athlete;
use FreeScore::Clock;
use FreeScore::Form;
use FreeScore::Round;

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
	my $self = shift;
	my $file = shift;

	my $cache = $self->read_header( $file ) if( $file );

	# Default values
	$self->{ event }  = 'recognized' unless $self->{ event };
	$self->{ method } = 'cutoff'     unless $self->{ method };

	$self->{ _athlete } = new FreeScore::Athlete( $self );
	$self->{ _clock }   = new FreeScore::Clock( $self );
	$self->{ _event }   = FreeScore::Event->factory( $self );
	$self->{ _method }  = FreeScore::Method->factory( $self );
	$self->{ _round }   = new FreeScore::Round( $self );

}

# ============================================================
sub judges {
# ============================================================
	my $self = shift;
	return $self->{ judges };
}

# ============================================================
sub read {
# ============================================================
#**
# @method ( file )
# @param {string} file - Absolute path to the file
# @brief Calls Method::read_division to read the division/match file
#*
	my $self   = shift;
	my $file   = shift;
	my $method = $self->method();

	my $cache = $self->read_header( $file );
	$method->read_body( $cache );
}

# ============================================================
sub read_header {
# ============================================================
#**
# @method ( file )
# @param {string} file - Absolute path to the file
# @brief Calls Method::read_division to read the division/match file
#*
	my $self     = shift;
	my $file     = shift;
	my $division = $self->parent();
	my @file     = split /\//, $file;
	my $div      = shift @file;
	my $ring     = shift @file;
	my $json     = new JSON::XS();

	$division->{ _file } = $file;
	$division->{ _ring } = $ring;

	my $name = $div;
	$name =~ s/^(?:div)//;
	$name =~ s/\.txt$//;

	$division->{ name } = $name;
	my ($evcode, $divnum, $group, $subgroup, $match) = $name =~ /(([a-z]+)(\d+)([a-z]+?)(\d+?)(?:\.(m\d+)?)/;

	die "File I/O Error: Division filename missing event code $!"      unless $evcode;
	die "File I/O Error: Division filename missing division number $!" unless $divnum;

	# Read file and filter empty lines
	open my $fh, $file or die "Can't read '$file' $!";
	my @cache = grep { ! /^\s*$/ } <$fh>;
	close $fh;

	# Headers
	while( $cache[ 0 ] =~ /^# \w/ ) {
		my $header = shift @cache;
		$header =~ s/^#\s*//;
		my ($key, $value) = split /=/, $header, 2;
		$division->{ $key } = $json->decode( $value );
	}

	return $cache;
}

# ============================================================
sub update {
# ============================================================
	my $self       = shift;
	my $event      = $self->event();
	my $method     = $self->method();
	my $round      = $self->round->current();
	my $rid        = $round->id();
	my $athletes   = $round->athletes();
	my $placements = [];

	if( $event->form->complete()) {
		$placements = $round->place( $athletes );
		$self->{ placement }{ $rid } = $placements;
	}

	if( $self->round->complete()) {
		my $next = $self->round->next();
		my $nrid = $next->id();

		$self->{ order }{ $nrid } = $next->advance( $placements );
	}
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	my @blacklist = qw( file name path );
	my $json      = new JSON::XS();

	open my $fh, $self->{ file } or die "Can't write $self->{ name } to $self->{ file } $!";

	# Headers
	foreach my $key (keys %$self) {
		next if $key =~ /^_/;
		next if $key eq 'athletes';
		next if grep { $key eq $_ } @blacklist;

		unbless( $self->{ $key });
		printf $fh "# %s=%s\n", $key, $json->canonical->encode( $self->{ $key });
	}

	# Division body
	my $round = $division->round->first();
	do { $round->write( $fh ); } while( $round = $round->next());

	close $fh;
}

# ============================================================
# COMPONENTS
# ============================================================
sub athlete { my $self = shift; return $self->{ _athlete }; }
sub clock   { my $self = shift; return $self->{ _clock };   }
sub event   { my $self = shift; return $self->{ _event };   }
sub method  { my $self = shift; return $self->{ _method };  }
sub round   { my $self = shift; return $self->{ _round };   }

1;
