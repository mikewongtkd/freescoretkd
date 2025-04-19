FreeScore.App.WorldClass = class FSAppWorldClass extends FreeScore.App {
	constructor( ring = null ) {
		super( ring );
		this._comms = new FreeScore.CommsProtocol.WorldClass( this );
	}
}
