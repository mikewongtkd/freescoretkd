<?php 
include( "../../include/php/config.php" ); 
include( "../../session.php" ); 
$ring = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : (isset( $_COOKIE[ 'ring' ]) ? $_COOKIE[ 'ring' ] : null);
?>
<html>
  <head>
    <link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
    <link href="./include/css/display.css" rel="stylesheet" />
    <link href="../../include/page-transitions/css/animations.css" rel="stylesheet" />
    <link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
    <link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
    <script src="../../include/jquery/js/jquery.js"></script>
    <script src="../../include/jquery/js/jquery-ui.min.js"></script>
    <script src="../../include/jquery/js/jquery.howler.min.js"></script>
    <script src="../../include/jquery/js/jquery.purl.js"></script>
    <script src="../../include/jquery/js/jquery.cookie.js"></script>
    <script src="../../include/alertify/alertify.min.js"></script>
    <script src="../../include/js/freescore.js"></script>
    <script src="./include/js/score.js"></script>
    <script src="./include/js/athlete.js"></script>
    <script src="./include/js/division.js"></script>
  </head>
  <body>
    <div id="pt-main" class="pt-perspective">
      <div class="pt-page pt-page-1">
        <div class="scoreboard container">
          <div class="division-summary"></div>
          <div class="athlete-info">
            <div class="athlete-noc"></div>
            <div class="athlete-name"></div>
            <div class="athlete-boards"></div>
          </div>
          <div class="timer-display"><span class="fas fa-clock"></span> <span class="time">0:00</span></div>
          <div class="judge-scores">
            <div class="judge score r "><label>R</label><div class="tech"></div><div class="pres"></div><div class="received"></div></div>
            <div class="judge score j1"><label>J1</label><div class="tech"></div><div class="pres"></div><div class="received"></div></div>
            <div class="judge score j2"><label>J2</label><div class="tech"></div><div class="pres"></div><div class="received"></div></div>
            <div class="judge score j3"><label>J3</label><div class="tech"></div><div class="pres"></div><div class="received"></div></div>
            <div class="judge score j4"><label>J4</label><div class="tech"></div><div class="pres"></div><div class="received"></div></div>
            <div class="score mean"><label>AVG</label><div class="tech"></div><div class="pres"></div></div>
          </div>
          <div class="score-display">
            <div class="subtotal">
              <label>Subtotal</label>
              <span></span>
            </div>
            <div class="deductions">
              <div class="tech">
                <label>Technical Deductions</label>
                <span></span>
              </div>
              <div class="proc">
                <label>Procedural Deductions</label>
                <span></span>
              </div>
            </div>
            <div class="total">
              <label>Final Score</label>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="pt-page pt-page-2">
        <div class="leaderboard container">
          <div class="leaderboard-rankings"></div>
        </div>
      </div>
    </div>
    <script src="../../include/page-transitions/js/pagetransitions.js"></script>
    <script src="./include/js/display.js"></script>
    <script type="text/javascript">
      var screen    = { scale: 1.0, offsetX : 0, offsetY : 0 };
      screen.zoom = function( scale )  { screen.scale   += scale;  $( 'body' ).css({ 'transform' : `scale( ${screen.scale.toFixed( 2 )}) translateX( ${screen.offsetX}) translateY( ${screen.offsetY})` }); alertify.notify( `Zooming to ${screen.scale.toFixed( 2 )}` ); };
      screen.panX = function( deltaX ) { screen.offsetX += deltaX; $( 'body' ).css({ 'transform' : `scale( ${screen.scale.toFixed( 2 )}) translateX( ${screen.offsetX}) translateY( ${screen.offsetY})` }); alertify.notify( `Panning to ${screen.offsetX}, ${screen.offsetY}` ); };
      screen.panY = function( deltaY ) { screen.offsetY += deltaY; $( 'body' ).css({ 'transform' : `scale( ${screen.scale.toFixed( 2 )}) translateX( ${screen.offsetX}) translateY( ${screen.offsetY})` }); alertify.notify( `Panning to ${screen.offsetX}, ${screen.offsetY}` ); };
      $( 'body' ).keydown(( ev ) => {
        switch( ev.keyCode ) {
          case 74:  screen.panX( -10 ); break;   // j key
          case 76:  screen.panX(  10 ); break;   // l key
          case 73:  screen.panY( -10 ); break;   // i key
          case 75:  screen.panY(  10 ); break;   // k key
          case 187: screen.zoom(  0.05 ); break; // +/-
          case 189: screen.zoom( -0.05 ); break; // -/_
      }});
      var tournament = <?= $tournament ?>;
      var ring       = { num : <?= $ring ?> };
      var ws         = new WebSocket( `<?= $config->websocket( 'breaking' ) ?>/${tournament.db}/${ring.num}` );
      var state      = { time : { elapsed : 0, start : null, stop : null, limit : 180, timer : null }};
      ws.onopen      = network.open;
      ws.onmessage   = network.message;

    </script>
  </body>
</html>
<!-- vim: set ts=2 sw=2 expandtab -->
