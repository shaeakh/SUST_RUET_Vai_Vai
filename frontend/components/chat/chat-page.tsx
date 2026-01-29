"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PDFSelector } from "./pdf-selector";
import { Button } from "@/components/ui/button";
import {
  getConversations,
  createConversation,
  deleteConversation,
  updateConversationTitle,
} from "@/lib/storage/conversations";
import type { Conversation } from "@/types/chat";
import { ChatInterface } from "./chat-interface";

interface ChatPageProps {
  className?: string;
}

export function ChatPage({ className }: ChatPageProps) {
  // State
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>(
    [],
  );
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = React.useState<
    string | null
  >(null);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [showDocuments, setShowDocuments] = React.useState(true);

  // Load conversations from localStorage on mount
  React.useEffect(() => {
    const stored = getConversations();
    setConversations(stored);
  }, []);

  // Refresh conversations
  const refreshConversations = React.useCallback(() => {
    const stored = getConversations();
    setConversations(stored);
  }, []);

  // Create new conversation
  const handleNewConversation = () => {
    const conversation = createConversation(selectedDocuments);
    setCurrentConversationId(conversation.id);
    refreshConversations();
  };

  // Create conversation on first message (when user sends without clicking New Chat)
  const handleConversationCreated = (id: string) => {
    setCurrentConversationId(id);
    refreshConversations();
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setSelectedDocuments(conversation.documentIds);
    }
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
    refreshConversations();
  };

  // Update conversation title
  const handleUpdateTitle = (id: string, title: string) => {
    updateConversationTitle(id, title);
    refreshConversations();
  };

  // Handle document selection change
  const handleDocumentChange = (ids: string[]) => {
    setSelectedDocuments(ids);
  };

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId,
  );

  return (
    <div className={cn("flex h-full bg-white", className)}>
      {/* Sidebar - Conversation History */}
      {showSidebar && (
        <div className="w-64 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200">
            <Button
              onClick={handleNewConversation}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 font-light">
                No conversations yet
              </p>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  onClick={() => handleSelectConversation(conversation.id)}
                  onDelete={() => handleDeleteConversation(conversation.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle buttons */}
        <div className="flex items-center gap-2 p-3 border-b border-slate-200 bg-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
          <span className="text-sm font-semibold flex-1 text-slate-900 truncate">
            {currentConversation?.title || "New Chat"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDocuments(!showDocuments)}
            className={cn(
              "text-xs border-slate-200 font-medium",
              showDocuments
                ? "bg-primary/10 text-primary border-primary/20"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Documents
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Interface */}
          <div className="flex-1">
            <ChatInterface
              documentIds={selectedDocuments}
              conversationId={currentConversationId || undefined}
              onConversationUpdate={handleUpdateTitle}
              onConversationCreated={handleConversationCreated}
            />
          </div>

          {/* Document Selector Panel */}
          {showDocuments && (
            <div className="w-80 border-l border-slate-200 overflow-y-auto bg-slate-50/50">
              <PDFSelector
                selected={selectedDocuments}
                onSelect={handleDocumentChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Conversation list item component
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const [showDelete, setShowDelete] = React.useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary font-medium border border-primary/10"
          : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900",
      )}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <svg
        className={cn(
          "h-4 w-4 shrink-0",
          isActive
            ? "text-primary"
            : "text-slate-400 group-hover:text-slate-600",
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="truncate">{conversation.title}</p>
        <p
          className={cn(
            "text-[10px] uppercase tracking-wider font-semibold",
            isActive ? "text-primary/60" : "text-slate-400",
          )}
        >
          {formatDate(conversation.updatedAt)}
        </p>
      </div>
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
