/**
 * _app.tsx
 * Next.js app wrapper
 */

import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@/styles/live-api.css';
import '@/styles/app.scss';
import '@/components/audio-pulse/audio-pulse.scss';
import '@/components/control-tray/control-tray.scss';
import '@/components/logger/logger.scss';
import '@/components/settings-dialog/settings-dialog.scss';
import '@/components/side-panel/react-select.scss';
import '@/components/side-panel/side-panel.scss';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
