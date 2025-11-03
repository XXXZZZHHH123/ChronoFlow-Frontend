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
import OrganiserDashboardPage from "@/pages/organiser-dashboard";
import MemberDashboardPage from "@/pages/member-dashboard";
import SpecificEventAttendeesPage from "@/pages/event-attendees";
import SpecificCheckinAttendeesPage from "@/pages/checkin-attendees";
import StaffScanPage from "@/pages/checkin-attendees/staff-scan";
import AttendeeScanPage from "@/pages/checkin-attendees/attendee-scan";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/event/attendee/scan",
    element: <AttendeeScanPage />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <RootPage /> },
          { path: "member-dashboard", element: <MemberDashboardPage /> },
          { path: "organiser-dashboard", element: <OrganiserDashboardPage /> },
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
          {
            path: "event/:id/attendees",
            element: <SpecificEventAttendeesPage />,
          },
          {
            path: "event/:id/checkin",
            element: <SpecificCheckinAttendeesPage />,
          },
          // Staff扫码页面（在AppLayout内，有导航栏）
          {
            path: "event-attendees/staff-scan",
            element: <StaffScanPage />,
          },
        ],
      },
    ],
  },

  { path: "*", element: <ErrorFallback /> },
]);

export default router;
