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
		a     : $( "<a />" ), 
		div   : $( "<div />" ), 
		h1    : $( "<h1 />" ), 
		h2    : $( "<h2 />" ), 
		h3    : $( "<h3 />" ), 
		img   : $( "<img />" ), 
		li    : $( "<li />" ), 
		ol    : $( "<ol />" ), 
		p     : $( "<p />" ), 
		span  : $( "<span />" ), 
		table : $( "<table />" ), 
		td    : $( "<td />" ), 
		th    : $( "<th />" ), 
		tr    : $( "<tr />" ), 
		ul    : $( "<ul />" ), 
	}
};
