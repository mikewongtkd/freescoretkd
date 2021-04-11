# Reconstructing the Database for Reporting

Unpacking the daily backup snapshots after competition is complete can lead to 
noisy data unless the backups are performed with great care and consistency. It
is easier to unpack the snapshots independently and rebuild the database by
following the logical proceedings day-by-day.

For example, prelim rounds will always occur before semi-final rounds. We can
take advantage of this cause-and-effect relationship to reconstruct temporal
delineation.

## Scripts

| Script | Function |
| --- | --- |
| `db-dump-recognized` | Dump the placement and decision results of the recognized poomsae scores for collation |
| `db-dump-freestyle` | Dump the placement and decision results of the freestyle poomsae scores for collation |
| `db-collate` | Reconstruct the dumps in chronological order and report |


Note that `db-collate` has an interim step to track each athlete's placements for each round of their division,
creating a timeline of competition results for that athlete.
