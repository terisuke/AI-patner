import { getAuth } from "firebase/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Introduction } from "../components/introduction";
import { Menu } from "../components/menu";
import { MessageInputContainer } from "../components/messageInputContainer";
import { Meta } from "../components/meta";
import usePreviousRoute from '../components/usePreviousRoute';
import VrmViewer from "../components/vrmViewer";
import { AIService, AIServiceConfig, getAIChatResponseStream } from "../features/chat/aiChatFactory";
import { DEFAULT_PARAM, KoeiroParam } from "../features/constants/koeiroParam";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_B, SYSTEM_PROMPT_C } from "../features/constants/systemPromptConstants";
import { useMessageProcessing } from '@/hooks/useMessageProcessing'; // カスタムフックのインポート
import {
    Message,
    Screenplay,
    textsToScreenplay,
} from "../features/messages/messages";
import { speakCharacter } from "../features/messages/speakCharacter";
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { fetchAndProcessComments } from "../features/youtube/youtubeComments";
import { saveChatLog } from "../lib/firebase";
import "../lib/i18n";
import { buildUrl } from "../utils/buildUrl";
import { getMessagesForContinuation } from "../features/youtube/conversationContinuityFunctions";
import { url } from "node:inspector";

export default function Home() {
  const { viewer } = useContext(ViewerContext);
  const { t } = useTranslation();
  const previousRouteHook = usePreviousRoute();

  const [userId, setUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString());
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [userName, setUserName] = useState("きみ");
  const [systemPrompt, setSystemPrompt] = useState(() => SYSTEM_PROMPT("きみ","美穂"));
  const [selectAIService, setSelectAIService] = useState("openai");
  const [selectAIModel, setSelectAIModel] = useState("gpt-4o-mini");
  const [openAiKey, setOpenAiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [localLlmUrl, setLocalLlmUrl] = useState("");
  const [difyKey, setDifyKey] = useState("");
  const [difyUrl, setDifyUrl] = useState("");
  const [difyConversationId, setDifyConversationId] = useState("");
  const [selectVoice, setSelectVoice] = useState("voicevox");
  const [selectLanguage, setSelectLanguage] = useState("JP"); 
  const [selectVoiceLanguage, setSelectVoiceLanguage] = useState("ja-JP");
  const [changeEnglishToJapanese, setChangeEnglishToJapanese] = useState(false);
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [voicevoxSpeaker, setVoicevoxSpeaker] = useState("2");
  const [googleTtsType, setGoogleTtsType] = useState(process.env.NEXT_PUBLIC_GOOGLE_TTS_TYPE && process.env.NEXT_PUBLIC_GOOGLE_TTS_TYPE !== "" ? process.env.NEXT_PUBLIC_GOOGLE_TTS_TYPE : "");
  const [stylebertvits2ServerUrl, setStylebertvits2ServerURL] = useState("http://127.0.0.1:5000");
  const [stylebertvits2ModelId, setStylebertvits2ModelId] = useState("0");
  const [stylebertvits2Style, setStylebertvits2Style] = useState("Neutral");
  const [youtubeMode, setYoutubeMode] = useState(false);
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [youtubeLiveId, setYoutubeLiveId] = useState("");
  const [conversationContinuityMode, setConversationContinuityMode] = useState(false);
  console.log("Conversation Continuity Mode changed:", conversationContinuityMode);
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [codeLog, setCodeLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [webSocketMode, changeWebSocketMode] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false); 
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_PATH !== undefined ? process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_PATH : "/bg-c.png"
  );
  const [dontShowIntroduction, setDontShowIntroduction] = useState<boolean>(false);
  const [gsviTtsServerUrl, setGSVITTSServerUrl] = useState(process.env.NEXT_PUBLIC_TTS_URL && process.env.NEXT_PUBLIC_TTS_URL !== "" ? process.env.NEXT_PUBLIC_TTS_URL : "http://127.0.0.1:5000/tts");
  const [gsviTtsModelId, setGSVITTSModelID] = useState("");
  const [gsviTtsBatchSize, setGSVITTSBatchSize] = useState(2);
  const [gsviTtsSpeechRate, setGSVITTSSpeechRate] = useState(1.0);
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState("");
  const [elevenlabsVoiceId, setElevenlabsVoiceId] = useState("");
  const [youtubeNextPageToken, setYoutubeNextPageToken] = useState("");
  const [youtubeContinuationCount, setYoutubeContinuationCount] = useState(0);
  const [youtubeNoCommentCount, setYoutubeNoCommentCount] = useState(0);
  const [youtubeSleepMode, setYoutubeSleepMode] = useState(false);
  const [chatProcessingCount, setChatProcessingCount] = useState(0);
  const [characterName, setCharacterName] = useState("美穂");
  const [showCharacterName, setShowCharacterName] = useState(true);
  const [selectType, setSelectType] = useState("main");
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [autoResponseInterval, setAutoResponseInterval] = useState<NodeJS.Timeout | null>(null);

  const incrementChatProcessingCount = () => {
    setChatProcessingCount(prevCount => prevCount + 1);
  };

  const decrementChatProcessingCount = () => {
    setChatProcessingCount(prevCount => prevCount - 1);
  }

  const wsRef = useRef<WebSocket | null>(null);
  // useMessageProcessingフックの利用
  const { handleSendChat, processAIResponse, preProcessAIResponse, addGeneratedMessageToChatLog } = useMessageProcessing({
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
  handleSpeakAi: speakCharacter,
  userId,
  startDate,
  setChatProcessing,
  setAssistantMessage,
  incrementChatProcessingCount,
  decrementChatProcessingCount,
  webSocketMode,
  t,
  systemPrompt,
});

useEffect(() => {
  const storedData = window.localStorage.getItem("chatVRMParams");
  if (storedData) {
    const params = JSON.parse(storedData);
      setUserName(params.userName || "きみ");
      setSystemPrompt(() => SYSTEM_PROMPT(params.userName || "きみ",params.characterName || "美穂"));
      setKoeiroParam(params.koeiroParam || DEFAULT_PARAM);
      setChatLog(Array.isArray(params.chatLog) ? params.chatLog : []);
      setCodeLog(Array.isArray(params.codeLog) ? params.codeLog : []);
      setSelectAIService(params.selectAIService || "openai");
      setSelectAIModel(params.selectAIModel || "gpt-4o-mini");
      setOpenAiKey(params.openAiKey || "");
      setAnthropicKey(params.anthropicKey(params.anthropicKey || ""));
setGoogleKey(params.googleKey ||"");
setGroqKey(params.groqKey || "");
setLocalLlmUrl(params.localLlmUrl || "");
setDifyKey(params.difyKey || "");
setDifyUrl(params.difyUrl || "");
setDifyConversationId(params.difyConversationId || "");
setSelectVoice(params.selectVoice || "voicevox");
setSelectLanguage(params.selectLanguage || "JP");
setSelectVoiceLanguage(params.selectVoiceLanguage || "ja-JP");
setChangeEnglishToJapanese(params.changeEnglishToJapanese || false);
setKoeiromapKey(params.koeiromapKey || "");
setVoicevoxSpeaker(params.voicevoxSpeaker || "2");
setGoogleTtsType(params.googleTtsType || "en-US-Neural2-F");
setYoutubeMode(params.youtubeMode || false);
setYoutubeApiKey(params.youtubeApiKey || "");
setYoutubeLiveId(params.youtubeLiveId || "");
setConversationContinuityMode(params.conversationContinuityMode !== undefined ? params.conversationContinuityMode : false);
console.log(`Initial conversationContinuityMode:`, params.conversationContinuityMode !== undefined ? params.conversationContinuityMode : false);
changeWebSocketMode(params.webSocketMode || false);
setStylebertvits2ServerURL(params.stylebertvits2ServerUrl || `http//127.0.0.1:5000`);
      setStylebertvits2ModelId(params.stylebertvits2ModelId || "0");
setStylebertvits2Style(params.stylebertvits2Style || "Neutral");
setDontShowIntroduction(false);
setGSVITTSServerUrl(params.gsviTtsServerUrl || `http://127.0.0.1:5000/tts`);
setGSVITTSModelID(params.gsviTtsModelId || "");
setGSVITTSBatchSize(params.gsviTtsBatchSize || 2);
setGSVITTSSpeechRate(params.gsviTtsSpeechRate || 1.0);
setElevenlabsApiKey(params.elevenlabsApiKey || "");
setElevenlabsVoiceId(params.elevenlabsVoiceId || "");
setCharacterName(params.characterName || "美穂");
setShowCharacterName(params.showCharacterName || true);
}
const storedPreviousRoute = window.localStorage.getItem('previousRoute');
if (storedPreviousRoute) {
  setPreviousRoute(storedPreviousRoute);
  window.localStorage.removeItem('previousRoute'); // 読み取り後に削除
}
}, []);

useEffect(() => {
const params = {
systemPrompt,
koeiroParam,
chatLog,
codeLog,
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
selectVoice,
selectLanguage,
selectVoiceLanguage,
selectType,
changeEnglishToJapanese,
koeiromapKey,
voicevoxSpeaker,
googleTtsType,
youtubeMode,
youtubeApiKey,
youtubeLiveId,
conversationContinuityMode,
webSocketMode,
stylebertvits2ServerUrl,
stylebertvits2ModelId,
stylebertvits2Style,
dontShowIntroduction,
gsviTtsServerUrl,
gsviTtsModelId,
gsviTtsBatchSize,
gsviTtsSpeechRate,
characterName,
showCharacterName
};
process.nextTick(() =>
window.localStorage.setItem(
"chatVRMParams", JSON.stringify(params)
)
);
}, [
systemPrompt,
koeiroParam,
chatLog,
codeLog,
selectAIService,
selectAIModel,
openAiKey,
anthropicKey,
googleKey,
localLlmUrl,
groqKey,
difyKey,
difyUrl,
difyConversationId,
selectVoice,
selectLanguage,
selectVoiceLanguage,
changeEnglishToJapanese,
koeiromapKey,
voicevoxSpeaker,
googleTtsType,
youtubeMode,
youtubeApiKey,
youtubeLiveId,
conversationContinuityMode,
webSocketMode,
stylebertvits2ServerUrl,
stylebertvits2ModelId,
stylebertvits2Style,
dontShowIntroduction,
gsviTtsServerUrl,
gsviTtsModelId,
gsviTtsBatchSize,
gsviTtsSpeechRate,
elevenlabsApiKey,
elevenlabsVoiceId,
characterName,
showCharacterName,
selectType
]);

useEffect(() => {
const storedEnvVariables = window.localStorage.getItem("envVariables");
const currentEnvVariables = JSON.stringify({
openAiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY,
anthropicKey: process.env.NEXT_PUBLIC_ANTHROPIC_KEY,
googleKey: process.env.NEXT_PUBLIC_GOOGLE_KEY,
groqKey: process.env.NEXT_PUBLIC_GROQ_KEY,
localLlmUrl: process.env.NEXT_PUBLIC_LOCAL_LLM_URL,
difyKey: process.env.NEXT_PUBLIC_DIFY_KEY,
difyUrl: process.env.NEXT_PUBLIC_DIFY_URL,
googleTtsType: process.env.NEXT_PUBLIC_GOOGLE_TTS_TYPE,
gsviTtsServerUrl: process.env.NEXT_PUBLIC_TTS_URL,
});
if (!storedEnvVariables) {
  window.localStorage.setItem("envVariables", currentEnvVariables);
} else if (storedEnvVariables !== currentEnvVariables) {
  window.localStorage.setItem("envVariables", currentEnvVariables);
  window.localStorage.clear();
  window.location.reload();
}
}, []);

useEffect(() => {
const storedChatVRMParams = window.localStorage.getItem("chatVRMParams");
if (storedChatVRMParams) {
const params = JSON.parse(storedChatVRMParams);
  const updatedParams = {
    ...params,
gsviTtsServerUrl: process.env.NEXT_PUBLIC_TTS_URL || `http://127.0.0.1:5000/tts`,
};
window.localStorage.setItem("chatVRMParams", JSON.stringify(updatedParams));
setGSVITTSServerUrl(updatedParams.gsviTtsServerUrl);
}
}, []);

const handleChangeChatLog = useCallback(
(targetIndex: number, text: string) => {
const newChatLog = chatLog.map((v: Message, i) => {
return i === targetIndex ? { role: v.role, content: text } : v;
});
  setChatLog(newChatLog);
  if (userId) {
    saveChatLog(userId, newChatLog, startDate); // 開始日付を追加
  }
},
  [chatLog, userId, startDate]
);
const handleChangeCodeLog = useCallback(
async (targetIndex: number, text: string) => {
const newCodeLog = codeLog.map((v: Message, i) => {
return i === targetIndex ? { role: v.role, content: text } : v;
});
  setCodeLog(newCodeLog);
},
[codeLog]
);
/**

	•	WebSocketの接続をセットアップし、メッセージを処理する関数
*/
useEffect(() => {
const handleOpen = (event: Event) => {
console.log("WebSocket connection opened:", event);
};
const handleMessage = (event: MessageEvent) => {
console.log("Received message:", event.data);
const jsonData = JSON.parse(event.data);
setTmpMessages((prevMessages) => [...prevMessages, jsonData]);
};
  
const handleError = (event: Event) => {
console.error("WebSocket error:", event);
};
const handleClose = (event: Event) => {
console.log("WebSocket connection closed:", event);
};
function setupWebsocket() {
  const ws = new WebSocket("ws://localhost:8000/ws");
  ws.addEventListener("open", handleOpen);
  ws.addEventListener("message", handleMessage);
  ws.addEventListener("error", handleError);
  ws.addEventListener("close", handleClose);
  return ws;
}
let ws = setupWebsocket();
wsRef.current = ws;

const reconnectInterval = setInterval(() => {
  if (webSocketMode && ws.readyState !== WebSocket.OPEN && ws.readyState !== WebSocket.CONNECTING) {
    setChatProcessing(false);
    console.log("try reconnecting...");
    ws.close();
    ws = setupWebsocket();
    wsRef.current = ws;
  }
}, 1000);

return () => {
  clearInterval(reconnectInterval);
  ws.close();
};
},[webSocketMode]);
// WebSocketモード用の処理
const [tmpMessages, setTmpMessages] = useState<{text: string, role: string}[]>([]);

useEffect(() => {
  if (tmpMessages.length > 0 && !isVoicePlaying) {
    const message = tmpMessages[0];
    if (message.role === "assistant") { setIsVoicePlaying(true); }
    setTmpMessages((tmpMessages) => tmpMessages.slice(1));
    handleSendChat(message.text, message.role);
  }
}, [tmpMessages, isVoicePlaying, handleSendChat]);
// YouTubeコメントを取得する処理
const fetchAndProcessCommentsCallback = useCallback(async() => {
if (!openAiKey || !youtubeLiveId || !youtubeApiKey || chatProcessing || chatProcessingCount > 0) {
return;
}
await new Promise(resolve => setTimeout(resolve, 5000));
console.log("Call fetchAndProcessComments !!!");
fetchAndProcessComments(
systemPrompt,
chatLog,
selectAIService === "anthropic" ? anthropicKey : openAiKey,
selectAIService,
selectAIModel,
youtubeLiveId,
youtubeApiKey,
youtubeNextPageToken,
setYoutubeNextPageToken,
youtubeNoCommentCount,
setYoutubeNoCommentCount,
youtubeContinuationCount,
setYoutubeContinuationCount,
youtubeSleepMode,
setYoutubeSleepMode,
conversationContinuityMode,
handleSendChat,
preProcessAIResponse,
characterName,
selectType,
addGeneratedMessageToChatLog
);
}, [
openAiKey,
youtubeLiveId,
youtubeApiKey,
chatProcessing,
chatProcessingCount,
systemPrompt,
chatLog,
selectAIService,
anthropicKey,
selectAIModel,
youtubeNextPageToken,
youtubeNoCommentCount,
youtubeContinuationCount,
youtubeSleepMode,
conversationContinuityMode,
handleSendChat,
preProcessAIResponse,
characterName,
selectType,
addGeneratedMessageToChatLog
]);

useEffect(() => {
console.log("chatProcessingCount:", chatProcessingCount);
fetchAndProcessCommentsCallback();
}, [chatProcessingCount, youtubeLiveId, youtubeApiKey, conversationContinuityMode,
fetchAndProcessCommentsCallback
]);
console.log("Current conversationContinuityMode:", conversationContinuityMode);

useEffect(() => {
if (youtubeNoCommentCount < 1) return;
console.log("youtubeSleepMode:", youtubeSleepMode);
setTimeout(() => {
fetchAndProcessCommentsCallback();
}, 5000);
}, [youtubeNoCommentCount, conversationContinuityMode, fetchAndProcessCommentsCallback, youtubeSleepMode]);

const handleIntroductionClosed = useCallback(() => {
const auth = getAuth();
const unsubscribe = auth.onAuthStateChanged((user) => {
if (user) {
  setUserId(user.uid);
    let prompt;
    switch (selectType) {
      case "male":
        prompt = SYSTEM_PROMPT_B("きみ", "健一");
        setVoicevoxSpeaker("12");
        setGoogleTtsType("en-US-Standard-D");
        break;
      case "dog":
        prompt = SYSTEM_PROMPT_C("きみ", "ポチ");
        setVoicevoxSpeaker("3");
        setGoogleTtsType("en-IN-Wavenet-A");
        break;
      default:
        prompt = SYSTEM_PROMPT("きみ", "美穂");
        setVoicevoxSpeaker("2");
        setGoogleTtsType("en-US-Neural2-F");
        break;
    }
    setSystemPrompt(prompt);
    setConversationContinuityMode(false);
    if (previousRoute === "/login") {
      handleSendChat(`あなたは${characterName}という名前の${selectType === "male" ? "男性" : selectType === "dog" ? "犬" : "女性"}パートナーです。おかえり、また来てくれてありがとう！から始まる文章を出力して、あなたから会話を開始してください。`, "assistant");
    } else if (previousRoute === "/signup") {
      handleSendChat(`あなたは${characterName}という名前の${selectType === "male" ? "男性" : selectType === "dog" ? "犬" : "女性"}パートナーです。「こんにちは、${selectType === "male" ? "僕" : "私は"}${characterName}！あなたの名前は何ていうの？「〜だよ」って言う形で教えてね♪」という文章をそのまま出力して、あなたから会話を開始してください。`, "assistant");
    } else {
      handleSendChat(`あなたは${characterName}という名前の${selectType === "male" ? "男性" : selectType === "dog" ? "犬" : "女性"}パートナーです。やっほー！前も来てくれたよね？から始まる文章を出力して、あなたから会話を開始してください。`, "assistant");
    }
  } else {
    setUserId(null);
  }
});

  return () => unsubscribe();
}, [userId, previousRoute, selectType, characterName, handleSendChat]);
// WebSocket用のメッセージリストの状態管理

return (
<>
<div className={"font-M_PLUS_2"} style={{ backgroundImage: `url(${buildUrl(backgroundImageUrl)})`, backgroundSize: 'cover', minHeight: '100vh' }}>

{!dontShowIntroduction && (
<Introduction
dontShowIntroduction={dontShowIntroduction}
onChangeDontShowIntroduction={setDontShowIntroduction}
selectLanguage={selectLanguage}
setSelectLanguage={setSelectLanguage}
setSelectVoiceLanguage={setSelectVoiceLanguage}
onIntroductionClosed={handleIntroductionClosed}
systemPrompt={systemPrompt}
setSystemPrompt={setSystemPrompt}
characterName={characterName}
setCharacterName={setCharacterName}
onChangeCharacterName={(event) => setCharacterName(event.target.value)}
selectVoice={selectVoice}
setSelectVoice={setSelectVoice}
selectType={selectType}
setSelectType={setSelectType}
voicevoxSpeaker={voicevoxSpeaker}
setVoicevoxSpeaker={setVoicevoxSpeaker}
googleTtsType={googleTtsType}
setGoogleTtsType={setGoogleTtsType}
/>
)}


<Menu
selectAIService={selectAIService}
onChangeAIService={setSelectAIService}
selectAIModel={selectAIModel}
setSelectAIModel={setSelectAIModel}
userName={userName}
setUserName={setUserName}
openAiKey={openAiKey}
onChangeOpenAiKey={setOpenAiKey}
anthropicKey={anthropicKey}
onChangeAnthropicKey={setAnthropicKey}
googleKey={googleKey}
onChangeGoogleKey={setGoogleKey}
groqKey={groqKey}
onChangeGroqKey={setGroqKey}
localLlmUrl={localLlmUrl}
onChangeLocalLlmUrl={setLocalLlmUrl}
difyKey={difyKey}
onChangeDifyKey={setDifyKey}
difyUrl={difyUrl}
onChangeDifyUrl={setDifyUrl}
difyConversationId={difyConversationId}
onChangeDifyConversationId={setDifyConversationId}
systemPrompt={systemPrompt}
chatLog={chatLog}
codeLog={codeLog}
koeiroParam={koeiroParam}
assistantMessage={assistantMessage}
koeiromapKey={koeiromapKey}
voicevoxSpeaker={voicevoxSpeaker}
googleTtsType={googleTtsType}
stylebertvits2ServerUrl={stylebertvits2ServerUrl}
stylebertvits2ModelId={stylebertvits2ModelId}
stylebertvits2Style={stylebertvits2Style}
youtubeMode={youtubeMode}
youtubeApiKey={youtubeApiKey}
youtubeLiveId={youtubeLiveId}
conversationContinuityMode={conversationContinuityMode}
onChangeSystemPrompt={setSystemPrompt}
onChangeChatLog={handleChangeChatLog}
onChangeCodeLog={handleChangeCodeLog}
onChangeKoeiromapParam={setKoeiroParam}
onChangeYoutubeMode={setYoutubeMode}
onChangeYoutubeApiKey={setYoutubeApiKey}
onChangeYoutubeLiveId={setYoutubeLiveId}
onChangeConversationContinuityMode={setConversationContinuityMode}
handleClickResetChatLog={() => setChatLog([])}
handleClickResetCodeLog={() => setCodeLog([])}
handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT("きみ","美穂"))}
onChangeKoeiromapKey={setKoeiromapKey}
onChangeVoicevoxSpeaker={setVoicevoxSpeaker}
onChangeGoogleTtsType={setGoogleTtsType}
onChangeStyleBertVits2ServerUrl={setStylebertvits2ServerURL}
onChangeStyleBertVits2ModelId={setStylebertvits2ModelId}
onChangeStyleBertVits2Style={setStylebertvits2Style}
webSocketMode={webSocketMode}
changeWebSocketMode={changeWebSocketMode}
selectVoice={selectVoice}
setSelectVoice={setSelectVoice}
selectLanguage={selectLanguage}
setSelectLanguage={setSelectLanguage}
setSelectVoiceLanguage={setSelectVoiceLanguage}
changeEnglishToJapanese={changeEnglishToJapanese}
setChangeEnglishToJapanese={setChangeEnglishToJapanese}
setBackgroundImageUrl={setBackgroundImageUrl}
gsviTtsServerUrl={gsviTtsServerUrl}
onChangeGSVITtsServerUrl={setGSVITTSServerUrl}
gsviTtsModelId={gsviTtsModelId}
onChangeGSVITtsModelId={setGSVITTSModelID}
gsviTtsBatchSize={gsviTtsBatchSize}
onChangeGVITtsBatchSize={setGSVITTSBatchSize}
gsviTtsSpeechRate={gsviTtsSpeechRate}
onChangeGSVITtsSpeechRate={setGSVITTSSpeechRate}
elevenlabsApiKey={elevenlabsApiKey}
onChangeElevenlabsApiKey={setElevenlabsApiKey}
elevenlabsVoiceId={elevenlabsVoiceId}
onChangeElevenlabsVoiceId={setElevenlabsVoiceId}
showCharacterName={showCharacterName}
setSystemPrompt={setSystemPrompt}
onChangeShowCharacterName={setShowCharacterName}
characterName={characterName}
setCharacterName={setCharacterName}
onChangeCharacterName={setCharacterName}
selectType={selectType}
setSelectType={setSelectType}
setVoicevoxSpeaker={setVoicevoxSpeaker}
setGoogleTtsType={setGoogleTtsType}
      />
    </div>
  </>
);
}