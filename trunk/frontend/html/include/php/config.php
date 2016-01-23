<?php
	$host = "freescore.net";
	$tournament = json_encode( [ 
		"name" => "FreeScore Test Data",
		"db" => "test", 
		"rings" => [ "count" => 6, "start" => 1, "enable" => [ 1, 2, 5, 6 ], "width" => 3, "height" => 2, "formation" => "loop" ]
	]);
?>
