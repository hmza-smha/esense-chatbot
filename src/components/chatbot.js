let appSettings = {};

let localization = {};

let chatbotService = null;

let thread = {
  messages: null,
  id: null,
  page: 1,
  items: [],
  periods: [],
};

let imagesPath = "/assets/images/";

let icon = {
  avatar: domain + imagesPath + "chatbot-logo.svg",
  logo: domain + imagesPath + "portal.png",
  sideLogo: domain + imagesPath + "portalsidelogo.png",
};

let serviceEnum = Object.freeze({
  ChatWithAttributes: 0,
  ChatWithDocuments: 1,
  SpeechToText: 3,
});

async function applyChatbotConfig(chatbotConfigration) {
  appSettings = await getAppSettings();
  chatbotService = new ChatbotService(new ApiService(appSettings.apiUrl));
  icon = {
    avatar: chatbotConfigration.avatar ?? domain + imagesPath + "chatbot-logo.svg",
    logo: chatbotConfigration.logo ?? domain + imagesPath + "portal.png",
    sideLogo: chatbotConfigration.sideLogo ?? domain + imagesPath + "portalsidelogo.png",
  };

  await appendChatbotButton(chatbotConfigration);
}

async function appendChatbotButton(chatbotConfigration) {
  try {
    const htmlContent = await loadExternalHTML(domain + "/index.html");
    document
      .getElementById("chatbot-container")
      .insertAdjacentHTML("beforeend", htmlContent);
    localization = await getLocalization(chatbotConfigration);
    loadChatbotImages();
    setPosition(chatbotConfigration);
    setThemeColor(chatbotConfigration.themeColor);
    setThemeFont();
    setLanguageDirection(chatbotConfigration.language);
    await applyClientFeatures();
    bindThreadScrollEvent();
    checkMicrophoneAccssiblity();
  } catch (error) {
    console.error("Error loading HTML:", error);
  }
}

function setPosition(config) {
  const positionMap = {
    "bottom-right": { right: "10px", bottom: "65px" },
    "bottom-left": { left: "70px", right: "unset" },
  };
  const position = positionMap[config.position] || {};
  const chatDiv = document.querySelector("#chatbot-container #cb-mainchatdiv");
  if (chatDiv) {
    Object.assign(chatDiv.style, position);
  }
}

function setThemeFont() {
  const fontFaceRule = `
  @font-face {
      font-family: 'eSenseTajawalFlat';
      src: url('${domain}/assets/font/eSenseTajawalFlat.ttf') format('woff2'),
           url('${domain}/assets/font/eSenseTajawalFlat.ttf') format('woff');
      font-weight: normal;
      font-style: normal;
  }
`;

  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.appendChild(document.createTextNode(fontFaceRule));
  document.head.appendChild(styleElement);
}

function setThemeColor(color) {
  const defaultColor = "blue";
  document.documentElement.style.setProperty(
    "--TemplatebaseColor",
    color || defaultColor
  );
}

function setLanguageDirection(language) {
  const chatbotContainer = document.getElementById("chatbot-container");
  if (chatbotContainer) {
    chatbotContainer.classList.toggle("ltr", language === "en");
    chatbotContainer.classList.toggle("rtl", language !== "en");
  }
}

async function applyClientFeatures() {
  try {
    const info = await chatbotService.fetchChatbotInfo();
    displayServices(info.services);
    displaySuggestions(info);
    presentPopupSuggestions(info);
  } catch (error) {
    console.error("Error fetching localization data:", error);
  }
}

function displayServices(services) {
  if (services) {
    if (!services.includes(serviceEnum.ChatWithAttributes)) {
      document
        .querySelectorAll(
          '[data-target="suggestionbox1"], [data-target="popupsuggestionbox1"]'
        )
        .forEach((el) => el.remove());
    }
    if (!services.includes(serviceEnum.ChatWithDocuments)) {
      document
        .querySelectorAll(
          '[data-target="suggestionbox2"], [data-target="popupsuggestionbox2"]'
        )
        .forEach((el) => el.remove());
    }
    if (!services.includes(serviceEnum.SpeechToText)) {
      document.getElementById("chatbot-mic")?.remove();
      document.getElementById("popup-chatbot-mic")?.remove();
    }
  }
}

var toggleSuggestionBox = (suggestionBoxId) => {
  document
    .querySelectorAll(".suggestion-box ")
    .forEach((box) => (box.style.display = "none"));
  document.getElementById("cb-questions").style.display = "block";
  const suggestionBoxElement = document.querySelector(
    `[data-target="${suggestionBoxId}"]`
  );

  if (suggestionBoxElement) {
    const suggestionBoxtarget =
      suggestionBoxElement.getAttribute("data-target");

    document
      .querySelectorAll(".suggestion-box")
      .forEach((box) => (box.style.display = "none"));

    const targetBox = document.querySelector(`.${suggestionBoxtarget}`);
    if (targetBox) {
      targetBox.style.display = "flex";
    }
    document
      .querySelectorAll(".suggestion-box ")
      .forEach((box) => box.classList.remove("hide"));
    document
      .querySelectorAll(".suggestion-boxitem")
      .forEach((item) => item.classList.remove("cb-clicked-sug"));
    suggestionBoxElement.classList.add("cb-clicked-sug");
  } else {
    console.error("Suggestion box element not found:", suggestionBoxId);
  }
};

var toggleChatbotWindow = () => {
  const chatScreen = document.querySelector(".cb-chat-screen");
  chatScreen.classList.toggle("chat-screen_hidden");
  thread.id = 0;
  thread.messages = [];
  document
    .querySelectorAll("#chat-suggestions-boxes .chatbotmessage")
    .forEach((msg) => msg.remove());
  const suggestionsBoxes = document.querySelector(".suggestions-boxes");
  if (suggestionsBoxes) {
    suggestionsBoxes.style.removeProperty("display");
    suggestionsBoxes.classList.display = "block";
  }
  document
    .getElementById("chat-suggestions-boxes")
    .classList.add("cb-flex-center");
  document.getElementById("chat-input").value = "";
};

var toggleButtons = () => {
  const sideChatDiv = document.getElementById("cb-sidechatdiv");
  const mainChatDiv = document.getElementById("cb-mainchatdiv");
  sideChatDiv.classList.remove("hide");
  sideChatDiv.classList.add("chatbuttondiv");
  document
    .querySelector(".cb-chat-screen")
    .classList.remove("chat-screen_hidden");
  mainChatDiv.classList.add("hide");
};

var showMainChatbotButton = () => {
  const sideChatDiv = document.getElementById("cb-sidechatdiv");
  const mainChatDiv = document.getElementById("cb-mainchatdiv");
  sideChatDiv.classList.remove("chatbuttondiv");
  mainChatDiv.classList.remove("chatbuttondiv", "hide");
  sideChatDiv.classList.add("hide");
};

var sendMessage = () => {
  const input = document.getElementById("chat-input").value;
  if (input && input.trim().length > 0) {
    handleUserInput(input);
    document.getElementById("chat-input").value = "";
  }
};

var fillInputText = (suggestionBoxItem) => {
  const boxText = suggestionBoxItem.textContent;
  document.getElementById("chat-input").value = boxText;
  checkEnter(boxText);
};

var emptySusggestionbox = (event) => {
  if (event.target.id === "chat-suggestions-boxes") {
    document.getElementById("cb-questions").style.display = "none";
    document
      .querySelectorAll(".suggestion-boxitem")
      .forEach((item) => item.classList.remove("cb-clicked-sug"));
  }
};

function checkEnter(event) {
  const input = document.getElementById("chat-input").value.trim();
  checkChatbotInput(input, false);

  if (event.key === "Enter") {
    event.preventDefault();

    if (input.length > 0) {
      handleUserInput(input);
      document.getElementById("chat-input").value = "";
    }
  }
}

var handleUserInput = (input) => {
  addUserMessage(input);
};

var addUserMessage = async (input) => {
  try {
    document.getElementById("cb-questions").style.display = "none";
    document.querySelector(".suggestions-boxes").style.display = "none";
    document
      .getElementById("chat-suggestions-boxes")
      .classList.remove("cb-flex-center");
    document
      .getElementById("chat-suggestions-boxes")
      .insertAdjacentHTML("beforeend", createUserMessageHTML(input));

    const newMessage = {
      role: "user",
      content: input,
      isAttributesQuestion: false,
    };

    newMessage.isAttributesQuestion = isAttributesQuestion();

    thread.messages.push(newMessage);

    addBotResponseLoader();

    const aiResponse = await chatbotService.sendMessageThread(
      thread.id,
      thread.messages
    );

    if (aiResponse.error) {
      document
        .getElementById("chat-suggestions-boxes")
        .insertAdjacentHTML(
          "beforeend",
          createErrorBotResponseHTML(localization.error, true)
        );
      checkChatbotInput("", false);
      document.getElementById("cbloader").remove();
      return;
    }

    if (aiResponse.isAttributesQuestion) {
      const aiFilter = JSON.parse(aiResponse.filter);

      const apiResponse = await chatbotConfigration.getSearchResult(aiFilter);

      if (!!apiResponse?.count || apiResponse?.count === 0) {
        await chatbotService.seedAttributeResponseResult(
          aiResponse.referenceId,
          apiResponse?.count.toString(),
          aiFilter.module
        );
        aiResponse.content = localization.apiSearchResponse?.replace(
          "{0}",
          apiResponse?.count
        );
      }
    }

    thread.messages.push({
      role: aiResponse.role,
      content: aiResponse.content,
      isAttributesQuestion: aiResponse.isAttributesQuestion,
    });

    document.getElementById("cbloader").remove();
    thread.id = aiResponse.threadID;
    document
      .getElementById("chat-suggestions-boxes")
      .insertAdjacentHTML(
        "beforeend",
        createBotResponseHTML(aiResponse, false)
      );
    checkChatbotInput("", false);
  } catch (error) {
    console.error("Failed to send chat message:", error);
    document.getElementById("cbloader").remove();
  } finally {
    document.getElementById("chat-input").disabled = false;
    document.getElementById("chat-suggestions-boxes").scrollTop =
      document.getElementById("chat-suggestions-boxes").scrollHeight;
    focusChatbotInput(false);
  }
};

function displaySuggestions(response) {
  let html = "";
  const documentsSuggestions =
    response.suggestedQuestions?.documentsSuggestions;
  if (
    documentsSuggestions &&
    documentsSuggestions.every((info) => info !== null)
  ) {
    html += `<div class="suggestionbox2 suggestion-box hide">`;
    documentsSuggestions.forEach((info) => {
      html += `<div class="cb-item-sug cb-cursor-pointer" onclick="fillInputText(this)" id="cb-WordSearch">${info}</div>`;
    });
    html += `</div>`;
  }

  const attributesSuggestions =
    response.suggestedQuestions?.attributesSuggestions;
  if (
    attributesSuggestions &&
    attributesSuggestions.every((info) => info !== null)
  ) {
    html += `<div class="suggestionbox1 suggestion-box hide">`;
    attributesSuggestions.forEach((info) => {
      html += `<div class="cb-item-sug cb-cursor-pointer" onclick="fillInputText(this)" id="cb-WordSearch">${info}</div>`;
    });
    html += `</div>`;
  }

  if (html) {
    document
      .getElementById("cb-questions")
      .insertAdjacentHTML("beforeend", html);
  }
}

function hideChatbot() {
  const chatScreen = document.querySelector(".cb-chat-screen");
  chatScreen.classList.remove("chat-screen_hidden");
}

function loadChatbotImages() {
  const elements = [
    { selector: ".left-long-solid", file: "left-long-solid.svg" },
    { selector: ".cbmainclose", file: "xmark-solid.svg" },
    { selector: ".cbclose-icon", file: "xmark-solid.svg" },
    { selector: ".cbcloseblack", file: "blackxmark-solid.svg" },
    { selector: ".cbiexpandcon", file: "expand-solid.svg" },
    { selector: ".cbquestion", file: "question-solid.svg" },
    { selector: ".cbsearch", file: "magnifying-glass-solid.svg" },
    { selector: ".cbiexpandcon", file: "expand-solid.svg" },
    { selector: ".cb-popup-question", file: "question-solid.svg" },
    { selector: ".cb-popup-search", file: "magnifying-glass-solid.svg" },
    { selector: ".cb-chat-send-icon", file: "paper-plane-solid.svg" },
    { selector: ".cb-popupchat-send-icon", file: "paper-plane-solid.svg" },
    { selector: ".microphone", file: "microphone-solid.svg" },
    { selector: ".popupaudioicon", file: "microphone-solid.svg" },
    { selector: ".minimize", file: "minus-solid.svg" },
    { selector: ".plus", file: "plus-solid.svg" },
    { selector: ".bars", file: "bars-solid.svg" },
  ];
  elements.forEach(({ selector, file }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute("src", domain + imagesPath + "/" + file);
    } else {
      console.warn(`Element not found: ${selector}`);
    }
  });
}
