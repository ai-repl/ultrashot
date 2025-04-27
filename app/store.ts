import { atomWithStorage } from "jotai/utils";

interface ApiConfiguration {
  openaiKey: string;
  openaiModel: string;
  replicateKey: string;
  fluxModel: string;
}

export const apiConfigAtom = atomWithStorage<ApiConfiguration>("api-config", {
  openaiKey: "",
  openaiModel: "gpt-4.1-mini",
  replicateKey: "",
  fluxModel: "",
});
