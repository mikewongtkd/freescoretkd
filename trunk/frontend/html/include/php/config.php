<?php
	$host = "169.254.128.39";
	$host = "localhost";
	// $host = "192.168.1.111";
	$tournament = json_encode( [ 
		"db" => "tma-2014-spring", 
		"forms" => [ 
			"worldclass" => [ "judges" => 5 ], 
			"grassroots" => [ "judges" => 3 ]
		]
	]);
?>
