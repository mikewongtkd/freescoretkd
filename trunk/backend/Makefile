database:
	perl bin/divisions.pl data/2013-05-04.San-Francisco/aau-2013-cal-states-individual-all.csv
	sqlite3 data/2013-05-04.San-Francisco/freescore.db < data/2013-05-04.San-Francisco/freescore.sql

clean:
	rm -f data/2013-05-04.San-Francisco/freescore.db
	rm -f data/2013-05-04.San-Francisco/freescore.sql
