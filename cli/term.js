var term = require("terminal-kit").terminal;

term.bold.cyan("Type anything on the keyboard...\n");
term.green("Hit CTRL-C to quit.\n\n");

term.grabInput({ mouse: "button" });

term.on("terminal", function (name, data) {
  console.log("'terminal' event:", name, data);
});

term.on("key", function (name, matches, data) {
  console.log("'key' event:", name);
  if (name === "CTRL_C") {
    terminate();
  }
});

term.on("mouse", function (name, data) {
  console.log("'mouse' event:", name, data);
});
