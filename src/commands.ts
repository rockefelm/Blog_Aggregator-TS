import { setUser } from "./config";


type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandRegistry = {
  [cmdName: string]: CommandHandler;
};

export const handlerLogin: CommandHandler = (cmdName: string, ...args: string[]) => {
    if (args.length === 0) {
        throw new Error("Username is required for login command");
    }
    const userName = args[0];
    setUser(userName);
    console.log(`User set to ${userName}`);
}

export function registerCommand(
    registry: CommandRegistry, 
    cmdName: string, 
    handler: CommandHandler
) {
    if (registry[cmdName]) {
        throw new Error(`Command ${cmdName} already exists.`);
    }
    registry[cmdName] = handler;
    console.log(`Command ${cmdName} registered successfully.`);

} 

export function runCommand(
    registry: CommandRegistry,
    cmdName: string,
    ...args: string[]
) {
    if (registry[cmdName]) {
        registry[cmdName](cmdName, ...args);
    } else {
        throw new Error(`Command ${cmdName} not found.`);
    }

}