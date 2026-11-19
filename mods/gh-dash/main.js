// gh-dash in a window over the layout, from one key (keys.json: "mod.open:gh-dash").
//
// The key opens this mod as a 2x2 px launcher popup (mod.json). It starts `gh dash` in a hidden
// herdr-core terminal, in the focused terminal's folder and on its machine, through the user's login
// shell so PATH and the gh extension are found; shows that terminal in a 90% dialog; and closes itself.
// Quit gh-dash with its own key (q) and the dialog closes with it (an overlay closes when its terminal
// ends). Esc goes to gh-dash, not to Herdr, so a click beside the dialog does nothing (modal).
import { View, div } from "gpui-kit";
import { props, focused, spaces, hc, openOverlay, closeOverlay, notify, checking } from "herdr";

// The one line to change when you copy this folder for another program (`mod.clone`; lazygit, k9s, btop...).
const COMMAND = "gh dash";
// The terminal's name: unique among live terminals, so a second key press finds the first one instead
// of starting another. Derived from COMMAND ("gh dash" -> "popup-gh-dash"), so copies never collide.
const TERMINAL_NAME = `popup-${COMMAND.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`.slice(0, 32);

export default class GhDash extends View {
  init(_props, cx) {
    // `herdr-app check` renders every mod once: that must not start a terminal.
    if (checking()) return;
    cx.spawn(async () => {
      try {
        await openDash();
      } catch (err) {
        notify({ title: `Couldn't open ${COMMAND}`, body: String(err?.message ?? err).split("\n")[0], level: "error" });
      } finally {
        const launcher = props()?.overlay;
        if (launcher) closeOverlay(launcher);
      }
    });
  }

  render() {
    return div();
  }
}

async function openDash() {
  const f = focused();
  const machine = spaces().find((s) => s.id === f?.space)?.machine ?? null;
  // Pressing the key again while gh-dash is up must not start a second one: the terminal is named
  // (names are unique among live terminals), so a live one is shown again. Local only: on another
  // machine the name is that machine's, and `hc get` here would not see it.
  let address = null;
  if (!machine) {
    const have = await hc(["get", TERMINAL_NAME]);
    if (have.code === 0) {
      const t = JSON.parse(have.stdout);
      if (t.state === "live") address = t.address;
    }
  }
  if (!address) {
    const args = ["run", "--bg", "--json", "--rm", "--no-parent"];
    if (machine) args.push("--on", machine);
    else args.push("--name", TERMINAL_NAME);
    if (f?.cwd) args.push("--cwd", f.cwd);
    args.push("--", "/bin/sh", "-c", 'exec "${SHELL:-/bin/sh}" -lic "$1"', "sh", COMMAND);
    const r = await hc(args);
    if (r.code !== 0) throw new Error(r.stderr.trim() || `hc run exited ${r.code}`);
    address = JSON.parse(r.stdout).address;
  }
  // Close the launcher before the dialog opens: closing it afterwards hands the keyboard back to the pane underneath.
  const launcher = props()?.overlay;
  if (launcher) closeOverlay(launcher);
  openOverlay({ kind: "dialog", modal: true, width: 0.9, height: 0.9, layout: { type: "block", content: { terminal: address } } });
}
