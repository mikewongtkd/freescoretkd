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
		var html        = e.html = { div : $( "<div />" ), span : $( "<span />" ), ul : $( "<ul />" ), li : $( "<li />" ) };

		var header      = e.header      = html.div.clone() .addClass( 'header' );
		var icon        = e.icon        = html.div.clone() .addClass( 'sort-icon ui-icon ui-icon-arrowthick-2-n-s' );
		var name        = e.name        = html.div.clone() .addClass( 'name' ) .html( o.entry.name.toUpperCase() );
		var description = e.description = html.div.clone() .addClass( 'description' ) .html( o.entry.description );
		var size        = e.size        = html.div.clone() .addClass( 'size' ) .html( o.entry.athletes.length );

		var athletes    = e.athletes    = html.ul.clone();
		for( var i = 0; i < o.entry.athletes.length; i++ ) {
			var athlete   = o.entry.athletes[ i ];
			var li        = html.li.clone();
			var name      = html.div.clone() .addClass( "name" ) .html( athlete.name );
			var score     = html.div.clone();
			var edit      = html.div.clone();
			li.append( name );
			athletes.append( li );
		}

		header.append( e.icon, e.name, e.description, e.size );
		athletes.hide();
		athletes.css( "height", "0" );

		o.open = false;

		header .click( function() {
			if( ! o.open ) {
				var height = (o.entry.athletes.length + 1) * 20;
				athletes.show(); 
				athletes.animate({ height : height });
				widget.animate({ 'margin-bottom' : height + 4 });
				o.open = true;

			} else {
				athletes.animate({ height : 0 }, 500, function() { athletes.hide(); } );
				widget.animate({ 'margin-bottom' : 4 });
				o.open = false;
			}
		});

		widget .addClass( 'division' );
		widget .append( header, athletes );
	},
	_init: function( ) {
		var widget   = this.element;
		var e        = this.options.elements;
		var h        = this.options.elements.html;
		var o        = this.options;

		var refresh  = function( update ) {
			var division = JSON.parse( update.data );
		}
	}
});
