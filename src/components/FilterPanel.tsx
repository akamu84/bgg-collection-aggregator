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
          <Group justify="space-between" mb="xs">
            <Text
              size="xl"
              fw={700}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Filters
            </Text>
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

          <Group>
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
                  w={180}
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
                  w={150}
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
      </form>
    </Paper>
  );
}
