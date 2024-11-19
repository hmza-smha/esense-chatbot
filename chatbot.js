let domain = "Chatbot";

async function loadScript(src, type = "text/javascript") {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = type;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadChatbot() {
  const scripts = [
    domain + "/src/services/eSenseSpeechService.js",
    domain + "/src/services/baseApiService.js",
    domain + "/src/services/chatbotService.js",
    domain + "/src/utils/audioRecorder.js",
    domain + "/src/components/chatbot.js",
    domain + "/src/common/common.js",
    domain + "/src/components/chatbotPopup.js",
    domain + "/src/utils/loadLocalization.js",
    domain + "/src/utils/appSettings.js",
    domain + "/src/components/loader.js",
    domain + "/src/utils/toastr.js",
  ];

  try {
    await Promise.all(
      scripts.map((script) =>
        typeof script === "string"
          ? loadScript(script)
          : loadScript(script.src, script.type)
      )
    );
  } catch (error) {
    console.error(error);
  }
}
