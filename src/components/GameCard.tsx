import { Card, Image, Text, Badge, Group, Stack, Tooltip } from "@mantine/core";
import type { GameData } from "../types/bgg.types";

interface GameCardProps {
  game: GameData;
}

export default function GameCard({ game }: GameCardProps) {
  const bggUrl = `https://boardgamegeek.com/boardgame/${game.id}`;

  return (
    <Card
      shadow="lg"
      padding="lg"
      radius="lg"
      component="a"
      href={bggUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background:
          "linear-gradient(145deg, rgba(37, 38, 43, 0.7) 0%, rgba(37, 38, 43, 0.5) 100%)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.4)";
        e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
      }}
    >
      <Card.Section style={{ position: "relative", overflow: "hidden" }}>
        {game.thumbnail ? (
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
                zIndex: 1,
              }}
            />
            <Image
              src={game.thumbnail}
              height={160}
              alt={game.name}
              fit="cover"
              style={{
                backgroundColor: "#2a2b30",
                objectPosition: "top",
              }}
            />
          </>
        ) : (
          <div
            style={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #434343 0%, #2a2b30 100%)",
            }}
          >
            <Text c="dimmed">No Image</Text>
          </div>
        )}
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Text fw={600} size="lg" lineClamp={2} style={{ minHeight: "3.5rem" }}>
          {game.name}
        </Text>

        <Group gap="xs" wrap="wrap">
          {game.minPlayers !== undefined && game.maxPlayers !== undefined && (
            <Tooltip label="Player Count">
              <Badge
                color="blue"
                variant="light"
                radius="md"
                style={{
                  background: "rgba(34, 139, 230, 0.1)",
                  border: "1px solid rgba(34, 139, 230, 0.3)",
                }}
              >
                👥{" "}
                {game.minPlayers === game.maxPlayers
                  ? game.minPlayers
                  : `${game.minPlayers}-${game.maxPlayers}`}
              </Badge>
            </Tooltip>
          )}

          {game.playingTime !== undefined && game.playingTime > 0 && (
            <Tooltip label="Playing Time">
              <Badge
                color="red"
                variant="light"
                radius="md"
                style={{
                  background: "rgba(250, 82, 82, 0.1)",
                  border: "1px solid rgba(250, 82, 82, 0.3)",
                }}
              >
                ⏱️ {game.playingTime}min
              </Badge>
            </Tooltip>
          )}

          {game.complexity !== undefined && (
            <Tooltip label="Complexity (1-5)">
              <Badge
                color="green"
                variant="light"
                radius="md"
                style={{
                  background: "rgba(64, 192, 87, 0.1)",
                  border: "1px solid rgba(64, 192, 87, 0.3)",
                }}
              >
                🧩 {game.complexity.toFixed(1)}
              </Badge>
            </Tooltip>
          )}

          {game.rating !== undefined && (
            <Tooltip label="BGG Rating">
              <Badge
                color="yellow"
                variant="light"
                radius="md"
                style={{
                  background: "rgba(250, 176, 5, 0.1)",
                  border: "1px solid rgba(250, 176, 5, 0.3)",
                }}
              >
                ⭐ {game.rating.toFixed(1)}
              </Badge>
            </Tooltip>
          )}
        </Group>

        {game.owners.length > 0 && (
          <Text size="sm" c="dimmed" mt="xs">
            Owned by: {game.owners.join(", ")}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
