"use client";
import { FormEvent, useEffect, useState } from "react";
import { Bot, MessageSquarePlus, Trash2 } from "lucide-react";

type Message = { id?: string; role: "user" | "assistant"; content: string; sources?: string[]; createdAt?: string };
type Conversation = { id: string; title: string; updatedAt: string; _count?: { messages: number } };

async function request(path: string, method = "GET", body?: unknown) {
  const response = await fetch("/api/v1/" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

const starters = [
  "Which products are below reorder level?",
  "Summarize order value for the last 30 days.",
  "What orders need credit approval?",
  "Which recent invoices have an unpaid balance?",
];

export default function WorkspaceAI() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoadingHistory(true);
    try { setConversations(await request("ai/conversations")); setError(""); }
    catch (cause) { setError((cause as Error).message); }
    finally { setLoadingHistory(false); }
  }
  useEffect(() => { void loadHistory(); }, []);

  async function openConversation(id: string) {
    setBusy(true); setError("");
    try {
      const conversation = await request("ai/conversations/" + id);
      setConversationId(conversation.id);
      setMessages(conversation.messages.map((message: Message) => ({ ...message, sources: Array.isArray(message.sources) ? message.sources : [] })));
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  function newConversation() { setConversationId(""); setMessages([]); setQuestion(""); setError(""); }

  async function send(e?: FormEvent<HTMLFormElement>, draft?: string) {
    e?.preventDefault();
    const text = (draft ?? question).trim();
    if (!text || busy) return;
    setBusy(true); setError("");
    try {
      const result = await request("ai/chat", "POST", { question: text, ...(conversationId ? { conversationId } : {}) });
      setConversationId(result.conversationId);
      setMessages((existing) => [...existing, { role: "user", content: text }, { role: "assistant", content: result.answer, sources: result.sources ?? [] }]);
      setQuestion("");
      await loadHistory();
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  async function deleteConversation() {
    if (!conversationId || busy) return;
    if (!window.confirm("Delete this saved conversation? This cannot be undone.")) return;
    setBusy(true); setError("");
    try { await request("ai/conversations/" + conversationId, "DELETE"); newConversation(); await loadHistory(); }
    catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  return <section className="workspace-ai" aria-labelledby="workspace-ai-title">
    <div className="workspace-ai-main">
      <div className="workspace-ai-heading"><div className="workspace-ai-icon"><Bot size={19}/></div><div><p className="eyebrow">READ-ONLY BUSINESS ASSISTANT</p><h2 id="workspace-ai-title">Ask Drinkarto</h2><p>Answers from this workspace’s orders, stock and invoice balances.</p></div><div className="workspace-ai-actions"><button type="button" className="secondary" onClick={newConversation}><MessageSquarePlus size={15}/>New chat</button>{conversationId&&<button type="button" className="icon-button" aria-label="Delete this conversation" title="Delete this conversation" onClick={deleteConversation}><Trash2 size={16}/></button>}</div></div>
      {messages.length === 0 ? <div className="workspace-ai-starters">{starters.map((starter) => <button type="button" key={starter} className="secondary" disabled={busy} onClick={() => void send(undefined, starter)}>{starter}</button>)}</div> : <div className="workspace-ai-transcript" aria-live="polite">{messages.map((message, index) => <article className={`workspace-ai-message ${message.role}`} key={message.id ?? `${index}-${message.role}`}><span>{message.role === "user" ? "You" : "Drinkarto"}</span><p>{message.content}</p>{message.role === "assistant"&&message.sources?.length ? <small>Data checked: {message.sources.join(", ")}</small> : null}</article>)}</div>}
      {error&&<p className="error" role="alert">{error}</p>}
      <form className="workspace-ai-composer" onSubmit={send}><label className="sr-only" htmlFor="workspace-ai-question">Ask a question about your business</label><textarea id="workspace-ai-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about orders, inventory or invoices…" minLength={3} maxLength={1000} rows={2}/><button disabled={busy||question.trim().length<3}>{busy?"Checking…":"Ask"}</button></form>
      <p className="workspace-ai-note">AI can make mistakes. Verify important figures in the linked ERP records. Invoice data covers recent records and has no due dates, so the assistant won’t label balances overdue.</p>
    </div>
    <aside className="workspace-ai-history"><div><strong>Recent chats</strong><button type="button" onClick={loadHistory} disabled={loadingHistory} aria-label="Refresh chat history">↻</button></div>{loadingHistory?<p>Loading history…</p>:conversations.length?<ul>{conversations.map((conversation)=><li key={conversation.id}><button type="button" className={conversation.id===conversationId?"active":""} onClick={()=>void openConversation(conversation.id)} disabled={busy}><span>{conversation.title}</span><small>{new Date(conversation.updatedAt).toLocaleDateString()}</small></button></li>)}</ul>:<p>Saved conversations will appear here.</p>}</aside>
  </section>;
}
