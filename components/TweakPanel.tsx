"use client";

import React, { useEffect, useRef } from "react";
import { Pane } from "tweakpane";
import { useAtom } from "jotai";
import { apiConfigAtom } from "@/app/store";

const TweakPanel = () => {
  const [apiConfig, setApiConfig] = useAtom(apiConfigAtom);

  const paneRef = useRef<Pane | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a new Tweakpane instance
    const pane = new Pane({
      container: containerRef.current || undefined,
    });

    // Add controls
    pane.addBinding(apiConfig, "openaiKey", {
      label: "OpenAI API Key",
    });
    pane.addBinding(apiConfig, "openaiModel", {
      label: "OpenAI Model",
      defaultValue: "gpt-4.1-mini",
      options: {
        "gpt-4.1": "gpt-4.1",
        "gpt-4.1-mini": "gpt-4.1-mini",
      },
    });
    pane.addBinding(apiConfig, "replicateKey", {
      label: "Replicate API Key",
    });

    // Handle changes
    pane.on("change", (ev: any) => {
      setApiConfig((prev) => ({
        ...prev,
        [ev.target.key]: ev.value,
      }));
    });

    // Store pane reference
    paneRef.current = pane;

    // Cleanup
    return () => pane.dispose();
  }, []);

  return (
    <div className="">
      <div ref={containerRef} />
    </div>
  );
};

export default TweakPanel;
