package FreeScore::Tournament;

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
	my $self   = shift;
	$self->{ config } = '/var/www/html/freescore/include/php/config.php';
	$self->{ php2pl } = '/usr/local/freescore/test/include/vars.php';
	if( -e $self->{ config } && -e $self->{ php2pl } ) {
		my $json = new JSON::XS();
		my $php = `cat $self->{ config } $self->{ php2pl } | php`;
		my ($host, $tournament) = @{ $json->decode( $php )};
		$self->{ host }       = $host;
		$self->{ tournament } = $tournament;
		$self->{ json }       = $json;
	} else {
		die "Can't find Tournament Configuration File '$config' and/or PHP-to-Perl adapter '$php2pl' $!";
	}
}

# ============================================================
sub rings {
# ============================================================
	my $self = shift;
	my @pairs = ();
	foreach my $key (sort keys %{ $self->{ rings }}) {
		if( $key eq "enabled" ) {
			my $value = "[ " . join( ", ", @{$self->{ rings }{ $key }}) . " ]";
			push @pairs, "\"$key\" => $value";
			

		} else {
			my $value = $self->{ rings }{ $key };
			$value = $value =~ /^\d+$/ ? int( $value ) : "\"$value\"";
			push @pairs, "\"$key\" => $value";
		}
	}
	return join( ", ", @pairs );
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	my $rings = $self->rings();
	open FILE, ">$self->{ config }" or die "Can't write to '$self->{ config }' $!";
	print FILE<<EOF;
<?php
	\$host = "$self->{ host }";
	\$tournament = json_encode( [
		"name"  => "$self->{ name }",
		"db"    => "$self->{ db }",
		"rings" => [ $rings ]
	]);
?>
EOF
	close FILE;
}

1;
