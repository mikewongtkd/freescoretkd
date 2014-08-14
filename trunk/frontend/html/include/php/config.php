<?php
	$host = "wong.net";
	$tournament = json_encode( [ 
		"name" => "Tiger Martial Arts Spring Tournament 2014",
		"db" => "tma-2014-spring", 
		"rings" => [ "count" => 2, "width" => 2, "height" => 1, formation => "rows" ],
		"forms" => [ 
			"worldclass" => [ "judges" => 5 ], 
			"grassroots" => [ "judges" => 3 ]
		]
	]);
?>
