import type { GameData, FilterState } from "../types/bgg.types";

export function filterGames(
  games: GameData[],
  filters: FilterState
): GameData[] {
  return games.filter((game) => {
    // Player count filter
    if (filters.playerCount !== undefined) {
      const minPlayers = game.minPlayers ?? 0;
      const maxPlayers = game.maxPlayers ?? 999;

      // Game must accommodate the specified number of players
      if (
        filters.playerCount < minPlayers ||
        filters.playerCount > maxPlayers
      ) {
        return false;
      }
    }

    // Play time filter
    if (filters.minPlayTime !== undefined) {
      const playTime = game.maxPlayTime ?? game.playingTime ?? 0;
      if (playTime < filters.minPlayTime) return false;
    }

    if (filters.maxPlayTime !== undefined) {
      const playTime = game.minPlayTime ?? game.playingTime ?? 999;
      if (playTime > filters.maxPlayTime) return false;
    }

    // Complexity filter
    if (filters.minComplexity !== undefined) {
      if ((game.complexity ?? 0) < filters.minComplexity) return false;
    }

    if (filters.maxComplexity !== undefined) {
      if ((game.complexity ?? 0) > filters.maxComplexity) return false;
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      if ((game.rating ?? 0) < filters.minRating) return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!game.name.toLowerCase().includes(searchLower)) return false;
    }

    return true;
  });
}

export function sortGames(
  games: GameData[],
  sortBy: "name" | "rating" | "rank" | "complexity" | "playingTime" | "owners",
  sortOrder: "asc" | "desc" = "asc"
): GameData[] {
  const sorted = [...games].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case "name":
        aValue = String(a.name || "").toLowerCase();
        bValue = String(b.name || "").toLowerCase();
        break;
      case "rating":
        aValue = a.rating ?? 0;
        bValue = b.rating ?? 0;
        break;
      case "rank":
        aValue = a.rank ?? 999999;
        bValue = b.rank ?? 999999;
        break;
      case "complexity":
        aValue = a.complexity ?? 0;
        bValue = b.complexity ?? 0;
        break;
      case "playingTime":
        aValue = a.playingTime ?? 0;
        bValue = b.playingTime ?? 0;
        break;
      case "owners":
        aValue = a.owners.length;
        bValue = b.owners.length;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}
