package FreeScore;
use List::MoreUtils qw( first_index );
use Scalar::Util qw( looks_like_number );

our $PATH = "/usr/local/freescore/data";

# ============================================================
sub has {
# ============================================================
	my $self = shift;
	my @keys = @ARGV;

	if( $self->isa( 'HASH' )) {
		my $node = $self;
		foreach my $key (@keys) {
			if( exists $node->{ $key } && defined $node->{ $key } ) {
				$node = $node->{ $key };
			} else {
				return undef;
			}
		}
		return $node;
	}

	if( $self->isa( 'ARRAY' )) {
		my $has = 1;
		foreach my $key (@keys) {
			my $is_num = looks_like_number( $key );
			if( $is_num ) { return undef if( (first_index { $_ == $key } @$self) < 0 ); }
			else          { return undef if( (first_index { $_ eq $key } @$self) < 0 ); }
		}
	}

	return undef;
}

1;
