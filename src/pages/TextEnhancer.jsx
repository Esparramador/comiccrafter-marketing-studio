import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Send, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/SectionHeader";

export default function TextEnhancer() {
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => setUserEmail(u?.email || "")).catch(() => setUserEmail(""));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeAgent = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "textEnhancer",
        metadata: {
          name: "Text Enhancement Session",
          description: "Session para mejorar y expandir textos",
        },
      });
      setConversationId(conv.id);
      setMessages(conv.messages || []);
    } catch (error) {
      console.error("Error initializing agent:", error);
    }
  };

  useEffect(() => {
    if (userEmail && !conversationId) {
      initializeAgent();
    }
  }, [userEmail]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversationId) return;

    setLoading(true);
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: inputText,
      });
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles");
  };

  const downloadAsText = (text) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", "texto-mejorado.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!conversationId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SectionHeader
          title="Text Enhancer"
          subtitle="Transforma tus textos en contenido pulido, expandido y conversacional"
          icon={Sparkles}
        />
        <div className="animate-pulse text-center text-gray-400">Inicializando agente...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SectionHeader
        title="Text Enhancer"
        subtitle="Mejora tus textos: estructura, detalles, humor y acciones concretas"
        icon={Sparkles}
      />

      {/* Chat Area */}
      <div className="bg-[var(--surface)] border border-[var(--border-dim)] rounded-2xl flex flex-col h-[600px] shadow-lg">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <Sparkles className="w-12 h-12 text-violet-400/50" />
              <p className="text-gray-400">
                Comparte un texto que quieras mejorar y te ayudaré a pulirlo, expandirlo y hacerlo más vivo.
              </p>
              <p className="text-xs text-gray-500">
                Usa la estructura: Introducción → Contexto → Objetivos → Acciones → Ejemplo → Cierre
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-violet-600/20 text-violet-200 border border-violet-500/30"
                      : "bg-slate-700/40 text-gray-200 border border-slate-600/30"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => copyToClipboard(msg.content)}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copiar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => downloadAsText(msg.content)}
                      >
                        <Download className="w-3 h-3 mr-1" /> Descargar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border-dim)] p-4">
          <div className="flex gap-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSendMessage();
                }
              }}
              placeholder="Escribe el texto que quieres mejorar... (Ctrl+Enter para enviar)"
              className="flex-1 bg-[var(--surface-raised)] border border-[var(--border-dim)] rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              rows="3"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !inputText.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-violet-300 mb-2">Estructura</h3>
          <p className="text-xs text-gray-400">Introduc. → Contexto → Objetivos → Acciones → Ejemplo → Cierre</p>
        </div>
        <div className="bg-fuchsia-600/10 border border-fuchsia-500/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-fuchsia-300 mb-2">Tono</h3>
          <p className="text-xs text-gray-400">Conversacional + profesional, con humor, sin platitudes</p>
        </div>
        <div className="bg-cyan-600/10 border border-cyan-500/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-cyan-300 mb-2">Resultado</h3>
          <p className="text-xs text-gray-400">Texto pulido, expandido, medible y con chispa</p>
        </div>
      </div>
    </div>
  );
}