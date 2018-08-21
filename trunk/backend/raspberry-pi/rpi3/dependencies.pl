#! /usr/bin/perl
use List::Util qw( uniq );

my $contains = {
	'GD::Barcode::UPCE' => 'GD::Barcode',
	'Mojolicious::Lite' => 'Mojolicious'
};

my @modules = qw(
);

push @modules,
	grep { !/^(?:base|parent|warnings|strict|lib|Data::Dumper|FreeScore)/ } 
	map { 
		chomp;
		s/^use\s*//;
		s/\s\(?qw\([^)]+\)\)?//;
		s/;$//;
		exists $contains->{ $_ } ? $contains->{ $_ } : $_;
	} `cd ../../ && grep -hir '^use' bin lib ../frontend/cgi-bin | sort | uniq`;

@modules = uniq sort @modules;

print map { "$_\n" } @modules;
