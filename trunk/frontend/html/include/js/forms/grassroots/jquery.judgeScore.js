$.widget( "freescore.judgeScore", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var options = this.options;
		var html    = { div : $( "<div />" ) };
		var score   = html.div.clone() .addClass( "score" ) .prop( "id", "judgeScore" + options.num );
		var name    = html.div.clone() .addClass( "judge" );
		score .html( "0.0" );
		name .html( "JUDGE " + options.num );
		this.element .addClass( "judgeScore" );
		this.element .append( score, name );

		var url = {
			tournament : $.url().param( 'tournament' ),
			division   : $.url().param( 'division' ),
		}

		var refresh = function() {
			if( url.tournament === undefined || url.division === undefined ) {alert( "Need tournament and division" ); }
			$.getJSON(
				'http://localhost/cgi-bin/freescore/rest/' + url.tournament + '/forms/grassroots/division' + url.division + '/judge' + options.num,
				function( judgeScore ) {
					score .html( judgeScore );
				}
			);
		}

		refresh();
		// window.setTimeout( refresh, 2000 );
	},
});
