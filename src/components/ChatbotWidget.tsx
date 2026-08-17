import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, PhoneCall, Calendar } from "lucide-react";
import { MedicalLandingData } from "../types";

interface ChatbotWidgetProps {
  data: MedicalLandingData;
  getC: (key: string) => string;
}

interface Message {
  sender: "bot" | "user";
  text: string;
  isAction?: boolean;
  actions?: { label: string; url: string; type: "whatsapp" | "agenda" }[];
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ data, getC }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message and interactive suggestions
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: `¡Hola! Soy el asistente virtual de la consulta del ${data.nombreMedico || "Doctor"}. ¿Tienes alguna duda sobre nuestros servicios, horarios o cómo agendar tu cita?`
        }
      ]);
    }
  }, [data.nombreMedico, messages.length]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = { sender: "user", text: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    // Bot processing matching logic
    setTimeout(() => {
      const query = textToSend.toLowerCase().trim();
      
      // Find matching FAQ
      let matchedFaq = data.faqs.find(faq => {
        const question = faq.pregunta.toLowerCase();
        // Check if question contains the query, or query contains key words from question
        if (question.includes(query) || query.includes(question)) return true;
        
        // Match key words (split words and search)
        const queryWords = query.split(/\s+/).filter(w => w.length > 3);
        if (queryWords.length > 0) {
          const matchCount = queryWords.filter(word => question.includes(word)).length;
          // If at least 2 words or 50% of query words match, consider it a match
          if (matchCount >= Math.min(2, queryWords.length)) return true;
        }
        return false;
      });

      if (matchedFaq) {
        setMessages(prev => [
          ...prev,
          {
            sender: "bot",
            text: matchedFaq.respuesta
          }
        ]);
      } else {
        // Fallback response with CTAs
        const botResponse: Message = {
          sender: "bot",
          text: "Entiendo tu consulta. No tengo una respuesta exacta guardada para esa duda, pero puedes agendar una cita directa o enviarnos un WhatsApp para atenderte de inmediato.",
          isAction: true,
          actions: [
            { label: "Agendar Cita", url: "#agendar-preview", type: "agenda" },
            { label: "Enviar WhatsApp", url: data.whatsappUrl, type: "whatsapp" }
          ]
        };
        setMessages(prev => [...prev, botResponse]);
      }
    }, 600);
  };

  return (
    <div className="absolute bottom-16 right-4 z-40 font-sans">
      {/* Chat Trigger Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center justify-center w-11 h-11 rounded-full text-white shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-300 bg-${getC("600")} hover:bg-${getC("700")} animate-bounce`}
          title="Consultas en tiempo real"
        >
          <MessageSquare className="w-5.5 h-5.5" />
        </button>
      )}

      {/* Chatbox Panel */}
      {isOpen && (
        <div className="w-72 h-96 bg-white rounded-2xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className={`p-3 text-white flex items-center justify-between bg-${getC("600")}`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold leading-tight">Asistente Médico</p>
                <p className="text-[9px] text-blue-100/90 leading-none">Responde tus dudas</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick FAQ Suggestion Bar */}
          <div className="bg-slate-50 border-b border-slate-100 p-1.5 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {data.faqs.slice(0, 3).map((faq, i) => (
              <button
                key={i}
                onClick={() => handleSend(faq.pregunta)}
                className="text-[9px] font-bold px-2 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 max-w-[120px] truncate transition-colors"
              >
                {faq.pregunta}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-2.5 rounded-2xl text-[11px] leading-relaxed ${
                    msg.sender === "user"
                      ? `bg-${getC("600")} text-white rounded-tr-none shadow-sm`
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-xs"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Actions (WhatsApp / Agenda) if matching fails */}
                {msg.isAction && msg.actions && (
                  <div className="flex flex-col gap-1 w-full mt-1.5">
                    {msg.actions.map((act, idx) => (
                      <a
                        key={idx}
                        href={act.url}
                        className={`text-[10px] font-bold py-1.5 px-2.5 rounded-lg border flex items-center justify-center gap-1 transition-all ${
                          act.type === "whatsapp"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : `bg-${getC("50")} text-${getC("700")} border-${getC("100")} hover:bg-${getC("100")}`
                        }`}
                        onClick={act.url.startsWith("#") ? () => setIsOpen(false) : undefined}
                      >
                        {act.type === "agenda" ? (
                          <Calendar className="w-3.5 h-3.5" />
                        ) : (
                          <PhoneCall className="w-3.5 h-3.5" />
                        )}
                        {act.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-2 bg-white border-t border-slate-100 flex gap-1"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz una pregunta clínica..."
              className="flex-1 border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              className={`p-1.5 rounded-xl text-white transition-all bg-${getC("600")} hover:bg-${getC("700")} active:scale-95`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
