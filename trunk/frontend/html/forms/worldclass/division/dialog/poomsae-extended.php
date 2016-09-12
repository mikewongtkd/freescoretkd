<div class="modal fade" id="modal-edit-forms" tabindex="-1" role="dialog" data-backdrop="static">
	<div class="modal-dialog">
		<div class="modal-content panel-primary">
			<div class="modal-header panel-heading">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Edit Poomsae Selection</h4>
			</div>
			<div class="modal-body">
				<h4>Select Competition Method</h4>
				<div class="btn-group" id="method-select" data-toggle="buttons">
					<label class="btn btn-success active">
						<input type="radio" name="method" id="cutoff" autocomplete="off" checked> Cutoff
					</label>
					<label class="btn btn-success">
						<input type="radio" name="method" id="modcut" autocomplete="off"> Extended Cutoff
					</label>
					<label class="btn btn-success">
						<input type="radio" name="method" id="cutsin" autocomplete="off"> Cutoff/Single Elimination
					</label>
				</div>

				<h4>Select Poomsae for each Round</h4>
				<div style="margin-bottom: 10px;">
					<div class="btn-group">
						<button type="button" class="btn btn-primary btn-addon" style="width: 180px; text-align: left;">
						Preliminary Round</button>
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-default dropdown-toggle" id="prelim-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
							1st Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
							<ul class="dropdown-menu" id="prelim-1-select"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
						</div>
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-default dropdown-toggle" id="prelim-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
							2nd Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
							<ul class="dropdown-menu" id="prelim-2-select"> <li><a>None</a></li> <li role="separator" class="divider"></li> <li><a>Taegeuk 1</a></li> <li><a>Taegeuk 2</a></li> <li><a>Taegeuk 3</a></li> <li><a>Taegeuk 4</a></li> <li><a>Taegeuk 5</a></li> <li><a>Taegeuk 6</a></li> <li><a>Taegeuk 7</a></li> <li><a>Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a>Koryo</a></li> <li><a>Keumgang</a></li> <li><a>Taebaek</a></li> <li><a>Pyongwon</a></li> <li><a>Sipjin</a></li> <li><a>Jitae</a></li> <li><a>Chongkwon</a></li> <li><a>Hansu</a></li> </ul>
						</div>
					</div>
				</div>

				<div style="margin-bottom: 10px;">
					<div class="btn-group">
						<button type="button" class="btn btn-primary btn-addon" style="width: 180px; text-align: left;">
						Semi-Finals Round</button>
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-default dropdown-toggle" id="semfin-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
							1st Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
							<ul class="dropdown-menu" id="semfin-1-select"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
						</div>
						<div class="btn-group" role="group">
							<button type="button" class="btn btn-default dropdown-toggle" id="semfin-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
							2nd Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
							<ul class="dropdown-menu" id="semfin-2-select"> <li><a>None</a></li> <li role="separator" class="divider"></li> <li><a>Taegeuk 1</a></li> <li><a>Taegeuk 2</a></li> <li><a>Taegeuk 3</a></li> <li><a>Taegeuk 4</a></li> <li><a>Taegeuk 5</a></li> <li><a>Taegeuk 6</a></li> <li><a>Taegeuk 7</a></li> <li><a>Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a>Koryo</a></li> <li><a>Keumgang</a></li> <li><a>Taebaek</a></li> <li><a>Pyongwon</a></li> <li><a>Sipjin</a></li> <li><a>Jitae</a></li> <li><a>Chongkwon</a></li> <li><a>Hansu</a></li> </ul>
						</div>
					</div>
				</div>

				<div id="cutoff-finals">
					<div style="margin-bottom: 10px;">
						<div class="btn-group">
							<button type="button" class="btn btn-primary btn-addon" style="width: 180px; text-align: left;">
							Finals Round</button>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								1st Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-1-select"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
							</div>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								2nd Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-2-select"> <li><a>None</a></li> <li role="separator" class="divider"></li> <li><a>Taegeuk 1</a></li> <li><a>Taegeuk 2</a></li> <li><a>Taegeuk 3</a></li> <li><a>Taegeuk 4</a></li> <li><a>Taegeuk 5</a></li> <li><a>Taegeuk 6</a></li> <li><a>Taegeuk 7</a></li> <li><a>Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a>Koryo</a></li> <li><a>Keumgang</a></li> <li><a>Taebaek</a></li> <li><a>Pyongwon</a></li> <li><a>Sipjin</a></li> <li><a>Jitae</a></li> <li><a>Chongkwon</a></li> <li><a>Hansu</a></li> </ul>
							</div>
						</div>
					</div>
				</div>

				<div id="extended-or-modified-finals">
					<div style="margin-bottom: 10px;">
						<div class="btn-group">
							<button type="button" class="btn btn-primary btn-addon" style="width: 180px; text-align: left;">
							Finals Round of 8</button>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								1st Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-1-select"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
							</div>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								2nd Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-2-select"> <li><a>None</a></li> <li role="separator" class="divider"></li> <li><a>Taegeuk 1</a></li> <li><a>Taegeuk 2</a></li> <li><a>Taegeuk 3</a></li> <li><a>Taegeuk 4</a></li> <li><a>Taegeuk 5</a></li> <li><a>Taegeuk 6</a></li> <li><a>Taegeuk 7</a></li> <li><a>Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a>Koryo</a></li> <li><a>Keumgang</a></li> <li><a>Taebaek</a></li> <li><a>Pyongwon</a></li> <li><a>Sipjin</a></li> <li><a>Jitae</a></li> <li><a>Chongkwon</a></li> <li><a>Hansu</a></li> </ul>
							</div>
						</div>
					</div>

					<div style="margin-bottom: 10px;">
						<div class="btn-group">
							<button type="button" class="btn btn-primary btn-addon" style="width: 180px; text-align: left;">
							Finals Round of 4</button>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								1st Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-1-select"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
							</div>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								2nd Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-2-select"> <li><a>None</a></li> <li role="separator" class="divider"></li> <li><a>Taegeuk 1</a></li> <li><a>Taegeuk 2</a></li> <li><a>Taegeuk 3</a></li> <li><a>Taegeuk 4</a></li> <li><a>Taegeuk 5</a></li> <li><a>Taegeuk 6</a></li> <li><a>Taegeuk 7</a></li> <li><a>Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a>Koryo</a></li> <li><a>Keumgang</a></li> <li><a>Taebaek</a></li> <li><a>Pyongwon</a></li> <li><a>Sipjin</a></li> <li><a>Jitae</a></li> <li><a>Chongkwon</a></li> <li><a>Hansu</a></li> </ul>
							</div>
						</div>
					</div>

					<div style="margin-bottom: 10px;">
						<div class="btn-group">
							<button type="button" class="btn btn-primary btn-addon" style="width: 180px; text-align: left;">
							Finals Round of 2</button>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								1st Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-1-select"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
							</div>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-default dropdown-toggle" id="finals-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 160px; text-align: left;">
								2nd Form: None <span class="caret" style="float: right; margin-top:8px;"></span></button>
								<ul class="dropdown-menu" id="finals-2-select"> <li><a>None</a></li> <li role="separator" class="divider"></li> <li><a>Taegeuk 1</a></li> <li><a>Taegeuk 2</a></li> <li><a>Taegeuk 3</a></li> <li><a>Taegeuk 4</a></li> <li><a>Taegeuk 5</a></li> <li><a>Taegeuk 6</a></li> <li><a>Taegeuk 7</a></li> <li><a>Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a>Koryo</a></li> <li><a>Keumgang</a></li> <li><a>Taebaek</a></li> <li><a>Pyongwon</a></li> <li><a>Sipjin</a></li> <li><a>Jitae</a></li> <li><a>Chongkwon</a></li> <li><a>Hansu</a></li> </ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-warning" data-dismiss="modal">Close</button>
				<button type="button" class="btn btn-success">Save Changes</button>
			</div>
		</div>
	</div>
</div>
