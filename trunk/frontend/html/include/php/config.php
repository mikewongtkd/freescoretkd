<?php
	$host = "localhost";
	// $host = "mikewong.net";
	$tournament = json_encode( [ 
		"name" => "Tiger Martial Arts Spring Tournament 2014",
		"db" => "tma-2014-spring", 
		"rings" => [ "count" => 6, "width" => 3, "height" => 2, formation => "loop" ],
		"forms" => [ 
			"worldclass" => [ "judges" => 5 ], 
			"grassroots" => [ "judges" => 3 ]
		]
	]);
?>
