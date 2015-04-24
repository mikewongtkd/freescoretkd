function defined( x ) { return ((typeof( x ) !== 'undefined') && (x != null)); }
function ordinal( x ) {
	var d = x % 10;
	if      ( x > 10 && x < 14 ) { return x + 'th'; }
	else if ( d == 1           ) { return x + 'st'; }
	else if ( d == 2           ) { return x + 'nd'; }
	else if ( d == 3           ) { return x + 'rd'; }
	else                         { return x + 'th'; }
}
var FreeScore = { 
	html : { 
		a      : $( "<a />" ), 
		div    : $( "<div />" ), 
		form   : $( "<form />" ), 
		h1     : $( "<h1 />" ), 
		h2     : $( "<h2 />" ), 
		h3     : $( "<h3 />" ), 
		h4     : $( "<h4 />" ), 
		img    : $( "<img />" ), 
		text   : $( "<input type=\"text\" />" ), 
		li     : $( "<li />" ), 
		ol     : $( "<ol />" ), 
		option : $( "<option />" ), 
		p      : $( "<p />" ), 
		search : $( "<input type=\"search\" />" ), 
		select : $( "<select />" ), 
		span   : $( "<span />" ), 
		table  : $( "<table />" ), 
		td     : $( "<td />" ), 
		th     : $( "<th />" ), 
		tr     : $( "<tr />" ), 
		ul     : $( "<ul />" ), 
	}
};
String.prototype.capitalize = function() {
	return this.charAt( 0 ).toUpperCase() + this.slice( 1 );
}
