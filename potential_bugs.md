# FreeScore Potential Bugs & Data Validation Issues

Audit date: 2026-05-04. Five systems reviewed: forms-worldclass, forms-grassroots, forms-freestyle, feats-breaking, sparring (olympic + virtual) + kicking-speed.

Issues are grouped by urgency. **Section 1** contains confirmed bugs that will crash or silently produce wrong output in normal use. **Section 2** covers missing input validation that requires a crafted request to exploit. **Section 3** covers hardening gaps.

---

## Section 1 — Confirmed Bugs (will fail in normal use)

### 1.1 Bareword `request` instead of `$request` — WorldClass autopilot crashes
**File:** `trunk/backend/lib/FreeScore/Forms/WorldClass/RequestManager.pm:951`

```perl
request->{ type } = 'autopilot';   # bareword, not a variable
```
Should be `$request->{ type }`. The autopilot handler fails with a compile-time or runtime error every time it is called.

---

### 1.2 `Score.drop()` always throws — Breaking score dropping is broken
**File:** `trunk/frontend/html/feats/breaking/include/js/score.js:12`

```javascript
if( category != 'technical' || category != 'presentation' )  // always true
    throw new Error(...);
```
`||` should be `&&`. Because every string either isn't `'technical'` or isn't `'presentation'`, the condition fires for every valid input. The high/low score drop mechanism fails entirely.

---

### 1.3 `record_decision()` checks undefined `$id` — wrong athlete targeted
**File:** `trunk/backend/lib/FreeScore/Feats/Breaking/Division.pm:186–204`

The bounds check reads `if( $id < 0 || $id > $n )` but `$id` is never declared in this function. Perl treats it as `undef` → 0, so the check always passes. The function then operates on `$self->{ current }` regardless of which athlete the request named.

---

### 1.4 `$counts` referenced but never defined — sparring/kicking deduction consensus crashes
**File:** `trunk/backend/lib/FreeScore/Sparring/Virtual/RequestManager.pm` (same pattern duplicated in `FreeScore/Kicking/Speed/RequestManager.pm`)

```perl
sub judge_deduction_consensus {
    my @deductions = ...;
    my $i = int((int( @deductions ) + 1)/2) - 1;
    return $counts[ $i ];   # $counts is not defined anywhere
}
```
Should be `$deductions[ $i ]`. Every call to this function dies at runtime.

---

### 1.5 String concatenation uses `+` instead of `.` — judge label always numeric
**File:** `trunk/backend/lib/FreeScore/Sparring/Virtual/RequestManager.pm:382` (same pattern in Kicking RequestManager)

```perl
my $judge = $num == 0 ? 'Referee' : 'Judge ' + $num;
```
Perl's `+` is numeric addition, not concatenation. `'Judge ' + 2` evaluates to `2`. The judge label is logged and broadcast as a bare number rather than `"Judge 2"`.

---

### 1.6 `$timer` never defined — sparring timeout logic always falls through
**File:** `trunk/backend/lib/FreeScore/Sparring/Virtual/RequestManager.pm:455`

```perl
my $timeout = $timer->{ pause }{ ready } || $request->{ timeout } || 10;
```
`$timer` is never assigned in scope. The first operand always produces undef; the timeout always falls back to 10 seconds regardless of the request value.

---

### 1.7 `sprintf` format/argument arity mismatch — vsparring path drops `$ring`
**File:** `trunk/backend/lib/FreeScore/Sparring/Virtual.pm:20`

```perl
$self->{ path } = sprintf( "%s/%s/%s/staging", $FreeScore::PATH, $tournament, $SUBDIR, $ring );
```
Three `%s` placeholders, four arguments. `$ring` is silently discarded. The constructed path always points to `/staging` regardless of which ring was requested.

---

### 1.8 Consensus index underflows when no deductions present
**File:** `trunk/backend/lib/FreeScore/Sparring/Virtual/Division.pm:423`

```perl
my $i = int((int( @deductions ) + 1)/2) - 1;
return $counts[ $i ];   # also see 1.4 above
```
When `@deductions` is empty, `$i` evaluates to `-1`. In Perl, `$array[-1]` returns the last element rather than throwing, silently returning stale data.

---

## Section 2 — Missing Input Validation (exploitable with a crafted request)

### 2.1 Athlete and judge indices not bounds-checked before array access

All systems accept `athlete_id` and `judge` from WebSocket messages and use them directly as array indices. Out-of-range values cause autovivification (silent sparse arrays), undefined dereferences, or writes to unintended positions.

| System | File | Parameter | Lines |
|--------|------|-----------|-------|
| WorldClass | `Forms/WorldClass/RequestManager.pm` | `athlete_id`, `judge`, `form`, `index` | 112–113, 270, 332, 269–274 |
| GrassRoots | `Forms/GrassRoots/RequestManager.pm` | `target.id` | 274, 281 |
| GrassRoots | `Forms/GrassRoots/Division.pm` | `$self->{ current }` | 249, 296, 311, 474 |
| FreeStyle | `Forms/FreeStyle/RequestManager.pm` | `athlete_id`, `judge` | 159, 195 |
| FreeStyle | `Forms/FreeStyle/Division.pm` | `$judge` in `record_score()` | 708–721 |
| Breaking | `Feats/Breaking/Division.pm` | `$index` in `navigate()`, `$judge` in `record_score()` | 162–169, 224–243 |
| Sparring | `Sparring/Virtual/RequestManager.pm` | `athlete_id`, `judge.num` | 158, 386 |

In each case the fix is the same pattern:
```perl
my $i = $request->{ athlete_id };
return unless defined $i && $i >= 0 && $i < scalar @{ $division->{ athletes } };
```

---

### 2.2 Mass assignment in Breaking division POST endpoint
**File:** `trunk/backend/bin/breaking:182–185`

```perl
foreach my $key (keys %{ $data->{ header }}) {
    $division->{ $key } = $data->{ header }{ $key };   # no whitelist
}
$division->write();
```

Any client can POST a crafted JSON body that sets arbitrary keys on the division object (`state`, `round`, `judges`, `method`, etc.) which are then written to disk. A whitelist of permitted header keys should be enforced before assignment.

---

### 2.3 Score range not enforced server-side

Scores are stored as received. Clients can send negative values, values far above the maximum, or non-numeric strings that coerce silently.

| System | Expected range | Gap |
|--------|---------------|-----|
| WorldClass | accuracy 0–4.0, presentation 0.5–2.0 per component | Lower bound partially checked in `complete()`; no upper bound |
| GrassRoots | 0–10.0 (stored after `/10`) | No range check — `bin/grassroots:224` divides raw param by 10 and records |
| FreeStyle | technical/presentation components 0.0–1.0 | No backend validation at any layer |
| Breaking | boards 0–15, deductions ≥ 0 | Max boards enforced only client-side (`judge.js:544`); negative boards accepted server-side |

---

### 2.4 PHP page parameters not validated before output or URL construction

`$ring`, `$judge`, and `$divid` are read from `$_GET` / `$_COOKIE` and interpolated directly into HTML and JavaScript with no type coercion, integer clamping, or escaping. This creates both XSS risk and wrong-ring connections if a cookie is tampered with.

Representative locations (pattern repeats across all systems):

- `trunk/frontend/html/feats/breaking/judge.php:2–3, 43` — `<?= $ring ?>` and `<?= $judge ?>` output raw to HTML
- `trunk/frontend/html/forms/freestyle/judge.php:3–4` — ring and judge, no validation
- `trunk/frontend/html/forms/freestyle/coordinator.php:6`
- `trunk/frontend/html/forms/freestyle/divisions.php:8`

Minimum fix: cast to integer and clamp.
```php
$ring  = max( 1, intval( $_GET['ring']  ?? $_COOKIE['ring']  ?? 1 ));
$judge = max( 0, intval( $_GET['judge'] ?? $_COOKIE['judge'] ?? 0 ));
```

---

### 2.5 Division names and IDs used in file paths without sanitization

Division IDs and names from client requests are interpolated directly into file paths in all backends. A crafted value containing `../` could traverse outside the data directory.

| System | File | Pattern |
|--------|------|---------|
| WorldClass | `Forms/WorldClass/RequestManager.pm:708` | `sprintf( ".../%s/div.%s.txt", ..., $division->{ name } )` |
| GrassRoots | `Forms/GrassRoots.pm:57` | `"$self->{ path }/div.$divid.txt"` |
| Breaking | `bin/breaking:173` | `sprintf( ".../%s/ring%02d", ..., $ring )` + divid |
| Sparring | `Sparring/Virtual.pm:20` | `sprintf` with tournament name (see also §1.7) |

Fix: validate IDs match the expected naming pattern before use.
```perl
die "Invalid division ID" unless $divid =~ /^p\d+[a-z]?$/;
die "Invalid tournament name" unless $tournament =~ /^[\w-]+$/;
```

---

### 2.6 WebSocket JSON decoded without error handling — malformed message crashes handler
**Files:** `bin/grassroots:47`, `bin/sparring:51`, `bin/vsparring:51`

```perl
my $request = $json->decode( shift );  # dies on malformed JSON
```

A client sending invalid JSON kills the WebSocket handler for that connection with no error reply. Should be wrapped in `try { } catch { }`.

---

### 2.7 Decision and penalty values not validated against allowed set

`record_decision()` and `record_penalty()` accept arbitrary strings for the decision type and penalty keys without checking against an enum. An invalid value like `"fraud"` is written to disk and broadcast to all clients.

Affected: all systems that support `division/disqualify` or `division/withdraw` actions (WorldClass, GrassRoots, FreeStyle, Breaking, Sparring).

---

### 2.8 Breaking: negative boards accepted server-side
**File:** `trunk/backend/lib/FreeScore/Feats/Breaking/RequestManager.pm:116`

```perl
my $boards = int( $request->{ boards } );   # no minimum check
```

The client enforces a 0–15 range, but a WebSocket message with `boards: -5` is accepted and stored. Since scoring multiplies boards by a coefficient, negative boards reduce scores below zero.

---

## Section 3 — Hardening Gaps (lower priority)

### 3.1 Debug `Dumper` output left in production code
**File:** `trunk/backend/lib/FreeScore/Forms/WorldClass/Division.pm:584`

```perl
print STDERR Dumper $judge, $score;  # MW
```
Leaks judge identifiers and score values to server logs. Should be removed or gated on a `$DEBUG` flag.

---

### 3.2 WorldClass form index lower-bound check misses `f0`
**File:** `trunk/backend/lib/FreeScore/Forms/WorldClass/Division.pm:498`

```perl
$form = int( $form ) - 1;
die "..." unless $form >= 0;
```
Input `"f0"` becomes `int(0) - 1 = -1`, which correctly fails. Input `"f1"` becomes 0, which passes. However, input `"f-1"` becomes `int(-1) - 1 = -2`, which also correctly fails. The check is logically sound but the comment in the code notes this path is persnickety — explicit rejection of non-integer form strings would be safer.

---

### 3.3 GrassRoots bracket navigation can autovivify on empty bracket array
**File:** `trunk/backend/lib/FreeScore/Forms/GrassRoots/Division.pm:259–265`

```perl
my $k = int( @{$self->{ brackets }[ $j ]});
while( $i >= $k ) { $i -= $k; $j++; $k = int( @{$self->{ brackets }[ $j ]}); }
```
If the bracket array is shorter than expected (e.g., a freshly created division), `$j` can exceed bounds. Perl autovivifies `$self->{ brackets }[ $j ]` as an empty arrayref, `$k` becomes 0, and the while loop runs forever.

---

### 3.4 Implicit string-to-number coercion during file parsing
**File:** `trunk/backend/lib/FreeScore/Forms/WorldClass/Division.pm:503–504`

```perl
$major ||= 0; $minor ||= 0; ...
```
If a field reads as a non-numeric string (e.g., corrupted file), `||=` keeps the string (it's truthy). Arithmetic operations later silently coerce it to 0 without any error. A `looks_like_number` check would catch file corruption early.

---

### 3.5 GrassRoots `$self->{ tied }[0]` accessed without existence check
**File:** `trunk/backend/lib/FreeScore/Forms/GrassRoots/Division.pm:508`

```perl
my $tie = $self->{ tied }[ 0 ];
if( (int( @{ $tie->{ tied }}) == 2) && ...   # $tie could be undef
```
If `tied` is empty, `$tie` is undef and the dereference crashes. Should guard with `if( defined $tie && ... )`.

---

### 3.6 Sparring: unvalidated splice on judges array
**File:** `trunk/backend/lib/FreeScore/Sparring/Virtual/RequestManager.pm:362`

```perl
splice( @$judges, 0, $n );
```
`$n` is derived from `$division->{ judges }` which is a user-editable field. If set to a large value, the splice can clear the entire judges array.

---

### 3.7 FreeStyle: `division/write` deserialises client JSON into division object without schema check
**File:** `trunk/backend/lib/FreeScore/Forms/FreeStyle/RequestManager.pm:684`

```perl
FreeScore::Forms::FreeStyle::Division->from_json( $request->{ division } )
```
The client supplies the entire division object. No schema validation is performed before the object is persisted. This is a broader form of the breaking mass-assignment issue (§2.2).

---

## Summary by Priority

| Priority | Count | Action |
|----------|-------|--------|
| Fix now (confirmed crashes/wrong results) | 8 | §1.1 – §1.8 |
| Fix before untrusted access | 8 | §2.1 – §2.8 |
| Harden when possible | 7 | §3.1 – §3.7 |
