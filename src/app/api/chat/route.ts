import { auth, currentUser } from '@clerk/nextjs/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";

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
    
    const url = new URL(req.url);
    const chatId = url.searchParams.get("chatId");
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response("GEMINI_API_KEY is not set", { status: 500 });
    }

    if (!chatId) {
      return new Response("chatId is required", { status: 400 });
    }

    const user = await currentUser();
    if (!user) {
      return new Response("User not found", { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress ?? "unknown";
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
        image: user.imageUrl,
      },
      create: {
        clerkId: userId,
        email,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
        image: user.imageUrl,
      }
    });

    const conversation = await prisma.conversation.upsert({
      where: { id: chatId },
      update: {},
      create: {
        id: chatId,
        userId: dbUser.id,
        title: "New Conversation",
      }
    });

    const lastMessage = messages[messages.length - 1];
    const userMessageContent = lastMessage.parts 
        ? lastMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') 
        : lastMessage.content;

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: userMessageContent || '',
      }
    });

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: "You are Nova AI, a helpful, friendly, and expert assistant. Format your answers in markdown. Be concise when appropriate.",
      async onFinish({ text }) {
        try {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: 'ASSISTANT',
              content: text,
            }
          });
        } catch (e) {
          console.error("Failed to save assistant message", e);
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return new Response(error.message || "An error occurred during chat processing", { status: 500 });
  }
}
