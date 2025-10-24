import { useQuery } from "@tanstack/react-query";
import { bggApiClient } from "../api/bggClient";
import type { GameData } from "../types/bgg.types";
import {
  normalizeCollectionItem,
  normalizeThingItem,
  mergeGameData,
} from "../utils/dataTransform";

export function useAggregatedCollections(usernames: string[]) {
  return useQuery({
    queryKey: ["aggregated-collections", usernames],
    queryFn: async () => {
      if (usernames.length === 0) {
        return [];
      }

      // Fetch all user collections in parallel
      const collectionPromises = usernames.map((username) =>
        bggApiClient.getUserCollection(username).then((items) => ({
          username,
          items,
        }))
      );

      const collections = await Promise.all(collectionPromises);

      // Normalize and collect all games
      const allGames: Partial<GameData>[] = [];
      const gameIds = new Set<string>();

      for (const { username, items } of collections) {
        for (const item of items) {
          gameIds.add(item.objectid);
          allGames.push(normalizeCollectionItem(item, username));
        }
      }

      // Fetch detailed information for games that need it (those missing complexity)
      const gamesNeedingDetails = allGames.filter(
        (game) => game.complexity === undefined
      );
      const idsNeedingDetails = Array.from(
        new Set(
          gamesNeedingDetails
            .map((g) => g.id)
            .filter((id): id is string => !!id)
        )
      );

      if (idsNeedingDetails.length > 0) {
        const thingDetails =
          await bggApiClient.getThingDetails(idsNeedingDetails);
        const detailsMap = new Map(
          thingDetails.map((thing) => [thing.id, normalizeThingItem(thing)])
        );

        // Merge details into games
        for (const game of allGames) {
          if (game.id && detailsMap.has(game.id)) {
            const details = detailsMap.get(game.id)!;
            Object.assign(game, {
              ...details,
              ...Object.fromEntries(
                Object.entries(game).filter(([key, value]) => {
                  // Don't overwrite good name from details with potentially bad name from original
                  if (
                    key === "name" &&
                    details.name &&
                    typeof details.name === "string"
                  ) {
                    return false;
                  }
                  return value !== undefined;
                })
              ),
              owners: game.owners, // Ensure owners list is preserved
            });
          }
        }
      }

      // Merge duplicate games across users
      const mergedGames = mergeGameData(allGames);

      return mergedGames;
    },
    enabled: usernames.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserCollection(username: string) {
  return useQuery({
    queryKey: ["user-collection", username],
    queryFn: async () => {
      const items = await bggApiClient.getUserCollection(username);
      return items.map((item) => normalizeCollectionItem(item, username));
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}
