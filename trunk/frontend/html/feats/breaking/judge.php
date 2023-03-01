<?php 
  if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] )) { header( 'Location: register.php' ); exit(); }
  include( "../../include/php/config.php" ); 
  
  function referee() {
    return isset( $_COOKIE[ 'judge' ]) && $_COOKIE[ 'judge' ] == 1; # First judge is referee (Should be index 0 instead of 1, but whatever)
  }
?>
<html>
  <head>
    <link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
    <link href="../../include/alertify/css/alertify.min.css" rel="stylesheet">
    <link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet">
    <link href="include/css/judge.css" rel="stylesheet">
    <script src="../../include/jquery/js/jquery.js"></script>
    <script src="../../include/jquery/js/jquery-ui.min.js"></script>
    <script src="../../include/jquery/js/jquery.howler.min.js"></script>
    <script src="../../include/jquery/js/jquery.ui.touch-punch.min.js"></script>
    <script src="../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
    <script src="../../include/jquery/js/jquery.touchswipe.min.js"></script>
    <script src="../../include/jquery/js/jquery.cookie.js"></script>
    <script src="../../include/bootstrap/js/bootstrap.min.js"></script>
    <script src="../../include/bootstrap/add-ons/bootbox.min.js"></script>
    <script src="../../include/alertify/alertify.min.js"></script>
    <script src="../../include/js/freescore.js"></script>
  </head>
  <body>
    <div class="judge-scoring-interface">
      <div class="judge-tool-nav">
        <ul class="nav nav-pills nav-justified">
<?php if( referee()): ?>
          <li role="presentation" class="active"><a id="nav-deductions" href="#tool-deductions" data-toggle="pill">Deductions</a></li>
<?php endif; ?>
          <li role="presentation" <?php if( ! referee()): ?>class="active"<?php endif; ?>><a id="nav-scoring" href="#tool-scoring" data-toggle="pill">Scoring</a></li>
          <li role="presentation"><a id="nav-inspection" href="#tool-inspection" data-toggle="pill">Inspection</a></li>
          <li role="presentation"><a id="nav-help" href="#tool-help" data-toggle="pill">Help</a></li>
        </ul>
      </div>
      <div class="judge-tools tab-content">
<?php if( referee()): ?>
        <div role="tabpanel" class="tab-pane fade in active" id="tool-deductions">
<?php include( 'judge/deductions.php' ); ?>
        </div>
<?php endif; ?>
        <div role="tabpanel" class="tab-pane fade" id="tool-scoring">
<?php include( 'judge/scoring.php' ); ?>
        </div>
        <div role="tabpanel" class="tab-pane fade" id="tool-inspection">
<?php include( 'judge/inspection.php' ); ?>
        </div>
        <div role="tabpanel" class="tab-pane fade" id="tool-help">
<div class="division-summary"></div>
<?php include( 'judge/help/inspection.php' ); ?>
<?php include( 'judge/help/scoring.php' ); ?>
<?php include( 'judge/help/deductions.php' ); ?>
        </div>
      </div>
    </div>
  </body>
  <script src="include/js/score.js"></script>
  <script src="include/js/athlete.js"></script>
  <script src="include/js/division.js"></script>
  <script src="include/js/judge.js"></script>
  <script>
    // ============================================================
    // Alertify defaults
    // ============================================================
    alertify.set( 'notifier', 'position', 'top-right' );

    // ============================================================
    // Judge Tool: Deductions
    // ============================================================

    var sound      = {};
    var tournament = <?= $tournament ?>;
    var ring       = <?= $_COOKIE[ 'ring' ] ?>;
    var ws         = new WebSocket( `<?= $config->websocket( 'breaking' ) ?>/${tournament.db}/${ring}` );
    var state = {
      "current" : {
        "divid" : null,
        "athlete" : null
      },
      "score" : {
        "technical" : { 
          "difficulty" : 0.0<?php if( referee()): ?>,
          "deductions" : {
            "major" : 0.0,
            "minor" : 0.0
          }
        },
        "procedural" : {
          "deductions" : 0.0
<?php endif; ?>
        },
        "presentation" : {
          "technique"  : 0.0,
          "rhythm"     : 0.0,
          "style"      : 0.0,
          "creativity" : 0.0
        }
      }
    };

    sound.ok    = new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]});
    sound.error = new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]});
    sound.next  = new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]});
    sound.prev  = new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]});

    ws.onopen = () => {
      let request = { data : { type : 'division', action : 'read' }};
      request.json = JSON.stringify( request.data );
      ws.send( request.json );
    };

    ws.onmessage = response => {
      let update = JSON.parse( response.data );
      console.log( 'UPDATE', update );

      if( ! defined( update.division )) { return; }
      let division = new Division( update.division );
      let request  = update.request;

      if( request.type == 'division' ) {
        switch( request.action ) {
          case 'inspection': refresh.on.inspection( update ); break;
          case 'read'      : refresh.on.read( update );       break;
          case 'navigate'  : refresh.on.navigate( update );   break;
        }
      }
    };

  </script>
</html>
<!-- vim: ts=2 sw=2 expandtab -->
