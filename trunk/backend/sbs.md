# Implementing Dynamic Methods

- Cutoff
- Side-by-Side
- Single Elimination

Idea: Allow methods to be defined by the headers

    # method={"prelim":"cutoff","semfin":"cutoff","r08":"sbs","ro4":"sbs","ro2":"sbs"}
    # rounds=["prelim","semfin","ro8","ro4","ro2"]

Typical choices:

- Cutoff (default)
- Side-By-Side
- Combination (Cutoff/Side-By-Side)
- Combination (Single Elimination/Side-By-Side)

Also allow methods to be defined by the round headers (default is `cutoff`:

    # ============================================================
    # semfin
    # ============================================================

    # ============================================================
    # ro8:sbs
    # ============================================================

## Methods

- `advance_athletes()`
- `assign()`
- `normalize()`
- `place_athletes()`
- `string()`
