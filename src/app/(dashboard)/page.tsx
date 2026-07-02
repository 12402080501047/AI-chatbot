import { Bot, Sparkles, Code, PenTool, ArrowUp } from "lucide-react"

export default function NewChatPage() {
  return (
    <div className="flex h-full flex-col items-center p-4 pt-10 md:pt-20">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 shadow-inner">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          How can I help you today?
        </h1>
        
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <p className="text-sm font-medium">Brainstorm ideas</p>
            <p className="text-xs text-muted-foreground line-clamp-2">For a new SaaS product</p>
          </div>
          <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md">
            <Code className="h-5 w-5 text-indigo-500" />
            <p className="text-sm font-medium">Write code</p>
            <p className="text-xs text-muted-foreground line-clamp-2">To build a React component</p>
          </div>
          <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md">
            <PenTool className="h-5 w-5 text-rose-500" />
            <p className="text-sm font-medium">Draft an email</p>
            <p className="text-xs text-muted-foreground line-clamp-2">To request a project update</p>
          </div>
          <div className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-accent/50 hover:shadow-md">
            <Bot className="h-5 w-5 text-emerald-500" />
            <p className="text-sm font-medium">Explain concepts</p>
            <p className="text-xs text-muted-foreground line-clamp-2">Like quantum computing</p>
          </div>
        </div>
      </div>
      
      {/* Mock Chat Input at bottom */}
      <div className="absolute bottom-6 w-full max-w-3xl px-4">
        <div className="relative flex items-center overflow-hidden rounded-2xl border border-border bg-card shadow-lg focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
          <textarea 
            className="w-full resize-none bg-transparent py-4 pl-4 pr-12 text-sm outline-none placeholder:text-muted-foreground"
            rows={1}
            placeholder="Send a message to Nova AI..."
          />
          <button className="absolute right-3 rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Nova AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  )
}
