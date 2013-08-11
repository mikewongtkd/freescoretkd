(function( $ ) {
	$.widget( "freescore.showAthlete", {
		options: { autoShow: true },
		_init: function() {
			var div         = $( "<div />" );
			var athlete     = div.clone() .addClass( "athlete" );
			var athleteModel = this.options.model;

			this.element .append( athlete );
			athlete
				.append( div.clone() .addClass( 'id' )         .append( athleteModel.id ))
				.append( div.clone() .addClass( 'name' )       .append( athleteModel.fname + ' ' + athleteModel.lname ) )
				.append( div.clone() .addClass( 'age-weight' ) .append( athleteModel.belt + ', ' + athleteModel.age + 'yo, ' + athleteModel.weight + ' lbs.' ))

			var splitHere = div.clone() .addClass( 'split-here' );
			var hr        = $( '<hr />' );
			
			splitHere.append( hr.clone());
			splitHere.append( div.clone() .addClass( 'text' ) .append( 'Split Here' ) );
			splitHere.append( hr.clone());

			var division = $( this.element ).parent();
			athlete.hover(
				function() {
					if( division .hasClass( 'state-selected' ) && ! athleteModel.last ) { athlete .append( splitHere ); }
				},
				function() {
					if( ! athleteModel.last ) { splitHere .remove(); }
				}
			);
			athlete.click(
				function() {
					alert( divParent.attr( 'class' ) );
					if( divisionSelected ) {
						alert( "Splitting division at " + athleteModel.fname + ' ' + athleteModel.lname );
					}
				}
			);
		}
	});
})( jQuery );
