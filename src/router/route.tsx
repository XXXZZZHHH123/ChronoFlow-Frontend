import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/Layout";
import ErrorFallback from "@/components/error";
import RequireAuth from "@/components/auth/require-auth";
import RootPage from "@/pages/Root";
import LoginPage from "@/pages/login";
import MembersPage from "@/pages/members";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
   { path: "/members", element: <MembersPage /> },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <RootPage /> },
          // { path: "members", element: <MembersPage /> },
        ],
      },
    ],
  },

  { path: "*", element: <ErrorFallback /> },
]);

export default router;
