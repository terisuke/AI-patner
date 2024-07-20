import { useState, useCallback, useEffect } from "react";
import { Link } from "./link";
import { IconButton } from "./iconButton";
import i18n from "i18next";
import { useTranslation, Trans } from 'react-i18next';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_B, SYSTEM_PROMPT_C } from "../features/constants/systemPromptConstants";

type Props = {
  dontShowIntroduction: boolean;
  onChangeDontShowIntroduction: (dontShowIntroduction: boolean) => void;
  selectLanguage: string;
  setSelectLanguage: (show: string) => void;
  setSelectVoiceLanguage: (show: string) => void;
  onIntroductionClosed: () => void; // 追加
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  characterName: string;
  setCharacterName: (name: string) => void;
  onChangeCharacterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectVoice: string;
  setSelectVoice: (show: string) => void;
};

export const Introduction = ({
  // dontShowIntroduction,
  // onChangeDontShowIntroduction,
  selectLanguage,
  setSelectLanguage,
  setSelectVoiceLanguage,
  onIntroductionClosed,// 追加
  characterName,
  setCharacterName,
  setSystemPrompt,
  selectVoice,
  setSelectVoice,
}: Props) => {
  const [opened, setOpened] = useState(true);

  // const handleDontShowIntroductionChange = useCallback(
  //   (event: React.ChangeEvent<HTMLInputElement>) => {
  //     onChangeDontShowIntroduction(event.target.checked);
  //     updateLanguage();
  //   },
  //   [onChangeDontShowIntroduction]
  // );

  // キャラクター名を更新する関数
  const onChangeCharacterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCharacterName = event.target.value;
    setCharacterName(newCharacterName);
    setSystemPrompt(SYSTEM_PROMPT(newCharacterName));
  };

  const { t } = useTranslation();

    useEffect(() => {
    const storedData = window.localStorage.getItem('chatVRMParams');
    if (storedData) {
      const params = JSON.parse(storedData);
      if (params.selectLanguage) {
        setSelectLanguage(params.selectLanguage);
      }
    }
  }, [setSelectLanguage]);

  const updateLanguage = () => {
    let languageCode = i18n.language.toUpperCase();
    if (languageCode === "JA") {
      languageCode = "JP";
    }
    setSelectLanguage(languageCode);
    setSelectVoiceLanguage(getVoiceLanguageCode(languageCode));
  }

  const getVoiceLanguageCode = (selectLanguage: string) => {
    switch (selectLanguage) {
      case 'JP':
        return 'ja-JP';
      case 'EN':
        return 'en-US';
      case 'ZH':
        return 'zh-TW';
      case 'zh-TW':
        return 'zh-TW';
      case 'KO':
        return 'ko-KR';
      default:
        return 'ja-JP';
    }
  }

  useEffect(() => {
    if (!opened) {
      onIntroductionClosed();
    }
  }, [opened, onIntroductionClosed]);

  return opened ? (
    <div className="absolute z-40 w-full h-full px-24 py-40 bg-black/30 font-M_PLUS_2">
      <div className="relative mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
      <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={() => {
            setOpened(false);
            updateLanguage();
          }}
          className="absolute top-8 right-8 bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white"
        ></IconButton>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary ">
            {t('AboutThisApplication')}
          </div>
          <div>
            <Trans i18nKey="AboutThisApplicationDescription" />
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            {t('TechnologyIntroduction')}
          </div>
          <div>
            <Trans i18nKey="TechnologyIntroductionDescription1" components={{ b: <b /> }} />
            <Link
              url={
                "https://github.com/pixiv/ChatVRM"
              }
              label={t('TechnologyIntroductionLink1')}
            />
            {t('TechnologyIntroductionDescription2')}
          </div>
          <div className="my-16">
            {t('TechnologyIntroductionDescription3')}
            <Link
              url={"https://github.com/pixiv/three-vrm"}
              label={"@pixiv/three-vrm"}
            />
            {t('TechnologyIntroductionDescription4')}
            <Link
              url={
                "https://openai.com/blog/introducing-chatgpt-and-whisper-apis"
              }
              label={"OpenAI API"}
            />
            {t('TechnologyIntroductionDescription5')}
            <Link url={"https://developers.rinna.co.jp/product/#product=koeiromap-free"} label={"Koemotion"} />
            {t('TechnologyIntroductionDescription6')}
            <Link
              url={"https://note.com/nike_cha_n/n/ne98acb25e00f"}
              label={t('TechnologyIntroductionLink2')}
            />
            {t('TechnologyIntroductionDescription7')}
          </div>
          <div className="my-16">
            {t('SourceCodeDescription1')}
            <br />
            {t('RepositoryURL')}<span> </span>
            <Link
              url={"https://github.com/terisuke/AI-patner"}
              label={"https://github.com/terisuke/AI-patner"}
            />
          </div>
        </div>

        {/* dontShowIntroductionのチェックボックスを表示 */}
        {/* <div className="my-24">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={dontShowIntroduction}
              onChange={handleDontShowIntroductionChange}
              className="mr-8"
            />
            <span>{t('DontShowIntroductionNextTime')}</span>
          </label>
        </div> */}
        <div className="my-8 font-bold typography-20 text-secondary ">
          {t('Initial settings')}
        </div>
          {/* キャラクター名の設定 */}
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">
              {t('CharacterName')}
            </div>
            <input
              className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface3 hover:bg-surface3-hover rounded-8"
              type="text"
              placeholder={t('CharacterName')}
              value={characterName}
              onChange={onChangeCharacterName}
            />
          </div>
          {/* 言語設定 */}
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">
              {t('Language')}
            </div>
            <div className="my-8">
              <select
                className="px-16 py-8 bg-surface3 hover:bg-surface3-hover rounded-8"
                value={selectLanguage}
                onChange={(e) => {
                  const newLanguage = e.target.value;
                  switch (newLanguage) {
                    case "JP":
                      setSelectLanguage("JP");
                      setSelectVoiceLanguage("ja-JP");
                      i18n.changeLanguage('ja');
                      break;
                    case "EN":
                      setSelectLanguage("EN");
                      if (selectVoice === "voicevox" || selectVoice === "koeiromap") {
                        setSelectVoice("google");
                      }
                      setSelectVoiceLanguage("en-US");
                      i18n.changeLanguage('en');
                      break;
                    case "ZH":
                      setSelectLanguage("ZH");
                      if (selectVoice === "voicevox" || selectVoice === "koeiromap") {
                        setSelectVoice("google");
                      }
                      setSelectVoiceLanguage("zh-TW");
                      i18n.changeLanguage('zh-TW');
                      break;
                    case "KO":
                      setSelectLanguage("KO");
                      if (selectVoice === "voicevox" || selectVoice === "koeiromap") {
                        setSelectVoice("google");
                      }
                      setSelectVoiceLanguage("ko-KR");
                      i18n.changeLanguage('ko');
                      break;
                    default:
                      break;  // Optionally handle unexpected values
                  }
                }}
              >
                <option value="JP">日本語 - Japanese</option>
                <option value="EN">英語 - English</option>
                <option value="ZH">繁體中文 - Traditional Chinese</option>
                <option value="KO">韓語 - Korean</option>
              </select>
            </div>
          </div>
        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
              updateLanguage();
            }}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
          >
           {t('Close')}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
