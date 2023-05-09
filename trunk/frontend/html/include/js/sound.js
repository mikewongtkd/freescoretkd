FreeScore.Sound = class FSSound {
	constructor( path ) {
		this.path  = path;
		this.ok    = new Howl({ urls: [ `${path}/upload.mp3`,   `${path}/upload.ogg` ]});
		this.error = new Howl({ urls: [ `${path}/quack.mp3`,    `${path}/quack.ogg`  ]});
		this.next  = new Howl({ urls: [ `${path}/next.mp3`,     `${path}/next.ogg`   ]});
		this.prev  = new Howl({ urls: [ `${path}/prev.mp3`,     `${path}/prev.ogg`   ]});
	}
}
