const path = require("path");
const { setupMaster, fork: _fork } = require("cluster");

let isRunning = false;
function start(file) {
	if (isRunning) {
		return;
	}
	isRunning = true;
	const args = [path.join(__dirname, file), ...process.argv.slice(2)];
	setupMaster({
		exec: args[0],
		args: args.slice(1),
	});
	const fork = _fork();
	fork.on("message", (data) => {
		console.log("[INIT] " + data);
	});
	fork.on("exit", (code) => {
		console.log("[PROCCESS] KILLED: " + code);
		throw code;
	});
}
start("main.js");
