import { createFileRoute, redirect } from "@tanstack/react-router";

/** Chapter 3 is part of the one game now; old links lead there. */
export const Route = createFileRoute("/insel")({
  beforeLoad: () => {
    throw redirect({ to: "/abenteuer", replace: true });
  },
});
