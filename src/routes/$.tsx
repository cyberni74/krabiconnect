import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old marketplace links (/item/…, /search, /login, …) lead to the app, not to a 404. */
export const Route = createFileRoute("/$")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
