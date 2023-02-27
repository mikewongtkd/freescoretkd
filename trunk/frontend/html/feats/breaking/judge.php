<?php 
  # $_COOKIE[ 'ring' ]  = 1;
  # $_COOKIE[ 'role' ]  = 'judge';
  # $_COOKIE[ 'judge' ] = 1';
  if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] )) { header( 'Location: register.php' ); exit(); }
  include( "../../include/php/config.php" ); 
  
  function referee() {
    return isset( $_COOKIE[ 'judge' ]) && $_COOKIE[ 'judge' ] == 1; # First judge is referee (Should be index 0 instead of 1, but whatever)
  }
?>
<html>
  <head>
    <link rel="stylesheet" href="../../include/jquery/css/smoothness/jquery-ui-1.10.3.custom.min.css">
    <link rel="stylesheet" href="../../include/jquery/css/smoothness/smoothness.min.css">
    <link rel="stylesheet" href="include/css/judge.css">
    <script src="../../include/jquery/js/jquery.js"></script>
    <script src="../../include/jquery/js/jquery-ui.min.js"></script>
    <script src="../../include/jquery/js/jquery.howler.min.js"></script>
    <script src="../../include/jquery/js/jquery.ui.touch-punch.min.js"></script>
    <script src="../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
    <script src="../../include/jquery/js/jquery.touchswipe.min.js"></script>
    <script src="../../include/jquery/js/jquery.cookie.js"></script>
    <script src="../../include/js/freescore.js"></script>
  </head>
  <body>
    <div class="judge-scoring-interface">
      <ul class="nav nav-pills">
<?php
if( referee()):
?>
        <li class="nav-item"><a class="nav-link active" href="#">Penalties</a></li>
<?php
  endif;
?>
    </div>
  </body>
</html>
<!-- vim: ts=2 sw=2 expandtab -->
