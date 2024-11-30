package FreeScore::Forms::WorldClass::Method::SingleElimination;
use base qw( FreeScore::Forms::WorldClass::Method );

our @rounds = [
	{ code => 'ro256', name => 'Round of 256',  matches => 128, min => 129, max => 256 },
	{ code => 'ro128', name => 'Round of 128',  matches => 64,  min => 65,  max => 128 },
	{ code => 'ro64',  name => 'Round of 64',   matches => 32,  min => 33,  max => 64  },
	{ code => 'ro32',  name => 'Round of 32',   matches => 16,  min => 17,  max => 32  },
	{ code => 'ro16',  name => 'Round of 16',   matches => 8,   min => 9,   max => 16  },
	{ code => 'ro8',   name => 'Quarterfinals', matches => 4,   min => 5,   max => 8   },
	{ code => 'ro4',   name => 'Semifinals',    matches => 2,   min => 3,   max => 4   },
	{ code => 'ro2',   name => 'Finals',        matches => 1,   min => 1,   max => 2   }
];

# ============================================================
sub distribute_evenly {
# ============================================================
#** @method ( group_name_array, athlete_array )
#   @brief Uniformly distributes the athletes across the array of groups for bracketed round assignments
#*
	my $self   = shift;
	my $groups = shift;
	my $queue  = shift || [ ( 0 .. $#{ $div->{ athletes }} ) ];
	my $i      = 0;
	my $k      = int( @$groups );
	while( @$queue ) {
		my $j     = shift @$queue;
		my $group = $groups->[ $i ];
		$div->assign( $j, $group );
		$i = ($i + 1) % $k;
	}
}

# ============================================================
sub initialize {
# ============================================================
#** @method ()
#   @brief Normalizes the division object.
#*
	my $self   = shift;
	my $div    = $self->{ division };
	my $judges = $div->{ judges };
	my $round  = $div->{ round };

	$div->{ state } ||= 'score';
	$div->{ form }  ||= 0;

	# ===== ASSIGN ALL ATHLETES TO THE DEFINED ROUND
	if( defined $round ) {
		die "Division Configuration Error: No forms defined for round '$round' $!" unless defined $div->{ forms }{ $round };
		my $order = $div->{ order }{ $round };
		$self->distribute_evenly(

	# ===== NO ROUND DEFINED; FIGURE OUT WHICH ROUND TO START WITH, GIVEN THE NUMBER OF ATHLETES
	} else {
		foreach my $round ($self->rounds()) {
		}
	}
}


