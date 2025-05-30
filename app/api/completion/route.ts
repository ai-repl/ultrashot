import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { headers } from "next/headers";

import { decodeBase64Image } from "@/lib/image";
import { ratelimit } from "@/lib/redis";
import { isSupportedImageType } from "@/lib";
export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, openaiApiKey, openaiModel } = await req.json();

  if (
    process.env.NODE_ENV === "production" &&
    ratelimit &&
    openaiApiKey === ""
  ) {
    const identifier = await getRequestIdentifier();
    const rl = await ratelimit.limit(identifier);

    if (!rl.success) {
      return new Response(
        "No requests left. Please add your own API key or try again in 24h.",
        { status: 429 }
      );
    }
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    return new Response(
      "Missing OPENAI_API_KEY – make sure to add it to your .env file.",
      {
        status: 400,
      }
    );
  }

  // roughly 4.5MB in base64
  if (prompt.length > 6_464_471) {
    return new Response("Image too large, maximum file size is 4.5MB.", {
      status: 400,
    });
  }

  const { type, data } = decodeBase64Image(prompt);

  if (!type || !data)
    return new Response("Invalid image data", { status: 400 });

  if (!isSupportedImageType(type)) {
    return new Response(
      "Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported.",
      { status: 400 }
    );
  }

  const openai = createOpenAI({
    apiKey: openaiApiKey !== "" ? openaiApiKey : process.env.OPENAI_API_KEY,
  });

  const response = await streamText({
    model: openai(openaiModel ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Begin each of the following with a triangle symbol (▲ U+25B2):
            	Tell me What's in this image?, please analyze the image and provide a detailed description, Do not describe or extract text in the description;
              and please try to analyze which style or filter was used in the image, e.g. cinematography, portraiture, vintage film, and so on.
            	Second, the text extracted from the image, with newlines where applicable. Un-obstruct text if it is covered by something, to make it readable.
            	If there is no text in the image, only respond with the description. Do not include any other information.
            	Example: ▲ Lines of code in a text editor.▲ const x = 5; const y = 10; const z = x + y; console.log(z);
            `,
          },
          {
            type: "image",
            image: new URL(prompt),
          },
        ],
      },
    ],
  });
  return response.toDataStreamResponse();
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
