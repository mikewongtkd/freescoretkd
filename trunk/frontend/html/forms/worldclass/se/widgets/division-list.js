FreeScore.Widget.SEDivisionList = class FSWidgetSEDivisionList extends FreeScore.Widget {
	constructor( app, type ) {
		const navs   = "division-nav-tabs";
		const tabs   = "division-tab-contents";
		const filter = {
			ready :     div => div?.ring() != 'staging' && div?.is?.complete() === false,
			completed : div => div?.ring() != 'staging' && div?.is?.complete() === true,
			staging :   div => div?.ring() == 'staging'
		};

		super( app, tabs );

		this._type   = type;
		this._active = type == 'ready' ? 'active' : '';
		this._filter = filter[ type ];

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="tab-content">
			<div id="${this.type}-tab" class="tab-pane fade in ${this.active}">
				<form role="form">
					<div class="form-group">
						<input id="search-${this.type}" class="form-control" type="search" placeholder="Search..." />
					</div>
					<div class="list-group" id="ring-${this.type}">
					</div>
				</form>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.list = this.dom.children( `#ring-${this.type}` );
		this.display.navs = $( `#${navs}` );
		this.display.tabs = $( `#${tabs}` );

		// ===== ADD STATE
		this.state = null;

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.listgroup = {
			item : ( lgitem, ring ) => {
				lgitem.off( 'click' ).click( ev => {
					let clicked  = $( ev.target ); if( ! clicked.is( 'a' ) ) { clicked = clicked.parent(); }
					let divid    = clicked.attr( 'divid' );
					let division = ring.divisions.find(( d ) => { return d.name == divid; });

					$.cookie( 'divid', divid, { expires: 1, path: '/' });
					this.event.trigger( 'division-show', { divid });
				});
			}
		};
		this.refresh.list = update => {
			let ring = update?.ring;
			if( ! defined( ring )) { return; }

			this.display.list.empty();
			let divisions = ring.divisions.map( data => new Division( data )).filter( this.filter );
			divisions.forEach( div => {
				let lgitem       = html.a.clone().addClass( 'list-group-item' );
				let item         = {};
				let athletes     = div.athletes();
				item.title       = html.h4.clone().html( div.summary()),
				item.count       = athletes.length;
				item.athletes    = athletes.map(( a ) => { return a.name(); }).join( ', ' );
				item.description = html.p.clone().append( `<b>${item.count} Athlete${item.count > 1 ? 's' : ''}:</b>${item.athletes}` );

				lgitem.empty();
				lgitem.append( item.title, item.description );
				lgitem.attr({ divid : div.name()});
				if( div.name() == ring.current ) { lgitem.addClass( 'active' ); }
			});

			this.dom.btsListFilter( `#search-${this.type}`, { initial: false, resetOnBlur: false });
		};

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.app.network.on.heard( 'ring' )
			.command( 'update' )
				.respond( update => { 
					this.refresh.list( update ); 
				});

		// ===== INITIALIZE DISPLAY
		this.display.navs.append( this.nav() );
	}

	nav() {
		let active = this.active ? ` class="${this.active}"` : '';
		return $( `<li${active}><a data-toggle="tab" href="#${this.type}-tab">${this.type.capitalize()} Divisions</a></li>` );
	}

	get active() { return this._active; }
	get type()   { return this._type; }
	get filter() { return this._filter; }
}
