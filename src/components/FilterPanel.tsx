import {
  Paper,
  Stack,
  TextInput,
  NumberInput,
  Text,
  Group,
  Button,
  Select,
} from "@mantine/core";
import type { FilterState } from "../types/bgg.types";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";

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
  // Initialize TanStack Form with incoming filters
  const form = useForm({
    defaultValues: filters,
    onSubmit: () => {
      // No explicit submit needed; sync via effect below
    },
  });

  // (No useEffect for filter syncing; call onChange directly in each field)

  // If external filters prop changes (e.g., reset from parent), sync the form
  useEffect(() => {
    form.reset(filters);
  }, [filters, form]);

  return (
    <Paper shadow="sm" p="md" withBorder>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="lg" fw={600}>
              Filters
            </Text>
            <Button
              size="xs"
              variant="subtle"
              onClick={() => {
                // Reset only filter fields; keep sort controls unchanged to preserve behavior
                form.setFieldValue("search", undefined as unknown as string);
                form.setFieldValue(
                  "playerCount",
                  undefined as unknown as number
                );
                form.setFieldValue(
                  "minPlayTime",
                  undefined as unknown as number
                );
                form.setFieldValue(
                  "maxPlayTime",
                  undefined as unknown as number
                );
                form.setFieldValue(
                  "minComplexity",
                  undefined as unknown as number
                );
                form.setFieldValue(
                  "maxComplexity",
                  undefined as unknown as number
                );
                form.setFieldValue("minRating", undefined as unknown as number);
                onReset();
              }}
            >
              Reset
            </Button>
          </Group>

          <Group>
            <form.Field
              name="sortBy"
              children={(field) => (
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
                  value={(field.state.value as string | undefined) ?? "name"}
                  onChange={(v) => {
                    (field.handleChange as unknown as (val: unknown) => void)(
                      v ?? "name"
                    );
                    onChange({
                      ...form.state.values,
                      sortBy: (v as FilterState["sortBy"]) ?? "name",
                    });
                  }}
                  onBlur={field.handleBlur}
                  allowDeselect={false}
                  w={180}
                />
              )}
            />
            <form.Field
              name="sortOrder"
              children={(field) => (
                <Select
                  label="Order"
                  data={[
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                  ]}
                  value={(field.state.value as string | undefined) ?? "asc"}
                  onChange={(v) => {
                    (field.handleChange as unknown as (val: unknown) => void)(
                      v ?? "asc"
                    );
                    onChange({
                      ...form.state.values,
                      sortOrder: (v as FilterState["sortOrder"]) ?? "asc",
                    });
                  }}
                  onBlur={field.handleBlur}
                  allowDeselect={false}
                  w={150}
                />
              )}
            />
          </Group>

          <form.Field
            name="search"
            children={(field) => (
              <TextInput
                label="Search"
                placeholder="Search by name..."
                value={(field.state.value as string | undefined) ?? ""}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                  onChange({
                    ...form.state.values,
                    search: e.currentTarget.value,
                  });
                }}
                onBlur={field.handleBlur}
              />
            )}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Player Count
            </Text>
            <form.Field
              name="playerCount"
              children={(field) => (
                <NumberInput
                  label="Number of Players"
                  placeholder="e.g. 4"
                  min={1}
                  max={20}
                  value={(field.state.value as number | undefined) ?? undefined}
                  onChange={(value) => {
                    const val = typeof value === "number" ? value : undefined;
                    field.handleChange(val);
                    onChange({ ...form.state.values, playerCount: val });
                  }}
                  onBlur={field.handleBlur}
                />
              )}
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Play Time (minutes)
            </Text>
            <Group grow>
              <form.Field
                name="minPlayTime"
                children={(field) => (
                  <NumberInput
                    label="Min"
                    placeholder="Min"
                    min={0}
                    step={15}
                    value={
                      (field.state.value as number | undefined) ?? undefined
                    }
                    onChange={(value) => {
                      const val = typeof value === "number" ? value : undefined;
                      field.handleChange(val);
                      onChange({ ...form.state.values, minPlayTime: val });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              />
              <form.Field
                name="maxPlayTime"
                children={(field) => (
                  <NumberInput
                    label="Max"
                    placeholder="Max"
                    min={0}
                    step={15}
                    value={
                      (field.state.value as number | undefined) ?? undefined
                    }
                    onChange={(value) => {
                      const val = typeof value === "number" ? value : undefined;
                      field.handleChange(val);
                      onChange({ ...form.state.values, maxPlayTime: val });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              />
            </Group>
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Complexity (1-5)
            </Text>
            <Group grow>
              <form.Field
                name="minComplexity"
                children={(field) => (
                  <NumberInput
                    label="Min"
                    placeholder="Min"
                    min={1}
                    max={5}
                    step={0.5}
                    decimalScale={1}
                    value={
                      (field.state.value as number | undefined) ?? undefined
                    }
                    onChange={(value) => {
                      const val = typeof value === "number" ? value : undefined;
                      field.handleChange(val);
                      onChange({ ...form.state.values, minComplexity: val });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              />
              <form.Field
                name="maxComplexity"
                children={(field) => (
                  <NumberInput
                    label="Max"
                    placeholder="Max"
                    min={1}
                    max={5}
                    step={0.5}
                    decimalScale={1}
                    value={
                      (field.state.value as number | undefined) ?? undefined
                    }
                    onChange={(value) => {
                      const val = typeof value === "number" ? value : undefined;
                      field.handleChange(val);
                      onChange({ ...form.state.values, maxComplexity: val });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              />
            </Group>
          </div>

          <form.Field
            name="minRating"
            children={(field) => (
              <NumberInput
                label="Minimum Rating"
                placeholder="Min BGG rating"
                min={0}
                max={10}
                step={0.5}
                decimalScale={1}
                value={(field.state.value as number | undefined) ?? undefined}
                onChange={(value) => {
                  const val = typeof value === "number" ? value : undefined;
                  field.handleChange(val);
                  onChange({ ...form.state.values, minRating: val });
                }}
                onBlur={field.handleBlur}
              />
            )}
          />
        </Stack>
      </form>
    </Paper>
  );
}
