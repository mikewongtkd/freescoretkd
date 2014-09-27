<?php
	# $host = "wong.net";
	$host = "tmaopen.net";
	$tournament = json_encode( [ 
		"name" => "Tiger Martial Arts Fall Open Taekwondo Championships 2014",
		"db" => "tma-2014-fall", 
		"rings" => [ "count" => 2, "width" => 2, "height" => 1, formation => "rows" ],
		"forms" => [ 
			"worldclass" => [ "judges" => 5 ], 
			"grassroots" => [ "judges" => 3 ]
		]
	]);
?>
