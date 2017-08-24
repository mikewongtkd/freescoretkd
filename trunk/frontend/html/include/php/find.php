<?php
	function find( $path, $found = [] ) {
		if( is_dir( $path )) {
			$files = glob( $path .'*', GLOB_MARK );
			foreach( $files as $file ) {
				$found = find( $file, $found );
			}
		} else {
			array_push( $found, $path );
		}
		return $found;
	}
?>
