import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    try {
      const role = localStorage.getItem("auth_role");
      if (!role) {
        throw redirect({ to: "/" });
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'isRedirect' in e) throw e;
    }
  },
  component: AppLayout,
});
