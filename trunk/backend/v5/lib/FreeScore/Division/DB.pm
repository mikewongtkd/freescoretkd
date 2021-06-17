package FreeScore::Division::DB
use base qw( FreeScore::Component );
use FreeScore;
use DBD::SQLite;
use JSON::XS;
use Scalar::Util qw( looks_like_number );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ db } = DBI->connect( "dbi:SQLite:dbname=$FreeScore::PATH/freescore.sqlite", '', '' );
	$self->{ schema } = {
		division => { name => 'string', header => 'json' },
		athlete  => { divid => 'string', aid => 'int', name => 'string', info => 'json' },
		form     => { divid => 'string', aid => 'int', rid => 'string', fid => 'int', info => 'json', decision => 'json', penalties => 'json' },
		judge    => { divid => 'string', aid => 'int', rid => 'string', fid => 'int', jid => 'int', score => 'json' },
		pool     => { divid => 'string', aid => 'int', rid => 'string', fid => 'int', jpid => 'string', score => 'json' },
		history  => { divid => 'string', pkey => 'json', timestamp => 'string', do => 'json', undo => 'json' }
	};
}

# ============================================================
sub read_division {
# ============================================================
#**
# @method ( name )
# @param {string} name - Division ID
# @brief Loads the division from the database
#*
	my $self = shift;

}

sub read_athlete {
}

sub read_form {
}

sub read_score {
}

sub read_pool {
}

sub write_division {
}

sub write_athlete {
}

sub write_form {
}

sub write_score {
}

sub write_pool {
}

# ============================================================
sub db_count {
# ============================================================
	my $self     = shift;
	my $table    = shift;
	my $pkey     = shift;

	my $dbh      = $self->{ db };
	my $pkselect = _primary_key_select( $pkey );
	my $count    = sprintf( "select count( * ) as count from %s where %s", $table, $pks );
	my $sth      = $dbh->prepare( $count );
	
	$sth->execute();

	my $row = $sth->fetch();
	return $row;
}

# ============================================================
sub db_read {
# ============================================================
	my $self     = shift;
	my $table    = shift;
	my $pkey     = shift;

	my $dbh      = $self->{ db };
	my $pkselect = _primary_key_select( $pkey );
	my $select   = sprintf( "select * from %s where %s", $table, $pkselect );
	my $sth      = $dbh->prepare( $select );
	
	$sth->execute();

	my $row = $sth->fetch();
	return $row;
}

# ============================================================
sub db_history {
# ============================================================
	my $self     = shift;
	my $table    = shift;
	my $pkey     = shift;
	my $do       = shift;
	my $undo     = shift;

	$do   = [ $do ]   unless ref $do;
	$undo = [ $undo ] unless ref $undo;

	foreach my $key (qw( table pkey do undo )) {
		push @$columns, $key;
		my $value = $updates->{ $key };
		my $type  = $typeof->{ $key } or die "Database error: $table.$key does not exist in schema $!";

		if   ( $type eq 'int'    ) { push @$values, _intify( $value );   }
		elsif( $type eq 'string' ) { push @$values, _stringify( $value ); }
		elsif( $type eq 'json'   ) { push @$values, _jsonify( $value ); }
		else { die "Database error: Unknown type '$type' for $table.$key $!"; }
	}

}

# ============================================================
sub db_write {
# ============================================================
	my $self     = shift;
	my $table    = shift;
	my $pkey     = shift;
	my $updates  = shift;
	my $dbh      = $self->{ db };
	my $record   = $self->db_count( $table, $pkey );
	my $pkselect = _primary_key_select( $pkey );
	my $sth      = undef;

	if( $record->{ count } == 1 ) {
		my $previous = db_read( $table, $pkselect );
		my $set      = $self->update_statement( $table, $updates );
		my $update   = sprintf( "update %s set %s where %s", $table, $set, $pkselect );

		$sth = $dbh->prepare( $update );

	} else {
		my ($cols, $vals) = $self->update_statement( $table, $updates, $pkey );
		my $insert = sprintf( "insert into %s (%s) values (%s)", $table, $cols, $vals );

		$sth = $dbh->prepare( $insert );
	}

	$sth->execute();
}

# ============================================================
sub insert_statement {
# ============================================================
	my $self      = shift;
	my $table     = shift;
	my $updates   = shift;
	my $pkey      = shift;
	my $schema    = $self->{ schema };
	my $typeof    = $schema->{ $table } or die "Database error: $table not found in schema $!";
	my $columns   = [];
	my $values    = [];
	my $statement = undef;
	my $json      = new JSON::XS();

	# Primary key (can be a compound key)
	foreach my $key (sort keys %$pkey) {
		push @$columns, $key;
		my $type = $typeof->{ $key } or die "Database error: $table.$key does not exist in the schema $!";

		if   ( $type eq 'int'    ) { push @$values, _intify( $value );   }
		elsif( $type eq 'string' ) { push @$values, _stringify( $value ); }
		else { die "Database error: Unknown type '$type' for $table.$key $!"; }
	}

	# Insert values
	foreach my $key (sort keys %$updates) {
		push @$columns, $key;
		my $value = $updates->{ $key };
		my $type  = $typeof->{ $key } or die "Database error: $table.$key does not exist in schema $!";

		if   ( $type eq 'int'    ) { push @$values, _intify( $value );   }
		elsif( $type eq 'string' ) { push @$values, _stringify( $value ); }
		elsif( $type eq 'json'   ) { push @$values, _jsonify( $value ); }
		else { die "Database error: Unknown type '$type' for $table.$key $!"; }
	}

	my $cols = join( ', ', @$columns );
	my $vals = join( ', ', @$values );

	return ($cols, $vals);
}

# ============================================================
sub update_statement {
# ============================================================
	my $self      = shift;
	my $table     = shift;
	my $updates   = shift;
	my $schema    = $self->{ schema };
	my $typeof    = $schema->{ $table } or die "Database error: $table not found in schema $!";
	my $statement = [];
	my $json      = new JSON::XS();

	foreach my $key (sort keys %$updates) {
		my $value = $updates->{ $key };
		my $type  = $typeof->{ $key } or die "Database error: $table.$key does not exist in schema $!";

		if   ( $type eq 'int'    ) { push @$statement, '$key=' . _intify( $value );    }
		elsif( $type eq 'string' ) { push @$statement, '$key=' . _stringify( $value ); }
		elsif( $type eq 'json'   ) { push @$statement, '$key=' . _jsonify( $value );   }
		else { die "Database error: Unknown type '$type' for $table.$key $!"; }
	}

	$statement = join( ', ', @$statement );
	return $statement;
}

# ============================================================
sub _primary_key_select {
# ============================================================
	my $pkey     = shift;
	my $criteria = [];

	foreach my $key (sort keys %$pkey) {
		my $value = $pkey->{ $key };
		$value = "'$value'" if( ! looks_like_number( $value ));
		push @$criteria, "$key=$value";
	}

	return join( ' and ', @$criteria );
}

sub _intify    { my $value = shift; return $value; }
sub _stringify { my $value = shift; $value =~ s/'/''/g; return "'$value'"; }
sub _jsonify   { my $value = shift; my $json = new JSON::XS(); $value = $json->canonical->encode( $value ); $value =~ s/'/''/g; return "'$value'"; }

1;
