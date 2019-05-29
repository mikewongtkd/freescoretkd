var dnd = { block: undefined, handle : {
	drag : {
		start : function( ev ) {
			dnd.block  = $( ev.target );
		},
		enter : function( ev ) {
		},
		leave : function( ev ) {
		},
		over : function( ev ) { 
			if( ev.preventDefault ) { ev.preventDefault(); } 
			return false;
		},
		end : function( ev ) {
		},
	},
	drop : function( ev ) {
		if( ev.stopPropogation ) { ev.stopPropogation(); }
		var target    = { ui: $( ev.target )}; 
		var block     = { ui: dnd.block };
		block.id      = block.ui.attr( 'data-blockid' );
		block.data    = schedule.blocks[ block.id ];

		block.is  = {  block : block.ui.hasClass( 'block' ), plan: block.ui.hasClass( 'ring-plan' ) || block.ui.parent( '.ring-plan' ).length > 0, ring : block.ui.hasClass( 'ring' )};
		target.is = { block : target.ui.hasClass( 'block' ), plan: target.ui.hasClass( 'ring-plan' ) || target.ui.parent( '.ring-plan' ).length > 0, ring : target.ui.hasClass( 'ring' )};

		if( ! target.is.plan && ! target.is.block && ! target.is.ring ) { 
			target.ui = target.ui.parent( '.block' );
			if( ! defined( target.ui )) { return; } // Target is not a block or ring or child of a block or ring; ignore
			target.is.block  = defined( target.ui );
			target.is.ring   = false;
		}

		if( block.is.plan && target.is.plan ) {
			block.ui = block.ui.hasClass( 'ring-plan' ) ? block.ui : block.ui.parent( '.ring-plan' );
			if( block.ui.length == 0 ) { return; } // Dragged object is not a ring plan
			if( ! target.ui.hasClass( 'ring-plan' )) { target.ui = target.ui.parent( '.ring-plan' ); }
			var day = schedule.days[ settings.current.day ];
			var a   = { id: block.ui.attr( 'data-ringid' )};  a.data = find.ring( day, a.id );
			var b   = { id: target.ui.attr( 'data-ringid' )}; b.data = find.ring( day, b.id );
			console.log( a, b );
			var tmp = a.data.plan;
			a.data.plan = b.data.plan;
			b.data.plan = tmp;

		} else if( block.is.block && target.is.block ) {
			target.id   = target.ui.attr( 'data-blockid' );
			target.data = schedule.blocks[ target.id ];
			if( block.id == target.id ) { return; }
			var below = (ev.originalEvent.clientY - target.ui.position().top) > (target.ui.height()/2);
			plan.move( block.id, target.id, below );
			console.log( 'REQUIREMENTS:', block.data.require );

		} else if( block.is.block && target.is.ring ) {
			target.id = target.ui.attr( 'id' );
			var ring  = { id: target.ui.attr( 'data-ringid' )};
			var rows  = $( `td.${ring.id}` ).map(( i, item ) => { return $( item ).attr( 'id' ); } ).toArray();
			var i     = rows.findIndex( row => { return row == target.id });
			var next  = rows[ i + 1 ];

			// See if there's a block in the next cell (below)
			target.ui    = $( `#${next}` ).find( '.block' );

			if( target.ui.length ) {
				target.id = target.ui.attr( 'data-blockid' );
				plan.move( block.id, target.id );

			} else {
				plan.move( block.id, ring.id );
			}
		} else {
			dnd.block  = undefined;
			return;
		}

		dnd.block  = undefined;

		show.daySchedule();

		var results = plan.validate();
		show.errors( results );

		return false;
	}
}};
