import { createUser } from "./lib/db/queries/users";
import { setUser } from "./config";
import { getUserByName } from "./lib/db/queries/users";


type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandRegistry = {
  [cmdName: string]: CommandHandler;
};

export const handlerLogin: CommandHandler = async (cmdName: string, ...args: string[]) => {
    if (args.length === 0) {
        throw new Error("Username is required for login command");
    }
    const userName = args[0];
    if (await getUserByName(userName) === undefined) {
        throw new Error(`User ${userName} does not exist.`);
    }
    setUser(userName);
    console.log(`User set to ${userName}`);
}

export const handlerRegister: CommandHandler = async (cmdName: string, ...args: string[]) => {
    if (args.length === 0) {
        throw new Error("Username is required for register command");
    }
    const userName = args[0];
    if (await getUserByName(userName)) {
        throw new Error(`User ${userName} already exists.`);
    } 
    const newUser = await createUser(userName);
    setUser(userName); // Set the current user in config
    console.log(`User ${newUser.name} registered successfully.`);
    console.log(newUser); // Log the user data for debugging
}

export async function registerCommand(
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

export async function runCommand(
    registry: CommandRegistry,
    cmdName: string,
    ...args: string[]
) {
    if (registry[cmdName]) {
        await registry[cmdName](cmdName, ...args);
    } else {
        throw new Error(`Command ${cmdName} not found.`);
    }

}