import { auth } from '@clerk/nextjs/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const runtime = 'edge';
export const maxDuration = 30;

let ratelimit: Ratelimit | undefined;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
  });
} else {
  console.warn("Upstash Redis not configured. Rate limiting is disabled.");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (ratelimit) {
      const { success, limit, reset, remaining } = await ratelimit.limit(userId);
      if (!success) {
        return new Response("Too many requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    }

    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response("GEMINI_API_KEY is not set", { status: 500 });
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: "You are Nova AI, a helpful, friendly, and expert assistant. Format your answers in markdown. Be concise when appropriate.",
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return new Response(error.message || "An error occurred during chat processing", { status: 500 });
  }
}
