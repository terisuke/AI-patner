import { Message } from "../features/messages/messages";
import { MessageLog } from "./messageLog";

type Props = {
  messages: Message[];
};

export const CodeLog = ({ messages }: Props) => (
  <div className="absolute w-col-span-7 max-w-full h-[100svh] pb-104">
    <div className="h-full pl-64 pr-16 pt-104 pb-104">
      <div className="p-24 ml-16 h-full rounded-8 bg-base">
        <MessageLog
          messages={messages}
          className="h-full font-bold tracking-wider bg-base text-primary overflow-y-auto scroll-hidden"
        />
      </div>
    </div>
  </div>
);