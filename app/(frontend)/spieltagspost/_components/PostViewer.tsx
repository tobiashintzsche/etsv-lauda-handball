"use client";

import { useEffect, useRef, useState } from "react";

import { POST_SIZE } from "@/lib/matchday-posts/design";

/**
 * Scales the 1080px canvas down to whatever width the browser has.
 *
 * The post must keep its native pixel size — every value in it is absolute —
 * so it is rendered at 1080 × 1350 and shrunk with a transform. The wrapper
 * takes over the scaled height, otherwise the page would keep 1350px of empty
 * space below the post. Never scales up: 100 % is the reference view.
 */
export function PostViewer({ children }: { children: React.ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const update = () => setScale(Math.min(1, frame.clientWidth / POST_SIZE.width));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} style={{ width: "100%", height: POST_SIZE.height * scale }}>
      <div
        data-post-scale={scale}
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
