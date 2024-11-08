# UltraShot

Image to text to Image, reimagine, ultra-fast, high-quality. Built with the [Vercel AI SDK](https://sdk.vercel.ai), [OpenAI](https://openai.com/), and [Next.js](https://nextjs.org).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fai-repl%2Fultrashot&env=OPENAI_API_KEY,OPENAI_MODEL,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,REPLICATE_API_KEY&demo-title=UltraShot&demo-description=Image%20to%20text%20to%20Image%2C%20reimagine%2C%20ultra-fast%2C%20high-quality.&demo-url=https%3A%2F%2Fultrashot.vercel.app)

## Developing

- Clone the repository
- Copy a `.env.local` file from `.env.example`
  - Get the `OPENAI_API_KEY` from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys).
  - Get the `REPLICATE_API_KEY` from [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).
- Run `pnpm install` to install dependencies.
- Run `pnpm dev` to start the development server.
