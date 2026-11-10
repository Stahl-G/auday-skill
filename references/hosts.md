# Desktop hosts and the DSH adapter

The common skill uses `SKILL.md`, `scripts/`, and relative references. Install it
through the host's skill importer or supported local skill directory:

| Host | Installation |
| --- | --- |
| Codex | Configured local skills directory |
| Claude Code | `~/.claude/skills/auday/` or a project skill directory; see [skill locations](https://code.claude.com/docs/en/skills) |
| WorkBuddy | Application's [installed-skills workflow](https://www.workbuddy.ai/docs/zh/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market) |
| DSH / Kaitu | Packed npm bundle through DSH's profile plugin manager |

## DSH / Kaitu

The adapter targets DSH **0.2.2-rc.1** and requires Node 24.9+, macOS, existing Python 3,
and Xcode Command Line Tools with Swift 5.9 or later. Windows can load the page;
connection, cached browsing and import require macOS. The Swift helper builds
from the installed sources on the first live connection. The adapter does not
run the common skill's bootstrap or install software or models.

Choose **Check prerequisites**, find the phone, then **Connect**. Enter the
communication password in the native local dialog; successful pairing saves it
in Keychain. **Sync once** captures one snapshot. Browse the local copy, select
records, preview, and submit them to the Kaitu inbox. Cancel or leaving the page
terminates the managed operation.

Kaitu supplies `KAITU_DIR`. Plain DSH needs an explicit `workspace` pointing to an
existing Kaitu workspace; `python` can select an installed interpreter. Cache
and pairing configuration use `$DSH_HOME/auday/default` (default
`~/.dsh/auday/default`), separate from the common skill. Uninstalling the plugin
keeps this cache, Keychain entries, and previously submitted notes.

Imports publish completed Markdown in `inbox/agents`. Kaitu's watcher handles
processing and deduplication; it needs the ordinary-file resend support in
Kaitu commit `a9544c6` or later. Source identity and revision determine the
filename, so identical resends are stable while changed content is a new
revision. Original source states and timestamps remain attached to the notes.

The embedded route is `#kaitu-page=kaitu-auday&kaitu-embed=1`; Kaitu owns the
loader and navigation. The page follows the host's colors and dark mode.
