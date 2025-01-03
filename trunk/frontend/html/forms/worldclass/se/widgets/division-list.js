FreeScore.Widget.DivisionList = class FSWidgetDivisionList extends FSWidget {
	constructor( app, type ) {
		const tabs = "division-tab-contents";
		const navs = "division-nav-tabs";

		super( app, tabs );

		this._type   = type;
		this._active = type == 'ready' ? 'active' : '';

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
		this.refresh.list = update => {
			let ring = update?.ring;
			if( ! defined( ring )) { return; }

			this.display.list.empty();
		};

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.app.on.heard( 'ring' )
		.command( 'update' ).respond( update => { this.refresh.list( update ); });

		// ===== INITIALIZE DISPLAY
		this.display.tabs.append( this.tab() );
	}

	tab() {
		let active = this.active ? ` class="${this.active}"` : '';
		return $( `
			<li${active}><a data-toggle="tab" href="#${this.type}-tab">${this.type.capitalize()} Divisions</a></li>
		` );
	}

	get type()   { return this._type; }
	get active() { return this._active; }
}
