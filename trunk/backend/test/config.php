<?php
	$host = "tmaopen.net";
	$tournament = json_encode( [ 
		"name" => "Test Tournament",
		"db" => "test", 
		"rings" => [ "count" => 2, "width" => 2, "height" => 1, "formation" => "rows" ]
	]);
?>
["<?= $host ?>",<?= $tournament ?>]
