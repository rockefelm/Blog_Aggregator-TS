import { XMLParser } from "fast-xml-parser";
import { Feed, User, feeds, feedFollows, users } from "./db/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string) {
  const res = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
      accept: "application/rss+xml",
    },
  });
  if (!res.ok) {
    throw new Error(`failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const parser = new XMLParser();
  let result = parser.parse(xml);

  const channel = result.rss?.channel;
  if (!channel) {
    throw new Error("failed to parse channel");
  }

  if (
    !channel ||
    !channel.title ||
    !channel.link ||
    !channel.description ||
    !channel.item
  ) {
    throw new Error("failed to parse channel");
  }

  const items: any[] = Array.isArray(channel.item)
    ? channel.item
    : [channel.item];

  const rssItems: RSSItem[] = [];

  for (const item of items) {
    if (!item.title || !item.link || !item.description || !item.pubDate) {
      continue;
    }

    rssItems.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    });
  }

  const rss: RSSFeed = {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: rssItems,
    },
  };

  return rss;
}

export function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

export async function createFeed(
  feedName: string,
  url: string,
  userId: string,
) {
  const result = await db
    .insert(feeds)
    .values({
      name: feedName,
      url,
      userId,
    })
    .returning();

  return result[0];
}

export async function getFeeds() {
  const result = await db.select().from(feeds);
  return result;
}

export async function createFeedFollow(feedId: string, userId: string) {
    console.log("createFeedFollow called with:", { feedId, userId });
    const existingFollow = await db
        .select()
        .from(feedFollows)
        .where(
            and(
                eq(feedFollows.userId, userId),
                eq(feedFollows.feedId, feedId)
            )
        );
    console.log("Existing follows found:", existingFollow.length);
    if (existingFollow.length > 0) {
        const result = await db
            .select({
                id: feedFollows.id,
                createdAt: feedFollows.createdAt,
                updatedAt: feedFollows.updatedAt,
                userId: feedFollows.userId,
                feedId: feedFollows.feedId,
                userName: users.name,
                feedName: feeds.name,
            })
            .from(feedFollows)
            .innerJoin(users, eq(feedFollows.userId, users.id))
            .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
            .where(eq(feedFollows.id, existingFollow[0].id));
        
        return result[0];
    }
    console.log("Creating new follow");
    console.log("About to insert with values:", { feedId, userId });
    const [newFeedFollow] = await db
        .insert(feedFollows)
        .values({ feedId, userId })
        .returning();
    
    const result = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            updatedAt: feedFollows.updatedAt,
            userId: feedFollows.userId,
            feedId: feedFollows.feedId,
            userName: users.name,
            feedName: feeds.name,
        })
        .from(feedFollows)
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .where(
            eq(feedFollows.id, newFeedFollow.id),
        );
    return result[0];
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            upDatedAt: feedFollows.updatedAt,
            userId: feedFollows.userId,
            feedIf: feedFollows.feedId,
            feedName: feeds.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .where(eq(feedFollows.userId, userId));

    return result;
}

export async function getFeedByURL(url: string) {
  const result = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}

export function printFeedFollow(username: string, feedname: string) {
  console.log(`* User:          ${username}`);
  console.log(`* Feed:          ${feedname}`);
}