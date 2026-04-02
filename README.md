# pi-terminal-signals

Let's pi send standard OSC escape sequences to inform the terminal it is running in of its status.

Ghostty will display a progress line at the top while pi is running the agent loop.
Supacode, Supaterm and Conductor use it to display a spinner / finished icon on the worktree / agent tab.

## Demo

https://github.com/user-attachments/assets/1cdefbb4-e7c7-40a3-824d-2ccaddbd3a54

*Unmute for audio.*

## Install

```bash
pi install npm:pi-terminal-signals
```

## What it does

| Pi event | Escape sequence | Terminal effect |
|---|---|---|
| `agent_start` | `OSC 9;4;3` | Tab shows indeterminate progress spinner |
| `agent_end` | `OSC 9;4;0` | Progress indicator clears |
| `agent_end` | `OSC 133;D;0` | "Command finished" — triggers completion notification |

**OSC 9;4** — Progress indicator protocol (originated in ConEmu, adopted by Ghostty, WezTerm, Windows Terminal). State 3 is indeterminate (spinner), state 0 clears.

**OSC 133** — Semantic prompt protocol (originated in FinalTerm, adopted by Ghostty, iTerm2, Kitty, WezTerm, VS Code terminal). Marker `D;0` means "command finished successfully" — Ghostty uses this to fire a tab completion notification. 