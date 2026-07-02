"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, RefreshCcw, Square, User, Bot, ArrowUp, Sparkles, Code, PenTool } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Chat() {
  const [chatId] = React.useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(7);
  });

  const [input, setInput] = React.useState("");
  
  const transport = React.useMemo(() => {
    return new DefaultChatTransport({
      api: `/api/chat?chatId=${chatId}`
    });
  }, [chatId]);

  const { messages, status, stop, regenerate, sendMessage } = useChat({
    transport,
    id: chatId,
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const isLoading = status === 'submitted' || status === 'streaming';

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
    setInput("");
  };

  const getMessageContent = (message: any) => {
    if (message.content) return message.content;
    if (message.parts && Array.isArray(message.parts)) {
      return message.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto pb-4">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4">
            <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 shadow-inner">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                How can I help you today?
              </h1>
              
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md" onClick={() => handleInputChange({ target: { value: 'Brainstorm ideas for a new SaaS product' } })}>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <p className="text-sm font-medium">Brainstorm ideas</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">For a new SaaS product</p>
                </div>
                <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md" onClick={() => handleInputChange({ target: { value: 'Write code to build a React component' } })}>
                  <Code className="h-5 w-5 text-indigo-500" />
                  <p className="text-sm font-medium">Write code</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">To build a React component</p>
                </div>
                <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md" onClick={() => handleInputChange({ target: { value: 'Draft an email to request a project update' } })}>
                  <PenTool className="h-5 w-5 text-rose-500" />
                  <p className="text-sm font-medium">Draft an email</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">To request a project update</p>
                </div>
                <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md" onClick={() => handleInputChange({ target: { value: 'Explain concepts like quantum computing' } })}>
                  <Bot className="h-5 w-5 text-emerald-500" />
                  <p className="text-sm font-medium">Explain concepts</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">Like quantum computing</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message: any) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} group/message`}>
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 border border-border/50 text-foreground'
                  }`}>
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm">{getMessageContent(message)}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm break-words">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            code({node, inline, className, children, ...props}: any) {
                              return !inline ? (
                                <div className="relative mt-4 mb-4 group/code">
                                  <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-50 overflow-x-auto text-xs font-mono">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon-xs" 
                                    className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50"
                                    onClick={() => copyToClipboard(String(children))}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary" {...props}>
                                  {children}
                                </code>
                              )
                            }
                          }}
                        >
                          {getMessageContent(message)}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
                      <Button type="button" variant="ghost" size="icon-xs" onClick={() => copyToClipboard(getMessageContent(message))} className="h-6 w-6">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-xs" onClick={() => regenerate()} className="h-6 w-6">
                        <RefreshCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent border border-border">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="flex gap-4 justify-start">
                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                   <Bot className="h-5 w-5 text-primary" />
                 </div>
                 <div className="px-4 py-4 rounded-2xl bg-muted/50 border border-border/50 flex items-center gap-1.5">
                   <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" />
                   <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
                   <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0.4s' }} />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pt-2 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-end overflow-hidden rounded-2xl border border-border bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
          <Textarea 
            value={input}
            onChange={handleInputChange}
            className="min-h-[60px] w-full resize-none border-0 bg-transparent py-4 pl-4 pr-14 text-sm outline-none focus-visible:ring-0 placeholder:text-muted-foreground shadow-none"
            placeholder="Send a message to Nova AI..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {isLoading ? (
              <Button type="button" size="icon-sm" variant="destructive" className="rounded-full shadow-sm" onClick={stop}>
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon-sm" className="rounded-full shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!input.trim()}>
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Nova AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
