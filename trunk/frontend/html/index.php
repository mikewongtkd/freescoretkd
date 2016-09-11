<?php
	include "./include/php/config.php";
?>
<html>
	<head>
		<title>FreeScore TKD Wifi v<?=$freescore[ 'version' ] ?></title>
		<link href="./include/jquery/mobile/jquery.mobile-1.4.5.min.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			@font-face {
			  font-family: Nimbus;
			  src: url("/freescore/include/fonts/nimbus-sans-l_bold-condensed.ttf"); }
			@font-face {
			  font-family: Biolinum;
			  font-weight: bold;
			  src: url("/freescore/include/fonts/LinBiolinum_Rah.ttf"); }
			div[data-role="header"]                   { font-family: Optima, helvetica, sans-serif; text-align: center; }
			div[data-role="header"]      .title       { font-size: 24px; color: gold; }
			div[data-role="header"]      .version     { font-size: 10px; color: silver; }
			div[data-role="header"]      .description { color: silver; }
			div[data-role="header"]      a            { text-decoration: none; }
			div[data-role="footer"]                   { font-family: Optima, Biolinum, sans-serif; text-align: center; color: silver; }
			li[data-role="list-divider"]              { font-size: 14pt !important; padding-left: 10px !important; }
			li[data-role="list-divider"] .description { color: #888; font-weight: lighter; }
		</style>
		<script>
			var go = {
				grassroots : {
					registration: function() { window.location="./forms/grassroots/register.php"; },
					divisions:    function() { window.location="./forms/grassroots/divisions.php"; }
				},
				worldclass : {
					registration: function() { window.location="./forms/worldclass/register.php"; },
					divisions:    function() { window.location="./forms/worldclass/divisions.php"; }
				},
			};
		</script>
	</head>
	<body>
		<div data-role="page">
			<div data-role="header" data-position-fixed="true" data-theme="b">
				<div><span class="title">FreeScore TKD Wifi</span> <span class="version">v<?=$freescore[ 'version' ]?></span></div>
				<span class="description"><a href="http://mikewongtkd.github.io/freescoretkd">Open Source Taekwondo Poomsae Scoring Software</a> available under the GPL v2.</span>
			</div>
			<div data-role="main">
					<ul data-role="listview">
						<li data-role="list-divider">Sport Poomsae<span class="description">: Score poomsae following the WTF Sport Poomsae rules</span></li>
						<li><a href="javascript:go.worldclass.registration()">
							<h2>Register a Tablet or Computer for Sport Poomsae</h2>
							<p>Assign and ring and role for a ring laptop or judge tablet</p>
						</a></li>
						<li><a href="javascript:go.worldclass.divisions()">
							<h2>Manage Sport Poomsae Divisions</h2>
							<p>Add, remove, or edit divisions; also add or remove rings</p>
						</a></li>
						<li data-role="list-divider">Classic Poomsae<span class="description">: Score poomsae using an electronic version of the classic flip cards</span></li>
						<li><a href="javascript:go.grassroots.registration()">
							<h2>Register a Tablet or Computer for Classic Poomsae</h2>
							<p>Assign and ring and role for a ring laptop or judge tablet</p>
						</a></li>
						<li><a href="javascript:go.grassroots.divisions()">
							<h2>Manage Classic Poomsae Divisions</h2>
							<p>Add, remove, or edit divisions; also add or remove rings</p>
						</a></li>
					</ul>
			</div>
			<div data-role="footer" data-position-fixed="true" data-theme="b">
				&copy; <?= $freescore[ 'copyright' ] ?> Mike Wong All Rights Reserved. 
			</div>
		</div>
	</body>
</html>
