package FreeScore::Form;
use base qw( FreeScore::Component );

# ============================================================
sub current {
# ============================================================
	my $self     = shift;
	my $division = $self->{ _parent };
	my $athlete  = $division->athlete->current();
	my $rid      = $division->{ current }{ round };
	my $fid      = $division->{ current }{ form };

	# Autovivify form datastructure
	if( ! exists $athlete->{ scores }{ $rid }) { $athlete->{ scores }{ $rid } = { forms => [ {} ]}; }
	if( $fid > 0 ) { $athlete->{ scores }{ $rid }{ forms }[ $_ ] ||= {} foreach ( 1 .. $fid ); }

	my $form     = $athlete->{ scores }{ $rid }{ forms }[ $fid ];

	return $form;
}

1;
