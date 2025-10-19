/**
 * DOCS ROUTES - DISABLED
 * MDX support was removed to reduce bundle size
 * To re-enable, install @mdx-js/rollup and @mdx-js/react, update vite.config.mjs
 */

import { RouteObject } from 'react-router-dom';
import { LazyPage } from '@/routes/lazy-page';
import paths from './paths';

// const posts = import.meta.glob('/src/pages/docs/**/*.mdx', { eager: true }); // DISABLED
const posts: Record<string, any> = {}; // Empty - MDX disabled

const postRoutes = Object.keys(posts).map((path) => {
  const slug = path.split('/src/pages/docs/').at(-1)?.replace('.mdx', '') || '';
  return {
    path: paths.page(slug),
    element: LazyPage(() => posts[path] as any),
  };
});

export default [
  {
    path: paths.root,
    element: LazyPage(() => import('@/layouts/docs')),
    children: [
      {
        index: true,
        path: paths.root,
        element: LazyPage(() => import('@/pages/docs/index')),
      },
      ...postRoutes,
    ],
  },
] satisfies RouteObject[];
