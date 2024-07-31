import { useState, useCallback } from 'react';
import { Message, Screenplay, textsToScreenplay } from '../features/messages/messages';
import { AIService, AIServiceConfig, getAIChatResponseStream } from "../features/chat/aiChatFactory";
import { saveChatLog } from "../lib/firebase";
import { KoeiroParam } from '@/features/constants/koeiroParam';

type MessageProcessingDependencies = {
  selectAIService: string;
  selectAIModel: string;
  openAiKey: string;
  anthropicKey: string;
  googleKey: string;
  groqKey: string;
  localLlmUrl: string;
  difyKey: string;
  difyUrl: string;
  difyConversationId: string;
  setDifyConversationId: (id: string) => void;
  koeiroParam: KoeiroParam;
  handleSpeakAi: (screenplay: Screenplay, onStart?: () => void, onEnd?: () => void) => void;
  userId: string | null;
  startDate: string;
  setChatProcessing: (value: boolean) => void;
  setAssistantMessage: (message: string) => void;
  incrementChatProcessingCount: () => void;
  decrementChatProcessingCount: () => void;
  webSocketMode: boolean;
  t: (key: string) => string;
  systemPrompt: string;
};

export const useMessageProcessing = (dependencies: MessageProcessingDependencies) => {
  const {
    selectAIService,
    selectAIModel,
    openAiKey,
    anthropicKey,
    googleKey,
    groqKey,
    localLlmUrl,
    difyKey,
    difyUrl,
    difyConversationId,
    setDifyConversationId,
    koeiroParam,
    handleSpeakAi,
    userId,
    startDate,
    setChatProcessing,
    setAssistantMessage,
    incrementChatProcessingCount,
    decrementChatProcessingCount,
    webSocketMode,
    t,
    systemPrompt,
  } = dependencies;

  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [codeLog, setCodeLog] = useState<Message[]>([]);

  const processAIResponse = useCallback(async (currentChatLog: Message[], messages: Message[]) => {
    // ロジック内容をそのまま移行
    setChatProcessing(true);
    let stream;

    const aiServiceConfig: AIServiceConfig = {
      openai: { key: openAiKey, model: selectAIModel },
      anthropic: { key: anthropicKey, model: selectAIModel },
      google: { key: googleKey, model: selectAIModel },
      localLlm: { url: localLlmUrl, model: selectAIModel },
      groq: { key: groqKey, model: selectAIModel },
      dify: {
        key: difyKey,
        url: difyUrl,
        conversationId: difyConversationId,
        setConversationId: setDifyConversationId
      }
    };

    try {
      stream = await getAIChatResponseStream(selectAIService as AIService, messages, aiServiceConfig);
    } catch (e) {
      console.error(e);
      stream = null;
    }

    if (stream == null) {
      setChatProcessing(false);
      return;
    }

    const reader = stream.getReader();
    let receivedMessage = "";
    let aiTextLog: Message[] = [];
    let tag = "";
    let isCodeBlock = false;
    let codeBlockText = "";
    const sentences = new Array<string>();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        receivedMessage += value;

        // タグと返答を分離
        const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
        if (tagMatch && tagMatch[0]) {
          tag = tagMatch[0];
          receivedMessage = receivedMessage.slice(tag.length);
        }

        const sentenceMatch = receivedMessage.match(/^(.+?[。．.!?！？\n]|.{20,}[、,])/);
        if (sentenceMatch?.[0]) {
          let sentence = sentenceMatch[0];
          if (!sentence.match(/^\[(neutral|happy|angry|sad|relaxed)\]/)) {
            sentence = "[neutral]" + sentence;
          }
          sentences.push(sentence);
          receivedMessage = receivedMessage.slice(sentence.length).trimStart();

          if (
            !sentence.includes("```") && !sentence.replace(/^[\s\u3000\t\n\r$begin:math:display$\$begin:math:text$\\\\{「］」\\\\}\\$end:math:text$$end:math:display$'"''""・、。,.!?！？:：;；\-_=+~～*＊@＠#＃$＄%％^＾&＆|｜\\＼/／`｀]+$/gu, "")
          ) {
            continue;
          }

          let aiText = `${tag} ${sentence}`;

          if (isCodeBlock && !sentence.includes("```")) {
            codeBlockText += sentence;
            continue;
          }

          if (sentence.includes("```")) {
            if (isCodeBlock) {
              const [codeEnd, ...restOfSentence] = sentence.split("```");
              aiTextLog.push({ role: "code", content: codeBlockText + codeEnd });
              aiText += `${tag} ${restOfSentence.join("```") || ""}`;

              setAssistantMessage(sentences.join(" "));

              codeBlockText = "";
              isCodeBlock = false;
            } else {
              isCodeBlock = true;
              [aiText, codeBlockText] = aiText.split("```");
            }

            sentence = sentence.replace(/```/g, "");
          }

          const aiTalks = textsToScreenplay([aiText], koeiroParam);
          aiTextLog.push({ role: "assistant", content: sentence });

          const currentAssistantMessage = sentences.join(" ");

          handleSpeakAi(aiTalks[0], () => {
            setAssistantMessage(currentAssistantMessage);
            incrementChatProcessingCount();
          }, () => {
            decrementChatProcessingCount();
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      reader.releaseLock();
    }

    aiTextLog = aiTextLog.reduce((acc: Message[], item: Message) => {
      const lastItem = acc[acc.length - 1];
      if (lastItem && lastItem.role === item.role) {
        lastItem.content += " " + item.content;
      } else {
        acc.push({ ...item, content: item.content.trim() });
      }
      return acc;
    }, []).filter(item => item.content !== "");

    setChatLog([...currentChatLog, ...aiTextLog]);
    setChatProcessing(false);
    if (userId) {
      saveChatLog(userId, [...currentChatLog, ...aiTextLog], startDate);
    }
  }, [selectAIService, openAiKey, selectAIModel, anthropicKey, googleKey, localLlmUrl, groqKey, difyKey, difyUrl, difyConversationId, koeiroParam, handleSpeakAi, userId, startDate]);

  const handleSendChat = useCallback(
    async (text: string, role: string = "user") => {
      if (!text) return;
      
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: text },
      ];

      setChatLog(messageLog);

      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog.slice(-10),
      ];

      try {
        await processAIResponse(messageLog, messages);
      } catch (e) {
        console.error(e);
      }

      setChatProcessing(false);
    },
    [chatLog, systemPrompt, processAIResponse, setChatProcessing]
  );

  const preProcessAIResponse = useCallback((response: string) => {
    // ここでAIレスポンスの前処理を行うロジックを追加します
  }, []);

  const addGeneratedMessageToChatLog = useCallback((message: Message) => {
    setChatLog(prevLog => [...prevLog, message]);
}, []);

return { chatLog, codeLog, processAIResponse, handleSendChat, preProcessAIResponse, addGeneratedMessageToChatLog };
};