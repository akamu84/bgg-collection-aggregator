import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 50%, #1a1a2e 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
});
