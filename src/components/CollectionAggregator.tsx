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
  ActionIcon,
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
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Persist usernames to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(USERNAMES_STORAGE_KEY, JSON.stringify(usernames));
  }, [usernames]);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      <Stack gap="xl">
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            paddingTop: "1rem",
          }}
        >
          <Title
            order={1}
            size="3rem"
            mb="sm"
            style={{
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            BGG Collection Aggregator
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Enter BoardGameGeek usernames to combine their owned collections
          </Text>
        </div>

        <Stack
          gap="lg"
          p="xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(37, 38, 43, 0.6) 0%, rgba(37, 38, 43, 0.4) 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
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
                    radius="md"
                    placeholder="e.g. tomvasel"
                    value={(field.state.value as string | undefined) ?? ""}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    w={300}
                    styles={{
                      input: {
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        fontSize: "1rem",
                      },
                    }}
                  />
                )}
              />
              <Button
                type="submit"
                size="md"
                radius="md"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(102, 126, 234, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                Add
              </Button>
              {usernames.length > 0 && (
                <Button
                  variant="light"
                  size="md"
                  radius="md"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  Refresh
                </Button>
              )}
            </Group>
          </form>

          {usernames.length > 0 && (
            <Group gap="sm">
              {usernames.map((name) => (
                <Badge
                  key={name}
                  size="lg"
                  radius="md"
                  color={getStableColor(name)}
                  variant="light"
                  style={{
                    paddingRight: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                  rightSection={
                    <CloseButton
                      size="xs"
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

        <Group align="flex-start" wrap="wrap" gap="lg">
          <div style={{ width: "100%", flex: "1 1 100%", maxWidth: "100%" }}>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters({})}
            />
          </div>

          <Stack style={{ flex: "1 1 100%", minWidth: 0 }} gap="lg">
            {isLoading && (
              <Group
                justify="center"
                p="xl"
                style={{
                  background: "rgba(37, 38, 43, 0.5)",
                  borderRadius: "12px",
                }}
              >
                <Loader size="lg" />
                <Text size="lg">Loading collections...</Text>
              </Group>
            )}

            {error && (
              <Alert
                color="red"
                title="Error fetching collections"
                radius="md"
                style={{
                  border: "1px solid rgba(250, 82, 82, 0.3)",
                }}
              >
                {error instanceof Error ? error.message : "Unknown error"}
              </Alert>
            )}

            {!isLoading && usernames.length === 0 && (
              <Text c="dimmed" size="lg" ta="center" p="xl">
                Add at least one username to begin
              </Text>
            )}

            {!isLoading && usernames.length > 0 && (
              <Text size="sm" c="dimmed" px="xs">
                {filtered.length} of {games.length} games match filters
              </Text>
            )}

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {sorted.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </SimpleGrid>
          </Stack>
        </Group>
      </Stack>

      {showBackToTop && (
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            transition: "all 0.3s ease",
            zIndex: 1000,
            width: "56px",
            height: "56px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(102, 126, 234, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(102, 126, 234, 0.4)";
          }}
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </ActionIcon>
      )}
    </Container>
  );
}
