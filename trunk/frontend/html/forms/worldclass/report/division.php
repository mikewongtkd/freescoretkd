<?php

class Division {
	private ?string $divid;
	private ?int $ring;
	private ?string $file;

	function __construct( $divid = null, $ring = null ) {
		if( $divid && $ring ) {
			$this->divid = $divid;
			$this->ring  = $divid;
			$this->file  = "/usr/local/freescore/data/test/forms-worldclass/$ring/div.$divid.txt";
		}
	}
}

?>
