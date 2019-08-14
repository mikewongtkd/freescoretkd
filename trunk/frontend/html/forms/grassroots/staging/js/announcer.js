class Announcer {
	constructor() {
		this.messages = []; 
		this.voice    = { cantonese: 'Google 粤語（香港）', english: 'Google US English', hindi: 'Google हिन्दी', japanese: 'Google 日本語', korean: 'Google 한국의', spanish: 'Google español de Estados Unidos', selected: undefined };
		this.timer    = undefined; 
		this.status   = 'disabled';

		if( $( '#announcer' ).length == 0 ) { throw( 'Error, no announcer button found' ); }

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
		this.messages.push({ time: moment(), text : text });
		$( '#announcer' ).removeClass( 'disabled' ).html( `<span class="fa fa-comment"></span> ${announcer.messages.length} messages` );
	}

	mute() {
		let now  = moment().format( 'h:mm A' );
		alertify.notify( `Announcer ${now}<br><i>muted</i>` );
		$( '#announcer' ).addClass( 'disabled' ).html( `<span class="fa fa-comment-slash"></span> Muted` );
	}

	pause( time ) {
		this.messages.push({ time: moment(), pause: time, text: '' });
	}

	pronunciationHelp( message ) {
		message.text = message.text.toLowerCase();
		message.text = message.text.replace( /group a/i, 'group ae' );   // Force voice to say hard 'A' (pronounces 'ae' as a hard A)
		message.text = message.text.replace( /division \w+a$/i, '$&e' ); // Force voice to say hard 'A' (pronounces 'ae' as a hard A)
		return message;
	}

	speak() {
		if( this.status == 'disabled' ) { return; }
		if( this.messages.length == 0 ) { return; }

		let now     = moment();
		let message = this.messages.shift();

		// Discard messages older than 5 minutes
		if( message.time.isAfter( now.add( 5, 'minutes' ))) { this.speak(); return; }

		if( message.text ) { alertify.notify( `<b>Announcer</b> ${now.format( 'h:mm A' )}<br>${message.text}` ); }

		message = this.pronunciationHelp( message );

		let saying = new SpeechSynthesisUtterance( message.text );
		saying.voice = speechSynthesis.getVoices().filter( voice => voice.name == this.voice.english ).shift();
		window.speechSynthesis.speak( saying )
		saying.onend = ( e ) => { 
			let n     = this.messages.length;
			let state = n == 0 ? 'Waiting for messages' : `${n} messages`;
			$( '#announcer' ).html( `<span class="fa fa-comment"></span> ${state}` );
			let pause  = message.pause || 500; // Wait 0.5 second (or requested pause) and say the next item in the queue
			this.timer = setTimeout(() => { this.speak(); }, pause );  
		};
	}

	call( division, call ) {
		let map      = { '1': { number: 1, ordinal: 'First', time: 30 }, '2': { number: 2, ordinal: 'Second', time: 15 }, '3': { number: 3, ordinal: 'Third', time: 5 }}; call = map[ call ];
		let athletes = division.athletes.filter( a => ! a.hasCheckedIn( division )).sort(( a, b ) => a.lastName.localeCompare( b.lastName ))
		let names    = athletes.map( a => a.name ).join( ', ' );
		console.log( `Announcing ${call.ordinal} call for ${division._id.toUpperCase()} ${division._description}`, names );
		let div      = `${division.event} ${division.description} Division ${division.id.toUpperCase()}`;
		let intro    = [ 
			`${call.ordinal} call for ${div}`, 
			`Attention athletes, ${call.ordinal.toLowerCase()} call for ${div}`, 
			`This is your ${call.ordinal.toLowerCase()} call for ${div}`,
		];
		let repeat = [
			`Attention athletes, ${call.ordinal.toLowerCase()} call for Division ${division.id.toUpperCase()}`, 
			`This is your ${call.ordinal.toLowerCase()} call for Division ${division.id.toUpperCase()}`,
			`Repeating ${call.ordinal.toLowerCase()} call for Division ${division.id.toUpperCase()}`,
			`Attention athletes, repeating ${call.ordinal.toLowerCase()} call for Division ${division.id.toUpperCase()}`,
			`Again, ${call.ordinal.toLowerCase()} call for Division ${division.id.toUpperCase()}`,
			`Division ${division.id.toUpperCase()} this is your ${call.ordinal.toLowerCase()} call`,
		]
		let outro = [
			`Please report to the staging area. You have ${call.time} minutes.`,
			`You have ${call.time} minutes to report to the staging area.`,
		];
		let warning = [
			`If you are not in the staging area in  ${call.time} minutes, you may be disqualified.`,
			`You have ${call.time} minutes to report to the staging area, or you may be disqualified.`,
		]
		let pick = ( choices ) => { let i = Math.floor( Math.random() * choices.length ); return choices[ i ]; }

		this.message( pick( intro ));
		this.message( names );
		if( call.number == 1 ) {
			this.message( pick( repeat ));
			this.message( names );
			this.message( pick( repeat ));
			this.message( names );
		}
		if( call.number <= 2 ) {
			this.message( pick( outro ));

		} else {
			this.message( pick( repeat ));
			this.message( names );
			this.message( pick( warning ));
		}
		this.pause( 5000 );
	}
}
