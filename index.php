<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>gas food lodging</title>
		<link rel="stylesheet" type="text/css" media="screen" href="gas.css">
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>

		<script type="text/javascript" src="soar.js"></script>
		<script type="text/javascript" src="gas.js"></script>
		<script type="text/javascript" src="hud.js"></script>
		<script type="text/javascript" src="map.js"></script>
		<script type="text/javascript" src="game.js"></script>
		<script type="text/javascript" src="player.js"></script>
		<script type="text/javascript" src="skybox.js"></script>
		<script type="text/javascript" src="card.js"></script>
		<script type="text/javascript" src="weeds.js"></script>
		<script type="text/javascript" src="ejecta.js"></script>
		<script type="text/javascript" src="paddler.js"></script>
		<script type="text/javascript" src="lookup.js"></script>
		
<?php
include("gas.glsl");
?>
		<script type="text/javascript">
			jQuery(window).bind("load", function() {
				GAS.start();
			});
		</script>
    </head>
	<body>
		<canvas id="gl"></canvas>
		<?php include("hud.html"); ?>
	</body>
</html>
