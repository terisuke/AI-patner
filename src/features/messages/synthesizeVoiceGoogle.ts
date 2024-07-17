export async function synthesizeVoiceGoogleApi(
  message: string,
  ttsType: string
) {
  const body = {
    message: message,
    ttsType: ttsType,
    // type: "google",
  };

  const res = await fetch("https://us-central1-aipartner-426616.cloudfunctions.net/googleTtsFunction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  // 
  return res
}
