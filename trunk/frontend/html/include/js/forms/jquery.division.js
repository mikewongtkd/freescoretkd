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

		var header      = e.header      = html.div.clone() .addClass( 'header default' );
		var icon        = e.icon        = html.div.clone() .addClass( 'sort-icon ui-icon ui-icon-arrowthick-2-n-s' );
		var name        = e.name        = html.div.clone() .addClass( 'name' ) .html( o.entry.name.toUpperCase() );
		var description = e.description = html.div.clone() .addClass( 'description' ) .html( o.entry.description );
		var controls    = e.controls    = html.div.clone() .addClass( 'controls' ) .hide();
		var size        = e.size        = html.div.clone() .addClass( 'size' ) .html( o.entry.athletes.length );
		var athletes    = e.athletes    = html.ul.clone();

		var edit        = e.edit        = html.div.clone() .addClass( 'editButton ui-icon ui-icon-pencil' );
		var restage     = e.restage     = html.div.clone() .addClass( 'restageButton ui-icon ui-icon-closethick' );
		var add         = e.edit        = html.div.clone() .addClass( 'stageButton ui-icon ui-icon-clock' );
		controls.append( edit, restage, add );

		if( o.isCurrent ) { header .removeClass( 'default' ) .addClass( 'current' ); } 
		else              { header .removeClass( 'current' ) .addClass( 'default' ); }

		var addScore    = {
			grassroots : function( score ) {
				var display = html.div.clone() .addClass( "score" );
				var value   = html.div.clone() .addClass( "value" ) .html( score > 0 ? score : "" );
				display.append( value );
				return display;
			},

			worldclass : function( score ) {
			},
		};
		for( var i = 0; i < o.entry.athletes.length; i++ ) {
			var athlete    = o.entry.athletes[ i ];
			var li         = html.li.clone() .addClass( "pendingAthlete" );
			var name       = html.div.clone() .addClass( "name" ) .html( athlete.name );
			if( typeof( o.entry.current ) !== 'undefined' && i == parseInt( o.entry.current )) { 
				li .removeClass( "pendingAthlete" ) .addClass( "currentAthlete" );
			}
			var finalScore = 0.0;
			li.append( name );
			for( var j = 0; j < athlete.scores.length; j++ ) {
				var score   = athlete.scores[ j ];
				var display;
				if      ( typeof( score.ki ) === 'undefined' ) { display = addScore.grassroots( score ); finalScore += score; } 
				else                                           { display = addScore.worldclass( score ); }
				display.css( "left", (j * 40) + 200 );
				li.append( display );
			}
			athletes.append( li );
		}

		header.append( e.icon, e.name, e.description, e.controls, e.size );
		athletes.hide();
		athletes.css( "height", "0" );

		o.open = false;

		header .click( function() {
			if( ! o.open ) {
				e.controls.fadeIn();
				var height = (o.entry.athletes.length + 1) * 20;
				athletes.show(); 
				athletes.animate({ height : height });
				widget.animate({ 'margin-bottom' : height + 4 });
				o.open = true;

			} else {
				e.controls.fadeOut();
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
