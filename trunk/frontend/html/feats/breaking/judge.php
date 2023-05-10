<?php 
  $ring  = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
  $judge = isset( $_GET[ 'judge' ]) ? $_GET[ 'judge' ] : $_COOKIE[ 'judge' ];
  if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] )) { header( 'Location: register.php' ); exit(); }
  include( "../../include/php/config.php" ); 
  include( "../../session.php" ); 

  $url = $config->websocket( 'breaking', $ring, "judge{$judge}" );
  
  function referee() {
    global $judge;
    return $judge == 0;
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
    <script src="../../include/js/websocket.js"></script>
    <script src="../../include/js/sound.js"></script>
    <script src="../../include/js/app.js"></script>
  </head>
  <body>
    <div class="judge-scoring-interface">
      <div class="judge-page-nav">
        <ul class="nav nav-pills nav-justified">
          <li class="ring-judge"><div class="ring">Ring <?= $ring ?></div><div class="judge"><?= $judge == 0 ? 'Referee' : "Judge {$judge}" ?></div></li>
<?php if( referee()): ?>
          <li role="presentation" class="active"><a id="nav-deductions" href="#page-deductions" data-toggle="pill">Deductions</a></li>
<?php endif; ?>
          <li role="presentation" <?php if( ! referee()): ?>class="active"<?php endif; ?>><a id="nav-scoring" href="#page-scoring" data-toggle="pill">Scoring</a></li>
          <li role="presentation"><a id="nav-inspection" href="#page-inspection" data-toggle="pill">Inspection</a></li>
          <li role="presentation"><a id="nav-help" href="#page-help" data-toggle="pill">Help</a></li>
        </ul>
      </div>
      <div class="judge-pages tab-content">
<?php if( referee()): ?>
        <div role="tabpanel" class="tab-pane fade in active" id="page-deductions">
<?php include( 'judge/deductions.php' ); ?>
        </div>
<?php endif; ?>
        <div role="tabpanel" class="tab-pane fade <?php if( ! referee()): ?>in active<?php endif; ?>" id="page-scoring">
<?php include( 'judge/scoring.php' ); ?>
        </div>
        <div role="tabpanel" class="tab-pane fade" id="page-inspection">
<?php include( 'judge/inspection.php' ); ?>
        </div>
        <div role="tabpanel" class="tab-pane fade" id="page-help">
<?php include( 'judge/help/inspection.php' ); ?>
<?php include( 'judge/help/scoring.php' ); ?>
<?php include( 'judge/help/deductions.php' ); ?>
<?php include( 'judge/help/coordinator.php' ); ?>
        </div>
      </div>
    </div>
  </body>
  <script src="include/js/score.js"></script>
  <script src="include/js/athlete.js"></script>
  <script src="include/js/division.js"></script>
  <script>
    // ============================================================
    // Alertify defaults
    // ============================================================
    alertify.set( 'notifier', 'position', 'top-right' );

    // ============================================================
    // Judge Tool: Deductions
    // ============================================================

    var app = new FreeScore.App();

    app
      .on.connect( '<?= $url ?>' )
      .request({ type : 'ring', action : 'read' });

    app.state.current = { divid : null, athleteid : null };
    app.state.judge   = <?= $judge ?>;
    app.state.reset   = () => { 
        app.state.current.divid = null; 
        app.state.current.athleteid = null; 
        app.state.score = { 
          technical : { difficulty : 0.0, deductions : { major : 0.0, minor : 0.0 }}, 
          procedural : { deductions : 0.0 }, 
          presentation : { technique : 0.0, rhythm : 0.0, style : 0.0, creativity : 0.0 }
        };
    };

    app.state.reset();
   
  </script>
  <script src="include/js/judge.js"></script>
</html>
<!-- vim: set ts=2 sw=2 expandtab -->
