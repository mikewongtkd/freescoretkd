FreeScore.Sound = class FSSound {
	constructor() {
		let paths   = [ '/', '../', '../../', '../../../' ];
		let library = { ok : 'upload', error : 'quack', next : 'next', prev : 'prev' };
		let formats = [ 'mp3', 'ogg' ];
		if( typeof Howl != 'function' ) {
			console.log( 'Please include Howl library in a <script> tag before using.' );
			return;
		}
		Object.keys( library ).forEach( sound => {
			let urls = [];
			let file = library[ sound ];
			formats.forEach( format => {
				paths.forEach( path => {
					urls.push( `${path}sounds/${file}.${format}` );
				});
			});
			this[ sound ] = new Howl({ urls });
		});
	}
}
