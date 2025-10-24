import {
  Paper,
  Stack,
  TextInput,
  NumberInput,
  Text,
  Group,
  Button,
} from "@mantine/core";
import type { FilterState } from "../types/bgg.types";

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function FilterPanel({
  filters,
  onChange,
  onReset,
}: FilterPanelProps) {
  const updateFilter = (
    key: keyof FilterState,
    value: number | string | undefined
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>
            Filters
          </Text>
          <Button size="xs" variant="subtle" onClick={onReset}>
            Reset
          </Button>
        </Group>

        <TextInput
          label="Search"
          placeholder="Search by name..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Player Count
          </Text>
          <NumberInput
            label="Number of Players"
            placeholder="e.g. 4"
            min={1}
            max={20}
            value={filters.playerCount}
            onChange={(value) =>
              updateFilter("playerCount", value || undefined)
            }
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Play Time (minutes)
          </Text>
          <Group grow>
            <NumberInput
              label="Min"
              placeholder="Min"
              min={0}
              step={15}
              value={filters.minPlayTime}
              onChange={(value) =>
                updateFilter("minPlayTime", value || undefined)
              }
            />
            <NumberInput
              label="Max"
              placeholder="Max"
              min={0}
              step={15}
              value={filters.maxPlayTime}
              onChange={(value) =>
                updateFilter("maxPlayTime", value || undefined)
              }
            />
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Complexity (1-5)
          </Text>
          <Group grow>
            <NumberInput
              label="Min"
              placeholder="Min"
              min={1}
              max={5}
              step={0.5}
              decimalScale={1}
              value={filters.minComplexity}
              onChange={(value) =>
                updateFilter("minComplexity", value || undefined)
              }
            />
            <NumberInput
              label="Max"
              placeholder="Max"
              min={1}
              max={5}
              step={0.5}
              decimalScale={1}
              value={filters.maxComplexity}
              onChange={(value) =>
                updateFilter("maxComplexity", value || undefined)
              }
            />
          </Group>
        </div>

        <NumberInput
          label="Minimum Rating"
          placeholder="Min BGG rating"
          min={0}
          max={10}
          step={0.5}
          decimalScale={1}
          value={filters.minRating}
          onChange={(value) => updateFilter("minRating", value || undefined)}
        />
      </Stack>
    </Paper>
  );
}
