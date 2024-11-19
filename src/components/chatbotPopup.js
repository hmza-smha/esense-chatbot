function toggleSuggestionPopupBoxes(e) {
    document
        .querySelectorAll(".popupsuggestion-box")
        .forEach((box) => box.classList.add("hide"));
    document.getElementById("cb-PopUpquestions").style.display = "flex";
    var target = e.dataset.target;

    document.querySelectorAll(`.${target}`).forEach((box) => {
        box.classList.remove("hide");
        box.style.display = "flex";
    });

    document
        .querySelectorAll(".popupsuggestion-boxitem")
        .forEach((item) => item.classList.remove("cb-clicked-sug"));
    e.classList.add("cb-clicked-sug");
}

async function minimizePopup() {
    document.querySelector(".cb-chatbot-popup-container").classList.add("hide");
    document
        .querySelector(".cb-chat-screen")
        .classList.toggle("chat-screen_hidden");
    document.querySelectorAll(".chatbotmessage").forEach((box) => box.remove());

    if (thread.id) {
        document
            .querySelectorAll(".suggestions-boxes")
            .forEach((box) => (box.style.display = "none"));
        document
            .getElementById("chat-suggestions-boxes")
            .classList.remove("cb-flex-center");
        document.getElementById("cb-questions").style.display = "none";

        try {
            const messages = (
                await chatbotService.fetchConversationsHistory(thread.id, 1)
            ).messages;
            
            messages.forEach((e) => {
                if (e.role === "user") {
                    document
                        .getElementById("chat-suggestions-boxes")
                        .insertAdjacentHTML("beforeend", createUserMessageHTML(e));
                } else {
                    document
                        .getElementById("chat-suggestions-boxes")
                        .insertAdjacentHTML("beforeend", createBotResponseHTML(e, false));
                }
            });

            document.getElementById("chat-suggestions-boxes").scrollTop =
                document.getElementById("chat-suggestions-boxes").scrollHeight;
            var inputText = document.getElementById("chat-input").value;
            checkChatbotInput(inputText);
            thread.page = 1;
        } catch (error) {
            console.error("Failed to fetch conversations history:", error);
        }
    } else {
        document
            .querySelectorAll(".suggestions-boxes")
            .forEach((box) => (box.style.display = "flex"));
        document
            .getElementById("chat-suggestions-boxes")
            .classList.add("cb-flex-center");
    }
}

async function closePopup() {
    thread.id = 0;
    thread.messages = [];
    document.getElementById("overlay").classList.remove("darkoverlay");
    document.querySelector(".cb-chatbot-popup-container").classList.add("hide");
    document
        .querySelectorAll(".chatbotmessage")
        .forEach((msg) => (msg.innerHTML = ""));
    const chatCard = document.querySelector(
        ".cb-right-content-chat-history-card"
    );
    if (chatCard) {
        chatCard.classList.remove("isThreadActive");
    }
    document.getElementById("cb-questions").style.display = "block";
    document.getElementById("Popupchat-input").value = "";
    thread.page = 1;
}

function slideSideMenu() {
    document.querySelector(".cb-right-content").classList.toggle("shrink");
    document.getElementById("threadItems").classList.toggle("hide");
    document
        .getElementById("add-more-chat")
        .querySelector("span")
        .classList.toggle("hide");
}

function toggleThreadDropdownItems(e) {
    var allMenus = document.querySelectorAll(".cb-dropdown-menu");
    allMenus.forEach((menu) => {
        if (
            menu !== e.closest(".cb-btn-group").querySelector(".cb-dropdown-menu")
        ) {
            menu.classList.remove("open", "show");
            menu.style.display = "none";
        }
    });
    var targetMenu = e
        .closest(".cb-btn-group")
        .querySelector(".cb-dropdown-menu");
    if (targetMenu.classList.contains("open")) {
        targetMenu.classList.remove("open", "show");
        targetMenu.style.display = "none";
    } else {
        targetMenu.classList.add("open", "show");
        targetMenu.style.display = "block";
    }
}

async function showChatbotPopup() {
    document
        .querySelector(".cb-chatbot-popup-container")
        .classList.remove("hide");
    document.getElementById("overlay").classList.remove("overlay");
    document.getElementById("overlay").classList.add("darkoverlay");
    document
        .querySelector(".cb-chat-screen")
        .classList.toggle("chat-screen_hidden");
    document.getElementById("threadItems").innerHTML = "";
    thread.items = [];
    thread.periods = [];

    await chatbotService.getConversationHistory(0, 1);
    displayThreadItems();

    if (thread.id === 0 || thread.id === undefined) {
        document
            .getElementById("leftchatbox")
            .classList.remove("cb-left-content-body-chat");
        document
            .getElementById("leftchatbox")
            .classList.add("cb-left-content-body");
        document.body.classList.add("no-scroll");
        document.getElementById("popupmessages").style.display = "none";
        const suggestionBoxes = document.querySelectorAll(
            ".popup-suggestions-boxes"
        );
        suggestionBoxes.forEach(function (suggestionBox) {
            suggestionBox.classList.remove("hide");
        });
        document.getElementById("cb-PopUpquestions").style.display = "none";
        const chatbotMessageElement = document.querySelector(
            "#leftchatbox .chatbotmessage"
        );
        if (chatbotMessageElement) {
            chatbotMessageElement.innerHTML = "";
        }
    } else {
        document.querySelector(`h5[data-id="${thread.id}"]`)?.click();
    }
}

function addLoaderToChat(containerId, botResponse) {
    document
        .getElementById(containerId)
        .children[0].insertAdjacentHTML("beforeend", createLoaderHTML());
    setTimeout(() => {
        document.getElementById("cbloader").remove();
        document
            .getElementById(containerId)
            .children[0].insertAdjacentHTML(
                "beforeend",
                createBotResponseHTML(botResponse, true)
            );
    }, 3000);
}

function addBotPopupResponseLoader() {
    document
        .getElementById("popupmessages")
        .insertAdjacentHTML("beforeend", createLoaderHTML(false, true));
    document.getElementById("Popupchat-input").disabled = true;
    document.getElementById("popupmessages").scrollTop =
        document.getElementById("popupmessages").scrollHeight;
}

function displayBotResponse(response) {
    document.getElementById("cb-PopUpquestions").style.display = "none";
    document.getElementById("grid").classList.add("cb-chat-screen-container");
    document
        .getElementById("popupmessages")
        .insertAdjacentHTML("beforeend", createBotResponseHTML(response, true));
}

function resetChatInterface() {
    document
        .getElementById("leftchatbox")
        .classList.remove("cb-left-content-body-chat");
    document.getElementById("leftchatbox").classList.add("cb-left-content-body");
    document.getElementById("popupmessages").innerHTML = "";
    const cardElement = document.querySelector(
        ".cb-right-content-chat-history-card"
    );
    if (cardElement) {
        cardElement.classList.remove("isThreadActive");
    }
    document
        .querySelectorAll(".chatmessages")
        .forEach((chat) => chat.classList.add("hide"));
    document
        .querySelectorAll(".popupsuggestion-box")
        .forEach((box) => (box.style.display = "none"));
    document.getElementById("popup-suggestions-boxes").classList.remove("hide");
}

function deleteThread(threadId, period) {
    var threadIds = [threadId];

    chatbotService
        .deleteThread(threadIds)
        .then(() => {
            thread.items.periods[period] = thread.items.periods[period].filter(
                (thread) => thread.threadID !== threadId
            );
            var dropdownDivs = document.querySelectorAll(".cb-dropdown-menu");
            dropdownDivs.forEach(function (div) {
                div.style.display = "none";
            });
            displayThreadItems();
        })
        .catch((error) => {
            console.error("Error deleting thread:", error);
        });
}

function onRenameClick(threadId, element) {
    document.querySelectorAll(".plan-input").forEach((input) => input.remove());
    element.parentElement.removeAttribute("style");
    const threadContainer = element.closest(
        ".cb-right-content-chat-history-card"
    );
    const threadTitle = threadContainer.querySelector("h5");
    if (threadTitle) {
        threadTitle.style.display = "none";
    }
    let threadName = element
        .closest(".cb-right-content-chat-history-card")
        .querySelector("h5")
        .textContent.trim();
    let inputField = document.createElement("input");
    inputField.type = "text";
    inputField.classList.add("cb-flexi-1", "plan-input");
    var dropdownDivs = document.querySelectorAll(".cb-dropdown-menu");
    dropdownDivs.forEach(function (div) {
        div.classList.remove("open", "show");
    });
    inputField.addEventListener("keypress", function (event) {
        handleKeyPress(threadId, event, inputField);
    });
    inputField.addEventListener("focusout", function () {
        handleFocusOut(threadId, inputField);
    });
    inputField.value = threadName;
    element
        .closest(".cb-right-content-chat-history-card")
        .querySelector("h5")
        .before(inputField);
    inputField.focus();
}

async function handleKeyPress(threadId, event, inputField) {
    if (event.key === "Enter") {
        renameThread(threadId, inputField);
    }
}

async function handleFocusOut(threadId, inputField) {
    renameThread(threadId, inputField);
}

async function renameThread(threadId, inputField) {
    let newThreadName = inputField.value.trim();
    try {
        if (newThreadName !== "") {
            await chatbotService.renameThread(threadId, newThreadName);
            const threadCardElement = inputField.closest(
                ".cb-right-content-chat-history-card"
            );
            if (!threadCardElement) {
                return;
            }
            const threadTitleElement = threadCardElement.querySelector("h5");
            if (!threadTitleElement) {
                return;
            }
            threadTitleElement.textContent = newThreadName;
            threadTitleElement.style.display = "block";
        }
    } catch (error) {
        console.error("Error renaming thread:", error);
    }
    document.querySelectorAll(".plan-input").forEach((input) => input.remove());
}

function onUserInput(event) {
    var inputText = document.getElementById("Popupchat-input").value;
    checkChatbotInput(inputText, true);

    if (event.key === "Enter") {
        event.preventDefault();

        if (inputText && inputText.trim().length > 0) {
            createPopupChatMessage(inputText);
            document.getElementById("Popupchat-input").value = "";
        }
    }
}

function fillPopupInputText(element) {
    var suggestionText = element.textContent;
    document.getElementById("Popupchat-input").value = suggestionText;
    checkChatbotInput(suggestionText, true);
}

function emptyPopupSusggestionbox(event) {
    if (event.target.id === "leftchatbox") {
        document.getElementById("cb-PopUpquestions").style.display = "none";
        document
            .querySelectorAll(".popupsuggestion-boxitem")
            .forEach((item) => item.classList.remove("cb-clicked-sug"));
    }
}

function onThreadClick(element) {
    var threadId = element.dataset.id;
    var activeElement = document.querySelector(`h5[data-id="${threadId}"]`);
    activeElement.parentElement.classList.add("isThreadActive");
    thread.id = threadId;
    resetChatInterface();
    document.getElementById("popup-suggestions-boxes").classList.add("hide");
    document.getElementById("popupmessages").style.display = "block";
    document.querySelector(".cb-dropdown-menu").removeAttribute("style");
    document.querySelector(".cb-dropdown-menu").classList.remove("show");
    document.querySelector(".cb-dropdown-menu").classList.remove("open");
    displayThreadMessages(element, threadId);
    document
        .querySelectorAll(".cb-btn-group")
        .forEach((group) => group.classList.remove("show"));
    document
        .querySelectorAll(".cb-right-content-chat-history-card")
        .forEach((card) => card.classList.add("tabdisabled"));
    document
        .getElementById("Popupchat-input")
        .setAttribute("placeholder", localization.chatText);
}

async function createPopupChatMessage(message) {
    let chatMessage = {
        role: "user",
        content: message,
        isAttributesQuestion: false,
    };

    chatMessage.isAttributesQuestion = isAttributesQuestion(true);

    const chatHistoryCard = document.querySelector(
        ".cb-right-content-chat-history-card"
    );

    if (chatHistoryCard) {
        document
            .querySelector(".cb-right-content-chat-history-card")
            .classList.add("tabdisabled");
    }

    let messages = thread.messages || [];

    document
        .getElementById("popupmessages")
        .insertAdjacentHTML("beforeend", createUserMessageHTML(message));
    document
        .getElementById("leftchatbox")
        .classList.add("cb-left-content-body-chat");
    document
        .getElementById("leftchatbox")
        .classList.remove("cb-left-content-body");
    document.getElementById("popup-suggestions-boxes").classList.add("hide");
    document.getElementById("cb-PopUpquestions").style.display = "none";
    addBotPopupResponseLoader();
    messages.push(chatMessage);
    document.getElementById("popupmessages").style.display = "block";

    document.getElementById("add-more-chat").disabled = true;

    let aiResponse = await chatbotService.sendMessageThread(thread.id, messages);

    document.getElementById("add-more-chat").disabled = false;

    if (aiResponse.error) {
        document.getElementById("cbloader").remove();
        document.getElementById("Popupchat-input").disabled = false;
        focusChatbotInput(true);
        document.getElementById("popupmessages").scrollTop =
            document.getElementById("popupmessages").scrollHeight;
        document
            .getElementById("popupmessages")
            .insertAdjacentHTML(
                "beforeend",
                createErrorBotResponseHTML(localization.error, true)
            );
        document
            .querySelector(".cb-right-content-chat-history-card")
            .classList.remove("tabdisabled");
        return;
    }

    if (aiResponse.threadName) {
        thread.items.periods[thread.periods[0]].unshift({
            name: aiResponse.threadName,
            threadID: aiResponse.threadID,
        });
        thread.id = aiResponse.threadID + "";
        displayThreadItems();
        document
            .querySelector(".cb-right-content-chat-history-card")
            .classList.add("isThreadActive");
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

    messages.push({
        role: aiResponse.role,
        content: aiResponse.content,
        isAttributesQuestion: aiResponse.isAttributesQuestion,
    });

    displayBotResponse(aiResponse);

    checkChatbotInput("", true);
    thread.id = aiResponse.threadID;
    document.getElementById("cbloader").remove();
    document.getElementById("Popupchat-input").disabled = false;
    focusChatbotInput(true);
    document
        .querySelector(`div[data-id='${thread.id}']`)
        .classList.add("isThreadActive");
    document.getElementById("popupmessages").scrollTop =
        document.getElementById("popupmessages").scrollHeight;
    document
        .querySelector(".cb-right-content-chat-history-card")
        .classList.remove("tabdisabled");
}

async function startNewConversation() {
    thread.id = 0;
    thread.messages = [];
    document.getElementById("Popupchat-input").value = "";
    resetChatInterface();
    document.getElementById("popupmessages").style.display = "block";
    document.getElementById("popup-suggestions-boxes").style.display = "flex";
    document
        .getElementById("leftchatbox")
        .classList.remove("cb-left-content-body-chat");
    document.getElementById("leftchatbox").classList.add("cb-left-content-body");
    document
        .querySelectorAll(".popupsuggestion-boxitem")
        .forEach((item) => item.classList.remove("cb-clicked-sug"));
}

function displayThreadItems() {
    document.getElementById("threadItems").innerHTML = "";
    let threadHtml = "";
    Object.entries(thread.items.periods || {}).forEach(
        ([period, threadItems]) => {
            if (threadItems.length > 0) {
                let threadLabel = period.replace(/\s+/g, "-");
                let threadDiv = document.getElementById(threadLabel);
                let threadIds = [];
                threadHtml += `<label>${period}</label>`;

                if (threadDiv) {
                    threadIds = Array.from(threadDiv.querySelectorAll("[data-id]")).map(
                        function () {
                            return this.dataset.id;
                        }
                    );
                }
                threadItems.forEach((thread) => {
                    if (!threadIds.includes(thread.threadID)) {
                        threadHtml += `
                    <div class="cb-right-content-chat-history-card cb-cursor-pointer ${thread.threadID == thread.id ? "isThreadActive" : ""
                            }" data-id="${thread.threadID}" style="text-align:${chatbotConfigration.language === "ar" ? "right" : "left"
                            }">
                        <svg class="cbicon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" onclick="onThreadClick(this)" data-id="${thread.threadID
                            }">
                            <path d="M64 0C28.7 0 0 28.7 0 64L0 352c0 35.3 28.7 64 64 64l96 0 0 80c0 6.1 3.4 11.6 8.8 14.3s11.9 2.1 16.8-1.5L309.3 416 448 416c35.3 0 64-28.7 64-64l0-288c0-35.3-28.7-64-64-64L64 0z"/>
                        </svg>   
                        <h5 class="cb-flexi-1" onclick="onThreadClick(this)" data-id="${thread.threadID
                            }">
                            <bdi>${thread.name}</bdi>
                        </h5>
                        <div class="cb-btn-group actions">
                            <button id="chat-bot-actions" dropdowntoggle="" aria-controls="dropdown-basic" class="btn btn-clean dropdown-toggle remove-padding" aria-haspopup="true" aria-expanded="false">
                                <svg class="cbellipsisicon cursor-pointer" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" onclick="toggleThreadDropdownItems(this)">
                                    <path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/>
                                </svg>      
                            </button>
                            <ul id="dropdown-basic" role="menu" class="cb-dropdown-menu cb-dropdown-menu-styleone menu_left_minus5 dropdown-arrow">
                                <li class="pointer" onclick="onRenameClick(${thread.threadID
                            }, this)">
                                    <a id="chat-bot-edit">
                                        <svg height="14" width="14" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="#000000" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
                                        </svg>
                                        ${localization.rename}
                                    </a>
                                </li>
                                <li class="pointer" onclick="deleteThread(${thread.threadID
                            }, '${period}')">
                                    <a id="chat-bot-delete">
                                        <svg height="14" width="12.25" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="#e10000" d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                                        </svg>
                                        ${localization.delete}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>`;
                    }
                });
            }
        }
    );

    document
        .getElementById("threadItems")
        .insertAdjacentHTML("beforeend", threadHtml);
    fillSvgColors();
}

function fillSvgColors() {
    document.querySelectorAll("#chatbot-container svg").forEach((svg) => {
        const path = svg.querySelector("path");
        if (path) {
            path.setAttribute("fill", chatbotConfigration.themeColor);
        }
    });
}

const displayThreadMessages = (element, threadId) => {
    document
        .querySelectorAll(".cb-right-content-chat-history-card")
        .forEach((card) => card.classList.remove("isThreadActive"));
    document
        .querySelector(`h5[data-id="${threadId}"]`)
        .parentElement.classList.add("isThreadActive");

    let popupMessagesDiv = document.getElementById("popupmessages");
    popupMessagesDiv.insertAdjacentHTML("beforeend", createLoaderHTML(true));

    document
        .getElementById("leftchatbox")
        .classList.remove("cb-left-content-body-chat");
    document.getElementById("leftchatbox").classList.add("cb-left-content-body");
    document
        .querySelectorAll(".cb-right-content-chat-history-card")
        .forEach((card) => card.classList.add("tabdisabled"));

    chatbotService
        .fetchConversationsHistory(threadId, 1)
        .then((response) => {
            thread.messages = response.messages;
            let messagesHtml =
                '<div class="cb-flexi-1 overflow-x-hidden overflow-y-auto">';

            thread.messages.forEach((message) => {
                if (message.role === "user") {
                    messagesHtml += createUserMessageHTML(message);
                } else {
                    messagesHtml += createBotResponseHTML(message, true);
                }
            });

            messagesHtml += "</div>";
            popupMessagesDiv.innerHTML = messagesHtml;
            popupMessagesDiv.scrollTop = popupMessagesDiv.scrollHeight;
        })
        .catch((error) => {
            console.error("Failed to fetch conversations:", error);
        })
        .finally(() => {
            document
                .getElementById("leftchatbox")
                .classList.remove("cb-left-content-body");
            document
                .getElementById("leftchatbox")
                .classList.add("cb-left-content-body-chat");
            document
                .querySelectorAll(".cb-right-content-chat-history-card")
                .forEach((card) => card.classList.remove("tabdisabled"));
        });
};

function presentPopupSuggestions(suggestions) {
    let suggestionHtml = "";
    let documentSuggestions =
        suggestions.suggestedQuestions?.documentsSuggestions;

    if (documentSuggestions && documentSuggestions.every((e) => e !== null)) {
        suggestionHtml +=
            '<div class="popupsuggestionbox2 popupsuggestion-box hide">';
        documentSuggestions.forEach((suggestion) => {
            suggestionHtml += `<div class="cb-item-sug cb-cursor-pointer" onclick="fillPopupInputText(this)">${suggestion}</div>`;
        });
        suggestionHtml += "</div>";
    }

    let attributeSuggestions =
        suggestions.suggestedQuestions?.attributesSuggestions;

    if (attributeSuggestions && attributeSuggestions.every((e) => e !== null)) {
        suggestionHtml +=
            '<div class="popupsuggestionbox1 popupsuggestion-box hide">';
        attributeSuggestions.forEach((suggestion) => {
            suggestionHtml += `<div class="cb-item-sug cb-cursor-pointer" onclick="fillPopupInputText(this)">${suggestion}</div>`;
        });
        suggestionHtml += "</div>";
    }

    if (suggestionHtml) {
        const popupQuestionsElement = document.getElementById("cb-PopUpquestions");
        if (popupQuestionsElement) {
            popupQuestionsElement.insertAdjacentHTML("beforeend", suggestionHtml);
        }
    }
}

function sendpopupMessage() {
    const inputText = document.getElementById("Popupchat-input").value;

    if (inputText && inputText.trim().length > 0) {
        createPopupChatMessage(inputText);
        document.getElementById("Popupchat-input").value = "";
    }
}
