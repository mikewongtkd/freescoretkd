<?
class REST {
	function get_param( $key, $default = null ) {
		if( ! isset( $_GET[ $key ])) { return $default; }

		return $_GET[ $key ];
	}

	function lsgrep( $path, $regex ) {
		return array_values( array_filter( scandir( $path ), function( $item ) use ( $regex ) { return preg_match( $regex, $item ); }));
	}

}
