create table ring {
	rnum int primary key,
	name text not null,
	"current" text not null, /* divid, rid, aid, state */
	schedule text
}

create table court {
	rnum text not null,
	judges text not null
}

create table judge {
	jpid text primary key,
	fname text,
	lname text,
	noc text,
	email text
}

create table division (
	name text primary key,
	header text
);

create table "round" {
	rid text not null,
	name text not null,
	rnum int not null,
	athletes text not null,
	primary key( divid, rid )
}

create table athlete (
	divid text not null,
	aid int not null,
	name text not null,
	noc text not null,
	info text,
	primary key( divid, aid )
);

create table form (
	divid text not null,
	aid int not null,
	rid text not null,
	fid int not null,
	info text,
	decision text,
	penalties text,
	primary key( divid, aid, rid, fid )
);

create table score (
	divid text not null,
	aid int not null,
	rid text not null,
	fid int not null,
	jid int not null,
	points text,
	primary key( divid, aid, rid, fid, jid )
);

create table pool (
	divid text not null,
	aid int not null,
	rid text not null,
	fid int not null,
	jpid text not null,
	score text,
	status text,
	primary key( divid, aid, rid, fid, jpid )
);

create table history (
	"table" text not null,
	divid text not null,
	pkey text not null,
	timestamp text not null default current_timestamp,
	message text not null,
	undo text not null,
	redo text not null,
	primary key( "table", divid, pkey )
);

create index idx_athletes      on athlete (divid);                 /* For retrieving all forms for a given division */
create index idx_forms         on form    (divid, aid, rid);       /* For retrieving all forms for a given round (div,athlete,round) */
create index idx_pool          on pool    (divid, aid, rid, fid);  /* For retrieving all pool scores for a given form (div,athlete,round,fid) */
create index idx_scores        on score   (divid, aid, rid, fid ); /* For retrieving all scores for a given form (div,athlete,round,fid) */
create index idx_history_divid on history (divid);
