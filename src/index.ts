import { type CommandRegistry, handlerLogin, registerCommand, runCommand } from "./commands.js";


function main() {
  const registeredCommands: CommandRegistry = {};
  registerCommand(registeredCommands, "login", handlerLogin);
  const cmdName = process.argv[2];
  const args = process.argv.slice(3);
  if (!cmdName) {
    console.error("No command provided. Please specify a command to run.")
    process.exit(1);
  }
  try {
    runCommand(registeredCommands, cmdName, ...args);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unexpected error occurred.");
    }
    process.exit(1);
  }
}



main();