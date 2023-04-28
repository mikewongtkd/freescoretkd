<?php 
include( "../../../include/php/config.php" ); 
include( "../../../session.php" ); 
include( "../include/php/breaking.php" );
$ring   = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : (isset( $_COOKIE[ 'ring' ]) ? $_COOKIE[ 'ring' ] : null);
$divid  = isset( $_GET[ 'divid' ]) ? $_GET[ 'divid' ] : (isset( $_COOKIE[ 'divid' ]) ? $_COOKIE[ 'divid' ] : null);
$format = isset( $_GET[ 'format' ]) ? $_GET[ 'format' ] : 'html';
if( $format == 'csv' ) {
  $breaking = new BreakingDivision( $divid, $ring );

} else if( $format == 'json' ) {
  $breaking = new BreakingDivision( $divid, $ring );
  echo( $breaking->json());
  exit();
}
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
      <div class="results">
        <div class="division-description"></div>
        <table class="table table-striped draws">
          <thead>
            <th class="order">#</th>
            <th class="name">Name</th>
            <th class="usatid">USAT ID</th>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    </div>
    <script>
      var handle  = {
        ring : {
          read : update => {
<?php if( isset( $divid )): ?>
            let found = update.ring.divisions.find( division => division.name == '<?= $divid ?>' );
            if( ! found ) { return; }

            let display = {
              division : { description : $( '.division-description' ) },
              draw : { table : $( '.draws tbody' ) }
            };

            display.draw.table.empty();
            let division = new Division( found );
            let athletes = division.athletes();
            display.division.description.html( `<b>${division.name().toUpperCase()}</b> &mdash; ${division.description()}` );
            athletes.forEach(( athlete, i ) => {
                let num     = i + 1;
                let row     = $( `<tr><td class="order">${num}</td><td class="name">${ athlete.name() }</td><td class="usatid">${ athlete.info( 'usatid' ) }</td></tr>` );
                display.draw.table.append( row );
              });
            });
<?php else: ?>
            let template = $( '.results' );
            template.detach();

            $( '.container' ).empty();
            update.ring.divisions.forEach( division => {
              let results = template.clone();
              let display = {
                division : { description : results.find( '.division-description' ) },
                draw : { table : results.find( '.draws tbody' ) }
              };
              division = new Division( division );
              let athletes = division.athletes();
              display.division.description.html( `<b>${division.name().toUpperCase()}</b> &mdash; ${division.description()}` );
              athletes.forEach(( athlete, i ) => {
                let num     = i + 1;
                let row     = $( `<tr><td class="order">${num}</td><td class="name">${ athlete.name() }</td><td class="usatid">${ athlete.info( 'usatid' ) }</td></tr>` );
                display.draw.table.append( row );
              });
              $( '.container' ).append( results );
            });
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
