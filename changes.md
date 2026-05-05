# Bug Fix Changes

Fixes applied from `potential_bugs.md`. Each fix is one isolated commit.

## Section 1 — Confirmed Crashes / Wrong Output

| Commit | Bug | Files Changed |
|--------|-----|---------------|
| `cb27d0d1` | **WorldClass autopilot crash** — bareword `request` instead of `$request` on line 951 caused a runtime error every time autopilot was triggered | `trunk/backend/lib/FreeScore/Forms/WorldClass/RequestManager.pm` |
| `91e1d554` | **Breaking score drop never worked** — `Score.drop()` used `\|\|` instead of `&&`, making the guard always true and throwing on every valid call; high/low score elimination was broken entirely | `trunk/frontend/html/feats/breaking/include/js/score.js` |
| `32bf9d08` | **Breaking `record_decision()` targeted wrong athlete** — bounds check referenced undefined `$id` (always 0) instead of `$self->{current}`; wrong athlete could have a decision applied | `trunk/backend/lib/FreeScore/Feats/Breaking/Division.pm` |
| `69e61fe5` | **Sparring deduction consensus crashed** — `$counts` was never defined (should be `$deductions`); additionally, an empty scores array produced index `-1`, wrapping to the last element in Perl | `trunk/backend/lib/FreeScore/Sparring/Virtual/Division.pm` |
| `90e3f9f1` | **Judge label always a bare number** — `'Judge ' + $num` performs numeric addition in Perl; replaced with string concat `.` to produce `"Judge N"` | `trunk/backend/lib/FreeScore/Sparring/Virtual/RequestManager.pm`, `trunk/backend/lib/FreeScore/Kicking/Speed/RequestManager.pm` |
| `36258e0a` | **Pool ready timeout always ignored** — `$timer` was never declared in scope, so `$timer->{pause}{ready}` always produced undef; removed the dead operand | `trunk/backend/lib/FreeScore/Sparring/Virtual/RequestManager.pm`, `trunk/backend/lib/FreeScore/Kicking/Speed/RequestManager.pm` |
| `83f66932` | **Virtual sparring staging path dropped `$ring`** — `sprintf` had 3 format placeholders but 4 arguments; `$ring` was silently discarded, producing a wrong path | `trunk/backend/lib/FreeScore/Sparring/Virtual.pm` |

## Section 2 — Missing Input Validation

| Commit | Bug | Files Changed |
|--------|-----|---------------|
| `61a3f7c4` | **Breaking POST mass assignment** — all keys from the request `header` object were written directly to the division before `write()`; any field (`state`, `round`, `judges`, etc.) could be injected. Added whitelist: `description`, `judges`, `brackets`, `mode` | `trunk/backend/bin/breaking` |
| `cb312749` | **Malformed WebSocket JSON crashed handler** — `$json->decode(shift)` was called bare; invalid JSON killed the message handler with no error reply. Replaced with `eval { }` so malformed messages return an error and the handler continues | `trunk/backend/bin/worldclass`, `bin/freestyle`, `bin/breaking`, `bin/grassroots`, `bin/sparring`, `bin/vsparring`, `bin/speedkick`, `bin/para`, `bin/fswifi` |
| `6fb56dd3` | **Negative boards corrupted Breaking scores** — the client enforced a 0–15 range but the backend accepted any integer. A crafted WebSocket message could send `boards: -5`, making scoring go negative. Clamped to `[0, 15]` on arrival | `trunk/backend/lib/FreeScore/Feats/Breaking/RequestManager.pm` |
| `f3df080a` | **Ring and judge GET/COOKIE params not validated** — pages read `$ring` and `$judge` from `$_GET`/`$_COOKIE` and embedded them directly into JavaScript and WebSocket URLs with no type coercion, enabling XSS and wrong-ring connections. Applied `intval()` with safe defaults | `trunk/frontend/html/feats/breaking/judge.php`, `feats/breaking/index.php`, `feats/breaking/report/draws.php`, `feats/breaking/report/json.php`, `forms/freestyle/judge.php`, `forms/freestyle/divisions.php` |
| `f4189b97` | **Path traversal via division IDs and tournament names** — division names and IDs from client requests were interpolated directly into file paths without sanitization. Validated against `/^p\d+[a-z]?$/` (division IDs) and `/^[\w-]+$/` (tournament names) before use | `trunk/backend/lib/FreeScore/Forms/WorldClass/RequestManager.pm`, `trunk/backend/lib/FreeScore/Forms/GrassRoots.pm`, `trunk/backend/bin/breaking` |

## Section 3 — Hardening

| Commit | Bug | Files Changed |
|--------|-----|---------------|
| `2fc01b73` | **Debug `Dumper` left in production** — `print STDERR Dumper $judge, $score` leaked judge ID and raw score on every scoring event | `trunk/backend/lib/FreeScore/Forms/WorldClass/Division.pm` |
| `802f0f4c` | **GrassRoots bracket navigation could loop forever** — `current_bracket()` and `current_round()` incremented `$j` past the end of the brackets array, autovivifying an empty arrayref that kept `$k` at 0 indefinitely. Added upper bound on `$j` and `// []` fallback | `trunk/backend/lib/FreeScore/Forms/GrassRoots/Division.pm` |
| `ff8d2aca` | **GrassRoots tiebreaker crashed on empty tie list** — `$self->{tied}[0]` was accessed unconditionally; if no ties were active the dereference `$tie->{tied}` crashed. Now checks the array is non-empty first | `trunk/backend/lib/FreeScore/Forms/GrassRoots/Division.pm` |
| `5f9c1f20` | **Non-numeric score fields silently propagated** — score values read from the flat-file database used `\|\|= 0`, which preserved truthy non-numeric strings unchanged. Replaced with `looks_like_number()` from `Scalar::Util` so bad values default to 0 and are detected rather than silently coerced | `trunk/backend/lib/FreeScore/Forms/WorldClass/Division.pm` |

## Not Fixed (require broader changes)

| Bug | Reason deferred |
|-----|-----------------|
| **2.1 — Athlete/judge array index bounds** | Affects every `RequestManager` across all systems; needs a consistent helper and test coverage before a safe sweep |
| **2.3 — Score range enforcement server-side** | Requires sport-specific range constants (per WT/USAT rules) to be defined before clamping can be applied correctly |
| **2.7 — Decision/penalty enum validation** | Enum values vary by system; needs a mapping table per service before values can be validated |
