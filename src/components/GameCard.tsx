import { Card, Image, Text, Badge, Group, Stack, Tooltip } from "@mantine/core";
import type { GameData } from "../types/bgg.types";

interface GameCardProps {
  game: GameData;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        {game.thumbnail ? (
          <Image
            src={game.thumbnail}
            height={160}
            alt={game.name}
            fit="cover"
            style={{
              backgroundColor: "#f5f5f5",
              objectPosition: "top",
            }}
          />
        ) : (
          <div
            style={{
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Text c="dimmed">No Image</Text>
          </div>
        )}
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Text fw={500} size="lg" lineClamp={2}>
          {game.name}
        </Text>

        <Group gap="xs" wrap="wrap">
          {game.minPlayers !== undefined && game.maxPlayers !== undefined && (
            <Tooltip label="Player Count">
              <Badge color="blue" variant="outline">
                👥{" "}
                {game.minPlayers === game.maxPlayers
                  ? game.minPlayers
                  : `${game.minPlayers}-${game.maxPlayers}`}
              </Badge>
            </Tooltip>
          )}

          {game.playingTime !== undefined && game.playingTime > 0 && (
            <Tooltip label="Playing Time">
              <Badge color="red" variant="outline">
                ⏱️ {game.playingTime}min
              </Badge>
            </Tooltip>
          )}

          {game.complexity !== undefined && (
            <Tooltip label="Complexity (1-5)">
              <Badge color="green" variant="outline">
                🧩 {game.complexity.toFixed(1)}
              </Badge>
            </Tooltip>
          )}

          {game.rating !== undefined && (
            <Tooltip label="BGG Rating">
              <Badge color="yellow" variant="outline">
                ⭐ {game.rating.toFixed(1)}
              </Badge>
            </Tooltip>
          )}
        </Group>

        {game.owners.length > 0 && (
          <Text size="sm" c="dimmed">
            Owned by: {game.owners.join(", ")}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
