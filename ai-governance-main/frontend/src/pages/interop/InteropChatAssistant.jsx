import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles, ShieldCheck, HelpCircle, RefreshCw, FileText } from "lucide-react";
import { askInteropAssistant } from "./api/interopApi";

const QUICK_QUESTIONS = [
  "What documents are automatically reused from my Fire NOC application?",
  "What is the SLA timeframe for Municipal Corporation clearances?",
  "How do I grant data access consent to the Pollution Control Board?",
  "Which applications currently have an SLA breach (> 2 days)?"
];

export default function InteropChatAssistant() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "Hello! I am your Industrial Compliance & Interoperability Assistant for PS 26129. How can I assist you with single window clearances, data reuse rules, consent grants, or SLA tracking today?",
      sender: "bot",
      sources: ["Single Window Compliance Framework"],
      grounded: true,
      timestamp: new Date()
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setIsTyping(true);

    try {
      const res = await askInteropAssistant(textToSend);
      const botMsg = {
        id: `bot-${Date.now()}`,
        text: res.answer,
        sender: "bot",
        sources: res.sources,
        grounded: res.grounded,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Interop chat error:", err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        text: "Insufficient evidence in compliance records to verify this query.",
        sender: "bot",
        sources: [],
        grounded: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Interop Compliance AI Assistant
              </h1>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                PS 26129 Grounded AI
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Ask questions regarding Single Window clearances, SLA tracking, master data reuse, and consent rules.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Strict Grounded Evidence Mode</span>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-primary" /> Suggested Questions for Review:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleSend(q)}
                className="text-xs border-border bg-card hover:bg-accent/40 text-foreground"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Window Card */}
        <Card className="border-border bg-card shadow-md flex flex-col h-[520px]">
          <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* Messages Scroll Container */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                    </div>

                    <div className={`space-y-1.5 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted/40 border border-border text-foreground rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {/* Source Citations Badge for Bot Answers */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-1">
                          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                            ✓ Grounded
                          </Badge>
                          <span className="flex items-center gap-1 truncate">
                            <FileText className="h-3 w-3" /> {msg.sources.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/40 border border-border p-3 rounded-2xl text-xs text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Searching PS 26129 compliance records...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-border flex items-center gap-2">
              <Input
                placeholder="Ask about SLA breaches, Fire NOC data reuse, or MPCB consent..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-background border-border text-foreground text-sm"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!inputQuery.trim() || isTyping}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
