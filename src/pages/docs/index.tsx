import { Helmet } from 'react-helmet-async';
import { Title } from '@mantine/core';
import { Page } from '@/components/page';

export default function DocsPage() {
  const docsMeta = (
    <>
      <meta name="description" content="VeroTime documentation. Learn how to set up, customize, and share timers. Complete guide to timer features, configurations, and troubleshooting." />
      <meta name="keywords" content="timer documentation, timer setup, timer guide, timer features, how to use timer" />
    </>
  );

  return (
    <>
      <Helmet>
        <title>Timer Documentation & Setup Guide | VeroTime</title>
        {docsMeta}
      </Helmet>
      <Page title="Documentation - Timer Setup & Features" meta={docsMeta}>
        <Title>Quickstart</Title>
      </Page>
    </>
  );
}
