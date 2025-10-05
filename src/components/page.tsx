// src/components/page.tsx
import { forwardRef, ReactNode } from 'react'; // Remove useEffect
import { Helmet } from 'react-helmet-async';
import { Box, BoxProps } from '@mantine/core';
// Remove this import:
// import { nprogress } from '@mantine/nprogress';
import { app } from '@/config';

interface PageProps extends BoxProps {
  children: ReactNode;
  meta?: ReactNode;
  title: string;
}

export const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ children, title = '', meta, ...other }, ref) => {
    // Remove this entire useEffect block:
    // useEffect(() => {
    //   nprogress.complete();
    //   return () => nprogress.start();
    // }, []);

    return (
      <>
        <Helmet>
          <title>{`${title} | ${app.name}`}</title>
          {meta}
        </Helmet>

        <Box ref={ref} {...other}>
          {children}
        </Box>
      </>
    );
  }
);