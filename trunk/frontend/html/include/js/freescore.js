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
		small    : $( "<small />" ), 
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
		order : [ 'prelim', 'ro256', 'ro128', 'ro64', 'ro32', 'semfin', 'ro16', 'finals', 'ro8', 'ro4', 'ro2' ],
		name  : { 'prelim' : 'Preliminary Round', 'ro256' : 'Round of 256', 'ro128' : 'Round of 128', 'ro64' : 'Round of 64', 'ro32' : 'Round of 32', 'semfin' : 'Semi-Finals Round', 'ro16' : 'Round of 16', 'finals' : 'Finals Round', 'ro8' : 'Quarter-Finals Round (Ro8)', 'ro4' : 'Semi-Finals Round (Ro4)', 'ro2' : 'Finals Round (Ro2)' },
	},
	rulesWT2024 : { 
		// 2024 Rules, updated 3/18/2025
		// ------------------------------------------------------------
		genders : function() { return [ "Female", "Male", "Coed" ]; },
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
			if( format == 'Team' ) { return [ "6-9", "10-11", "12-14", "15-17", "18-30", "31+" ]; } else
			if( format == 'Pair' ) { return [ "6-9", "10-11", "12-14", "15-17", "18-30", "31+" ]; } else
			/* Individual */       { return [ "6-7", "8-9", "10-11", "12-14", "15-17", "18-30", "31-40", "41-50", "51-60", "61-65", "66+" ]; }
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
			if( rank == 'Blue'   || rank == 'b' ) { forms = allForms.splice( 0, 6 ); } else
			if( rank == 'Red'    || rank == 'r' ) { forms = allForms.splice( 0, 8 ); } else
			{
				age = parseInt( age );
				if( isNaN( age )) { return allForms; }
				if( format.match( /team/i ) ) {
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 8 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 4, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 6, 8 ); } else // Under 30
					if( age <= 50 ) { forms = allForms.splice( 7, 8 ); } else // Under 50
					if( age <= 60 ) { forms = allForms.splice( 8, 8 ); } else // Under 60
									{ forms = allForms.splice( 8, 8 ); }      // Over 60

				} else if( format.match( /pair/i ) ) {
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 8 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 4, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 6, 8 ); } else // Under 30
					if( age <= 50 ) { forms = allForms.splice( 7, 8 ); } else // Under 50
					if( age <= 60 ) { forms = allForms.splice( 8, 8 ); } else // Under 60
									{ forms = allForms.splice( 8, 8 ); }      // Over 60
				} else { // Individual
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 8 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 4, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 6, 8 ); } else
					if( age <= 40 ) { forms = allForms.splice( 6, 8 ); } else
					if( age <= 50 ) { forms = allForms.splice( 7, 8 ); } else
					if( age <= 60 ) { forms = allForms.splice( 8, 8 ); } else
					if( age <= 65 ) { forms = allForms.splice( 8, 8 ); } else
					                { forms = allForms.splice( 8, 8 ); }     
				}
			}
			return forms;
		},
		sparring : {
			weight_classes: ( age, gender, weight ) => {
				var inf = Infinity;
				var divisions = {
					'{"name":"dragons","min":6,"max":7}' : {
						'female' : [
							{ 'range' : '19.0kg-',     'name' : 'fin' },
							{ 'range' : '19.1-23.0kg', 'name' : 'light' },
							{ 'range' : '23.1-27.0kg', 'name' : 'middle' },
							{ 'range' : '27.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '19.0kg-',     'name' : 'fin' },
							{ 'range' : '19.1-23.0kg', 'name' : 'light' },
							{ 'range' : '23.1-27.0kg', 'name' : 'middle' },
							{ 'range' : '27.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"tigers","min":8,"max":9}' : {
						'female' : [
							{ 'range' : '21.0kg-',     'name' : 'fin' },
							{ 'range' : '21.1-25.0kg', 'name' : 'light' },
							{ 'range' : '25.1-30.0kg', 'name' : 'middle' },
							{ 'range' : '30.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '21.0kg-',     'name' : 'fin' },
							{ 'range' : '21.1-25.0kg', 'name' : 'light' },
							{ 'range' : '25.1-30.0kg', 'name' : 'middle' },
							{ 'range' : '30.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"youth","min":10,"max":11}' : {
						'female' : [
							{ 'range' : '30.0kg-',     'name' : 'fin' },
							{ 'range' : '30.1-35.0kg', 'name' : 'light' },
							{ 'range' : '35.1-40.0kg', 'name' : 'middle' },
							{ 'range' : '40.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '30.0kg-',     'name' : 'fin' },
							{ 'range' : '30.1-35.0kg', 'name' : 'light' },
							{ 'range' : '35.1-40.0kg', 'name' : 'middle' },
							{ 'range' : '40.1kg+',     'name' : 'heavy' },
						],
					},
					'{"name":"cadet","min":12,"max":14}' : {
						'female' : [
							{ 'range' : '29.0kg-',     'name' : 'fin' },
							{ 'range' : '29.1-33.0kg', 'name' : 'fly' },
							{ 'range' : '33.1-37.0kg', 'name' : 'bantam' },
							{ 'range' : '37.1-41.0kg', 'name' : 'feather' },
							{ 'range' : '41.1-44.0kg', 'name' : 'light' },
							{ 'range' : '44.1-47.0kg', 'name' : 'welter' },
							{ 'range' : '47.1-51.0kg', 'name' : 'light middle' },
							{ 'range' : '51.1-55.0kg', 'name' : 'middle' },
							{ 'range' : '55.1-59.0kg', 'name' : 'light heavy' },
							{ 'range' : '59.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '33.0kg-',     'name' : 'fin' },
							{ 'range' : '33.1-37.0kg', 'name' : 'fly' },
							{ 'range' : '37.1-41.0kg', 'name' : 'bantam' },
							{ 'range' : '41.1-45.0kg', 'name' : 'feather' },
							{ 'range' : '45.1-49.0kg', 'name' : 'light' },
							{ 'range' : '49.1-53.0kg', 'name' : 'welter' },
							{ 'range' : '53.1-57.0kg', 'name' : 'light middle' },
							{ 'range' : '57.1-61.0kg', 'name' : 'middle' },
							{ 'range' : '61.1-65.0kg', 'name' : 'light heavy' },
							{ 'range' : '65.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"junior","min":15,"max":17}' : {
						'female' : [
							{ 'range' : '42.0kg-',     'name' : 'fin' },
							{ 'range' : '42.1-44.0kg', 'name' : 'fly' },
							{ 'range' : '44.1-46.0kg', 'name' : 'bantam' },
							{ 'range' : '46.1-49.0kg', 'name' : 'feather' },
							{ 'range' : '49.1-52.0kg', 'name' : 'light' },
							{ 'range' : '52.1-55.0kg', 'name' : 'welter' },
							{ 'range' : '55.1-59.0kg', 'name' : 'light middle' },
							{ 'range' : '59.1-63.0kg', 'name' : 'middle' },
							{ 'range' : '63.1-68.0kg', 'name' : 'light heavy' },
							{ 'range' : '68.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '45.0kg-',     'name' : 'fin' },
							{ 'range' : '45.1-48.0kg', 'name' : 'fly' },
							{ 'range' : '48.1-51.0kg', 'name' : 'bantam' },
							{ 'range' : '51.1-55.0kg', 'name' : 'feather' },
							{ 'range' : '55.1-59.0kg', 'name' : 'light' },
							{ 'range' : '59.1-63.0kg', 'name' : 'welter' },
							{ 'range' : '63.1-68.0kg', 'name' : 'light middle' },
							{ 'range' : '68.1-73.0kg', 'name' : 'middle' },
							{ 'range' : '73.1-78.0kg', 'name' : 'light heavy' },
							{ 'range' : '78.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"senior","min":17,"max":32}' : {
						'female' : [
							{ 'range' : '46.0kg-',     'name' : 'fin' },
							{ 'range' : '46.1-49.0kg', 'name' : 'fly' },
							{ 'range' : '49.1-53.0kg', 'name' : 'bantam' },
							{ 'range' : '53.1-57.0kg', 'name' : 'feather' },
							{ 'range' : '57.1-62.0kg', 'name' : 'light' },
							{ 'range' : '62.1-67.0kg', 'name' : 'welter' },
							{ 'range' : '67.1-73.0kg', 'name' : 'middle' },
							{ 'range' : '73.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '54.0kg-',     'name' : 'fin' },
							{ 'range' : '54.1-58.0kg', 'name' : 'fly' },
							{ 'range' : '58.1-63.0kg', 'name' : 'bantam' },
							{ 'range' : '63.1-68.0kg', 'name' : 'feather' },
							{ 'range' : '68.1-74.0kg', 'name' : 'light' },
							{ 'range' : '74.1-80.0kg', 'name' : 'welter' },
							{ 'range' : '80.1-87.0kg', 'name' : 'middle' },
							{ 'range' : '87.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"ultra","min":33,"max":40}' : {
						'female' : [
							{ 'range' : '49.0kg-',     'name' : 'fin' },
							{ 'range' : '49.1-57.0kg', 'name' : 'light' },
							{ 'range' : '57.1-67.0kg', 'name' : 'middle' },
							{ 'range' : '67.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '58.0kg-',     'name' : 'fin' },
							{ 'range' : '58.1-68.0kg', 'name' : 'light' },
							{ 'range' : '68.1-80.0kg', 'name' : 'middle' },
							{ 'range' : '80.1kg+',     'name' : 'heavy' },
						],
					},
					'{"name":"ultra","min":41,"max":50}' : {
						'female' : [
							{ 'range' : '49.0kg-',     'name' : 'fin' },
							{ 'range' : '49.1-57.0kg', 'name' : 'light' },
							{ 'range' : '57.1-67.0kg', 'name' : 'middle' },
							{ 'range' : '67.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '58.0kg-',     'name' : 'fin' },
							{ 'range' : '58.1-68.0kg', 'name' : 'light' },
							{ 'range' : '68.1-80.0kg', 'name' : 'middle' },
							{ 'range' : '80.1kg+',     'name' : 'heavy' },
						],
					},
					'{"name":"ultra","min":51,"max":99}' : {
						'female' : [
							{ 'range' : '49.0kg-',     'name' : 'fin' },
							{ 'range' : '49.1-57.0kg', 'name' : 'light' },
							{ 'range' : '57.1-67.0kg', 'name' : 'middle' },
							{ 'range' : '67.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '58.0kg-',     'name' : 'fin' },
							{ 'range' : '58.1-68.0kg', 'name' : 'light' },
							{ 'range' : '68.1-80.0kg', 'name' : 'middle' },
							{ 'range' : '80.1kg+',     'name' : 'heavy' },
						],
					}

				};
				var division = undefined;
				var ageclass = Object.keys( divisions ).find( d => { let div = JSON.parse( d ); return age == `${div.min}-${div.max}` });

				if( defined( ageclass ))  { division = divisions[ ageclass ]; } else { console.log( `Unknown age ${age} for weight classes` ); return undefined; }
				if( gender in division  ) { division = division[ gender ];    } else { console.log( `Unknown gender ${gender} for weight classes` ); return undefined; }

				if( ! defined( weight ))   { return division; }
				return division.find( d => { return d.min > weight && d.max <= weight; });
			}
		}
	},
	rulesUSAT2020 : { 
		// 2020 Rules, updated 2/06/2020
		// ------------------------------------------------------------
		genders : function() { return [ "Female", "Male", "Coed" ]; },
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
			if( format == 'Team' ) { return [ "6-9", "10-11", "12-14", "15-17", "18-30", "31+" ]; } else
			if( format == 'Pair' ) { return [ "6-9", "10-11", "12-14", "15-17", "18-30", "31+" ]; } else
			/* Individual */       { return [ "6-7", "8-9", "10-11", "12-14", "15-17", "18-30", "31-40", "41-50", "51-60", "61-65", "66+" ]; }
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
			if( rank == 'Blue'   || rank == 'b' ) { forms = allForms.splice( 0, 6 ); } else
			if( rank == 'Red'    || rank == 'r' ) { forms = allForms.splice( 0, 8 ); } else
			{
				age = parseInt( age );
				if( isNaN( age )) { return allForms; }
				if( format.match( /team/i ) ) {
					if( age <=  9 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 11 ) { forms = allForms.splice( 2, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 5, 8 ); } else // Under 30
									{ forms = allForms.splice( 7, 8 ); }      // Over 30

				} else if( format.match( /pair/i ) ) {
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 30 ) { forms = allForms.splice( 5, 8 ); } else // Under 30
									{ forms = allForms.splice( 7, 8 ); }      // Over 30
				} else { // Individual
					if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
					if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
					if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
					if( age <= 40 ) { forms = allForms.splice( 5, 8 ); } else
					if( age <= 50 ) { forms = allForms.splice( 7, 8 ); } else
					if( age <= 60 ) { forms = allForms.splice( 8, 8 ); } else
					if( age <= 65 ) { forms = allForms.splice( 8, 8 ); } else
					                { forms = allForms.splice( 8, 8 ); }     
				}
			}
			return forms;
		},
		sparring : {
			weight_classes: ( age, gender, weight ) => {
				var inf = Infinity;
				var divisions = {
					'{"name":"dragons","min":6,"max":7}' : {
						'female' : [
							{ 'range' : '19.0kg-',     'name' : 'fin' },
							{ 'range' : '19.1-23.0kg', 'name' : 'light' },
							{ 'range' : '23.1-27.0kg', 'name' : 'middle' },
							{ 'range' : '27.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '19.0kg-',     'name' : 'fin' },
							{ 'range' : '19.1-23.0kg', 'name' : 'light' },
							{ 'range' : '23.1-27.0kg', 'name' : 'middle' },
							{ 'range' : '27.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"tigers","min":8,"max":9}' : {
						'female' : [
							{ 'range' : '21.0kg-',     'name' : 'fin' },
							{ 'range' : '21.1-25.0kg', 'name' : 'light' },
							{ 'range' : '25.1-30.0kg', 'name' : 'middle' },
							{ 'range' : '30.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '21.0kg-',     'name' : 'fin' },
							{ 'range' : '21.1-25.0kg', 'name' : 'light' },
							{ 'range' : '25.1-30.0kg', 'name' : 'middle' },
							{ 'range' : '30.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"youth","min":10,"max":11}' : {
						'female' : [
							{ 'range' : '30.0kg-',     'name' : 'fin' },
							{ 'range' : '30.1-35.0kg', 'name' : 'light' },
							{ 'range' : '35.1-40.0kg', 'name' : 'middle' },
							{ 'range' : '40.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '30.0kg-',     'name' : 'fin' },
							{ 'range' : '30.1-35.0kg', 'name' : 'light' },
							{ 'range' : '35.1-40.0kg', 'name' : 'middle' },
							{ 'range' : '40.1kg+',     'name' : 'heavy' },
						],
					},
					'{"name":"cadet","min":12,"max":14}' : {
						'female' : [
							{ 'range' : '29.0kg-',     'name' : 'fin' },
							{ 'range' : '29.1-33.0kg', 'name' : 'fly' },
							{ 'range' : '33.1-37.0kg', 'name' : 'bantam' },
							{ 'range' : '37.1-41.0kg', 'name' : 'feather' },
							{ 'range' : '41.1-44.0kg', 'name' : 'light' },
							{ 'range' : '44.1-47.0kg', 'name' : 'welter' },
							{ 'range' : '47.1-51.0kg', 'name' : 'light middle' },
							{ 'range' : '51.1-55.0kg', 'name' : 'middle' },
							{ 'range' : '55.1-59.0kg', 'name' : 'light heavy' },
							{ 'range' : '59.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '33.0kg-',     'name' : 'fin' },
							{ 'range' : '33.1-37.0kg', 'name' : 'fly' },
							{ 'range' : '37.1-41.0kg', 'name' : 'bantam' },
							{ 'range' : '41.1-45.0kg', 'name' : 'feather' },
							{ 'range' : '45.1-49.0kg', 'name' : 'light' },
							{ 'range' : '49.1-53.0kg', 'name' : 'welter' },
							{ 'range' : '53.1-57.0kg', 'name' : 'light middle' },
							{ 'range' : '57.1-61.0kg', 'name' : 'middle' },
							{ 'range' : '61.1-65.0kg', 'name' : 'light heavy' },
							{ 'range' : '65.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"junior","min":15,"max":17}' : {
						'female' : [
							{ 'range' : '42.0kg-',     'name' : 'fin' },
							{ 'range' : '42.1-44.0kg', 'name' : 'fly' },
							{ 'range' : '44.1-46.0kg', 'name' : 'bantam' },
							{ 'range' : '46.1-49.0kg', 'name' : 'feather' },
							{ 'range' : '49.1-52.0kg', 'name' : 'light' },
							{ 'range' : '52.1-55.0kg', 'name' : 'welter' },
							{ 'range' : '55.1-59.0kg', 'name' : 'light middle' },
							{ 'range' : '59.1-63.0kg', 'name' : 'middle' },
							{ 'range' : '63.1-68.0kg', 'name' : 'light heavy' },
							{ 'range' : '68.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '45.0kg-',     'name' : 'fin' },
							{ 'range' : '45.1-48.0kg', 'name' : 'fly' },
							{ 'range' : '48.1-51.0kg', 'name' : 'bantam' },
							{ 'range' : '51.1-55.0kg', 'name' : 'feather' },
							{ 'range' : '55.1-59.0kg', 'name' : 'light' },
							{ 'range' : '59.1-63.0kg', 'name' : 'welter' },
							{ 'range' : '63.1-68.0kg', 'name' : 'light middle' },
							{ 'range' : '68.1-73.0kg', 'name' : 'middle' },
							{ 'range' : '73.1-78.0kg', 'name' : 'light heavy' },
							{ 'range' : '78.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"senior","min":17,"max":32}' : {
						'female' : [
							{ 'range' : '46.0kg-',     'name' : 'fin' },
							{ 'range' : '46.1-49.0kg', 'name' : 'fly' },
							{ 'range' : '49.1-53.0kg', 'name' : 'bantam' },
							{ 'range' : '53.1-57.0kg', 'name' : 'feather' },
							{ 'range' : '57.1-62.0kg', 'name' : 'light' },
							{ 'range' : '62.1-67.0kg', 'name' : 'welter' },
							{ 'range' : '67.1-73.0kg', 'name' : 'middle' },
							{ 'range' : '73.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '54.0kg-',     'name' : 'fin' },
							{ 'range' : '54.1-58.0kg', 'name' : 'fly' },
							{ 'range' : '58.1-63.0kg', 'name' : 'bantam' },
							{ 'range' : '63.1-68.0kg', 'name' : 'feather' },
							{ 'range' : '68.1-74.0kg', 'name' : 'light' },
							{ 'range' : '74.1-80.0kg', 'name' : 'welter' },
							{ 'range' : '80.1-87.0kg', 'name' : 'middle' },
							{ 'range' : '87.1kg+',     'name' : 'heavy' },
						]
					},
					'{"name":"ultra","min":33,"max":40}' : {
						'female' : [
							{ 'range' : '49.0kg-',     'name' : 'fin' },
							{ 'range' : '49.1-57.0kg', 'name' : 'light' },
							{ 'range' : '57.1-67.0kg', 'name' : 'middle' },
							{ 'range' : '67.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '58.0kg-',     'name' : 'fin' },
							{ 'range' : '58.1-68.0kg', 'name' : 'light' },
							{ 'range' : '68.1-80.0kg', 'name' : 'middle' },
							{ 'range' : '80.1kg+',     'name' : 'heavy' },
						],
					},
					'{"name":"ultra","min":41,"max":50}' : {
						'female' : [
							{ 'range' : '49.0kg-',     'name' : 'fin' },
							{ 'range' : '49.1-57.0kg', 'name' : 'light' },
							{ 'range' : '57.1-67.0kg', 'name' : 'middle' },
							{ 'range' : '67.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '58.0kg-',     'name' : 'fin' },
							{ 'range' : '58.1-68.0kg', 'name' : 'light' },
							{ 'range' : '68.1-80.0kg', 'name' : 'middle' },
							{ 'range' : '80.1kg+',     'name' : 'heavy' },
						],
					},
					'{"name":"ultra","min":51,"max":99}' : {
						'female' : [
							{ 'range' : '49.0kg-',     'name' : 'fin' },
							{ 'range' : '49.1-57.0kg', 'name' : 'light' },
							{ 'range' : '57.1-67.0kg', 'name' : 'middle' },
							{ 'range' : '67.1kg+',     'name' : 'heavy' },
						],
						'male' : [
							{ 'range' : '58.0kg-',     'name' : 'fin' },
							{ 'range' : '58.1-68.0kg', 'name' : 'light' },
							{ 'range' : '68.1-80.0kg', 'name' : 'middle' },
							{ 'range' : '80.1kg+',     'name' : 'heavy' },
						],
					}

				};
				var division = undefined;
				var ageclass = Object.keys( divisions ).find( d => { let div = JSON.parse( d ); return age == `${div.min}-${div.max}` });

				if( defined( ageclass ))  { division = divisions[ ageclass ]; } else { console.log( `Unknown age ${age} for weight classes` ); return undefined; }
				if( gender in division  ) { division = division[ gender ];    } else { console.log( `Unknown gender ${gender} for weight classes` ); return undefined; }

				if( ! defined( weight ))   { return division; }
				return division.find( d => { return d.min > weight && d.max <= weight; });
			}
		}
	},
	rulesWT2018 : { 
		// 2018 Rules, updated 4/16/2018
		// ------------------------------------------------------------
		genders : function() { return [ "Female", "Male", "Coed" ]; },
		// ------------------------------------------------------------
		
		// ------------------------------------------------------------
		ranks : function() { return [ "Black Belt" ]; },
		// ------------------------------------------------------------

		// ------------------------------------------------------------
		poomsaeEvents : function() { return [ "Individual", "Pair", "Team" ]; },
		// ------------------------------------------------------------

		// ------------------------------------------------------------
		ageGroups : function( format ) {
		// ------------------------------------------------------------
			if( format == 'Team' ) { return [ "10-11", "12-14", "15-17", "18-29", "30+" ]; } else
			if( format == 'Pair' ) { return [ "10-11", "12-14", "15-17", "18-29", "30+" ]; } else
			/* Individual */       { return [ "10-11", "12-14", "15-17", "18-29", "30-39", "40-49", "50+" ]; }
		},

		// ------------------------------------------------------------
		recognizedPoomsae : function( format, age, rank ) {
		// ------------------------------------------------------------
			var allForms = [ 
				'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 
				'Taebaek', 'Pyongwon', 'Sipjin', 'Jitae', 'Chonkwon', 'Hansu', 
				'Bigak 1', 'Bigak 2', 'Bigak 3'
			];
			var forms = [];
			age = parseInt( age );
			if( isNaN( age )) { return allForms; }
/*
			if( format.match( /team/i ) ) {
				if( age <=  9 ) { forms = allForms.splice( 1, 8 ); } else // Youth
				if( age <= 11 ) { forms = allForms.splice( 2, 8 ); } else // Youth
				if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
				if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
				if( age <  30 ) { forms = allForms.splice( 5, 8 ); } else // Under 30
								{ forms = allForms.splice( 7, 8 ); }      // Over 30

			} else if( format.match( /pair/i ) ) {
				if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
				if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
				if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
				if( age <= 30 ) { forms = allForms.splice( 5, 8 ); } else // Under 30
								{ forms = allForms.splice( 7, 8 ); }      // Over 30
			} else { // Individual
				if( age <= 11 ) { forms = allForms.splice( 1, 8 ); } else // Youth
				if( age <= 14 ) { forms = allForms.splice( 3, 7 ); } else // Cadets
				if( age <= 17 ) { forms = allForms.splice( 3, 8 ); } else // Juniors
				if( age <  40 ) { forms = allForms.splice( 5, 8 ); } else
								{ forms = allForms.splice( 8, 8 ); }     
			}
*/
			return forms;
		},
	},
	websocket : {}
};

FreeScore.rulesUSAT = FreeScore.rulesWT2024;

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
