// src/routes/paths.ts
import docs from '@/pages/docs/paths';

export const paths = {
  docs,
  viewer: {
    detail: (roomId: number | string, token: string) => `/viewer/${roomId}/${token}`,
    passwordProtected: (roomId: number | string, token: string) =>
      `/viewer/${roomId}/${token}/pwd`,
  },
  auth: {
    root: '/auth',
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    otp: '/auth/otp',
    terms: '/auth/terms',
    privacy: '/auth/privacy',
  },

  dashboard: {
    root: '/dashboard',
    home: '/dashboard/home',
    rooms: '/dashboard/rooms',
    room: (roomId: number | string) => `/dashboard/room/${roomId}`,
    management: {
      root: '/dashboard/management',
      customers: {
        root: '/dashboard/management/customers',
        list: '/dashboard/management/customers/list',
        view: (customerId: string) => `/dashboard/management/customers/${customerId}`,
      },
    },
    apps: {
      root: '/dashboard/apps',
      kanban: '/dashboard/apps/kanban',
    },
    widgets: {
      root: '/dashboard/widgets',
      metrics: '/dashboard/widgets/metrics',
      charts: '/dashboard/widgets/charts',
      tables: '/dashboard/widgets/tables',
    },
  },
};