import { NextResponse, type NextRequest } from "next/server";
import Replicate from "replicate";
import { Ratelimit } from "@upstash/ratelimit";

import { redis } from "@/lib/redis";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
  useFileOutput: false,
});

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1440 m"),
      analytics: true,
    })
  : false;

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && ratelimit) {
    const ip = req.headers.get("x-real-ip") ?? "local";
    const rl = await ratelimit.limit(ip);

    if (!rl.success) {
      return new Response("Rate limit exceeded", { status: 429 });
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
  // Extract the `prompt` from the body of the request
  const { prompt, aspectRatio } = await req.json();

  const input = {
    prompt,
    go_fast: true,
    num_outputs: 1,
    aspect_ratio: aspectRatio,
    output_format: "webp",
    output_quality: 80,
  };

  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input,
  });

  return NextResponse.json({
    data: output,
  });
}
