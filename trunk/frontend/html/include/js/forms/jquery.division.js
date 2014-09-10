/*
 * Ideas:
 *
 * Pagination
 * Search for division name, description, or athlete
 * Divisions are sortable; use "connectWith" option for jQuery Sortable to tie together the different pages
 *
 * Name Description ... #Athletes
 */
$.widget( "freescore.division", {
	options: { autoShow: true  },
	_create: function() {
		var widget      = this.element;
		var o           = this.options;
		var e           = this.options.elements = {};
		var html        = e.html = { div : $( "<div />" ), span : $( "<span />" ) };

		var header      = e.header      = html.div.clone() .addClass( 'header' );
		var icon        = e.icon        = html.div.clone() .addClass( 'sort-icon ui-icon ui-icon-arrowthick-2-n-s' );
		var name        = e.name        = html.div.clone() .addClass( 'name' ) .html( o.entry.name.toUpperCase() );
		var description = e.description = html.div.clone() .addClass( 'description' ) .html( o.entry.description );
		var size        = e.size        = html.div.clone() .addClass( 'size' ) .html( o.entry.athletes.length );

		header.append( icon, name, description, size );

		widget .addClass( 'division' );
		widget .append( header );
	},
	_init: function( ) {
		var widget   = this.element;
		var e        = this.options.elements;
		var h        = this.options.elements.html;
		var o        = this.options;
	}
});
