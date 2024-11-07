"use client";

import { SparklesIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import TweakPanel from "./TweakPanel";

const ApiConfigMenu = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size={"icon"}>
          <SparklesIcon className="h-4 w-4 mr-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 m-0 space-y-3" align="end">
        <div className="text-sm">[Optional] Add your own API Keys</div>
        <TweakPanel />
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="link"
              size="sm"
              className="text-primary"
              onClick={() =>
                window.open("https://platform.openai.com/api-keys", "_blank")
              }
            >
              Get OpenAI API Key
            </Button>
            <Button
              variant="link"
              size="sm"
              className="text-primary"
              onClick={() =>
                window.open(
                  "https://replicate.com/account/api-tokens",
                  "_blank"
                )
              }
            >
              Get Replicate API Key
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ApiConfigMenu;
