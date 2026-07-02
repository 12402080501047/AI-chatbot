export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  const responseText = `This is a simulated response to: "${lastMessage.content}".\n\nHere is some markdown code:\n\`\`\`javascript\nfunction helloWorld() {\n  console.log("Hello, World!");\n}\n\`\`\`\n\nSince no AI provider is configured in \`.env\`, you are seeing this fallback response! You can integrate OpenAI or Gemini easily using the Vercel AI SDK.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = responseText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        // Using the 0: format which is standard for Vercel AI SDK text parts
        controller.enqueue(encoder.encode(`0:"${words[i]} "\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-vercel-ai-data-stream': 'v1',
    },
  });
}
