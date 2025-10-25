import {
  Paper,
  Stack,
  TextInput,
  NumberInput,
  Text,
  Group,
  Button,
  Select,
  Collapse,
  ActionIcon,
} from "@mantine/core";
import type { FilterState } from "../types/bgg.types";
import { useEffect, useMemo, useState } from "react";
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

  // Collapsible state with localStorage persistence
  const STORAGE_KEY = "bgg-aggregator-filters-collapsed";
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      // ignore persistence errors
    }
  }, [collapsed]);

  const contentId = useMemo(() => "filters-panel-content", []);

  // If external filters prop changes (e.g., reset from parent), sync the form
  useEffect(() => {
    form.reset(filters);
  }, [filters, form]);

  return (
    <Paper
      shadow="xl"
      p="lg"
      radius="lg"
      style={{
        background:
          "linear-gradient(145deg, rgba(37, 38, 43, 0.95) 0%, rgba(37, 38, 43, 0.85) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <Stack gap="lg">
          <Group justify="space-between" mb="xs" align="center">
            <Group gap="xs" align="center">
              <ActionIcon
                variant="subtle"
                radius="md"
                aria-label={collapsed ? "Expand filters" : "Collapse filters"}
                aria-expanded={!collapsed}
                aria-controls={contentId}
                onClick={() => setCollapsed((c) => !c)}
              >
                {/* Chevron icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 150ms ease",
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </ActionIcon>
              <Text
                size="xl"
                fw={700}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  userSelect: "none",
                  cursor: "default",
                }}
              >
                Filters
              </Text>
            </Group>
            <Button
              size="xs"
              variant="light"
              radius="md"
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

          <Collapse in={!collapsed} role="region" id={contentId}>
            <Stack gap="lg">
              <form.Field
            name="sortBy"
            children={(field) => (
              <Select
                label="Sort by"
                radius="md"
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
                styles={{
                  input: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              />
            )}
          />

              <form.Field
            name="sortOrder"
            children={(field) => (
              <Select
                label="Order"
                radius="md"
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
                styles={{
                  input: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              />
            )}
          />

              <form.Field
            name="search"
            children={(field) => (
              <TextInput
                label="Search"
                radius="md"
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
                styles={{
                  input: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
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
                  radius="md"
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
                  styles={{
                    input: {
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
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
                    radius="md"
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
                    styles={{
                      input: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  />
                )}
              />
                  <form.Field
                name="maxPlayTime"
                children={(field) => (
                  <NumberInput
                    label="Max"
                    radius="md"
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
                    styles={{
                      input: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
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
                    radius="md"
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
                    styles={{
                      input: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  />
                )}
              />
                  <form.Field
                name="maxComplexity"
                children={(field) => (
                  <NumberInput
                    label="Max"
                    radius="md"
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
                    styles={{
                      input: {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
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
                radius="md"
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
                styles={{
                  input: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              />
            )}
          />
            </Stack>
          </Collapse>
        </Stack>
      </form>
    </Paper>
  );
}
