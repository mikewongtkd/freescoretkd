#! /usr/bin/perl
use List::Util qw( first uniq );

sub which ($);

my $contains = {
	'GD::Barcode::UPCE' => 'GD::Barcode',
	'Mojolicious::Lite' => 'Mojolicious'
};

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

my $perl = first { -e $_ } ( which 'perl', '/usr/bin/perl', '/usr/local/bin/perl' );
my @missing = grep {
	my $test  = "$perl -M$_ -e 'exit();'";
	my $error = system( "$test 2>/dev/null" );
	$error;
} uniq sort @modules;

# Test for network
my ($ping) = grep { -e $_ } ( which 'ping', '/sbin/ping', '/bin/ping' );
die "Can't test network" if( ! -e $ping );
my $error = system( "$ping -c 1 cpan.org" );
die "Not connected to the network" if( $error );

# Network connected, try to install missing packages
my ($cpanm) = grep { -e $_ } ( which 'cpanm', '/usr/bin/cpanm', '/usr/local/bin/cpanm' );

if( ! $cpanm ) {
	my ($curl) = grep { -e $_ } ( which 'curl', '/usr/bin/curl', '/usr/local/bin/curl' );
	if( ! $curl ) {
		my ($aptget) = grep { -e $_ } ( which 'apt-get', '/sbin/apt-get', '/usr/bin/apt-get', '/usr/local/bin/apt-get' );
		$error = system( "$aptget install -y curl" );
		($curl) = grep { -e $_ } ( which 'curl', '/usr/bin/curl', '/usr/local/bin/curl' );
		die "Failed to install required libraries" if( ! $curl || $error );
	}
	$error = system( "curl -L https://cpanmin.us | perl - --sudo App::cpanminus" );
	my ($cpanm) = grep { -e $_ } ( which 'cpanm', '/usr/bin/cpanm', '/usr/local/bin/cpanm' );
	die "Failed to install required libraries" if( ! -e $cpanm || $error );
}

my @errors = ( $error );
foreach my $package (@missing) {
	$error = system( "$cpanm --sudo $package" );
	push @errors, $error if( $error );
}

if( @errors ) {
	print map { "$_\n" } @errors;
	exit( 1 );
} else {
	print "All dependencies satisfied.\n";
	exit( 0 );
}

sub which ($) {
	my $command = shift;
	my $which = `which $command`;
	chomp $which;
	return $which;
}
