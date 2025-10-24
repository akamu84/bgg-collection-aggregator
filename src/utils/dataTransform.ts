import type { BGGCollectionItem, BGGThing, GameData } from "../types/bgg.types";

// Utility function to safely extract string from potentially complex name structures
function extractNameString(name: unknown): string {
  if (typeof name === "string") {
    return name;
  }
  if (typeof name === "object" && name !== null) {
    // Handle BGGThing name structure
    if (Array.isArray(name)) {
      const primaryName = (name as Array<{ type: string; value: string }>).find(
        (n) => n.type === "primary"
      )?.value;
      if (primaryName) return primaryName;
      return (name as Array<{ value: string }>)[0]?.value || "Unknown";
    }
    // Handle single name object
    if (
      "value" in name &&
      typeof (name as { value: unknown }).value === "string"
    ) {
      return (name as { value: string }).value;
    }
  }
  return "Unknown";
}

export function normalizeCollectionItem(
  item: BGGCollectionItem,
  username: string
): Partial<GameData> {
  const ranks = item.stats?.rating?.ranks?.rank;
  const rank =
    ranks && ranks.length > 0
      ? ranks.find((r) => r.name === "boardgame") ||
        ranks.find((r) => r.type === "subtype") ||
        ranks.find((r) =>
          r.friendlyname?.toLowerCase().includes("board game")
        ) ||
        ranks[0] // Fallback to first rank
      : undefined;

  return {
    id: item.objectid,
    name: extractNameString(item.name),
    thumbnail: item.thumbnail,
    image: item.image,
    yearPublished: item.yearpublished
      ? parseInt(item.yearpublished)
      : undefined,
    minPlayers: item.stats?.minplayers
      ? parseInt(item.stats.minplayers)
      : undefined,
    maxPlayers: item.stats?.maxplayers
      ? parseInt(item.stats.maxplayers)
      : undefined,
    playingTime: item.stats?.playingtime
      ? parseInt(item.stats.playingtime)
      : undefined,
    minPlayTime: item.stats?.minplaytime
      ? parseInt(item.stats.minplaytime)
      : undefined,
    maxPlayTime: item.stats?.maxplaytime
      ? parseInt(item.stats.maxplaytime)
      : undefined,
    rating: item.stats?.rating?.average?.value
      ? parseFloat(item.stats.rating.average.value)
      : undefined,
    rank:
      rank && rank.value !== "Not Ranked" && !isNaN(parseInt(rank.value))
        ? parseInt(rank.value)
        : undefined,
    numOwned: item.stats?.numowned ? parseInt(item.stats.numowned) : undefined,
    owners: [username],
  };
}

export function normalizeThingItem(thing: BGGThing): Partial<GameData> {
  const ranks = thing.statistics?.ratings?.ranks?.rank;
  const rank = ranks
    ? Array.isArray(ranks)
      ? ranks.find((r) => r.name === "boardgame") ||
        ranks.find((r) => r.type === "subtype") ||
        ranks.find((r) =>
          r.friendlyname?.toLowerCase().includes("board game")
        ) ||
        ranks[0] // Fallback to first rank
      : ranks // Single rank object
    : undefined;

  return {
    id: thing.id,
    name: extractNameString(thing.name),
    thumbnail: thing.thumbnail,
    image: thing.image,
    yearPublished: thing.yearpublished?.value
      ? parseInt(thing.yearpublished.value)
      : undefined,
    minPlayers: thing.minplayers?.value
      ? parseInt(thing.minplayers.value)
      : undefined,
    maxPlayers: thing.maxplayers?.value
      ? parseInt(thing.maxplayers.value)
      : undefined,
    playingTime: thing.playingtime?.value
      ? parseInt(thing.playingtime.value)
      : undefined,
    minPlayTime: thing.minplaytime?.value
      ? parseInt(thing.minplaytime.value)
      : undefined,
    maxPlayTime: thing.maxplaytime?.value
      ? parseInt(thing.maxplaytime.value)
      : undefined,
    complexity: thing.statistics?.ratings?.averageweight?.value
      ? parseFloat(thing.statistics.ratings.averageweight.value)
      : undefined,
    rating: thing.statistics?.ratings?.average?.value
      ? parseFloat(thing.statistics.ratings.average.value)
      : undefined,
    rank:
      rank && rank.value !== "Not Ranked" && !isNaN(parseInt(rank.value))
        ? parseInt(rank.value)
        : undefined,
    numOwned: thing.statistics?.ratings?.owned?.value
      ? parseInt(thing.statistics.ratings.owned.value)
      : undefined,
    owners: [],
  };
}

export function mergeGameData(games: Partial<GameData>[]): GameData[] {
  const gameMap = new Map<string, GameData>();

  for (const game of games) {
    if (!game.id) continue;

    const existing = gameMap.get(game.id);

    if (existing) {
      // Merge owners
      const combinedOwners = [
        ...new Set([...existing.owners, ...(game.owners || [])]),
      ];

      // Prefer non-undefined values from new data, but preserve existing name if new name is undefined
      const updatedData = Object.fromEntries(
        Object.entries(game).filter(([key, value]) => {
          if (key === "name" && (!value || typeof value !== "string")) {
            return false; // Don't overwrite existing name with undefined/empty/non-string name
          }
          return value !== undefined;
        })
      );

      gameMap.set(game.id, {
        ...existing,
        ...updatedData,
        name:
          typeof updatedData.name === "string"
            ? updatedData.name
            : extractNameString(existing.name),
        owners: combinedOwners,
      } as GameData);
    } else {
      gameMap.set(game.id, {
        id: game.id,
        name: extractNameString(game.name),
        thumbnail: game.thumbnail,
        image: game.image,
        yearPublished: game.yearPublished,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        playingTime: game.playingTime,
        minPlayTime: game.minPlayTime,
        maxPlayTime: game.maxPlayTime,
        complexity: game.complexity,
        rating: game.rating,
        rank: game.rank,
        numOwned: game.numOwned,
        owners: game.owners || [],
      });
    }
  }

  return Array.from(gameMap.values());
}
