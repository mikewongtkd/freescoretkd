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

## How to run the scripts

1. Take backups of all the ring days as day-*-complete.tar.gz (Replace * with the day number)
2. Move up 1 directory
3. mkdir collate
4. Copy the day-*-complete.tar.gz from the main directory over to the collate directory
5. mkdir day-*-complete (Create a new directory for each ring day)
6. tar -xvzf day-*-complete.tar.gz (Extract the day individually)
7. mv forms-* (Move the forms-* into each day folder) day-*-complete
8. db-dump-recognized > recognized.tsv
9. db-dump-freestyle > freestyle.tsv
10. cat recognized.tsv freestyle.tsv > combined.tsv
11. cat combined.tsv | db-collate -p > athletes.json
12. cat combined.tsv | db-collate > collated.tsv