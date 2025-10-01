import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/Layout";
import ErrorFallback from "@/components/error";
import RequireAuth from "@/components/auth/require-auth";
import RootPage from "@/pages/Root";
import LoginPage from "@/pages/login";
import OrganisationPage from "@/pages/organisation";
import OrgEventsPage from "@/pages/events";
import SpecificEventDashboardPage from "@/pages/event-dashboard";
import SpecificEventGroupsPage from "@/pages/event-groups";
import SpecificEventTasksPage from "@/pages/event-tasks";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <RootPage /> },
          { path: "organisation", element: <OrganisationPage /> },
          { path: "events", element: <OrgEventsPage /> },
          {
            path: "event/:id/dashboard",
            element: <SpecificEventDashboardPage />,
          },
          {
            path: "event/:id/groups",
            element: <SpecificEventGroupsPage />,
          },
          {
            path: "event/:id/tasks",
            element: <SpecificEventTasksPage />,
          },
        ],
      },
    ],
  },

  { path: "*", element: <ErrorFallback /> },
]);

export default router;
