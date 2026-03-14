/**
 * index.tsx
 * Main home page
 */

import Head from 'next/head';
import CoachSession from '@/components/CoachSession';

export default function Home() {
  return (
    <>
      <Head>
        <title>Live Accent Coach</title>
        <meta name="description" content="Real-time AI pronunciation coaching with hand gestures" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <CoachSession />
      </main>
    </>
  );
}
