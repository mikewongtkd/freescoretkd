# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreeScoreTKD is an open-source tournament management and real-time scoring system for Taekwondo competitions (poomsae forms, breaking, sparring). It runs as a web appliance on Raspberry Pi hardware or AWS EC2, with wireless tablet/smartphone interfaces for judges and coordinators.

## Technology Stack

- **Backend:** Perl with Mojolicious Lite (WebSocket + REST services)
- **Frontend:** PHP + jQuery (no build step, no bundler)
- **CSS:** SCSS compiled to CSS, Bootstrap 3
- **Data storage:** Flat-file text database (current); SQLite planned (v5/)
- **Production server:** Hypnotoad (built into Mojolicious)
- **Web server:** Apache2 as reverse proxy

## Directory Layout

```
trunk/
├── backend/
│   ├── bin/          # Mojolicious Lite service entry points (one per competition type)
│   ├── lib/          # Perl modules under FreeScore:: namespace
│   ├── rest/v1/      # PHP REST API layer
│   ├── v5/           # In-progress SQLite refactor (not yet in production)
│   ├── test/         # Unit, REST, and UI tests
│   ├── config-default.json
│   └── Makefile      # Start/stop Hypnotoad services
└── frontend/
    ├── html/         # PHP pages + static assets served by Apache
    │   ├── forms/    # Per-event judge/coordinator/display pages
    │   ├── include/js/  # Core JS (websocket.js, app.js, freescore.js)
    │   └── rest/v1/  # REST endpoint router (index.php)
    └── cgi-bin/      # Legacy Perl CGI scripts
```

## Backend Services & Ports

Each competition type is an independent Hypnotoad process:

| Service    | Port | URL path           |
|------------|------|--------------------|
| grassroots | 3080 | forms-grassroots   |
| freestyle  | 3082 | forms-freestyle    |
| speedkick  | 3083 | kicking-speed      |
| sparring   | 3084 | sparring-olympic   |
| fswifi     | 3085 | (device setup)     |
| worldclass | 3088 | forms-worldclass   |
| breaking   | 3078 | feats-breaking     |
| vsparring  | 3095 | sparring-virtual   |

Apache proxies WebSocket connections from `/grassroots/request` → `ws://localhost:3080/grassroots`, etc.

## Common Commands

### Start/Stop Services

```bash
cd trunk/backend

make all-start           # Start all services
make all-stop            # Stop all services
make worldclass-start    # Start individual service
make worldclass-stop
make grassroots-start
make grassroots-stop
make setup-start         # fswifi device registration service
```

### Install Perl Dependencies (Raspberry Pi)

```bash
cd trunk/backend
perl raspberry-pi/dependencies.pl
```

### Run Tests

```bash
cd trunk/backend/test

make all                      # Run all tests
make grassroots-unit-test     # Unit tests for grassroots division/scoring logic
make grassroots-rest-test     # REST API tests
make grassroots-ui-test       # UI smoke tests (PhantomJS + Jasmine)
make start                    # Start test services
make stop                     # Stop test services
```

### Docker Build

```bash
# From repo root
make all    # Clones repo, builds Docker image
make clean  # Remove docker/context
```

## Installation (Symlinks)

The system expects specific symlink targets:

```bash
ln -s ~/freescoretkd/trunk/frontend/html    /var/www/html/freescore
ln -s ~/freescoretkd/trunk/frontend/cgi-bin /var/www/cgi-bin/freescore
ln -s ~/freescoretkd/trunk/backend          /usr/local/freescore
```

Config is loaded from `/usr/local/freescore/config.json` (falls back to `config-default.json`).

## Architecture: How Requests Flow

1. **Device registration:** Browser → `index.php` → selects role → `register.php?service=worldclass&role=judge`
2. **WebSocket connection:** Browser opens `ws://host:3088/worldclass/{tournament}/{ring}/{role}`
3. **Message dispatch:** Backend `RequestManager::handle()` routes by `{type, action}` (e.g., `division/score`)
4. **State update:** Handler reads flat-file division data, mutates it, writes back, then broadcasts JSON to all ring clients
5. **Frontend update:** `FreeScore.ResponseManager` dispatches to registered UI handlers by type/action

**WebSocket message format:**
```json
{ "type": "division", "action": "score", "ring": 1, "judge": 0, "score": 8.5 }
```

## Data Storage

**Flat-file format** (current production):
- Path: `/usr/local/freescore/data/{tournament}/{service}/ring01/div.p01a.txt`
- Divisions stored as tab-separated text with `# key=value` header comments
- JSON-encoded metadata in header fields

**v5 SQLite schema** (in development, `trunk/backend/data-v5/db_init.sql`):
- Tables: `division`, `round`, `athlete`, `form`, `fight`, `score`, `pool`, `ring`, `schedule`

## Key Perl Modules

- `FreeScore::Config` — loads config.json, provides service discovery
- `FreeScore::RequestManager` — base WebSocket message dispatcher (two-level dispatch table: type → action)
- `FreeScore::Forms::GrassRoots` / `WorldClass` / `FreeStyle` — load and persist division state from flat files
- `FreeScore::Forms::GrassRoots::Division` — scoring logic per athlete/round
- `FreeScore::Repository` — git integration for tournament data versioning
- `FreeScore::Security` — ring password authentication

## Key JavaScript Files

- `include/js/websocket.js` — `FreeScore.WebSocket` and `FreeScore.ResponseManager` (type/action dispatch)
- `include/js/app.js` — `FreeScore.App` main controller, ring selection, ping/pong heartbeat
- `include/js/freescore.js` — HTML factories, WT/USAT rules reference data, weight/age class definitions
- `include/js/ioc.js` — IoC container for dependency injection
- `include/js/event.js` — Custom event bus for inter-component communication

## Configuration

`config.json` / `config-default.json`:
```json
{
  "service": {
    "worldclass": { "path": "forms-worldclass", "port": 3088 }
  },
  "password": { "ring01": "1234" },
  "tournament": { "name": "FreeScore", "db": "test" }
}
```

The CGI path is configurable (see recent commits). Apache config lives in `trunk/backend/apache2/freescore.conf`.

## Supported Competition Types

- **Poomsae (Forms):** WorldClass (sport poomsae), GrassRoots (open), FreeStyle, Para
- **Feats:** Creative Breaking, Speed Kicking  
- **Sparring:** Olympic, Virtual

Scoring methods vary by event: Cutoff elimination, Side-by-Side (SBS), Single Elimination bracket.

## Dependency Notes

- `Filesys::Notify::Simple` must be installed on Raspberry Pi (see commit notes)
- PHP 7.2 used in Docker image
- No npm/node required for the frontend (jQuery/Bootstrap included as static files)
- PhantomJS + Jasmine used for UI tests
