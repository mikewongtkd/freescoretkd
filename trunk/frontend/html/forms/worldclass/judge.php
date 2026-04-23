<?php

include( "../../include/php/config.php" ); 
$rnum = intval( isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ]);
$jid  = intval( isset( $_GET[ 'judge' ] ) ? $_GET[ 'judge' ] : $_COOKIE[ 'judge' ]);
if( $rnum == 'staging' || in_array( $rnum, $config->rings())) { 
  setcookie( 'ring', $rnum, 0, '/' ); 
  $cookie_set = true;
} else {
  setcookie( 'ring', 1, 0, '/' ); 
}
include( '../../session.php' );

$url = $config->websocket( 'worldclass', $rnum, "judge{$judge}" );

?>
<html>
  <head>
    <link href="../../include/css/forms/worldclass/judgeController2.css" rel="stylesheet" />
    <link href="../../include/css/forms/worldclass/presentationWidgets.css" rel="stylesheet" />
    <link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
    <link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
    <link href="../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
    <link href="../../include/fontawesome//css/font-awesome.min.css" rel="stylesheet" />
    <script src="../../include/jquery/js/jquery.howler.min.js"></script>
    <script src="../../include/jquery/js/jquery.js"></script>
    <script src="../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
    <script src="../../include/jquery/js/jquery.cookie.js"></script>
    <script src="../../include/bootstrap/js/bootstrap.min.js"></script>
    <script src="../../include/alertify/alertify.min.js"></script>
    <script src="../../include/js/freescore.js"></script>
    <script src="../../include/js/uuid.js"></script>
    <script src="../../include/js/websocket.js"></script>
    <script src="../../include/js/sound.js"></script>
    <script src="../../include/js/event.js"></script>
    <script src="../../include/js/app.js"></script>
    <script src="../../include/js/widget.js"></script>
    <script src="../../include/js/ioc.js"></script>
    <script src="widgets/judge/score.js"></script>
    <script src="widgets/judge/accuracy.js"></script>
    <script src="widgets/judge/presentation.js"></script>
    <script src="widgets/judge/divinfo.js"></script>
    <script src="widgets/judge/divlist.js"></script>
    <script src="widgets/judge/remote.js"></script>
    <script src="../../include/js/forms/worldclass/form.class.js"></script>
    <script src="../../include/js/forms/worldclass/score.class.js"></script>
    <script src="../../include/js/forms/worldclass/athlete.class.js"></script>
    <script src="../../include/js/forms/worldclass/division.class.js"></script>
  </head>
  <body>
    <div id="pt-main" class="pt-perspective judge-controller">
      <!-- ============================================================ -->
      <!-- SCORE ATHLETE -->
      <!-- ============================================================ -->
      <div class="pt-page pt-page-1" id="pt-page-1">
      </div>

      <!-- ============================================================ -->
      <!-- PREVIOUS SCORES AND REMOTE CONTROLS -->
      <!-- ============================================================ -->
      <div class="pt-page pt-page-2" id="pt-page-2">
      </div>
    </div>
    <!-- ============================================================ -->
    <!-- DISPLAY CONFIGURATION MODAL -->
    <!-- ============================================================ -->
    <div class="display-config modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Display Configuration and Reset</h4>
          </div>
          <div class="modal-body">
            <div class="display-config-group row">
              <label class="col-sm-4">Pan</label>
              <div class="btn-group col-sm-8">
                <button type="button" class="btn pan btn-pan-up"><span class="fas fa-arrow-up"></span></button>
                <button type="button" class="btn pan btn-pan-down"><span class="fas fa-arrow-down"></span></button>
                <button type="button" class="btn pan btn-pan-left"><span class="fas fa-arrow-left"></span></button>
                <button type="button" class="btn pan btn-pan-right"><span class="fas fa-arrow-right"></span></button>
              </div>
            </div>
            <div class="display-config-group row">
              <label class="col-sm-4">Zoom</label>
              <div class="btn-group col-sm-8">
                <button type="button" class="btn zoom btn-zoom-out"><span class="fas fa-search-minus"></span></button>
                <button type="button" class="btn zoom btn-zoom-in"><span class="fas fa-search-plus"></span></button>
                <button type="button" class="btn zoom btn-full-screen"><span class="fas fa-expand"></span></button>
              </div>
            </div>
            <div class="display-config-group row">
              <label class="col-sm-4">Reconnect or Reboot</label>
              <div class="btn-group col-sm-8">
                <button type="button" class="btn reload btn-reload"><span class="fas fa-wifi"></span></button>
                <button type="button" class="btn reboot btn-reboot"><span class="fas fa-power-off"></span></button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default btn-cancel">Cancel</button>
            <button type="button" class="btn btn-default btn-defaults">Restore to Defaults</button>
            <button type="button" class="btn btn-primary btn-ok">OK</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      let tournament = <?= $tournament ?>;
      let ring       = { num: <?= $rnum ?> };
      let html       = FreeScore.html;
      let app        = new FreeScore.App( ring.num );
      $(() => { $( 'body' ).nodoubletapzoom(); });

      alertify.defaults.theme.ok     = "btn btn-danger";
      alertify.defaults.theme.cancel = "btn btn-warning";
      $.cookie.json = true;

      // ===== NETWORK CONNECT
      app.on.connect( '<?= $url ?>' ).read.division();

      // ===== MODAL
      app.modal.display = { 
        config: {
          all: $( '.display-config.modal' ), 
          show: () => {
            app.modal.display.config.all.modal( 'show' );
          },
          hide: () => {
            app.modal.display.config.all.modal( 'hide' );
          }
        }
      };

      // ===== DISPLAY CONFIG
      app.display.config  = { current: { zoom: 1.0, pan: { x: 0, y: 0 }}};
      app.display.cookie  = 'judge-cutoff-app-display';
      app.display.config.apply = () => {
        let display = app.display.config.current;
        $( '#pt-main' ).css({ transform: `scale( ${display.zoom}) translate( ${Math.round( display.pan.x * 100 )}%, ${Math.round( display.pan.y * 100)}% )`, 'transform-origin': '0 0' });
      }
      app.display.config.reset = () => {
        $.removeCookie( app.display.cookie );
        app.display.config.current = { zoom: 1.0, pan: { x: 0, y: 0 }};
      };

      app.display.config.defaults = () => {
        if( ! defined( $.cookie( app.display.cookie ))) { app.display.config.reset(); return; }
        app.display.config.current = $.cookie( app.display.cookie ); 
      };
      app.display.config.save = () => {
        $.cookie( app.display.cookie, app.display.config.current, { expires: 1 }); 
      };
      app.display.config.restore = () => {
        let settings = $.cookie( app.display.cookie );
        if( defined( settings )) { 
          app.display.config.current = settings;
          app.display.config.apply();
        } else {
          app.display.config.reset(); 
        }
      };
      app.display.panzoom = delta => {
        let display = app.display.config.current;
        display.pan.x = parseFloat((display.pan.x + delta.x).toFixed( 2 ));
        display.pan.y = parseFloat((display.pan.y + delta.y).toFixed( 2 ));
        display.zoom  = parseFloat((display.zoom  + delta.z).toFixed( 2 ));

        alertify.dismissAll();
        if( delta.z != 0 ) { alertify.notify( `Zoom: ${Math.round( display.zoom * 100 )}%` ); }
        else               { alertify.notify( `Pan: X: ${Math.round( display.pan.x * 100 )}%, Y: ${Math.round( display.pan.y * 100 )}%` ); }

        app.display.config.apply();
      }

      app.display.reset = ( division = null ) => {
        const widgets = [ 'major', 'minor', 'power', 'rhythm', 'ki', 'divinfo', 'score' ];
        widgets.forEach( widget => { 
          if( app.widget[ widget ].display?.reset ) {
            app.widget[ widget ].display.reset( division ); 
          } else {
            console.log( 'RESET FAILED', `${widget} does not have a display.reset() method` );
          }
        });
      };

      // ===== BUTTONS & BEHAVIOR
      app.button.config   = { display: $( '<div class="btn-configure-display">Settings</div>' ) };
      app.button.divList  = $( '<div class="btn-division-list">Division List</div>' );
      app.button.send     = $( '<div class="btn-send" role="button">Send</div>' );
      app.button.scoring  = $( '<div class="btn-return-to-score" role="button">Return to Scoring</div>' );
      app.button.zoom     = $( '.display-config .btn.zoom' );
      app.button.pan      = $( '.display-config .btn.pan' );
      app.button.reload   = $( '.display-config .btn.reload' );
      app.button.reboot   = $( '.display-config .btn.reboot' );
      app.button.ok       = $( '.display-config .btn-ok' );
      app.button.cancel   = $( '.display-config .btn-cancel' );
      app.button.defaults = $( '.display-config .btn-defaults' );

      app.button.divList.off( 'click' ).click( ev => {
        app.page.show.division();
        app.sound.next.play();
      });

      app.button.config.display.off( 'click' ).click( ev => {
        app.modal.display.config.show();
      });

      app.button.scoring.off( 'click' ).click( ev => {
        app.page.show.scoring();
        app.sound.prev.play();
      });

      // ------------------------------------------------------------
      app.button.send.off( 'click' ).click( ev => {
      // ------------------------------------------------------------
        let current   = app.state.current;
        let reconnect = app.state.reconnect;
        let score     = app.state.score;
        let send      = () => {
          alertify.notify( "Sending score" );
          let request = { type : 'division', action : 'score', judge: current.judge, score };
          app.network.send( request );

          if( reconnect.interval !== null ) { clearInterval( reconnect.interval ); }
          reconnect.interval = setInterval(() => { 
            if( reconnect.attempt >= 3 ) {
              alertify.error( `Failed to connect to server. Raise your hand and call for &quot;Referee&quot; to request help from a FreeScore technician.` );
              reconnect.cancel();
              return;
            }
            reconnect.attempt++; 

            alertify.message( `Re-sending ${jname} scores (attempt ${reconnect.attempt} out of 3).` );
            let request = { type: 'division', action: 'score', judge: current.judge, score };
            app.on.reconnect().send( request );

          }, reconnect.delay );
        };

        // ===== VALIDATE SCORE
        // Check for incomplete score
        const category = { power: 'Power and Speed', rhythm: 'Rhythm and Timing', ki: 'Expression of Energy' };
        let incomplete = [ 'power', 'rhythm', 'ki' ].find( field => score[ field ] == 0 );
        if( defined( incomplete )) {
          alertify.error( `Please provide a presentation score for the <i>${category[ incomplete ]}</i> category.` );
          return;
        }

        // Check for perfect accuracy
        if( score.major == 0 && score.minor == 0 ) {
          alertify.confirm( 
            'Perfect Accuracy?', 
            'The accuracy score is 4.0; is this intentional? Tap <b>OK</b> to accept a 4.0 accuracy, or <b>Cancel</b> to dismiss this dialog and change your score.',
            () => { send(); },
            () => {}
          );
        } else {
          send();
        }
      });

      app.button.pan.off( 'click' ).click( ev => {
        let target = $( ev.target );
        if( ! target.hasClass( 'btn' )) { target = target.parent( '.btn' ); }

        let display = app.display.config.current;
        if( target.hasClass( 'btn-pan-up' ))    { app.display.panzoom({ x:  0.00, y: -0.05, z:  0.00 }); } else
        if( target.hasClass( 'btn-pan-down' ))  { app.display.panzoom({ x:  0.00, y:  0.05, z:  0.00 }); } else
        if( target.hasClass( 'btn-pan-left' ))  { app.display.panzoom({ x: -0.05, y:  0.00, z:  0.00 }); } else
        if( target.hasClass( 'btn-pan-right' )) { app.display.panzoom({ x:  0.05, y:  0.00, z:  0.00 }); }
      });

      app.button.zoom.off( 'click' ).click( ev => {
        let target = $( ev.target );
        if( ! target.hasClass( 'btn' )) { target = target.parent( '.btn' ); }

        let display = app.display.config.current;
        if( target.hasClass( 'btn-zoom-in' )) {
          app.display.panzoom({ x: 0, y: 0, z: +0.05 });
        } else if( target.hasClass( 'btn-zoom-out' )) {
          app.display.panzoom({ x: 0, y: 0, z: -0.05 });
        } else {
          document.documentElement.requestFullscreen();
        }
      });

      app.button.reload.off( 'click' ).click( ev => { window.location.reload(); });
      app.button.reboot.off( 'click' ).click( ev => { 
        app.state.reset();
        window.location.reload(); 
      });

      app.button.ok.off( 'click' ).click( ev => {
        app.display.config.save();
        app.modal.display.config.hide();
      });

      app.button.cancel.off( 'click' ).click( ev => {
        app.display.config.restore();
        app.modal.display.config.hide();
      });

      app.button.defaults.off( 'click' ).click( ev => {
        app.display.config.reset();
        window.location.reload();
        app.modal.display.config.hide();
      });

      // ===== STATE
      app.state.current   = { ring: <?= $rnum ?>, judge: <?= $jid ?>, divid: null, round: null, form: null, page: 'scoring', score: null };
      app.state.cookie    = 'judge-app';
      app.state.reconnect = { interval: null, attempts: 0, delay: 6500 };

      app.state.score = { major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 };

      app.state.reconnect.cancel = () => {
        if( app.state.reconnect.interval !== null ) {
          clearInterval( app.state.reconnect.interval );
        }
        app.state.reconnect.attempt  = 0; 
        app.state.reconnect.interval = null; 
      };

      app.state.reset = () => { 
        $.removeCookie( app.state.cookie ); 
        app.state.current = { ring: <?= $rnum ?>, judge: <?= $jid ?>, divid: null, round: null, form: null, page: 'scoring', score: null }; 
        app.state.score   = { major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 };
      };

      app.state.restore = () => { 
        if( ! defined( $.cookie( app.state.cookie ))) { app.state.reset(); return; }
        app.state.current = $.cookie( app.state.cookie ); 
        app.state.score   = app.state.current.score;
        app.page.transition( app.state.current.page );
      };

      app.state.save = () => { 
        app.state.current.score = app.state.score;
        app.state.current.page  = Object.keys( app.page.for ).find( page => app.page.for[ page ] == app.page.num );
        $.cookie( app.state.cookie, app.state.current, { expires: 1 }); 
      };

      // ===== PAGES
      app.page = {
        count: 2,
        num: 1,
        for : {
          scoring: 1,
          division: 2
        },
        show : {
          scoring:      () => { app.page.transition( 'scoring' ); },
          division:     () => { app.page.transition( 'division' ); }
        },
        transition: target => { 
          let pnum = app.page.for?.[ target ] ? app.page.for[ target ] : app.page.for.accuracy;
          app.page.num = pnum;
          app.state.current.page = target;
          app.state.save();
          $( '.pt-page' ).hide();
          $( `.pt-page-${pnum}` ).show();
        }
      };

      // ============================================================
      // RESTORE FROM COOKIE ON LOAD
      // ============================================================
      app.state.restore();
      app.display.config.restore(); // Load display state from cookie (pan/zoom)
      app.display.config.apply();   // Apply display state

      // ============================================================
      // APP COMPOSITION
      // ============================================================
      app.widget = {
        divinfo:      new FreeScore.Widget.DivInfo( app, 'pt-page-1' ),
        score:        new FreeScore.Widget.Score( app, 'pt-page-1' ),
        major:        new FreeScore.Widget.Accuracy( app, 'pt-page-1', 0.3 ),
        minor:        new FreeScore.Widget.Accuracy( app, 'pt-page-1', 0.1 ),
        power:        new FreeScore.Widget.Presentation( app, 'pt-page-1', 'power' ),
        rhythm:       new FreeScore.Widget.Presentation( app, 'pt-page-1', 'rhythm' ),
        ki:           new FreeScore.Widget.Presentation( app, 'pt-page-1', 'ki' ),
        divlist:      new FreeScore.Widget.DivList( app, 'pt-page-2' ),
        remote:       new FreeScore.Widget.Remote( app, 'pt-page-2' )
      };

      // Division List button
      app.widget.score.display.all.after( app.button.divList );

      // Configure Display Modal button
      app.widget.score.display.all.after( app.button.config.display );

      // Presentation Score Label
      app.widget.power.display.all.before( '<div class="control-label">Presentation Score</div>' );

      // Send button
      app.widget.ki.display.all.after( app.button.send );

      // Return to Scoring button
      app.widget.remote.display.all.after( app.button.scoring );

      app.forwardIf = {
        sbs: division => {
          let method = division.current.method();
          let ring   = division.ring();

          if( method == 'sbs' ) { window.location = `sbs/judge.php?ring=<?= $rnum ?>&judge=<?= $jid ?>`; }
        },
        se: division => {
          let method = division.current.method();
          let ring   = division.ring();

          if( method == 'se' ) { window.location = `se/judge.php?ring=<?= $rnum ?>&judge=<?= $jid ?>`; }
        }
      };

      // ============================================================
      // NETWORK
      // ============================================================
      app.network.on
        // ============================================================
        .heard( 'division' )
        // ============================================================
          .command( 'update' )
            .respond( update => {
              let division = update?.division;
              if( ! defined( division )) { return; }
              if( update?.request?.type == 'users' ) { return; }

              division = new Division( division );
              if( ! defined( app.state.division )) {
                app.state.division = division.data();
              }

              app.forwardIf.sbs( division );
              app.forwardIf.se( division );

              app.widget.score.display.reset( division );

              if( update.request.action == 'score' ) {
                let current = app.state.current;
                let aname   = division.current.athlete().display.name();
                let jname   = current.judge == 0 ? 'Referee' : `Judge ${current.judge}`;
                if( update.request.judge != current.judge ) { return; }
                app.state.reconnect.cancel(); // Cancel queued precautionary reconnect/resend actions
                app.sound.ok.play();
                alertify.success( `Server received ${jname} score for ${aname}.` ); 
              }

              let current   = app.state.current;
              let different = {
                ring:    current.ring    != <?= $rnum ?>,
                judge:   current.judge   != <?= $jid ?>,
                divid:   current.divid   != division.name(),
                round:   current.round   != division.current.roundId(),
                athlete: current.athlete != division.current.athlete().id(),
                form:    current.form    != division.current.formId()
              };

              if( different.ring || different.judge || different.divid || different.round || different.athlete || different.form ) {
                app.state.reset();
                app.display.reset( division );
                app.state.division = division.data();

                let current = app.state.current;
                current.athlete = division.current.athlete().id();
                current.ring    = <?= $rnum ?>;
                current.judge   = <?= $jid ?>;
                current.divid   = division.name();
                current.round   = division.current.roundId();
                current.form    = division.current.formId();
                if( update.request.action.match( /(?:prev|next)$/ ) && update.request.judge == app.state.current.judge ) {
                  current.page = 'division';
                }
                app.state.save();
                if( current.page in app.page.show ) { app.page.show[ current.page ](); }

                let jname = current.judge == 0 ? 'Referee' : `Judge ${current.judge}`;
                let aname = division.current.athlete().display.name();
                alertify.success( `${jname} ready to score for ${aname}` );

              } else {
                if( current.page in app.page.show ) { app.page.show[ current.page ](); }
                else {
                  alertify.error( `${current.page} is not a valid page; defaulting to 'scoring'` );
                  app.page.show.scoring();
                }
              }
            });
    </script>
  </body>
</html>
<!-- vim: set ts=2 sw=2 expandtab -->
