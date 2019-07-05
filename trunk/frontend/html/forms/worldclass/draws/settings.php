			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header"> Sport Poomsae Draws </div>
					<div class="panel panel-primary" id="format">
						<div class="panel-heading">
							<h1 class="panel-title">Competition Format</h1>
						</div>
						<div class="panel-body">
							<div class="form-group row">
								<div class="col-xs-6">
									<div class="row">
										<label for="rings" class="col-xs-4 col-form-label">Rules</label>
										<div class="col-xs-8">
											<div class="btn-group rules" data-toggle="buttons" id="competition-rules">
												<label class="btn btn-default active"><input type="radio" name="competition-rules" class="text-light" value="cutoff" checked>USAT</label>
												<label class="btn btn-default"><input type="radio" name="competition-rules" class="text-light" value="combination">WT</label>
											</div>
										</div>
									</div>
									<div class="row">
										<label for="rings" class="col-xs-4 col-form-label">Format</label>
										<div class="col-xs-8">
											<div class="btn-group format" data-toggle="buttons" id="competition-format">
												<label class="btn btn-default active"><input type="radio" name="competition-format" class="format text-light" value="cutoff" checked>Cutoff</label>
												<label class="btn btn-default"><input type="radio" name="competition-format" class="format text-light" value="combination">Combination</label>
												<label class="btn btn-default"><input type="radio" name="competition-format" class="format text-light" value="team-trials">Team Trials</label>
											</div>
										</div>
									</div>
									<div class="row">
										<label for="gender-draw" class="col-xs-4 col-form-label">Male and Female divisions have:</label>
										<div class="col-xs-8"><input type="checkbox" class="gender" data-toggle="toggle" id="gender-draw" data-on="Different Forms" data-onstyle="primary" data-off="Same Forms" data-offstyle="primary"></div>
									</div>
									<div class="row">
										<label for="replacement" class="col-xs-4 col-form-label">Before drawing the forms for the final round:</label>
										<div class="col-xs-8"><input type="checkbox" checked class="replacement" data-toggle="toggle" id="replacement" data-on="Replace" data-onstyle="success" data-off="Do not replace" data-offstyle="danger"></div>
									</div>
									<div class="row">
										<label for="replacement" class="col-xs-4 col-form-label">Probability Distribution:</label>
										<div class="col-xs-8"><input type="checkbox" checked class="uniform" data-toggle="toggle" id="uniform" data-on="Uniform" data-onstyle="primary" data-off="Beta</sub>" data-offstyle="primary"></div>
									</div>
								</div>
								<div class="col-xs-6">
									<div class="row">
										<label for="prelim-count" class="col-xs-4 col-form-label">Preliminary Round</label>
										<div class="col-xs-8"><input type="checkbox" class="count" data-round="prelim" data-toggle="toggle" id="prelim-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary" data-size="small"></div>
									</div>
									<div class="row">
										<label for="semfin-count" class="col-xs-4 col-form-label">Semi-Final Round</label>
										<div class="col-xs-8"><input type="checkbox" class="count" data-round="semfin" data-toggle="toggle" id="semfin-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary" data-size="small"></div>
									</div>
									<div class="row">
										<label for="finals-count" class="col-xs-4 col-form-label">Final Round</label>
										<div class="col-xs-8"><input type="checkbox" class="count" data-round="finals" data-toggle="toggle" id="finals-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary" data-size="small" checked></div>
									</div>
								</div>
							</div>
							<div class="form-group row">
								<label for="finals-count" class="col-xs-2 col-form-label">Age Groups</label>
								<div class="col-xs-10">
									<div class="btn-group format" data-toggle="buttons" id="age-groups">
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="6-7"     checked>6-7</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="8-9"     checked>8-9</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="6-9"     checked>&leq; 9<sup>*</sup></label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="10-11"   checked>10-11</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="12-14"   checked>12-14</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="15-17"   checked>15-17</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="under30" checked>&leq;30</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="over30"  checked>&gt; 30<sup>*</sup></label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="under40" checked>&leq; 40</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="under50" checked>&leq; 50</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="under60" checked>&leq; 60</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="under65" checked>&leq; 65</label>
										<label class="btn btn-default active"><input type="checkbox" name="age-group[]" class="age-group text-light" value="over65"  checked>&gt; 65</label>
									</div>
									<p><b>*</b> Age divisions for Pairs and Teams</p>
								</div>
							</div>
						</div>
					</div>
					<div class="clearfix">
						<button type="button" class="btn btn-danger pull-left cancel" style="margin-right: 40px; width: 180px;">Cancel</button> 
						<button type="button delete" class="btn btn-primary pull-left disabled" style="margin-right: 40px; width: 180px;">Delete Draws</button> 
						<button type="button" id="instant-draw" class="btn btn-primary pull-right" style="width: 180px;">Instant Draw</button> 
						<button type="button edit" class="btn btn-primary pull-right" style="margin-right: 40px; width: 180px;">Select Manually</button> 
					</div>
				</div>
			</div>

