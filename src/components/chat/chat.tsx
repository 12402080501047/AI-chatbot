"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, RefreshCcw, Square, User, Bot, ArrowUp, Sparkles, Code, PenTool, Mic, MicOff, Volume2, VolumeX, Download, Paperclip, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Attachment = {
  id: string;
  type: "image" | "pdf";
  name: string;
  dataUrl?: string; // For images
  extractedText?: string; // For PDFs
  isUploading?: boolean;
};

export function Chat() {
  const [chatId] = React.useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(7);
  });

  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [playingMessageId, setPlayingMessageId] = React.useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const recognitionRef = React.useRef<any>(null);

  const transport = React.useMemo(() => {
    return new DefaultChatTransport({
      api: `/api/chat?chatId=${chatId}`
    });
  }, [chatId]);

  const { messages, status, stop, regenerate, sendMessage, error } = useChat({
    transport,
    id: chatId,
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const isLoading = status === 'submitted' || status === 'streaming';

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, attachments, error]);

  React.useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
    }
  }, [error]);

  // Cleanup speech synthesis on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const toggleSpeech = (text: string, messageId: string) => {
    if (!window.speechSynthesis) return;
    
    if (playingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setPlayingMessageId(null);
    setPlayingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev + (prev ? " " : "") + finalTranscript);
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const exportChat = () => {
    let content = "# Chat Export\n\n";
    messages.forEach(m => {
      const role = m.role === 'user' ? 'User' : 'Nova AI';
      content += `### ${role}\n${getMessageContent(m)}\n\n---\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    for (const file of files) {
      const id = Math.random().toString(36).substring(7);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => [...prev, {
            id,
            type: "image",
            name: file.name,
            dataUrl: e.target?.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setAttachments(prev => [...prev, { id, type: "pdf", name: file.name, isUploading: true }]);
        
        try {
          const formData = new FormData();
          formData.append("file", file);
          
          const res = await fetch("/api/parse-pdf", {
            method: "POST",
            body: formData,
          });
          
          if (!res.ok) throw new Error("Failed to parse PDF");
          const { text } = await res.json();
          
          setAttachments(prev => prev.map(att => att.id === id ? { ...att, extractedText: text, isUploading: false } : att));
        } catch (error) {
          console.error(error);
          setAttachments(prev => prev.filter(att => att.id !== id));
        }
      }
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    
    const parts: any[] = [];
    let textPrompt = input;
    
    // Process PDFs into text context
    const pdfs = attachments.filter(a => a.type === 'pdf' && a.extractedText);
    if (pdfs.length > 0) {
      const pdfContext = pdfs.map(p => `[Context from PDF: ${p.name}]\n${p.extractedText}`).join("\n\n");
      textPrompt = `${pdfContext}\n\n${textPrompt}`;
    }
    
    if (textPrompt.trim()) {
      parts.push({ type: 'text', text: textPrompt });
    }
    
    // Process Images
    const images = attachments.filter(a => a.type === 'image' && a.dataUrl);
    images.forEach(img => {
      // Vercel AI SDK parts API
      // Since it requires a specific format, and depending on version, usually it takes base64 buffer or data URL
      // We'll pass the base64 URL directly
      parts.push({ type: 'image', image: img.dataUrl });
    });

    if (parts.length > 0) {
      sendMessage({ role: 'user', parts });
    }
    
    setInput("");
    setAttachments([]);
  };

  const getMessageContent = (message: any) => {
    if (message.content) return message.content;
    if (message.parts && Array.isArray(message.parts)) {
      return message.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto pb-4 relative">
      {/* Export Button */}
      {messages.length > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-2 right-4 z-10 gap-2 bg-background/80 backdrop-blur"
          onClick={exportChat}
          aria-label="Export chat as Markdown"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      )}

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
            {messages.map((message: any) => {
              const textContent = getMessageContent(message);
              return (
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
                      {/* Show user attached images if any in the parts array */}
                      {message.role === 'user' && message.parts?.filter((p: any) => p.type === 'image').map((p: any, i: number) => (
                        <div key={i} className="mb-2 max-w-[200px] rounded overflow-hidden border border-primary-foreground/20">
                          <img src={p.image} alt="Upload" className="w-full h-auto object-cover" />
                        </div>
                      ))}
                      
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap text-sm">{textContent}</p>
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
                                      aria-label="Copy code snippet"
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
                            {textContent}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => copyToClipboard(textContent)} className="h-6 w-6" aria-label="Copy message">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => toggleSpeech(textContent, message.id)} className="h-6 w-6" aria-label={playingMessageId === message.id ? "Stop reading message" : "Read message aloud"}>
                          {playingMessageId === message.id ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => regenerate()} className="h-6 w-6" aria-label="Regenerate message">
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
              );
            })}
            
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
            
            {error && (
              <div className="flex gap-4 justify-start">
                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                   <Bot className="h-5 w-5 text-destructive" />
                 </div>
                 <div className="px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm max-w-[85%]">
                   <p className="font-semibold">Error communicating with Nova AI</p>
                   <p className="mt-1 opacity-90">{error.message}</p>
                   <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => regenerate()}>
                     Try Again
                   </Button>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pt-2 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex flex-col rounded-2xl border border-border bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
          
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 pb-0 border-b border-border/50 mx-1">
              {attachments.map(att => (
                <div key={att.id} className="relative flex items-center gap-2 bg-muted rounded-md p-1.5 pr-8 border border-border text-xs group">
                  {att.type === 'image' ? <ImageIcon className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-destructive" />}
                  <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                  {att.isUploading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-1" />}
                  <button 
                    type="button" 
                    onClick={() => removeAttachment(att.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove attachment ${att.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end w-full">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileChange}
            />
            <Button 
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute left-2 bottom-3 text-muted-foreground hover:text-foreground z-10 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file or image"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Textarea 
              value={input}
              onChange={handleInputChange}
              className="min-h-[60px] w-full resize-none border-0 bg-transparent py-4 pl-12 pr-24 text-sm outline-none focus-visible:ring-0 placeholder:text-muted-foreground shadow-none"
              placeholder="Send a message to Nova AI..."
              aria-label="Chat input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            
            <div className="absolute right-3 bottom-3 flex items-center gap-1.5 z-10">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon-sm" 
                className={`rounded-full transition-colors ${isRecording ? 'text-destructive bg-destructive/10 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={toggleRecording}
                title="Voice Input"
                aria-label={isRecording ? "Stop voice input" : "Start voice input"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              {isLoading ? (
                <Button type="button" size="icon-sm" variant="destructive" className="rounded-full shadow-sm" onClick={stop} aria-label="Stop generation">
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              ) : (
                <Button type="submit" size="icon-sm" className="rounded-full shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!input.trim() && attachments.length === 0} aria-label="Send message">
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Nova AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
