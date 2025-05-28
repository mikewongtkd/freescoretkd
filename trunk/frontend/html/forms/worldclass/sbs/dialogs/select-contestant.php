<div class="modal fade modal-select-contestant" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Choose Contestant to Penalize</h4>
      </div>
      <div class="modal-body">
        <p class="modal-message">Choose a contestant to penalize.</p>
        <button type="button" class="btn btn-primary select-chung">Chung</button>
        <button type="button" class="btn btn-danger select-hong">Hong</button>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default btn-close">Cancel</button>
        <button type="button" class="btn btn-primary btn-ok" data-selected="none">OK</button>
      </div>
    </div>
  </div>
</div>
<script>

/*
Choose a contestant to give a(n) Y penalty
Choose a contestant to clear all penalties
Give X a(n) Y penalty

Choose a contestant to disqualify/withdraw
Choose a contestant to clear all decisions
Disqualify/withdraw X
*/

let dialog     = app.modal.selectContestant = $( '.modal-select-contestant' );
dialog.show    = () => { dialog.modal( 'show' ); }
dialog.hide    = () => { dialog.modal( 'hide' ); }
dialog.title   = dialog.find( '.modal-title' );
dialog.message = dialog.find( '.modal-message' );
dialog.button  = {
  select : {
    chung: dialog.find( 'button.select-chung' ),
    hong: dialog.find( 'button.select-hong' )
  },
  close: dialog.find( 'button.close,.btn-close' ),
  ok: dialog.find( '.btn-ok' )
};

dialog.refresh = ( division, action, penalty, callback ) => {
  if( ! defined( division )) { return; }
  let match = division.current.match();

  if( ! defined( match )) { return; }
  let impersonal   = action.replace( / for$/, '' );
  let intransitive = penalty.replace( /^of /, '' );
  dialog.title.html( `Choose a contestant to ${impersonal} ${intransitive}` );
  dialog.message.html( `Choose a contestant to ${impersonal} ${intransitive}` );

  // ===== BUTTON BEHAVIOR
  [ 'chung', 'hong' ].forEach( contestant => {
    let button  = dialog.button.select[ contestant ];
    let athlete = defined( match[ contestant ]) ? division.athlete( match[ contestant ]) : null;

    button.off( 'click' );

    if( ! defined( athlete )) { 
      button.hide(); 

    } else {
      let name = athlete.name();
      button.show();
      button.html( name );
      button.click( ev => {
        app.sound.next.play();
        dialog.title.html( `${action.capitalize()} <b>${name}</b> ${penalty}` );
        dialog.message.html( `Click <b>OK</b> below to ${action} <b>${name}</b> ${penalty} or click <b>Cancel</b> to do nothing.` );
        let selected = { match, contestant, athlete: match[ contestant ]};
        dialog.button.ok.attr({ 'data-selected' : JSON.stringify( selected )});
      });
    }
  });

  dialog.button.ok.off( 'click' ).click( ev => {
    let selected = dialog.button.ok.attr( 'data-selected' );
    if( selected == 'none' ) {
      alertify.message( 'Please select Chung or Hong contestant' );
      return;

    } else {
      selected = JSON.parse( selected );
      dialog.button.ok.attr({ 'data-selected' : 'none' });
      callback( selected.athlete );
      dialog.hide();
    }
  });

  dialog.button.close.off( 'click' ).click( ev => {
      app.sound.prev.play();
      dialog.button.ok.attr({ 'data-selected' : 'none' });
      dialog.hide();
  });

  dialog.show();
};

</script>
