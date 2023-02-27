var refresh = {
	tool : {
		deductions : ( division ) => {
			let athlete = division.current.athlete();
			$( '#tool-deductions .athlete-info' ).html( athlete.name());
			$( '#tool-deductions .division-info .division-summary' ).html( division.summary());
			$( '#tool-deductions .division-info .division-progress' ).html( division.progress());
		},
		scoring : ( division ) => {
		},
		inspection : ( division ) => {
		}
	}
};
