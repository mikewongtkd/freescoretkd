package FreeScore::Forms::WorldClass::Division;
use FreeScore;
use FreeScore::Forms::Division;
use base qw( FreeScore::Forms::Division );
use Data::Dumper;

our @criteria = qw( major minor rhythm power ki );

# ============================================================
sub record_score {
# ============================================================
	my $self  = shift;
	my $judge = shift;
	my $score = shift;

	my $i = $self->{ current };
	my $j = $self->{ round } - 1;

	$self->{ athletes }[ $i ]{ scores }[ $j ][ $judge ] = $score;
}

# ============================================================
sub read {
# ============================================================
	my $self  = shift;
	my $index = 0;
	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			$self->{ $key } = $value;
			next;
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns  = split /\t/;
		my $athlete  = shift @columns;
		my $rank     = shift @columns;
		my @scores   = ();
		while( @columns ) {
			my $round_scores = shift @columns || undef;
			if( defined $round_scores ) {
				my @judge_scores = split /;/, $round_scores;
				my $score = [];
				foreach my $judge_score (@judge_scores) {
					my $individual_score = {};
					@{$individual_score}{ @criteria } = map { sprintf "%.1f", $_; } split /\//, $judge_score;
					push @$score, $individual_score;
				}
				push @scores, $score;

			} else {
				push @scores, [];
			}
		}
		push @{ $self->{ athletes }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ] };
		$index++;
	}
	close FILE;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	print FILE "# round=$self->{ round }\n";
	print FILE "# judges=$self->{ judges }\n";
	print FILE "# forms=$self->{ forms }\n";
	my $rounds = int( split /,/, $self->{ forms } );
	foreach my $athlete (@{ $self->{ athletes }}) {
		my $scores = $athlete->{ scores };
		my @scores = ();
		foreach my $judge_scores (@$scores) {
			my @judge_scores = ();
			foreach my $judge_score (@$judge_scores) {
				push @judge_scores, join( "/", (map { $judge_score->{ $_ }; } @criteria));
			}
			push @scores, join( ";", @judge_scores );
		}
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @scores), "\n";
	}
	close FILE;
}

1;
