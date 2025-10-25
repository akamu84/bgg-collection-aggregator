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
  Loader,
  Alert,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
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
  // TanStack Form for username input
  const usernameForm = useForm({
    defaultValues: { username: "" },
    onSubmit: ({ value }) => {
      addUsername(value.username?.trim() ?? "");
    },
  });
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

  const addUsername = (nameFromArg?: string) => {
    const raw = nameFromArg ?? usernameForm.state.values.username ?? "";
    const cleaned = raw.trim();
    if (!cleaned) return;
    if (usernames.includes(cleaned)) return;
    setUsernames((prev) => [...prev, cleaned]);
    // Reset the form field after adding
    usernameForm.reset({ username: "" });
  };

  const removeUsername = (name: string) => {
    setUsernames((prev) => prev.filter((u) => u !== name));
  };

  const filtered = filterGames(games, filters);
  const currentSortBy = (filters.sortBy ?? "name") as
    | "name"
    | "rating"
    | "rank"
    | "complexity"
    | "playingTime"
    | "owners";
  const currentSortOrder = (filters.sortOrder ?? "asc") as "asc" | "desc";
  const sorted = sortGames(filtered, currentSortBy, currentSortOrder);

  return (
    <Container size="xl" py="xl">
      <Stack>
        <Group justify="space-between">
          <Title order={2}>BGG Collection Aggregator</Title>
        </Group>

        <Stack>
          <Text c="dimmed">
            Enter BoardGameGeek usernames to combine their owned collections.
          </Text>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void usernameForm.handleSubmit();
            }}
          >
            <Group align="flex-end">
              <usernameForm.Field
                name="username"
                children={(field) => (
                  <TextInput
                    label="Username"
                    placeholder="e.g. tomvasel"
                    value={(field.state.value as string | undefined) ?? ""}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    w={300}
                  />
                )}
              />
              <Button type="submit">Add</Button>
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
          </form>

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
