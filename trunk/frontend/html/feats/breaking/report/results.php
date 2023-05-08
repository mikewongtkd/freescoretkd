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
      <div class="results">
        <div class="division-description"></div>
        <table class="table table-striped placements">
          <thead>
            <th class="place">Place</th>
            <th class="usatid">USAT ID</th>
            <th class="name">Name</th>
            <th class="score">Score</th>
            <th class="tb1">TB1</th>
            <th class="tb2">TB2</th>
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
              placement : { table : $( '.placements tbody' ) }
            };

            display.placement.table.empty();
            let division = new Division( found );
            let athletes = division.athletes();
            display.division.description.html( `<b>${division.name().toUpperCase()}</b> &mdash; ${division.description()}` );
            division.placements().forEach( placement => {
              placement.athletes.forEach( aid => {
                let athlete = athletes[ aid ];
                let tb1     = placement.show.includes( 'tb1' ) ? athlete.tb1() : '';
                let tb2     = placement.show.includes( 'tb2' ) ? athlete.tb2() : '';
                let row     = $( `<tr><td>${placement.place}<td>${athlete.info( 'usatid' )}</td><td>${ athlete.name() }</td><td>${ athlete.score() }</td><td>${tb1}</td><td>${tb2}</td></tr>` );
                display.placement.table.append( row );
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
                placement : { table : results.find( '.placements tbody' ) }
              };
              division = new Division( division );
              let athletes = division.athletes();
              display.division.description.html( `<b>${division.name().toUpperCase()}</b> &mdash; ${division.description()}` );
              division.placements().forEach( placement => {
                placement.athletes.forEach( aid => {
                  let athlete = athletes[ aid ];
                  let tb1     = placement.show.includes( 'tb1' ) ? athlete.tb1() : '';
                  let tb2     = placement.show.includes( 'tb2' ) ? athlete.tb2() : '';
                  let row     = $( `<tr><td>${placement.place}<td>${ athlete.info( 'usatid' ) }</td><td>${ athlete.name() }</td><td>${ athlete.score() }</td><td>${tb1}</td><td>${tb2}</td></tr>` );
                  display.placement.table.append( row );
                });
              });
              $( '.container' ).append( results );
            });
<?php endif; ?>
          }
        },
        server : {
          ping : update => {
            network.send({ type : 'server', action : 'stop ping' });
          }
        },
        users : {
          update : update => {}
        }
      }
      var network = {
        open: () => {
          network.send({ type : 'ring', ring : <?= $ring ?>, action : 'read' });
        },
        message: ( response ) => { 
          let update = JSON.parse( response.data );
          if( update.type != 'server' && update.action != 'ping' ) {
            console.log( update );
          }

          let type = update.type;
          if( ! (type in handle))           { return; }

          let action = update.action;
          if( ! (action in handle[ type ])) { return; }

          handle[ type ][ action ]( update );
        },
        send: data => {
          let request = { data };
          request.json = JSON.stringify( request.data ); 
          ws.send( request.json );
        }
      };

      var tournament = <?= $tournament ?>;
      var ring       = { num : <?= $ring ?> };
      var ws         = new WebSocket( `<?= $config->websocket( 'breaking' ) ?>/${tournament.db}/${ring.num}/report` );
      ws.onopen      = network.open;
      ws.onmessage   = network.message;

    </script>
  </body>
</html>
<!-- vim: set ts=2 sw=2 expandtab -->
