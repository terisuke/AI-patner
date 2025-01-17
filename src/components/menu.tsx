import LogoutIcon from '@mui/icons-material/Logout';
import { getAuth, signOut } from "firebase/auth";
import React, { useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { KoeiroParam } from "../features/constants/koeiroParam";
import { Message } from "../features/messages/messages";
import { testVoice } from "../features/messages/speakCharacter";
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { AssistantText } from "./assistantText";
import { ChatLog } from "./chatLog";
import { CodeLog } from "./codeLog";
import { IconButton } from "./iconButton";
import { Settings } from "./settings";

type Props = {
  selectAIService: string;
  onChangeAIService: (service: string) => void;
  selectAIModel: string;
  setSelectAIModel: (model: string) => void;
  openAiKey: string;
  onChangeOpenAiKey: (key: string) => void;
  anthropicKey: string;
  onChangeAnthropicKey: (key: string) => void;
  googleKey: string;
  onChangeGoogleKey: (key: string) => void;
  groqKey: string;
  onChangeGroqKey: (key: string) => void;
  localLlmUrl: string;
  onChangeLocalLlmUrl: (url: string) => void;
  difyKey: string;
  onChangeDifyKey: (key: string) => void;
  difyUrl: string;
  onChangeDifyUrl: (url: string) => void;
  difyConversationId: string;
  onChangeDifyConversationId: (id: string) => void;
  systemPrompt: string;
  chatLog: Message[];
  codeLog: Message[];
  koeiroParam: KoeiroParam;
  assistantMessage: string;
  koeiromapKey: string;
  voicevoxSpeaker: string;
  googleTtsType: string;
  stylebertvits2ServerUrl: string;
  onChangeStyleBertVits2ServerUrl: (key: string) => void;
  stylebertvits2ModelId: string;
  onChangeStyleBertVits2ModelId: (key: string) => void;
  stylebertvits2Style: string;
  onChangeStyleBertVits2Style: (key: string) => void;
  youtubeMode: boolean;
  youtubeApiKey: string;
  youtubeLiveId: string;
  conversationContinuityMode: boolean;
  onChangeSystemPrompt: (systemPrompt: string) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeCodeLog: (index: number, text: string) => void;
  onChangeKoeiromapParam: (param: KoeiroParam) => void;
  handleClickResetChatLog: () => void;
  handleClickResetCodeLog: () => void;
  handleClickResetSystemPrompt: () => void;
  onChangeKoeiromapKey: (key: string) => void;
  onChangeVoicevoxSpeaker: (speaker: string) => void;
  onChangeGoogleTtsType: (key: string) => void;
  onChangeYoutubeMode: (mode: boolean) => void;
  onChangeYoutubeApiKey: (key: string) => void;
  onChangeYoutubeLiveId: (key: string) => void;
  onChangeConversationContinuityMode: (mode: boolean) => void;
  webSocketMode: boolean;
  changeWebSocketMode: (show: boolean) => void;
  selectVoice: string;
  setSelectVoice: (show: string) => void;
  selectLanguage: string;
  setSelectLanguage: (show: string) => void;
  setSelectVoiceLanguage: (show: string) => void;
  changeEnglishToJapanese: boolean;
  setChangeEnglishToJapanese: (show: boolean) => void;
  setBackgroundImageUrl: (url: string) => void;
  gsviTtsServerUrl: string;
  onChangeGSVITtsServerUrl: (name: string) => void;
  gsviTtsModelId: string;
  onChangeGSVITtsModelId: (name: string) => void;
  gsviTtsBatchSize: number;
  onChangeGVITtsBatchSize: (speed: number) => void;
  gsviTtsSpeechRate: number;
  onChangeGSVITtsSpeechRate: (speed: number) => void;
  characterName: string;
  setCharacterName: (name: string) => void;
  onChangeCharacterName: (key: string) => void;
  showCharacterName: boolean;
  onChangeShowCharacterName: (show: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  setSystemPrompt: (prompt: string) => void;
  selectType: string;
  setSelectType: (type: string) => void;
  setVoicevoxSpeaker: (speaker: string) => void;
  setGoogleTtsType: (type: string) => void;
};
export const Menu = ({
  selectAIService,
  onChangeAIService,
  selectAIModel,
  setSelectAIModel,
  userName,
  setUserName,
  openAiKey,
  onChangeOpenAiKey,
  anthropicKey,
  onChangeAnthropicKey,
  googleKey,
  onChangeGoogleKey,
  groqKey,
  onChangeGroqKey,
  localLlmUrl,
  onChangeLocalLlmUrl,
  difyKey,
  onChangeDifyKey,
  difyUrl,
  onChangeDifyUrl,
  difyConversationId,
  onChangeDifyConversationId,
  systemPrompt,
  chatLog,
  codeLog,
  koeiroParam,
  assistantMessage,
  koeiromapKey,
  voicevoxSpeaker,
  googleTtsType,
  stylebertvits2ServerUrl,
  stylebertvits2ModelId,
  stylebertvits2Style,
  youtubeMode,
  youtubeApiKey,
  youtubeLiveId,
  conversationContinuityMode,
  onChangeSystemPrompt,
  onChangeChatLog,
  onChangeCodeLog,
  onChangeKoeiromapParam,
  handleClickResetChatLog,
  handleClickResetCodeLog,
  handleClickResetSystemPrompt,
  onChangeKoeiromapKey,
  onChangeVoicevoxSpeaker,
  onChangeGoogleTtsType,
  onChangeStyleBertVits2ServerUrl,
  onChangeStyleBertVits2ModelId,
  onChangeStyleBertVits2Style,
  onChangeYoutubeMode,
  onChangeYoutubeApiKey,
  onChangeYoutubeLiveId,
  onChangeConversationContinuityMode,
  webSocketMode,
  changeWebSocketMode,
  selectVoice,
  setSelectVoice,
  selectLanguage,
  setSelectLanguage,
  setSelectVoiceLanguage,
  changeEnglishToJapanese,
  setChangeEnglishToJapanese,
  setBackgroundImageUrl,
  gsviTtsServerUrl,
  onChangeGSVITtsServerUrl,
  gsviTtsModelId,
  onChangeGSVITtsModelId,
  gsviTtsBatchSize,
  onChangeGVITtsBatchSize,
  gsviTtsSpeechRate,
  onChangeGSVITtsSpeechRate,
  characterName,
  setCharacterName,
  onChangeCharacterName,
  showCharacterName,
  onChangeShowCharacterName,
  setSystemPrompt,
  selectType,
  setSelectType,
  setVoicevoxSpeaker,
  setGoogleTtsType,
}: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const { viewer } = useContext(ViewerContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleChangeAIService = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChangeAIService(event.target.value);
      if (event.target.value !== "openai") {
        onChangeConversationContinuityMode(false);
      }
    },
    [onChangeAIService, onChangeConversationContinuityMode]
  );

  const handleChangeSystemPrompt = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeSystemPrompt(event.target.value);
    },
    [onChangeSystemPrompt]
  );

  const handleOpenAiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeOpenAiKey(event.target.value);
    },
    [onChangeOpenAiKey]
  );

  const handleAnthropicKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAnthropicKey(event.target.value);
    },
    [onChangeAnthropicKey]
  );

  const handleGoogleKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeGoogleKey(event.target.value);
    },
    [onChangeGoogleKey]
  );

  const handleGroqKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeGroqKey(event.target.value);
    },
    [onChangeGroqKey]
  );

  const handleChangeLocalLlmUrl = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeLocalLlmUrl(event.target.value);
    },
    [onChangeLocalLlmUrl]
  );

  const handleDifyKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeDifyKey(event.target.value);
    },
    [onChangeDifyKey]
  );

  const handleDifyUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeDifyUrl(event.target.value);
    },
    [onChangeDifyUrl]
  );

  const handleDifyConversationIdChange = useCallback(
    (value: string) => {
      onChangeDifyConversationId(value);
    },
    [onChangeDifyConversationId]
  );

  const handleChangeKoeiromapKey = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeKoeiromapKey(event.target.value);
    },
    [onChangeKoeiromapKey]
  );

  const handleVoicevoxSpeakerChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChangeVoicevoxSpeaker(event.target.value);
    },
    [onChangeVoicevoxSpeaker]
  );

  const handleChangeGoogleTtsType = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeGoogleTtsType(event.target.value);
    },
    [onChangeGoogleTtsType]
  );

  const handleChangeStyleBertVits2ServerUrl = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeStyleBertVits2ServerUrl(event.target.value);
    },
    [onChangeStyleBertVits2ServerUrl]
  );

  const handleChangeStyleBertVits2ModelId = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeStyleBertVits2ModelId(event.target.value);
    },
    [onChangeStyleBertVits2ModelId]
  );

  const handleChangeStyleBertVits2Style = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeStyleBertVits2Style(event.target.value);
    },
    [onChangeStyleBertVits2Style]
  );

  const handleYoutubeApiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeYoutubeApiKey(event.target.value);
    },
    [onChangeYoutubeApiKey]
  );

  const handleYoutubeLiveIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeYoutubeLiveId(event.target.value);
    },
    [onChangeYoutubeLiveId]
  );

  const handleChangeKoeiroParam = useCallback(
    (x: number, y: number) => {
      onChangeKoeiromapParam({
        speakerX: x,
        speakerY: y,
      });
    },
    [onChangeKoeiromapParam]
  );

  const handleWebSocketMode = useCallback(
    (show: boolean) => {
      changeWebSocketMode(show);
      if (webSocketMode) {
        onChangeYoutubeMode(false);
      }
    },
    [changeWebSocketMode, webSocketMode, onChangeYoutubeMode]
  );

  const handleConversationContinuityMode = useCallback(
    (show: boolean) => {
      onChangeConversationContinuityMode(show);
    },
    [onChangeConversationContinuityMode]
  );

  const handleClickOpenVrmFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClickOpenBgFile = useCallback(() => {
    bgFileInputRef.current?.click();
  }, []);

  const handleClickTestVoice = (speaker: string) => {
    testVoice(viewer, speaker);
  };

  const handleChangeVrmFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const file = files[0];
      if (!file) return;

      const file_type = file.name.split(".").pop();

      if (file_type === "vrm") {
        const blob = new Blob([file], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        viewer.loadVrm(url);
      }

      event.target.value = "";
    },
    [viewer]
  );

  const handleChangeBgFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setBackgroundImageUrl(imageUrl);
      }
    },
    [setBackgroundImageUrl]
  );

  const handleChangeGSVITtsServerUrl = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeGSVITtsServerUrl(event.target.value);
    },
    [onChangeGSVITtsServerUrl]
  );

  const handleChangeGSVITtsModelId = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeGSVITtsModelId(event.target.value);
    },
    [onChangeGSVITtsModelId]
  );

  const handleChangeGSVITtsBatchSize = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeGVITtsBatchSize(parseFloat(event.target.value));
    },
    [onChangeGVITtsBatchSize]
  );

  const handleChangeGSVITtsSpeechRate = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeGSVITtsSpeechRate(parseFloat(event.target.value));
    },
    [onChangeGSVITtsSpeechRate]
  );

    const handleLogout = useCallback(() => {
    const auth = getAuth();
    signOut(auth).then(() => {
      // ログアウト成功時の処理（例：ログインページにリダイレクト）
      window.location.href = "/login";
    }).catch((error) => {
      // エラーハンドリング
      console.error("Logout error:", error);
    });
  }, []);

  const handleCharacterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeCharacterName(event.target.value);
    },
    [onChangeCharacterName]
  );

  const handleShowCharacterName = useCallback(
    (show: boolean) => {
      onChangeShowCharacterName(show);
    },
    [onChangeShowCharacterName]
  );

  return (
    <>
      <div className="absolute z-10 m-24">
        <div className="grid grid-flow-col gap-[8px]">
          <IconButton
            iconName="24/Settings"
            isProcessing={false}
            onClick={() => setShowSettings(true)}
          ></IconButton>
          {showChatLog ? (
            <IconButton
              iconName="24/CommentOutline"
              label={webSocketMode ? t('CodeLog') : t('ChatLog')}
              isProcessing={false}
              onClick={() => setShowChatLog(false)}
            />
          ) : (
            <IconButton
              iconName="24/CommentFill"
              label={webSocketMode ? t('CodeLog') : t('ChatLog')}
              isProcessing={false}
              disabled={chatLog.length <= 0}
              onClick={() => setShowChatLog(true)}
            />
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 m-24">
        <IconButton
          iconName="24/Logout"
          customIcon={<LogoutIcon />} // LogoutIconを使用
          isProcessing={false}
          onClick={handleLogout} // ログアウト関数を呼び出す
          label={t('Logout')}
        />
      </div>
      {
        webSocketMode ? 
          (showChatLog && <CodeLog messages={codeLog} />) :
          (showChatLog && <ChatLog messages={chatLog} characterName={characterName} />)
      }
      {showSettings && (
        <Settings
          selectAIService={selectAIService}
          onChangeAIService={handleChangeAIService}
          selectAIModel={selectAIModel}
          setSelectAIModel={setSelectAIModel}
          userName={userName}
          setUserName={setUserName}
          setSystemPrompt={setSystemPrompt}
          openAiKey={openAiKey}
          onChangeOpenAiKey={handleOpenAiKeyChange}
          anthropicKey={anthropicKey}
          onChangeAnthropicKey={handleAnthropicKeyChange}
          googleKey={googleKey}
          onChangeGoogleKey={handleGoogleKeyChange}
          groqKey={groqKey}
          onChangeGroqKey={handleGroqKeyChange}
          difyKey={difyKey}
          onChangeDifyKey={handleDifyKeyChange}
          localLlmUrl={localLlmUrl}
          onChangeLocalLlmUrl={handleChangeLocalLlmUrl}
          difyUrl={difyUrl}
          onChangeDifyUrl={handleDifyUrlChange}
          difyConversationId={difyConversationId}
          onChangeDifyConversationId={handleDifyConversationIdChange}
          chatLog={chatLog}
          codeLog={codeLog}
          systemPrompt={systemPrompt}
          koeiroParam={koeiroParam}
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
          onClickClose={() => setShowSettings(false)}
          onChangeSystemPrompt={handleChangeSystemPrompt}
          onChangeChatLog={onChangeChatLog}
          onChangeCodeLog={onChangeCodeLog}
          onChangeKoeiroParam={handleChangeKoeiroParam}
          onClickOpenVrmFile={handleClickOpenVrmFile}
          onClickOpenBgFile={handleClickOpenBgFile}
          onClickResetChatLog={handleClickResetChatLog}
          onClickResetCodeLog={handleClickResetCodeLog}
          onClickResetSystemPrompt={handleClickResetSystemPrompt}
          onChangeKoeiromapKey={handleChangeKoeiromapKey}
          onChangeVoicevoxSpeaker={handleVoicevoxSpeakerChange}
          onChangeGoogleTtsType={handleChangeGoogleTtsType}
          onChangeStyleBertVits2ServerUrl={handleChangeStyleBertVits2ServerUrl}
          onChangeStyleBertVits2ModelId={handleChangeStyleBertVits2ModelId}
          onChangeStyleBertVits2Style={handleChangeStyleBertVits2Style}
          onChangeYoutubeMode={onChangeYoutubeMode}
          onChangeYoutubeApiKey={handleYoutubeApiKeyChange}
          onChangeYoutubeLiveId={handleYoutubeLiveIdChange}
          onChangeConversationContinuityMode={handleConversationContinuityMode}
          webSocketMode={webSocketMode}
          onChangeWebSocketMode={handleWebSocketMode}
          selectVoice = {selectVoice}
          setSelectVoice = {setSelectVoice}
          selectLanguage = {selectLanguage}
          setSelectLanguage = {setSelectLanguage}
          setSelectVoiceLanguage = {setSelectVoiceLanguage}
          changeEnglishToJapanese={changeEnglishToJapanese}
          setChangeEnglishToJapanese={setChangeEnglishToJapanese}
          onClickTestVoice={handleClickTestVoice}
          gsviTtsServerUrl={gsviTtsServerUrl}
          onChangeGSVITtsServerUrl={handleChangeGSVITtsServerUrl}
          gsviTtsModelId={gsviTtsModelId}
          onChangeGSVITtsModelId={handleChangeGSVITtsModelId}
          gsviTtsBatchSize={gsviTtsBatchSize}
          onChangeGVITtsBatchSize={handleChangeGSVITtsBatchSize}
          gsviTtsSpeechRate={gsviTtsSpeechRate}
          onChangeGSVITtsSpeechRate={handleChangeGSVITtsSpeechRate}
          characterName={characterName}
          setCharacterName={setCharacterName}
          onChangeCharacterName={handleCharacterName}
          showCharacterName={showCharacterName}
          onChangeShowCharacterName={handleShowCharacterName}
          selectType={selectType}
          setSelectType={setSelectType}
          setVoicevoxSpeaker={setVoicevoxSpeaker}
          setGoogleTtsType={setGoogleTtsType}
        />
      )}
      {!showChatLog && assistantMessage && (
        <AssistantText message={assistantMessage} characterName={characterName} showCharacterName ={showCharacterName} />
      )}
      <input
        type="file"
        className="hidden"
        accept=".vrm"
        ref={fileInputRef}
        onChange={handleChangeVrmFile}
      />
      <input
        type="file"
        className="hidden"
        accept="image/*"
        ref={bgFileInputRef}
        onChange={handleChangeBgFile}
      />
    </>
  );
};
