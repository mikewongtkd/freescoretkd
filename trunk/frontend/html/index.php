<?php
	$version = 3.4;
?>
<html>
	<head>
		<title>FreeScore TKD Wifi v<?=$version?></title>
		<link href="./include/jquery/mobile/jquery.mobile-1.4.5.min.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			div[data-role="header"]              { text-align: center; }
			div[data-role="header"] .title       { font-size: 24px; color: gold; }
			div[data-role="header"] .version     { font-size: 10px; color: silver; }
			div[data-role="header"] .description { color: silver; }
			div[data-role="header"] a            { text-decoration: none; }
			div[data-role="footer"]              { text-align: center; color: silver; }
		</style>
		<script type="text/javascript">
			function register()   { document.location="./setup/register.php"; }
			function managewc()   { document.location="./forms/worldclass/divisions.php"; }
			function managegr()   { document.location="./forms/grassroots/divisions.php"; }
			function tournament() { document.location="./setup/tournament.php"; }
		</script>
	</head>
	<body>
		<div data-role="page">
			<div data-role="header" data-position-fixed="true" data-theme="b">
				<div><span class="title">FreeScore TKD Wifi</span> <span class="version">v<?=$version?></span></div>
				<span class="description"><a href="http://mikewongtkd.github.io/freescoretkd">Open Source Taekwondo Poomsae Scoring Software</a> available under the GPL v2.</span>
			</div>
			<div data-role="main">
					<ul data-role="listview">
						<li data-role="list-divider">Devices</li>
						<li><a href="javascript:register()">
							<h2>Register a Ring Device</h2>
							<p>Assign and ring and role for a ring laptop or judge/coordinator tablet</p>
						</a></li>
						<li data-role="list-divider">Divisions</li>
						<li><a href="javascript:managewc()">
							<h2>Manage Sport Poomsae Divisions</h2>
							<p>Add, remove, or edit divisions; also add or remove rings</p>
						</a></li>
						<li><a href="javascript:managegr()">
							<h2>Manage Flipcard Poomsae Divisions</h2>
							<p>Add, remove, or edit divisions; also add or remove rings</p>
						</a></li>
					</ul>
			</div>
			<div data-role="footer" data-position-fixed="true" data-theme="b">
				&copy; 2015-2016 Mike Wong All Rights Reserved. 
			</div>
		</div>
	</body>
</html>
