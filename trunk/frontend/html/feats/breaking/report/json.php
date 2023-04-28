<?php 
include( "../../../include/php/config.php" ); 
include( "../../../session.php" ); 
include( "../include/php/breaking.php" );
$ring   = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : (isset( $_COOKIE[ 'ring' ]) ? $_COOKIE[ 'ring' ] : null);
$divid  = isset( $_GET[ 'divid' ]) ? $_GET[ 'divid' ] : (isset( $_COOKIE[ 'divid' ]) ? $_COOKIE[ 'divid' ] : null);
$format = isset( $_GET[ 'format' ]) ? $_GET[ 'format' ] : 'html';
?>
<html>
  <head>
    <link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
    <link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../include/css/report.css" rel="stylesheet" />
    <script src="../../../include/jquery/js/jquery.js"></script>
    <script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
    <script src="../../../include/js/freescore.js"></script>
    <script src="../include/js/score.js"></script>
    <script src="../include/js/athlete.js"></script>
    <script src="../include/js/division.js"></script>
  </head>
  <body>
    <div class="container">
      <pre class="json">
      </pre>
    </div>
    <script>
      var handle  = {
        ring : {
          read : update => {
<?php if( isset( $divid )): ?>
            let found = update.ring.divisions.find( division => division.name == '<?= $divid ?>' );
            if( ! found ) { return; }
			$( 'pre' ).empty();
			$( 'pre' ).append( JSON.stringify( found, null, 2 ));

<?php else: ?>
            $( '.pre' ).empty();
			$( 'pre' ).append( JSON.stringify( update, null, 2 ));
<?php endif; ?>
          }
        }
      }
      var network = {
        open: () => {
          network.send({ data : { type : 'ring', ring : <?= $ring ?>, action : 'read' }});
        },
        message: ( response ) => { 
          let update = JSON.parse( response.data );
          console.log( update );

          let type = update.type;
          if( ! (type in handle))           { return; }

          let action = update.action;
          if( ! (action in handle[ type ])) { return; }

          handle[ type ][ action ]( update );
        },
        send: request => {
          request.json = JSON.stringify( request.data ); 
          ws.send( request.json );
        }
      };

      var tournament = <?= $tournament ?>;
      var ring       = { num : <?= $ring ?> };
      var ws         = new WebSocket( `<?= $config->websocket( 'breaking' ) ?>/${tournament.db}/${ring.num}` );
      ws.onopen      = network.open;
      ws.onmessage   = network.message;

    </script>
  </body>
</html>
<!-- vim: set ts=2 sw=2 expandtab -->
