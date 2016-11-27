// ============================================================
// TIMELINE BEHAVIOR
// ============================================================
var timeline = {};
$(function() {
	var html = FreeScore.html;
	timeline.add = ( i, ev ) => {
		var seconds = parseFloat( Math.abs( ev.time - score.deductions.timing.start.time ))/1000;
		var min     = (seconds / 60).toFixed( 0 );
		var sec     = (seconds % 60).toFixed( 1 );
		var time    = min + ':' + (sec < 10 ? '0' + sec : sec);
		var does    = undefined;
		if( defined( ev.value )) {
			if( ev.name == 'jumping-front-kicks' || ev.name == 'consecutive-kicks' ) {
				if( ev.value >= 0.6 ) { does = ' performed excellent '; } else
				if( ev.value >= 0.3 ) { does = ' performed good ';      } else
				if( ev.value >= 0.1 ) { does = ' performed poor ';      } else
				if( ev.value == 0.0 ) { does = ' did not perform ';     } 
			} else {
				if( ev.value >= 0.6 ) { does = ' performed an excellent '; } else
				if( ev.value >= 0.3 ) { does = ' performed a good ';       } else
				if( ev.value >= 0.1 ) { does = ' performed a poor ';       } else
				if( ev.value == 0.0 ) { does = ' did not perform a ';      }
			}
		}

		// ===== IF THE ATHLETE DOESN'T STOP IN TIME WITH THE MUSIC, ASSIGN PENALTY
		var stop = { music: score.deductions.timing[ 'music-stop' ], athlete: score.deductions.timing[ 'athlete-stop' ] };
		if( defined( stop.music ) && defined( stop.athlete )) {
			var delta = (Math.abs( stop.music.time - stop.athlete.time )/1000);
			if( stop.music.time < stop.athlete.time ) { 
				stop.music.text   = 'Music stopped ' +   delta.toFixed( 1 ) + 's before the athlete'; 
				stop.athlete.text = 'Athlete stopped ' + delta.toFixed( 1 ) + 's after the music'; 
			} else {
				stop.music.text   = 'Music stopped ' +   delta.toFixed( 1 ) + 's after the athlete'; 
				stop.athlete.text = 'Athlete stopped ' + delta.toFixed( 1 ) + 's before the music'; 
			}
		}
		var settings = {
			'start':               { context: 'success', icon: 'glyphicon-time',             heading: 'Start',               text: 'Music and performance begin' },
			'hakdari-seogi':       { context: 'warning', icon: 'hakdari-seogi.png',          heading: 'Mandatory Stance',    text: 'Athlete has performed <i>hakdari seogi</i>' },
			'beom-seogi':          { context: 'warning', icon: 'beom-seogi.png',             heading: 'Mandatory Stance',    text: 'Athlete has performed <i>beom seogi</i>' },
			'dwigubi':             { context: 'warning', icon: 'dwigubi.png',                heading: 'Mandatory Stance',    text: 'Athlete has performed <i>dwigubi</i>' },
			'jumping-side-kick':   { context: 'info',    icon: 'jumping-side-kick.png',      heading: 'Jumping Side Kick',   text: 'Athlete' + does + 'jumping side kick' },
			'jumping-front-kicks': { context: 'info',    icon: 'jumping-front-kick.png',     heading: 'Jumping Front Kicks', text: 'Athlete' + does + 'jumping front kicks' },
			'jumping-spin-kick':   { context: 'info',    icon: 'jumping-spin-kick.png',      heading: 'Jumping Spin Kick',   text: 'Athlete' + does + 'jumping spin kick' },
			'consecutive-kicks':   { context: 'info',    icon: 'consecutive-kicks.png',      heading: 'Consecutive Kicks',   text: 'Athlete' + does + 'sparring kicks' },
			'acrobatic-kick':      { context: 'info',    icon: 'acrobatic-kick.png',         heading: 'Acrobatic Kick',      text: 'Athlete' + does + 'acrobatic kick' },
			'major-deduction':     { context: 'danger',  icon: 'glyphicon-remove-sign',      heading: 'Major Deduction(s)',  text: 'Athlete is awarded a major penalty' },
			'minor-deduction':     { context: 'danger',  icon: 'glyphicon-exclamation-sign', heading: 'Minor Deduction(s)',  text: 'Athlete is awarded ' + (Math.round( ev.value/-0.1 ) > 1 ? Math.round( ev.value/-0.1 ) + ' minor penalties' : 'a minor penalty') },
			'music-stop':          { context: 'danger',  icon: 'music.png',                  heading: 'Music Stops',         text: ev.text },
			'athlete-stop':        { context: 'danger',  icon: 'music.png',                  heading: 'Athlete Stops',       text: ev.text },
			'both-stop':           { context: 'danger',  icon: 'glyphicon-time',             heading: 'Finish',              text: 'Athlete performance stops with the music' },
			
		}[ ev.name ];
		settings.time = time;
		var item    = html.li.clone().addClass( 'timeline-item' );
		var badge   = html.div.clone().addClass( 'timeline-badge ' + settings.context );
		var panel   = html.div.clone().addClass( 'timeline-panel' );
		var heading = html.div.clone().addClass( 'timeline-heading' );
		var body    = html.div.clone().addClass( 'timeline-body' ).append( html.p.clone().html( settings.text ) );
		var notes   = html.p.clone().addClass( 'timeline-notes' ).append( html.span.clone().addClass( 'text-muted' ), html.span.clone().addClass( 'glyphicon glyphicon-time' ), '&nbsp;', settings.time )

		if( defined( ev.value ) && ! isNaN( ev.value )) {
			if( ev.value >= 0 ) { notes.append( html.span.clone().addClass( 'points pull-right' ).text( '+' + ev.value.toFixed( 1 ) + ' points')); }
			else                { notes.append( html.span.clone().addClass( 'deduction pull-right' ).text( ev.value.toFixed( 1 ) + ' points')); }
		}

		if( settings.icon.match( /glyphicon/ )) {
			badge.addClass( 'glyphicon ' + settings.icon );
		} else if( settings.icon.match( /\.png$/ )) {
			badge.append( html.img.clone().attr( 'src', '../../images/icons/freestyle/' + settings.icon ));
		}

		heading.append( html.h4.clone().addClass( 'timeline-title' ).text( settings.heading ), notes );

		item.append( badge, panel.append( heading, body ));
		timeline.widget.append( item );
	};
});
