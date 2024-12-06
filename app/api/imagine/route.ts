import { NextResponse, type NextRequest } from "next/server";
import Replicate from "replicate";
import { headers } from "next/headers";

import { ratelimit } from "@/lib/redis";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Extract the `prompt` from the body of the request
  const { prompt, aspectRatio, replicateKey } = await req.json();

  if (
    process.env.NODE_ENV === "production" &&
    ratelimit &&
    replicateKey === ""
  ) {
    const identifier = await getRequestIdentifier();
    const rl = await ratelimit.limit(identifier);

    console.log(identifier);
    console.log(process.env.NODE_ENV === "production");
    console.log(replicateKey === "");
    console.log(rl.success);

    if (!rl.success) {
      return new Response(
        "No requests left. Please add your own API key or try again in 24h.",
        { status: 429 }
      );
    }
  }

  if (!process.env.REPLICATE_API_KEY || process.env.REPLICATE_API_KEY === "") {
    return new Response(
      "Missing REPLICATE_API_KEY – make sure to add it to your .env file.",
      {
        status: 400,
      }
    );
  }

  const replicate = new Replicate({
    auth: replicateKey !== "" ? replicateKey : process.env.REPLICATE_API_KEY,
    useFileOutput: false,
  });

  const input = {
    prompt,
    go_fast: true,
    num_outputs: 1,
    aspect_ratio: aspectRatio,
    output_format: "jpg",
    output_quality: 92,
  };

  // const output = await replicate.run("black-forest-labs/flux-schnell", {
  const output = await replicate.run("black-forest-labs/flux-1.1-pro-ultra", {
    input,
  });

  return NextResponse.json({
    data: output,
  });
}

async function getRequestIdentifier() {
  // Get IP address from headers
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");
  const ipAddress = forwardedFor
    ? forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS
    : headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;

  const request = await fetch(
    `https://ipinfo.io/json?token=${process.env.IPINFO_TOKEN}`
  );
  const jsonResponse = await request.json();

  return `${jsonResponse.loc}:${jsonResponse.country}`;
}
