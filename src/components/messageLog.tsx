import { Message } from "../features/messages/messages";
import { ChatMessage } from "./chatMessage";
import { useScrollToBottom } from "../hooks/useScrollToBottom";

type Props = {
  messages: Message[];
  characterName?: string;
  className?: string;
};

export const MessageLog = ({ messages, characterName, className }: Props) => {
  const scrollRef = useScrollToBottom<HTMLDivElement>();

  return (
    <div className={className}>
      {messages.map((msg, i) => (
        <div key={i} ref={i === messages.length - 1 ? scrollRef : null}>
          <ChatMessage
            role={msg.role}
            message={msg.content.trim()}
            characterName={characterName}
            prevRole={i > 0 ? messages[i - 1].role : undefined}
            nextRole={i < messages.length - 1 ? messages[i + 1].role : undefined}
          />
        </div>
      ))}
    </div>
  );
};