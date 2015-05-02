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
	},
	rulesUSAT : { 
		// 2015 Rules, updated 5/1/2015

		// ------------------------------------------------------------
		poomsaeEvents : function() { return [ "Individual", "Pair", "Team" ]; },
		// ------------------------------------------------------------

		// ------------------------------------------------------------
		ageGroups : function( format ) {
		// ------------------------------------------------------------
			if( format == 'Team' ) { return [ "6-9", "10-11", "12-14", "15-17", "18-29", "30-39", "40+" ]; } else
			if( format == 'Pair' ) { return [ "6-9", "10-11", "12-14", "15-17", "18-29", "30-39", "40+" ]; } else
			/* Individual */       { return [ "6-7", "8-9", "10-11", "12-14", "15-17", "18-29", "30-39", "40-49", "50-59", "60-64", "65+" ]; }
		},

		// ------------------------------------------------------------
		recognizedPoomsae : function( format, age, rank ) {
		// ------------------------------------------------------------
			var allForms = [ 
				'Taegeuk 1', 'Taegeuk 2', 'Taegeuk 3', 'Taegeuk 4', 'Taegeuk 5', 
				'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 
				'Taebaek', 'Pyongwon', 'Sipjin', 'Jitae', 'Chonkwon', 'Hansu'
			];
			var forms = [];
			if( rank == 'Yellow'       ) { forms = allForms.splice( 0, 2 ); } else
			if( rank == 'Green'        ) { forms = allForms.splice( 0, 4 ); } else
			if( rank == 'Blue'         ) { forms = allForms.splice( 0, 5 ); } else
			if( rank == 'Red'          ) { forms = allForms.splice( 0, 8 ); } else
			{
				var age = parseInt( age );
				if( format == 'Team' ) {
					if( age <=  9 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 11 ) { forms = allForms.splice( 2, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 5, 8 ); } else // Seniors
									{ forms = allForms.splice( 7, 8 ); }      // 1st Masters

				} else if( format == 'Pair' ) {
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 5, 8 ); } else // Seniors
									{ forms = allForms.splice( 7, 8 ); }      // 1st Masters
				} else { // Individual
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 40 ) { forms = allForms.splice( 5, 8 ); } else // Seniors
					if( age <= 50 ) { forms = allForms.splice( 7, 8 ); } else // 1st Masters
									{ forms = allForms.splice( 8, 8 ); }      // 2nd/3rd Masters
				}
			}
			return forms;
		},
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
