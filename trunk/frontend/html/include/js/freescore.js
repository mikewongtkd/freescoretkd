var module = {};
function defined( x ) { return ((typeof( x ) !== 'undefined') && (x !== null)); }
function ordinal( x ) {
	var d = parseInt( x ) % 10;
	if      ( x > 10 && x < 14 ) { return x + 'th'; }
	else if ( d == 1           ) { return x + 'st'; }
	else if ( d == 2           ) { return x + 'nd'; }
	else if ( d == 3           ) { return x + 'rd'; }
	else                         { return x + 'th'; }
}
var FreeScore = { 
	html : { 
		a        : $( "<a />" ), 
		button   : $( "<button />" ), 
		checkbox : $( "<input type=\"checkbox\" />" ), 
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
		strong   : $( "<strong />" ), 
		table    : $( "<table />" ), 
		tbody    : $( "<tbody />" ), 
		thead    : $( "<thead />" ), 
		td       : $( "<td />" ), 
		th       : $( "<th />" ), 
		tr       : $( "<tr />" ), 
		ul       : $( "<ul />" ), 
	},
	round : {
		order : [ 'prelim', 'semfin', 'finals', 'ro8a', 'ro8b', 'ro8c', 'ro8d', 'ro4a', 'ro4b', 'r02' ],
		name  : { 'prelim' : 'Preliminary', 'semfin' : 'Semi-Finals', 'finals' : 'Finals', 'ro8a' : '1st Finals', 'ro8b' : '1st Finals', 'ro8c': '1st Finals', 'ro8d' : '1st Finals', 'ro4a' : '2nd Finals', 'ro4b' : '2nd Finals', 'r02' : '3rd Finals' },
	},
	rulesUSAT : { 
		// 2015 Rules, updated 5/1/2015
		// ------------------------------------------------------------
		genders : function() { return [ "Female", "Male", "Male & Female" ]; },
		// ------------------------------------------------------------
		
		// ------------------------------------------------------------
		ranks : function() { return [ "Yellow Belt", "Green Belt", "Blue Belt", "Red Belt", "Black Belt" ]; },
		// ------------------------------------------------------------

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
			if( rank == 'Yellow' || rank == 'y' ) { forms = allForms.splice( 0, 2 ); } else
			if( rank == 'Green'  || rank == 'g' ) { forms = allForms.splice( 0, 4 ); } else
			if( rank == 'Blue'   || rank == 'b' ) { forms = allForms.splice( 0, 5 ); } else
			if( rank == 'Red'    || rank == 'r' ) { forms = allForms.splice( 0, 8 ); } else
			{
				age = parseInt( age );
				if( isNaN( age )) { return allForms; }
				if( format.match( /team/i ) ) {
					if( age <=  9 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 11 ) { forms = allForms.splice( 2, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 5, 8 ); } else // Seniors
									{ forms = allForms.splice( 7, 8 ); }      // 1st Masters

				} else if( format.match( /pair/i ) ) {
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 5, 8 ); } else // Seniors
									{ forms = allForms.splice( 7, 8 ); }      // 1st Masters
				} else { // Individual
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <  40 ) { forms = allForms.splice( 5, 8 ); } else
					if( age <  50 ) { forms = allForms.splice( 7, 8 ); } else
					if( age <  60 ) { forms = allForms.splice( 8, 8 ); } else
					if( age <  65 ) { forms = allForms.splice( 8, 8 ); } else
					                { forms = allForms.splice( 8, 8 ); }     
				}
			}
			return forms;
		},
	},
	websocket : {}
};
String.prototype.capitalize = function() {
	return this.charAt( 0 ).toUpperCase() + this.slice( 1 );
};

$.fn.exists = function () {
    return this.length !== 0;
}

// ============================================================
var addButtonGroup = function( name, buttons ) {
// ============================================================
	var html      = FreeScore.html;
	var fieldset  = html.fieldset.clone() .attr({ "data-role": "controlgroup", "data-type": "horizontal", "data-mini": true, "data-inline": true });
	var legend    = html.legend.clone() .html( name );
	var groupName = name.toLowerCase().replace( / /g, '-' );
	var eventName = name.replace( /[\-_ ]/g, '' );
	fieldset.append( legend );
	fieldset.controlgroup();
	var container = fieldset.controlgroup( 'container' );
	for( var i in buttons ) {
		var inputName = name.toLowerCase().replace( / /g, '-' ) + '-' + i;
		var input = html.radio.clone() .attr({ name: groupName, id: inputName, value: buttons[ i ] });
		var label = html.label.clone() .attr( "for", inputName ) .html( buttons[ i ] );
		container.append( input, label );
	}
	var buttons = container.find( ':radio' );
	setTimeout( function() { // 100ms delay apparently allows instantiation to complete, improving reliability of event being triggered
		buttons.on( "change", function() {
			var val = $( this ).val();
			var id  = $( this ).attr( 'id' );

			var ev  = $.Event( "buttonGroup" + eventName, { value : val, id : id } );
			$( this ).trigger( ev );
		});
	}, 100 );
	return fieldset;
};

// ============================================================
// SORT DELEGATE FUNCTIONS
// ============================================================
var numeric = function( a, b ) { return a - b; };

// ============================================================
// WEBSOCKET ERROR CODES AND DESCRIPTIONS
// ============================================================
FreeScore.websocket.errorDescription = function( error ) {
	if     (error.code == 1000) error.description = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
	else if(error.code == 1001) error.description = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
	else if(error.code == 1002) error.description = "An endpoint is terminating the connection due to a protocol error";
	else if(error.code == 1003) error.description = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
	else if(error.code == 1004) error.description = "Reserved. The specific meaning might be defined in the future.";
	else if(error.code == 1005) error.description = "No status code was actually present.";
	else if(error.code == 1006) error.description = "The connection was refused. Check to see if the FreeScore World Class service is running.";
	else if(error.code == 1007) error.description = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
	else if(error.code == 1008) error.description = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
	else if(error.code == 1009) error.description = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
	else if(error.code == 1010) error.description = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason; // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
	else if(error.code == 1011) error.description = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
	else if(error.code == 1015) error.description = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
	else                        error.description = "Unknown reason";
	return error.description;
}
