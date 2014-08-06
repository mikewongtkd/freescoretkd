<?php
	$host = "169.254.128.39";
	// $host = "localhost";
	// $host = "192.168.1.111";
	$tournament = json_encode( [ 
		"name" => "Tiger Martial Arts Spring Tournament 2014",
		"db" => "tma-2014-spring", 
		"rings" => 6,
		"forms" => [ 
			"worldclass" => [ "judges" => 5 ], 
			"grassroots" => [ "judges" => 3 ]
		]
	]);
?>
