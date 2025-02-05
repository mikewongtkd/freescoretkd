FreeScore.Widget.SELeaderboard = class FSWidgetSELeaderboard extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.append( '<div class="header"></div><div class="leaderboard"></div>' );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header      = this.dom.find( '.header' );
		this.display.leaderboard = { all: this.dom.find( '.leaderboard' )};

		// ===== ADD STATE
		this.state.division  = null;

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.header = division => {
			this.display.header.empty();
			this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1>` );
		};
		this.refresh.leaderboard = division => {
			if( ! defined( division )) { 
				this.display.header.empty(); 
				this.display.leaderboard.all.empty(); 
				return; 
			}
			let tdl   = this.display.leaderboard;
			let table = tdl.table = $( '<table class="table" />' );
			let thead = tdl.thead = $( '<thead />' );
			let tbody = tdl.tbody = $( '<tbody />' );
			let s     = division.description()?.match( /(?:pair|team)/i ) ? 's' : '';

			thead.append( `<tr><th class="place">Place</th><th class="name">Name${s}</th><th class="score">Matches Won</th><th class="top-round">Top Round</th></tr>` );
			table.append( thead, tbody );

			let placements = division.placement( 'ro2' );
			if( ! defined( placements )) { return; }

			let maxwins    = placements.length;
			let trmap      = { 1: 'Finals', 2: 'Finals', 3: 'Semi-Finals', 5: 'Quarter-Finals', 9: 'Round of 16', 17: 'Round of 32', 33: 'Round of 64', 65: 'Round of 128', 129: 'Round of 256' };

			placements.forEach(( athletes, i ) => {
				let place = placements.filter(( p, j ) => ( j < i )).reduce(( acc, cur ) => acc + cur.length, 0 ) + 1;
				console.log( 'ATHLETES', athletes ); // MW
				athletes.forEach( athlete => {
					let name     = athlete.display.name();
					let wins     = maxwins - (i + 1);
					let topround = trmap[ place ];
					tbody.append( `<tr><td class="place place-${ordinal( place )}"><span class="shine">${ordinal( place )}</span><span class="medal">${ordinal( place )}</span></td><td>${name}</td><td class="score">${wins}</td><td class="top-round">${topround}</td></tr>` );
				});
			});

			tdl.all.append( table );
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;

				this.refresh.header( division );
				this.refresh.leaderboard( division );
			});
	}
}
