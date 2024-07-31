import { Message } from "../features/messages/messages";
import { MessageLog } from "./messageLog";

type Props = {
  messages: Message[];
  characterName: string;
};

export const ChatLog = ({ messages, characterName }: Props) => (
  <div className="absolute w-col-span-7 max-w-full h-[100svh] pb-64">
    <MessageLog
      messages={messages}
      characterName={characterName}
      className="max-h-full px-16 pt-104 pb-64 overflow-y-auto scroll-hidden"
    />
  </div>
);