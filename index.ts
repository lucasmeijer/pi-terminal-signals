/**
 * pi-terminal-signals
 *
 * Communicates pi's agent lifecycle to the host terminal using standard
 * escape sequences. Works across Ghostty, WezTerm, iTerm2, Kitty,
 * Windows Terminal, VS Code terminal, and others.
 *
 * Signals emitted:
 *
 * - OSC 9;4;3 (indeterminate progress) on agent_start
 *   → terminal shows a tab spinner / progress indicator
 *
 * - OSC 9;4;0 (clear progress) on agent_end
 *   → terminal clears the progress indicator
 *
 * - OSC 133;D;0 (command finished successfully) on agent_end
 *   → terminal fires a completion notification (e.g. Ghostty tab badge)
 *
 * All sequences are silently ignored by terminals that don't support them.
 *
 * Install:
 *   pi install npm:pi-terminal-signals
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

const OSC = "\x1b]";
const BEL = "\x07";

function writeOSC(sequence: string) {
	process.stdout.write(`${OSC}${sequence}${BEL}`);
}

/**
 * OSC 9;4 — ConEmu / Ghostty / WezTerm / Windows Terminal progress protocol.
 *
 * State 3 = indeterminate (animated spinner on the tab).
 * State 0 = clear / remove progress indicator.
 */
function startProgress() {
	writeOSC("9;4;3");
}

function stopProgress() {
	writeOSC("9;4;0");
}

/**
 * OSC 133 — FinalTerm semantic prompt protocol.
 *
 * Adopted by Ghostty, iTerm2, Kitty, WezTerm, VS Code terminal.
 *
 * D;0 = command finished with exit code 0 (success).
 *       Ghostty uses this to trigger tab completion notifications.
 *
 * We intentionally do NOT emit 133;A (prompt start). That marker tells
 * the terminal "a prompt is displayed at this cursor position" which
 * enables scrollback navigation and gutter marks. Pi is a full-screen
 * TUI — there is no prompt line in the scrollback, so emitting A would
 * mark meaningless positions and confuse terminal features.
 */
function markCommandDone() {
	writeOSC("133;D;0");
}

export default function (pi: ExtensionAPI) {
	let active = false;

	function ensureStarted() {
		if (active) return;
		active = true;
		startProgress();
	}

	function ensureStopped() {
		if (!active) return;
		active = false;
		stopProgress();
		markCommandDone();
	}

	pi.on("agent_start", async (_event, _ctx: ExtensionContext) => {
		ensureStarted();
	});

	pi.on("agent_end", async (_event, _ctx: ExtensionContext) => {
		ensureStopped();
	});

	pi.on("session_shutdown", async (_event, _ctx: ExtensionContext) => {
		ensureStopped();
	});

	pi.on("session_switch", async (_event, _ctx: ExtensionContext) => {
		ensureStopped();
	});
}
