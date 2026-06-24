import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/builder")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/builder") {
      throw redirect({ to: "/builder/$botId", params: { botId: "new" } });
    }
  },
  component: BuilderLayout,
});

function BuilderLayout() {
  return <Outlet />;
}
