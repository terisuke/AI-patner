import React from "react";

type ChatProps = {
  role: string;
  message: string;
  characterName?: string;
  prevRole?: string;
  nextRole?: string;
};

export const ChatMessage = ({
  role,
  message,
  characterName,
  prevRole,
  nextRole
}: ChatProps) => {
  const roleStyles = {
    user: { bgColor: "bg-base", textColor: "text-primary", offsetX: "pl-40" },
    assistant: { bgColor: "bg-secondary", textColor: "text-white", offsetX: "pr-40" },
    code: { bgColor: "bg-black", textColor: "text-white", offsetX: "pl-40" },
    output: { bgColor: "bg-black", textColor: "text-white", offsetX: "pl-40" },
    executing: { bgColor: "bg-black", textColor: "text-white", offsetX: "pl-40" }
  } as const;

  const { bgColor, textColor, offsetX } = roleStyles[role as keyof typeof roleStyles] || roleStyles["user"];
  const isSameAsPrevRole = role === prevRole;
  const isSameAsNextRole = role === nextRole;

  const cleanMessage = message.replace(/^\[(neutral|happy|angry|sad|relaxed)\]/, "").trim();
  const messageLines = cleanMessage.split('\n').filter(line => line.trim() !== '');

  return (
    <div className={`mx-auto max-w-[32rem] my-16 ${offsetX}`}>
      {role === "code" ? (
        <pre className="whitespace-pre-wrap break-words bg-[#1F2937] text-white p-16 rounded-8">
          <code className="font-mono text-sm">{cleanMessage}</code>
        </pre>
      ) : (
        <>
          <div className={`px-24 py-8 rounded-t-8 font-bold tracking-wider ${bgColor}`}>
            {role !== "user" ? `${characterName || "Assistant"} (${role})` : "YOU"}
          </div>
          <div className={`px-24 py-16 bg-white rounded-b-8`}>
            <div className={`typography-16 font-bold ${textColor}`}>{messageLines.join('\n')}</div>
          </div>
        </>
      )}
    </div>
  );
};