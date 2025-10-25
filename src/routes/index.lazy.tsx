import { createLazyFileRoute } from "@tanstack/react-router";
import CollectionAggregator from "../components/CollectionAggregator";

export const Route = createLazyFileRoute("/")({
  component: CollectionAggregator,
});
