<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>sargasso</title>
		<link rel="stylesheet" type="text/css" media="screen" href="gas.css">
		<link rel="stylesheet" type="text/css" media="screen" href="/shared/toybox.css">
		<script type="text/javascript" src="/shared/jquery-1.7.1.js"></script>

		<script type="text/javascript" src="/debug/soar/soar.js"></script>
		<script type="text/javascript" src="/debug/soar/vector.js"></script>
		<script type="text/javascript" src="/debug/soar/quaternion.js"></script>
		<script type="text/javascript" src="/debug/soar/rotator.js"></script>
		<script type="text/javascript" src="/debug/soar/noise.js"></script>
		<script type="text/javascript" src="/debug/soar/camera.js"></script>
		<script type="text/javascript" src="/debug/soar/mesh.js"></script>
		<script type="text/javascript" src="/debug/soar/shader.js"></script>
		<script type="text/javascript" src="/debug/soar/texture.js"></script>
		<script type="text/javascript" src="/debug/soar/display.js"></script>

		<script type="text/javascript" src="/debug/gas/gas.js"></script>
		<script type="text/javascript" src="/debug/gas/hud.js"></script>
		<script type="text/javascript" src="/debug/gas/map.js"></script>
		<script type="text/javascript" src="/debug/gas/game.js"></script>
		<script type="text/javascript" src="/debug/gas/player.js"></script>
		<script type="text/javascript" src="/debug/gas/skybox.js"></script>
		<script type="text/javascript" src="/debug/gas/card.js"></script>
		<script type="text/javascript" src="/debug/gas/bolus.js"></script>
		<script type="text/javascript" src="/debug/gas/weeds.js"></script>
		<script type="text/javascript" src="/debug/gas/ejecta.js"></script>
		<script type="text/javascript" src="/debug/gas/paddler.js"></script>
		
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
		<?php include($_SERVER["DOCUMENT_ROOT"] . "/shared/toybox.php"); ?>
		<canvas id="gl"></canvas>
		<?php include("hud.html"); ?>
	</body>
</html>
