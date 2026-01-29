import { ChatPage } from "@/components/chat/chat-page";

export const metadata = {
  title: "Chat with Documents | BCF Learning Platform",
  description: "Chat with your course documents using AI-powered assistance",
};

export default function ChatRoute() {
  return (
    <div className="h-[calc(100vh)]">
      <ChatPage />
    </div>
  );
}
