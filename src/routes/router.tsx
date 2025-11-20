// src/routes/router.tsx
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthGuard } from '@/guards/auth-guard';
import { GuestGuard } from '@/guards/guest-guard';
import { AuthLayout } from '@/layouts/auth';
import { DashboardLayout } from '@/layouts/dashboard';
import docsRoutes from '@/pages/docs/routes';
import { LazyPage } from './lazy-page';
import { paths } from './paths';

// Component that redirects /dashboard/home to /dashboard/rooms if no query parameters
function HomeRedirectHandler() {
  const location = useLocation();

  // If there are no search parameters, redirect to rooms
  if (!location.search) {
    return <Navigate to={paths.dashboard.rooms} replace />;
  }

  // Otherwise, render the home page
  return LazyPage(() => import('@/pages/dashboard/home'));
}

// Landing page without loading screen
const LandingPage = lazy(() => import('@/pages/landing'));

// Fast lazy page without loading screen - for timer pages and other fast-loading routes
const FastLazyPage = (callback: () => Promise<{ default: any }>) => {
  const Component = lazy(callback);
  return <Suspense fallback={null}><Component /></Suspense>;
};

const router = createBrowserRouter([
  // Controller routes - no authentication guards needed
  {
    path: '/viewer/:roomId/:token',
    element: LazyPage(() => import('@/pages/viewer')),
  },
  {
    path: '/viewer/:roomId/:token/pwd',
    element: LazyPage(() => import('@/pages/viewer')),
  },
  {
    path: '/controller/:roomId/:token',
    element: LazyPage(() => import('@/pages/controller')),
  },
  {
    path: '/controller/:roomId/:token/pwd',
    element: LazyPage(() => import('@/pages/controller')),
  },
  // Timer routes - public, no authentication required - optimized for speed
  {
    path: '/timers',
    element: LazyPage(() => import('@/pages/timers-hub')),
  },
  {
    path: '/timers/:slug',
    element: FastLazyPage(() => import('@/pages/timers')),
  },
  ...docsRoutes,

  {
    path: '/checkout/success',
    element: LazyPage(() => import('@/pages/checkout/success')),
  },
  {
    path: '/checkout/cancel',
    element: LazyPage(() => import('@/pages/checkout/cancel')),
  },
  {
    path: '/',
    element: <Suspense><LandingPage /></Suspense>,
  },
  {
    path: paths.auth.root,
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      {
        index: true,
        path: paths.auth.root,
        element: <Navigate to={paths.auth.login} replace />,
      },
      {
        path: paths.auth.login,
        element: LazyPage(() => import('@/pages/auth/login')),
      },
      {
        path: paths.auth.register,
        element: LazyPage(() => import('@/pages/auth/register')),
      },
      {
        path: paths.auth.forgotPassword,
        element: LazyPage(() => import('@/pages/auth/forgot-password')),
      },
      {
        path: paths.auth.otp,
        element: LazyPage(() => import('@/pages/auth/otp')),
      },
    ],
  },
  {
    path: paths.auth.terms,
    element: LazyPage(() => import('@/pages/auth/terms')),
  },
  {
    path: paths.dashboard.root,
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
    {
  index: true,
  path: paths.dashboard.root,
  element: <Navigate to={paths.dashboard.rooms} replace />,
},
      {
        path: paths.dashboard.rooms,
        element: LazyPage(() => import('@/pages/dashboard/rooms')),
      },
      {
        path: '/dashboard/room/:roomId',
        element: LazyPage(() => import('@/pages/dashboard/room')),
      },
      {
        path: paths.dashboard.home,
        element: <HomeRedirectHandler />,
      },
      /* ---------------------------------- APPS ---------------------------------- */
      /* DISABLED: Demo apps removed to reduce bundle size
      {
        path: paths.dashboard.apps.root,
        children: [
          {
            index: true,
            path: paths.dashboard.apps.root,
            element: <Navigate to={paths.dashboard.apps.kanban} replace />,
          },
          {
            path: paths.dashboard.apps.kanban,
            element: LazyPage(() => import('@/pages/dashboard/apps/kanban')),
          },
        ],
      },
      */
      /* ------------------------------- MANAGEMENT ------------------------------- */
      /* DISABLED: Demo management pages removed to reduce bundle size
      {
        path: paths.dashboard.management.root,
        children: [
          {
            index: true,
            path: paths.dashboard.management.root,
            element: <Navigate to={paths.dashboard.management.customers.root} replace />,
          },
          {
            path: paths.dashboard.management.customers.root,
            children: [
              {
                index: true,
                path: paths.dashboard.management.customers.root,
                element: <Navigate to={paths.dashboard.management.customers.list} replace />,
              },
              {
                path: paths.dashboard.management.customers.list,
                element: LazyPage(() => import('@/pages/dashboard/management/customers/list')),
              },
            ],
          },
        ],
      },
      */
      /* --------------------------------- WIDGETS -------------------------------- */
      /* DISABLED: Demo widget pages removed to reduce bundle size
      {
        path: paths.dashboard.widgets.root,
        children: [
          {
            index: true,
            path: paths.dashboard.widgets.root,
            element: <Navigate to={paths.dashboard.widgets.charts} replace />,
          },
          {
            path: paths.dashboard.widgets.metrics,
            element: LazyPage(() => import('@/pages/dashboard/widgets/metrics')),
          },
          {
            path: paths.dashboard.widgets.charts,
            element: LazyPage(() => import('@/pages/dashboard/widgets/charts')),
          },
          {
            path: paths.dashboard.widgets.tables,
            element: LazyPage(() => import('@/pages/dashboard/widgets/tables')),
          },
        ],
      },
      */
    ],
  },
  // Catch-all 404 route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
