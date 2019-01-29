#! /usr/bin/perl
use List::Util qw( first uniq );

sub bin ($);
sub which ($);

my $contains = {
	'GD::Barcode::UPCE' => 'GD::Barcode',
	'Mojolicious::Lite' => 'Mojolicious'
};

our $perl    = bin 'perl' || die "Perl not installed";
my  @modules = required_perl_modules();
my  @missing = missing_perl_modules( @missing );

test_for_network();

my @errors  = install_missing_modules( @missing );

install_history_system();
configure_system_services();

# ============================================================
sub which ($) {
# ============================================================
	my $command = shift;
	my $which = `which $command`;
	chomp $which;
	return $which;
}

# ============================================================
sub bin ($) {
# ============================================================
	my $bin = shift;

	my $found = first { -e $_ } ( which $bin, "/sbin/$bin", "/bin/$bin", "/usr/bin/$bin", "/usr/local/bin/$bin" );
	return $found;
}

# ============================================================
sub required_perl_modules {
# ============================================================
	my @modules = ();

	push @modules,
		grep { !/^(?:base|parent|warnings|strict|lib|Data::Dumper|FreeScore)/ } 
		map { 
			chomp;
			s/^use\s*//;
			s/\s\(?qw\([^)]+\)\)?//;
			s/;$//;
			s/\(\)$//;
			exists $contains->{ $_ } ? $contains->{ $_ } : $_;
		} `cd ../../ && grep -hir '^use' bin lib ../frontend/cgi-bin | sort | uniq`;

	return @modules;
}

# ============================================================
sub missing_perl_modules {
# ============================================================
	my @modules = @ARGV;
	my @missing = grep {
		my $test  = "$perl -M$_ -e 'exit();'";
		my $error = system( "$test 2>/dev/null" );
		$error;
	} uniq sort @modules;
	return @missing;
}

# ============================================================
sub test_for_network {
# ============================================================
	my $ping = bin 'ping' || die "Can't test network";
	my $error = system( "$ping -c 1 cpan.org" );
	die "Not connected to the network" if( $error );
}

# ============================================================
sub install_cpanm {
# ============================================================
# Use the curl utility to download cpanm
	my $curl = bin 'curl';
	if( ! $curl ) {
		my $aptget = bin 'apt-get' || die "No package manager for this system";
		my $error = system( "$aptget install -y curl" );
		$curl = bin 'curl';
		die "Failed to install module manager utility 'cpanm'" if( ! $curl || $error );
	}
	my $error = system( "curl -L https://cpanmin.us | $perl - --sudo App::cpanminus" );
	my $cpanm = bin 'cpanm';
	die "Failed to install module manager utility 'cpanm'" if( ! $cpanm || $error );

	return $cpanm;
}

# ============================================================
sub install_missing_modules {
# ============================================================
	my @missing = @ARGV;
	my $cpanm = bin 'cpanm';

	$cpanm = install_cpanm() if( ! $cpanm );

	my @errors = ( $error );
	foreach my $package (@missing) {
		my $error = system( "$cpanm --sudo $package" );
		push @errors, $error if( $error );
	}

	if( @errors ) {
		print STDERR "Failed to install needed Perl modules:\n\n";
		print STDERR map { "$_\n" } @errors;
		exit( 1 );
	}
}

# ============================================================
sub install_history_system {
# ============================================================
	my $rcs = bin 'rcs';
	return if $rcs;

	my $aptget = bin 'apt-get' || die "No package manager for this system";
	my $error  = system( "$aptget install -y rcs" );
	$rcs = bin 'rcs';
	die "Failed to install RCS history system" if( ! $rcs || $error );
}

# ============================================================
sub configure_system_services {
# ============================================================
	system( "systemctl enable sshd" );
	system( "systemctl start sshd" );
}
