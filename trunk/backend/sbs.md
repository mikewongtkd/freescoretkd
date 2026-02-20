# Implementing Dynamic Methods

- Cutoff
- Side-by-Side
- Single Elimination

Methods are defined in the headers and can appear in one of two forms:

1. Single method for all rounds in the division.

    # method=sbs

2. Multiple methods, defined on a round-by-round basis.

    # method={"prelim":"cutoff","semfin":"cutoff","r08":"sbs","ro4":"sbs","ro2":"sbs"}

Typical choices:

- Cutoff (default)
- Side-By-Side
- Cutoff for all rounds prior to Ro8, and Side-By-Side thereafter
- Single Elimination for all rounds prior to Ro8, and Side-By-Side thereafter


However, any combination should be allowed. 

Note: the above use cases outline the priorties for testing; other combinations
might not work and won't be tested until these common cases are thoroughly
tested.

## Methods

- `advance_athletes()`
- `assign()`
- `normalize()`
- `place_athletes()`
- `string()`
