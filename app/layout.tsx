import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";

import "./globals.css";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { siteTitle, slogan } from "@/lib/constants";
import { DarkmodeToggle } from "@/components/DarkmodeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: siteTitle,
  description: slogan,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-mono bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-dvh flex flex-col px-3 lg:px-10 py-4 lg:py-10">
            <header className="flex justify-between">
              <h1 className="flex items-center justify-center gap-2 font-semibold text-center text-2xl bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-200 from-neutral-950 to-neutral-800 bg-clip-text text-transparent select-none">
                <Logo size={32} />
                <span className="bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-700/90 from-neutral-950 to-neutral-800 bg-clip-text">
                  {siteTitle}
                </span>
              </h1>
              <nav className="flex items-center gap-2">
                <DarkmodeToggle />
              </nav>
            </header>

            <main className="grow flex flex-col lg:flex-grow h-full gap-6 py-4 lg:py-10">
              {children}
            </main>

            <footer className="lg:flex flex-row justify-between text-center text-sm dark:text-neutral-400 text-neutral-600 select-none">
              <p>
                Built with
                <Button variant="link" className="underline">
                  <Link href="https://sdk.vercel.ai" target="_blank">
                    Vercel AI SDK
                  </Link>
                </Button>
                &
                <Button variant="link" className="underline">
                  <Link href="https://openai.com/" target="_blank">
                    OpenAI gpt-4o-mini
                  </Link>
                </Button>
                &
                <Button variant="link" className="underline">
                  <Link
                    href="https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell"
                    target="_blank"
                  >
                    Flux Schnell
                  </Link>
                </Button>
              </p>
              <p>
                <a href="https://github.com/xiaoluoboding/img2txt2img">
                  GitHub
                </a>{" "}
                / <a href="https://x.com/robert_shaw_x">Twitter</a> /{" "}
                <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fxiaoluoboding%2Fimg2txt2voice&env=OPENAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&demo-title=img2txt2img&demo-description=Image%20to%20text%20to%20audio%2C%20accurate%2C%20fast.&demo-url=https%3A%2F%2Fimg2txt2img.vercel.app%2F&demo-image=https%3A%2F%2Fimg2txt2img.vercel.app%2Fopengraph-image.png&skippable-integrations=1">
                  Deploy
                </a>
              </p>
            </footer>
          </div>

          <Toaster richColors theme="system" position="top-center" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
