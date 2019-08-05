class Announcer {
	constructor() {
		this.messages = []; 
		this.voice    = { cantonese: 'Google 粤語（香港）', english: 'Google US English', hindi: 'Google हिन्दी', japanese: 'Google 日本語', korean: 'Google 한국의', spanish: 'Google español de Estados Unidos', selected: undefined };
		this.timer    = undefined; 
		this.status   = 'disabled';

		$( '#announcer' ).off( 'click' ).click(( ev ) => {
			if( this.status == 'disabled' ) {
				this.status = 'enabled';
				this.speak();
			} else {
				this.status = 'disabled';
				this.mute();
			}
		});
	}

	message( text ) {
		this.messages.push( text );
		$( '#announcer' ).removeClass( 'disabled' ).html( `<span class="fa fa-comment"></span> ${announcer.messages.length} messages` );
	}

	mute() {
		let now  = moment().format( 'h:mm A' );
		alertify.notify( `Announcer ${now}<br><i>muted</i>` );
		$( '#announcer' ).addClass( 'disabled' ).html( `<span class="fa fa-comment-slash"></span> Muted` );
	}

	speak() {
		if( this.status == 'disabled' ) { return; }
		if( this.messages.length == 0 ) { return; }
		let now  = moment().format( 'h:mm A' );
		let text = this.messages.shift();
		alertify.notify( `<b>Announcer</b> ${now}<br>${text}` );

		// Text pronunciation hacks
		text = text.replace( /group a/i, 'group ae' );   // Force voice to say hard 'A' (pronounces 'ae')
		text = text.replace( /division \w+a$/i, '$&e' ); // Force voice to say hard 'A' (pronounces 'ae')

		let message = new SpeechSynthesisUtterance( text.toLowerCase() );
		message.voice = speechSynthesis.getVoices().filter( voice => voice.name == this.voice.english ).shift();
		window.speechSynthesis.speak( message )
		message.onend = ( e ) => { 
			let n = this.messages.length;
			if( n == 0 ) {
				$( '#announcer' ).html( '<span class="fa fa-comment"></span> Waiting for messages' );
			} else {
				$( '#announcer' ).html( `<span class="fa fa-comment"></span> ${n} messages` );
			}
			this.timer = setTimeout(() => { this.speak(); }, 500 ); }; // Wait 1 second and say the next item in the queue
	}

	call( division, call ) {
		console.log( `Announcing ${division._id.toUpperCase()} ${division._description}`, division.athletes.map( a => a.name ));
		let map   = { '1': { ordinal: 'First', time: 30 }, '2': { ordinal: 'Second', time: 15 }, '3': { ordinal: 'Third', time: 5 }}; call = map[ call ];
		let div   = `${division.event} ${division.description} Division ${division.id.toUpperCase()}`;
		let intro = [ 
			`${call.ordinal} call for ${div}`, 
			`Attention athletes, ${call.ordinal} call for ${div}`, 
			`This is your ${call.ordinal} call for ${div}`,
		];
		let repeat = [
			`Attention athletes, ${call.ordinal} call for ${div}`, 
			`This is your ${call.ordinal} call for ${div}`,
			`Repeating ${call.ordinal} call for ${div}`,
			`Again, ${call.ordinal} call for ${div}`,
		]
		let outro = [
			`Please report to the staging area. You have ${call.time} minutes.`,
			`You have ${call.time} minutes to report to the staging area.`,
		];
		let pick = ( choices ) => { let i = Math.floor( Math.random() * choices.length ); return choices[ i ]; }

		this.message( pick( intro ));
		division.athletes.forEach(( athlete ) => { if( athlete.hasCheckedIn( division )) { return; } this.message( athlete.name ); });
		this.message( pick( repeat ));
		division.athletes.forEach(( athlete ) => { if( athlete.hasCheckedIn( division )) { return; } this.message( athlete.name ); });
		this.message( pick( repeat ));
		division.athletes.forEach(( athlete ) => { if( athlete.hasCheckedIn( division )) { return; } this.message( athlete.name ); });
		this.message( pick( outro ));
	}
}
