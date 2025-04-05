
FreeScore.CommsProtocol.WorldClass = class FSCommsProtocolPWorldClass extends FreeScore.CommsProtocol {
	constructor( app ) {
		super( app );
		this._request.div = {};
		this._request.div.nav = {
			athlete: {
				next: () => { this.send( 'division', 'athlete next' ); },
				prev: () => { this.send( 'division', 'athlete prev' ); },
			},
			form: {
				next: () => { this.send( 'division', 'form next' ); },
				prev: () => { this.send( 'division', 'form prev' ); },
			},
			round: {
				next: () => { this.send( 'division', 'round next' ); },
				prev: () => { this.send( 'division', 'round prev' ); },
			}
		};

		this._request.div.rec = {
			award: { 
				minScore: () => { this.send( 'division', 'award min score' ); },
				penalty: ( penalties ) => { 
					if( ! this.validate.penalties( penalties )) { return; }
					this.send( 'division', 'award penalty', { penalties }); 
				},
				punitive: ( decision ) => { 
					if( ! this.validate.decision( decision )) { return; }
					this.send( 'division', 'award punitive', { decision }); 
				}
			},
			clearJudgeScore: ( judge ) => { this.send( 'division', 'clear judge score', { judge }); },
			display: () => { this.send( 'division', 'display' ); },
			score: ( score ) => { 
				this.send( 'division', 'score', { score }); 
			}
		};

		this.validate.penalties = penalties => {
			const valid = [ 'bounds', 'restart', 'timelimit', 'misconduct' ];
			if( typeof penalties !== 'object' ) {
				console.log( 'FCP Validate Penalties: penalty is not an object', penalties );
				return false;
			}
			let ok = Object.keys( penalties ).reduce(( acc, cur ) => acc && valid.includes( cur ), true );
			return ok;
		};

		this.validate.decisions = decision => {
			const valid = [ 'disqualify', 'withdraw' ];
			return valid.includes( decision );
		}

		this._request.div.drawSBSPoomsae = ( option ) => { 
			if( typeof option === 'string' ) {
				this.send( 'division', 'draw sbs poomsae', { age: option });
			} else if( typeof option === 'object' ) {
				this.send( 'division', 'draw sbs poomsae', { draw: option });
			} else {
				console.log( 'drawSBSPoomsae(): Unknown option', option );
			}
		};

		this._request.div.history = () => { this.send( 'division', 'history' ); };
		this._request.div.read    = () => { this.send( 'division', 'read' ); };
		this._request.div.restore = ( version ) => { this.send( 'division', 'restore', { version }); };
		this._request.div.write   = ( division ) => { this.send( 'division', 'restore', { division }); };
	}
}
