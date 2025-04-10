/* eslint-disable @next/next/no-img-element */
"use client";

import { track } from "@vercel/analytics";
import { useCompletion } from "ai/react";
import clsx from "clsx";
import { CopyIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { copyBlobToClipboard } from "copy-image-clipboard";
import { useAtom } from "jotai";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copy, isSupportedImageType, toBase64 } from "@/lib";
import { getImageAspectRatio } from "@/lib/image";
import getRetinaImage from "@/lib/getRetinaImage";
import { apiConfigAtom } from "./store";

let imgAspectRatio = "16:9";

export default function Home() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [blobURL, setBlobURL] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isGeneratingImage, setGeneratingImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageEl = useRef<HTMLImageElement>(null);
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const [detailDesc, setDetailDesc] = useState("");
  const [isCopying, setIsCopying] = useState(false);
  const [apiConfig] = useAtom(apiConfigAtom);

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/completion",
    body: {
      openaiApiKey: apiConfig.openaiKey,
      openaiModel: apiConfig.openaiModel,
    },
    onError: (e) => {
      toast.error(e.message);
      setBlobURL(null);
    },
    onFinish: (prompt: string, completion: string) => {
      const [_, description, text] = completion.split("▲");
      handleGenerateImage(description);
      setIsFinished(true);
    },
  });

  const handleGenerateImage = useCallback(
    async (prompt: string) => {
      setGeneratingImage(true);
      setImageURL("");
      try {
        const response = await fetch("/api/imagine", {
          method: "POST",
          body: JSON.stringify({
            prompt,
            aspectRatio: imgAspectRatio,
            replicateKey: apiConfig.replicateKey ?? null,
          }),
        });
        const data = await response.json();
        setImageURL(data.data || "");
      } catch (error) {
        toast.error((error as Error).message);
      }
      setGeneratingImage(false);
    },
    [apiConfig]
  );

  async function submit(file?: File | Blob) {
    if (!file) return;

    if (!isSupportedImageType(file.type)) {
      return toast.error(
        "Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported."
      );
    }

    if (file.size > 4.5 * 1024 * 1024) {
      return toast.error("Image too large, maximum file size is 4.5MB.");
    }

    const base64 = await toBase64(file);

    // roughly 4.5MB in base64
    if (base64.length > 6_464_471) {
      return toast.error("Image too large, maximum file size is 4.5MB.");
    }

    const res = await getImageAspectRatio(file);
    imgAspectRatio = res;
    setBlobURL(URL.createObjectURL(file));
    setImageURL("");
    setDetailDesc("");
    setGeneratingImage(false);
    setIsFinished(false);
    complete(base64);
  }

  function handleDragLeave() {
    setIsDraggingOver(false);
  }

  function handleDragOver(e: DragEvent) {
    setIsDraggingOver(true);
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }

  async function handleDrop(e: DragEvent) {
    track("Drop");

    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer?.files?.[0];
    submit(file);
  }

  async function handlePaste(e: ClipboardEvent) {
    track("Paste");
    const file = e.clipboardData?.files?.[0];
    submit(file);
  }

  async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    track("Upload");
    const file = e.target.files?.[0];
    submit(file);
  }

  const handleValueChange = async (val: string) => {
    setDetailDesc(val);
  };

  const handleRegenerate = useCallback(async () => {
    track("Regenerate");
    handleGenerateImage(detailDesc);
  }, [detailDesc]);

  const handleCopy = useCallback(async (base64: string) => {
    track("Copy Image");
    try {
      if (!imageEl.current) return;
      setIsCopying(true);
      const { imageBlob } = await getRetinaImage(imageEl.current);
      if (!imageBlob) return;
      copyBlobToClipboard(imageBlob);
      setIsCopying(false);
      toast.success("Image copied to clipboard");
    } catch (error) {
      console.error("Error copying image to clipboard:", error);
      toast.error("Failed to copy image to clipboard");
    }
  }, []);

  const handleDownload = useCallback(async (url: string) => {
    track("Download");
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "generated-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  }, []);

  useEffect(() => {
    if (completion) {
      const [_, description, text] = completion.split("▲");
      if (description) {
        const trimmedDescription = description.trim();
        setDetailDesc(trimmedDescription);
      }
    }
  }, [completion]);

  useEffect(() => {
    addEventListener("paste", handlePaste);
    addEventListener("drop", handleDrop);
    addEventListener("dragover", handleDragOver);
    addEventListener("dragleave", handleDragLeave);

    return () => {
      removeEventListener("paste", handlePaste);
      removeEventListener("drop", handleDrop);
      removeEventListener("dragover", handleDragOver);
      removeEventListener("dragleave", handleDragLeave);
    };
  });

  return (
    <>
      <div className="grow flex flex-col lg:flex-row gap-8 h-full">
        <section
          className={clsx(
            "rounded-lg border-2 h-[400px] lg:h-auto drop-shadow-sm cursor-pointer border-dashed transition-colors ease-in-out relative group select-none grow pointer-events-none [@media(hover:hover)]:pointer-events-auto",
            "text-neutral-700 dark:text-neutral-300",
            "bg-neutral-100 dark:bg-neutral-900",
            {
              "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700":
                !isDraggingOver,
              "border-blue-300 dark:border-blue-700": isDraggingOver,
            }
          )}
          onClick={() => inputRef.current?.click()}
        >
          {blobURL && (
            <Image
              src={blobURL}
              unoptimized
              fill
              className="object-contain min-h-16"
              alt="Uploaded image"
            />
          )}

          <div
            className={clsx(
              "flex flex-col w-full h-full p-3 items-center justify-center text-center absolute bg-neutral-100/70 dark:bg-neutral-900/70 text-lg",
              {
                "opacity-0 group-hover:opacity-100 transition ease-in-out":
                  completion,
              }
            )}
          >
            {isLoading ? (
              <Loader2Icon className="animate-spin size-12" />
            ) : (
              <>
                <p className="font-bold mb-4">
                  Transform Image into a detailed description
                </p>
                <p className="hidden [@media(hover:hover)]:block">
                  Drop or paste anywhere, or click to upload.
                </p>

                <div className="w-56 space-y-4 [@media(hover:hover)]:hidden pointer-events-auto">
                  <button className="rounded-full w-full py-3 bg-black dark:bg-white text-white dark:text-black">
                    Tap to upload
                  </button>

                  <input
                    type="text"
                    onKeyDown={(e) => e.preventDefault()}
                    placeholder="Hold to paste"
                    onClick={(e) => e.stopPropagation()}
                    className="text-center w-full rounded-full py-3 bg-neutral-200 dark:bg-neutral-800 placeholder-black dark:placeholder-white focus:bg-white dark:focus:bg-black focus:placeholder-neutral-700 dark:focus:placeholder-neutral-300 transition-colors ease-in-out focus:outline-none border-2 focus:border-blue-300 dark:focus:border-blue-700 border-transparent"
                  />
                </div>

                <p className="text-sm mt-3 text-neutral-700 dark:text-neutral-300">
                  (images are not stored)
                </p>
              </>
            )}
          </div>

          <input
            type="file"
            className="hidden"
            ref={inputRef}
            onChange={handleInputChange}
            accept="image/jpeg, image/png, image/gif, image/webp"
          />
        </section>

        <section className="space-y-3 p-3 min-w-sm lg:max-w-sm 2xl:max-w-lg rounded-md bg-white dark:bg-neutral-900 w-full drop-shadow-sm border-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold select-none text-neutral-600 dark:text-neutral-400">
              Image detail description
            </h2>

            {detailDesc && (
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={(e) => {
                  e.preventDefault();
                  copy(detailDesc);
                }}
                aria-label="Copy to clipboard"
              >
                <CopyIcon className="w-5 h-5" />
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <Textarea
              value={detailDesc}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="The image detail description will be displayed here, and you can modify it later."
              rows={12}
              disabled={isLoading || isGeneratingImage || !blobURL}
            />
            {isFinished && !detailDesc && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 select-none">
                No detail description was found in that image.
              </p>
            )}
            <Button
              className="w-full"
              disabled={!detailDesc || isGeneratingImage}
              onClick={handleRegenerate}
            >
              {isGeneratingImage && (
                <Loader2Icon className="animate-spin size-5 mr-2" />
              )}
              {isGeneratingImage ? "Generating" : "Regenerate"}
            </Button>
          </div>
        </section>

        <section
          className={clsx(
            "rounded-lg border-2 h-[400px] lg:h-auto drop-shadow-sm text-neutral-700 dark:text-neutral-300 cursor-pointer border-dashed transition-colors ease-in-out bg-neutral-100 dark:bg-neutral-900 relative group select-none grow pointer-events-none [@media(hover:hover)]:pointer-events-auto",
            "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
          )}
        >
          {!isGeneratingImage && imageURL && (
            <img
              ref={imageEl}
              src={imageURL}
              className="absolute inset-0 w-full h-full text-transparent object-contain min-h-16"
              alt="Generated Image"
            />
          )}

          <div
            className={clsx(
              "flex flex-col w-full h-full p-3 items-center justify-center text-center absolute bg-neutral-100/70 dark:bg-neutral-900/70 text-lg",
              {
                "opacity-0 group-hover:opacity-100 transition ease-in-out":
                  imageURL,
              }
            )}
          >
            {isGeneratingImage ? (
              <Loader2Icon className="animate-spin size-12" />
            ) : imageURL ? (
              <>
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => handleCopy(imageURL)}
                    disabled={isCopying}
                  >
                    {isCopying ? "Copying..." : "Copy Image"}
                  </Button>
                  <Button onClick={() => handleDownload(imageURL)}>
                    Download Image
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="font-bold mb-4">Generated Image in real-time</p>
                <p className="hidden [@media(hover:hover)]:block">
                  Powered by Flux on Replicate
                </p>
                <p className="text-sm mt-3 text-neutral-700 dark:text-neutral-300">
                  (images are not stored)
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
