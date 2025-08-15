import { type CommandRegistry, handlerLogin, registerCommand, handlerRegister, runCommand } from "./commands.js";


async function main() {
  const registeredCommands: CommandRegistry = {};
  registerCommand(registeredCommands, "login", handlerLogin);
  registerCommand(registeredCommands, "register", handlerRegister)
  const cmdName = process.argv[2];
  const args = process.argv.slice(3);
  if (!cmdName) {
    console.error("No command provided. Please specify a command to run.")
    process.exit(1);
  } else if (!registeredCommands[cmdName]) {
    console.error(`Command ${cmdName} is not registered.`);
    process.exit(1);
  }
  try {
    await runCommand(registeredCommands, cmdName, ...args);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unexpected error occurred.");
    }
    process.exit(1);
  }
  process.exit(0);
}



main();