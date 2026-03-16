'use client';

import { memo } from 'react';
import cn from 'classnames';

interface LiveCaptionsProps {
  text: string;
  typing: boolean;
}

function LiveCaptionsComponent({ text, typing }: LiveCaptionsProps) {
  if (!text && !typing) return null;

  return (
    <div className={cn('live-captions', { 'live-captions--typing': typing })}>
      <div className="live-captions__content">
        {text}
        {typing && <span className="live-captions__cursor" />}
      </div>
    </div>
  );
}

export const LiveCaptions = memo(LiveCaptionsComponent);
