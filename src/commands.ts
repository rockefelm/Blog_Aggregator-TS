import { createUser, 
    getUserByName, 
    reset, 
    getUsers, 
    getUserById, 
} from "./lib/db/queries/users";
import { setUser, readConfig } from "./config";
import { fetchFeed, 
    createFeed, 
    printFeed, 
    getFeeds, 
    createFeedFollow, 
    printFeedFollow, 
    getFeedFollowsForUser, 
    getFeedByURL 
} from "./lib/rss";
import { User } from "./lib/db/schema";


type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
type userCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;
type middlewareLoggedIn = (handler: userCommandHandler) => CommandHandler;

export function middlewareLoggedIn(handler: userCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    if (!config.currentUserName) {
      throw new Error("No user is currently logged in. Please login first.");
    }
    const user = await getUserByName(config.currentUserName);
    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }
    return handler(cmdName, user, ...args);
  };
}

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

export const handlerReset: CommandHandler = async (cmdName: string, ...args: string[]) => {
    await reset();
    console.log("Database reset successfully.");
}

export const handlerGetUsers: CommandHandler = async (cmdName: string, ...args: string[]) => {
    const allUsers = await getUsers();
    if (allUsers.length === 0) {
        console.log("No users found.");
    } else {
        const config = readConfig();
        const currentUserName = config.currentUserName;
        allUsers.forEach(user => {
            if (user.name === currentUserName) {
                console.log(`* ${user.name} (current)`);
            } else {
                console.log(`* ${user.name}`);
            }
        });
    }
}

export async function handlerAgg(_: string) {
  const feedURL = "https://www.wagslane.dev/index.xml";

  const feedData = await fetchFeed(feedURL);
  const feedDataStr = JSON.stringify(feedData, null, 2);
  console.log(feedDataStr);
}

export async function handlerAddFeed(cmdName: string,user: User, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <feed_name> <url>`);
    }

    const feedName = args[0];
    const url = args[1];

    const feed = await createFeed(feedName, url, user.id);
    if (!feed) {
        throw new Error(`Failed to create feed`);
    }
    const feedFollow = await createFeedFollow(feed.id, user.id);

    printFeedFollow(user.name, feedFollow.feedName);

    console.log("Feed created successfully:");
    printFeed(feed, user);
}

export async function handlerListFeeds(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds();

    if (feeds.length === 0) {
        console.log("No feeds found.");
        return;
    }

    console.log(`Found ${feeds.length} feeds:`);
    for (const feed of feeds) {
        const user = await getUserById(feed.userId);
        if (!user) {
            throw new Error(`Can't find user for feed ${feed.id}`);
        }
        printFeed(feed, user);
        console.log("--------------------");
    }
    
}

export async function handlerFollow(cmdName: string,user: User, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <feed_url>`);
  }

  const feedURL = args[0];
  const feedResult = await getFeedByURL(feedURL);
  const feed = feedResult[0];
  if (!feed) {
    throw new Error(`Feed not found: ${feedURL}`);
  }

  const ffRow = await createFeedFollow(feed.id, user.id);

  console.log(`Feed follow created:`);
  printFeedFollow(ffRow.userName, ffRow.feedName);
}

export async function handlerListFeedFollows(cmdName: string, user: User, ...args: string[]) {
    if (args.length > 0) {
        throw new Error(`usage: ${cmdName}`);
    }
    const feedFollows = await getFeedFollowsForUser(user.id);
    if (feedFollows.length === 0) {
        console.log(`No feed follows found for this user.`);
        return;
    }

    console.log(`Feed follows for user %s:`, user.id);
    for (let ff of feedFollows) {
        console.log(`* %s`, ff.feedName);
    }
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