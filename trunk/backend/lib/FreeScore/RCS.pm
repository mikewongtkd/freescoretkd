package FreeScore::RCS;

use Data::Dumper;

# Provides support for data file versioning and history;
# where FreeScore::Repository provides support for software
# updates via Git

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
	$self->{ ci }  = `which ci`;
	$self->{ co }  = `which co`;
	$self->{ log } = `which rlog`;
	foreach (qw( ci co log )) { chomp $self->{ $_ }; }
	$self->{ available } = $self->{ ci } && $self->{ co } && $self->{ log };
}

# ============================================================
sub available { my $self = shift; return $self->{ available }; }
# ============================================================

# ============================================================
sub checkout {
# ============================================================
	my $self        = shift;
	my $target      = shift;
	my $file        = $target->{ file } or die "No file specified for RCS checkout $!";
	my $description = $target->{ description } || "$file";

	my @history = $self->history( $target );

	# ===== INITIAL CHECK-IN, IF NO PREVIOUS HISTORY
	if( ! @history ) {
		$description =~ s/'/\\'/g;
		`$self->{ ci } -t-'$description' -u $file`;
	}

	my $command = "$self->{ co } -l $file 2>/dev/null";
	system( $command );
}

# ============================================================
sub commit {
# ============================================================
	my $self    = shift;
	my $target  = shift;
	my $message = shift;
	my $file    = $target->{ file } or die "No file specified for RCS commit $!";

	chomp $message;
	$message =~ s/'/\\'/g;
	$message = "-m'$message'" if( $message );
	my $command = "$self->{ ci } -u $message $file 2>/dev/null";
	system( $command );
}

# ============================================================
sub history {
# ============================================================
	my $self        = shift;
	my $target      = shift;
	my $file        = $target->{ file } or die "No file specified for RCS history $!";
	my @log         = split /\n/, `$self->{ log } $file 2>/dev/null`;
	my $current     = {};
	my @history     = ();

	while( @log ) {
		local $_ = shift @log;

		if( /^revision (\d+\.\d+)/ ) {
			if( exists $current->{ revision }) {
				push @history, $current;
				$current = {};
			}
			$current->{ revision } = $1;
		}
		if( /^date: ([^;]+);/ ) {
			$current->{ datetime }    = $1;
			$current->{ description } = shift @log;
		}
	}
	push @history, $current if( exists $current->{ revision });

	return @history;
}

# ============================================================
sub restore {
# ============================================================
	my $self        = shift;
	my $target      = shift;
	my $version     = shift;
	my $file        = $target->{ file } or die "No file specified for RCS history $!";

	my $command = "co -r$version $file 2>/dev/null";
	system( $command );
}

1;
