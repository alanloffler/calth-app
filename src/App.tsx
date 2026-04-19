import { createBrowserRouter, RouterProvider } from "react-router";
import { lazy, Suspense } from "react";

import { AdminLogin } from "@login/AdminLogin";
import { AppInitializer } from "@auth/components/AppInitializer";
import { GuestRoute } from "@auth/components/GuestRoute";
import { PageLoader } from "@components/PageLoader";
import { ProtectedLayout } from "@auth/components/ProtectedLayout";
import { ProtectedRoute } from "@auth/components/ProtectedRoute";
import { Toaster } from "@components/ui/sonner";
import { UserLogin } from "@login/UserLogin";
import { useTheme } from "@core/providers/theme-provider";

const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));

const Business = lazy(() => import("./features/business/Business"));
const BusinessCreate = lazy(() => import("./features/business/views/CreateBusiness"));
const Calendar = lazy(() => import("./features/calendar/Calendar"));

const Admin = lazy(() => import("./features/admin/Admin"));
const EditAdmin = lazy(() => import("./features/admin/views/EditAdmin"));

const Events = lazy(() => import("./features/event/Events"));

const Roles = lazy(() => import("./features/roles/Roles"));
const CreateRole = lazy(() => import("./features/roles/views/CreateRole"));
const EditRole = lazy(() => import("./features/roles/views/EditRole"));
const ViewRole = lazy(() => import("./features/roles/views/ViewRole"));

const Permissions = lazy(() => import("./features/permissions/Permissions"));
const CreatePermission = lazy(() => import("./features/permissions/views/CreatePermission"));
const EditPermission = lazy(() => import("./features/permissions/views/EditPermission"));
const ViewPermission = lazy(() => import("./features/permissions/views/ViewPermission"));

const AppSettings = lazy(() => import("./features/settings/AppSettings"));
const BusinessSettings = lazy(() => import("./features/settings/BusinessSettings"));
const DashboardSettings = lazy(() => import("./features/settings/DashboardSettings"));
const NotificationsSettings = lazy(() => import("./features/settings/NotificationsSettings"));

const Users = lazy(() => import("./features/users/Users"));
const CreateUser = lazy(() => import("./features/users/views/CreateUser"));
const EditUser = lazy(() => import("./features/users/views/EditUser"));
const ViewUser = lazy(() => import("./features/users/views/ViewUser"));

const Account = lazy(() => import("./features/account/Account"));

const NotFound = lazy(() => import("./core/components/NotFound"));

const router = createBrowserRouter([
  {
    path: "/business/create",
    element: (
      <GuestRoute>
        <BusinessCreate />
      </GuestRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <AdminLogin />
      </GuestRoute>
    ),
  },
  {
    path: "/",
    element: (
      <GuestRoute>
        <UserLogin />
      </GuestRoute>
    ),
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "business",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <Business />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "calendar",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <Calendar />
          </Suspense>
        ),
      },
      {
        path: "events",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <Events />
          </Suspense>
        ),
      },
      {
        path: "admin",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="admin-view">
              <Admin />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "admin/edit/:id",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["admin-view", "admin-update"]}>
              <EditAdmin />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "roles",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="roles-view">
              <Roles />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "roles/create",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["roles-view", "roles-create"]}>
              <CreateRole />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "roles/edit/:id",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["roles-view", "roles-update"]}>
              <EditRole />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "roles/view/:id",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="roles-view">
              <ViewRole />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "permissions",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="permissions-view">
              <Permissions />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "permissions/create",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["permissions-view", "permissions-create"]}>
              <CreatePermission />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "permissions/edit/:id",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["permissions-view", "permissions-update"]}>
              <EditPermission />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "permissions/view/:id",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="permissions-view">
              <ViewPermission />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "settings/business",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            {/* TODO: set permissions */}
            {/* <ProtectedRoute requiredPermission=""> */}
            <BusinessSettings />
            {/* </ProtectedRoute> */}
          </Suspense>
        ),
      },
      {
        path: "settings/app",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="settings-view">
              <AppSettings />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "settings/dashboard",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="settings-view">
              <DashboardSettings />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "settings/notifications",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission="settings-view">
              <NotificationsSettings />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "account",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <Account />
          </Suspense>
        ),
      },
      {
        path: "users/create",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["admin-view", "patient-view", "professional-view"]} mode="some">
              <CreateUser />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "users/role/:role",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["admin-view", "patient-view", "professional-view"]} mode="some">
              <Users />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "users/edit/:id",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["admin-update", "patient-update", "professional-update"]} mode="some">
              <EditUser />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "users/view/:id",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <ProtectedRoute requiredPermission={["admin-view", "patient-view", "professional-view"]} mode="some">
              <ViewUser />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <Suspense
            fallback={
              <div className="relative h-full w-full">
                <PageLoader className="-mt-8" />
              </div>
            }
          >
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

export default function App() {
  const { theme } = useTheme();

  return (
    <AppInitializer>
      <RouterProvider router={router} />
      <Toaster position="bottom-center" richColors theme={theme} />
    </AppInitializer>
  );
}
