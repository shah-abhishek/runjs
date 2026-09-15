import { useEffect, useRef } from "react";
import type { SandboxMessage } from "../lib/messageTypes";

interface Props {
  srcDoc: string;
  onMessage: (msg: SandboxMessage) => void;
  runId: number;
  sandboxAttribute: string;
}

export function PreviewFrame({ srcDoc, onMessage, runId, sandboxAttribute }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handler(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      onMessage(event.data as SandboxMessage);
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onMessage]);

  return (
    <iframe
      key={runId}
      ref={iframeRef}
      title="Code preview"
      srcDoc={srcDoc}
      sandbox={sandboxAttribute}
      className="w-full h-full border-0 bg-white"
    />
  );
}