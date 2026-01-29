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
    <div className={cn("flex h-full", className)}>
      {/* Sidebar - Conversation History */}
      {showSidebar && (
        <div className="w-64 border-r flex flex-col bg-muted/30">
          <div className="p-4 border-b">
            <Button onClick={handleNewConversation} className="w-full">
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
              <p className="text-sm text-muted-foreground text-center py-4">
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
      <div className="flex-1 flex flex-col">
        {/* Toggle buttons */}
        <div className="flex items-center gap-2 p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
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
          <span className="text-sm font-medium flex-1">
            {currentConversation?.title || "New Chat"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDocuments(!showDocuments)}
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
            />
          </div>

          {/* Document Selector Panel */}
          {showDocuments && (
            <div className="w-72 border-l overflow-y-auto">
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
        "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
      )}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <svg
        className="h-4 w-4 shrink-0"
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
        <p className="truncate font-medium">{conversation.title}</p>
        <p className="text-xs text-muted-foreground">
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
