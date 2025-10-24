import {
  Container,
  Group,
  Title,
  Text,
  Stack,
  TextInput,
  Button,
  Badge,
  CloseButton,
  SimpleGrid,
  Select,
  Loader,
  Alert,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useAggregatedCollections } from "../hooks/useBGGData";
import type { FilterState } from "../types/bgg.types";
import FilterPanel from "./FilterPanel";
import GameCard from "./GameCard";

const getStableColor = (text: string) => {
  const colors = [
    "blue",
    "cyan",
    "teal",
    "green",
    "lime",
    "yellow",
    "orange",
    "red",
    "pink",
    "grape",
    "violet",
    "indigo",
    "dark",
    "gray",
  ];
  // Create a simple hash from the text to get a consistent index
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
import { filterGames, sortGames } from "../utils/filtering";

const USERNAMES_STORAGE_KEY = "bgg-aggregator-usernames";

export default function CollectionAggregator() {
  const [usernameInput, setUsernameInput] = useState("");
  const [usernames, setUsernames] = useState<string[]>(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem(USERNAMES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<
    "name" | "rating" | "rank" | "complexity" | "playingTime" | "owners"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Persist usernames to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(USERNAMES_STORAGE_KEY, JSON.stringify(usernames));
  }, [usernames]);

  const {
    data: games = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAggregatedCollections(usernames);

  const addUsername = () => {
    const cleaned = usernameInput.trim();
    if (!cleaned) return;
    if (usernames.includes(cleaned)) return;
    setUsernames((prev) => [...prev, cleaned]);
    setUsernameInput("");
  };

  const removeUsername = (name: string) => {
    setUsernames((prev) => prev.filter((u) => u !== name));
  };

  const filtered = filterGames(games, filters);
  const sorted = sortGames(filtered, sortBy, sortOrder);

  return (
    <Container size="xl" py="xl">
      <Stack>
        <Group justify="space-between">
          <Title order={2}>BGG Collection Aggregator</Title>
          <Group>
            <Select
              label="Sort by"
              data={[
                { value: "name", label: "Name" },
                { value: "rating", label: "Rating" },
                { value: "rank", label: "Rank" },
                { value: "complexity", label: "Complexity" },
                { value: "playingTime", label: "Playing time" },
                { value: "owners", label: "Owners" },
              ]}
              value={sortBy}
              onChange={(v) => setSortBy((v as typeof sortBy) ?? "name")}
              allowDeselect={false}
              w={180}
            />
            <Select
              label="Order"
              data={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
              value={sortOrder}
              onChange={(v) => setSortOrder((v as typeof sortOrder) ?? "asc")}
              allowDeselect={false}
              w={150}
            />
          </Group>
        </Group>

        <Stack>
          <Text c="dimmed">
            Enter BoardGameGeek usernames to combine their owned collections.
          </Text>
          <Group align="flex-end">
            <TextInput
              label="Username"
              placeholder="e.g. tomvasel"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addUsername();
              }}
              w={300}
            />
            <Button onClick={addUsername}>Add</Button>
            {usernames.length > 0 && (
              <Button
                variant="light"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                Refresh
              </Button>
            )}
          </Group>

          {usernames.length > 0 && (
            <Group>
              {usernames.map((name) => (
                <Badge
                  key={name}
                  color={getStableColor(name)}
                  rightSection={
                    <CloseButton
                      onClick={() => removeUsername(name)}
                      aria-label={`Remove ${name}`}
                    />
                  }
                >
                  {name}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>

        <Group align="flex-start" wrap="nowrap">
          <div style={{ width: 320, flex: "0 0 auto" }}>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters({})}
            />
          </div>

          <Stack style={{ flex: 1 }}>
            {isLoading && (
              <Group>
                <Loader />
                <Text>Loading collections...</Text>
              </Group>
            )}

            {error && (
              <Alert color="red" title="Error fetching collections">
                {error instanceof Error ? error.message : "Unknown error"}
              </Alert>
            )}

            {!isLoading && usernames.length === 0 && (
              <Text c="dimmed">Add at least one username to begin.</Text>
            )}

            {!isLoading && usernames.length > 0 && (
              <Text size="sm" c="dimmed">
                {filtered.length} of {games.length} games match filters
              </Text>
            )}

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {sorted.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </SimpleGrid>
          </Stack>
        </Group>
      </Stack>
    </Container>
  );
}
