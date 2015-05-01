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
		a        : $( "<a />" ), 
		div      : $( "<div />" ), 
		fieldset : $( "<fieldset />" ), 
		form     : $( "<form />" ), 
		h1       : $( "<h1 />" ), 
		h2       : $( "<h2 />" ), 
		h3       : $( "<h3 />" ), 
		h4       : $( "<h4 />" ), 
		label    : $( "<label />" ), 
		legend   : $( "<legend />" ), 
		img      : $( "<img />" ), 
		text     : $( "<input type=\"text\" />" ), 
		textarea : $( "<textarea />" ), 
		li       : $( "<li />" ), 
		ol       : $( "<ol />" ), 
		option   : $( "<option />" ), 
		p        : $( "<p />" ), 
		radio    : $( "<input type=\"radio\" />" ), 
		search   : $( "<input type=\"search\" />" ), 
		select   : $( "<select />" ), 
		span     : $( "<span />" ), 
		table    : $( "<table />" ), 
		td       : $( "<td />" ), 
		th       : $( "<th />" ), 
		tr       : $( "<tr />" ), 
		ul       : $( "<ul />" ), 
	}
};
String.prototype.capitalize = function() {
	return this.charAt( 0 ).toUpperCase() + this.slice( 1 );
}

// ============================================================
var addButtonGroup = function( name, buttons, handler ) {
// ============================================================
	var html      = FreeScore.html;
	var fieldset  = html.fieldset.clone() .attr( "data-role", "controlgroup" ) .attr( "data-type", "horizontal" ) .attr( "data-mini", "true" ) .attr( "data-inline", true );
	var legend    = html.legend.clone() .html( name );
	var groupName = name.toLowerCase().replace( / /g, '-' );
	fieldset.append( legend );
	for( var i in buttons ) {
		var inputName = name.toLowerCase().replace( / /g, '-' ) + '-' + i;
		var input = html.radio.clone() .attr( "name", groupName ) .attr( "id", inputName ) .attr( "value", buttons[ i ] );
		var label = html.label.clone() .attr( "for", inputName ) .html( buttons[ i ] );
		fieldset.append( input, label );
	}
	fieldset.children( "input:radio" ).on( "change", handler );
	return fieldset;
}

// ============================================================
// SORT DELEGATE FUNCTIONS
// ============================================================
var numeric = function( a, b ) { return a - b; };
