var loadExternalHTML = (url) => fetch(url).then(response => response.text());

var copyToClipboard = (text, event) => {
    navigator.clipboard.writeText(text.toString().replace(/["']/g, '').replace(/\n/g, '')).then(() => {
        const icon = event.target;
        icon.src = domain+imagesPath+'/check-solid.svg';
        icon.alt = 'Checked';
        icon.classList.add("fa-solid");
        setTimeout(() => {
            icon.src =  domain+imagesPath+'/copy-regular.svg';
            icon.alt = 'Copy';
            icon.classList.remove("fa-solid");
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

var toggleLikeDislike = (action, currentIcon, referenceId) => {
    var isLiked = action === 'like';
    const likeButton = currentIcon.closest('.timetext').querySelector('.likeButton');
    const dislikeButton = currentIcon.closest('.timetext').querySelector('.dislikeButton');
    const isLikeActive = likeButton.classList.contains('active');
    const isDislikeActive = dislikeButton.classList.contains('active');

    if (isLikeActive || isDislikeActive) {
        Array.from(currentIcon.parentNode.children).forEach(child => {
            child.classList.remove("hide");
        })
        likeButton.style.display = '';
        dislikeButton.style.display = '';

        likeButton.src =  domain+imagesPath+'like-empty.svg';
        dislikeButton.src = domain+imagesPath+'dislike-empty.svg';

        likeButton.classList.remove("active");
        dislikeButton.classList.remove("active");

        isLiked = null;
    } else {
        if (isLiked) {
            likeButton.src = domain+imagesPath+'like-filled.svg';
            dislikeButton.style.display = 'none';
            likeButton.classList.add('active');
        } else {
            dislikeButton.src = domain+imagesPath+'dislike-filled.svg';
            likeButton.style.display = 'none';
            dislikeButton.classList.add('active');
        }
    }
    
    chatbotService.messageReview(referenceId, isLiked, '');
};

var bindChatbotAudioEvents = async () => {
    const chatbotMic = document.getElementById("chatbot-mic");
    if (chatbotMic) {    
        let isRecording = false;

        chatbotMic.addEventListener('click', async function () {

            if (!isMicAccessGranted) {
                await initializeAudio();
            }

            if (isMicAccessGranted) {
                chatbotMic.title = localization.startRecording
                if (!isRecording) {
                    chatbotMic.title = localization.recording;
                    document.getElementById("chat-input").disabled = true;
                    document.getElementById("chat-input").value = "";
                    toggleRecording(isRecording, false)
                    this.src = domain+imagesPath+"microphone-solidblue.svg"
                    isRecording = true;
                } else {
                    this.src = domain+imagesPath+"microphone-solid.svg";
                    toggleRecording(isRecording, false);
                    chatbotMic.title = localization.startRecording;
                    isRecording = false;
                }

                document.querySelector(".cb-mainchat-send-icon").style.visibility = "hidden";
            }
        });
    } 
}


var bindPopupChatbotAudioEvents = async () => {
    const popupChatbotMic = document.getElementById("popup-chatbot-mic");
    if (popupChatbotMic) {
        let isRecording = false;
        popupChatbotMic.addEventListener('click', async function () {

            if (!isMicAccessGranted) {
                await initializeAudio();
            }
            if (isMicAccessGranted) {
                if (!isRecording) {
                    popupChatbotMic.title = localization.recording;
                    document.getElementById("Popupchat-input").disabled = true;
                    document.getElementById("Popupchat-input").value = "";
                    this.src = domain+imagesPath+"microphone-solidblue.svg"
                    toggleRecording(isRecording, true);
                    isRecording = true;
                } else {
                    toggleRecording(isRecording, true);
                    popupChatbotMic.title = localization.startRecording;
                    isRecording = false;
                    this.src = domain+imagesPath+"microphone-solid.svg";
                    document.getElementById("Popupchat-input").setAttribute("placeholder", localization.proccessingAudio);
                }

                document.querySelector(".cb-popupchat-send-icon").style.visibility = "hidden";
            }
        });
    }
}

var bindAudioEvents = async () => {

    if(!isMicAccessGranted){
        await initializeAudio();
        await bindChatbotAudioEvents();
        await bindPopupChatbotAudioEvents();
    }
};

var bindThreadScrollEvent = () => {
    var threadsDiv = document.getElementById('threadItems');
    let isLoading = false;
    let allowScroll = true;
    threadsDiv.addEventListener('scroll', () => {
        var threshold = threadsDiv.scrollHeight * 0.95;
        if (threadsDiv.scrollTop + threadsDiv.clientHeight < threshold) {
            return
        }
        
        if (!isLoading && allowScroll && (threadsDiv.scrollTop + threadsDiv.clientHeight > threshold)) {
            isLoading = true;
            
            threadsDiv.style.overflow = "hidden";
            threadsDiv.insertAdjacentHTML('afterend', createLoaderHTML(true, false));
            
            chatbotService.getConversationHistory(0, ++thread.page)
                .then((t) => {
                    displayThreadItems()
                    if(isAllThreadsLoaded(t.periods) == 0){
                        allowScroll = false;
                    }
                    isLoading = false;
                    document.getElementById("cbloader").remove();
                    threadsDiv.removeEventListener('scroll', this);
                    threadsDiv.style.overflow = '';
                })
                .catch(error => {
                    console.error('Error fetching conversations:', error);
                    isLoading = false;
                    document.getElementById("cbloader").remove();
                    threadsDiv.removeEventListener('scroll', this);
                    threadsDiv.style.overflow = '';
                })
        }
    });
}


const isAllThreadsLoaded = (threads) => {
    let totalCount = 0;

  for (const key in threads) {
    if (threads.hasOwnProperty(key)) {
      totalCount += threads[key].length;
    }
  }

  return totalCount;
}

const createUserMessageHTML = (input) => {
    return `
    <div class="chatbotmessage">
        <div class="cb-flexi-col">
            <div class="cb-width-60-per cb-flexi-col cb-padding-10 align-items-start algin-self-start"  style="text-align:left">
                <label class="cb-message gap-5 text-wrap user">
                    <bdi><p>${input.content != null ? input.content : input}</p></bdi>
                    <span class="text-align-end timetext"><bdi>${input.displayDateText != null ? input.displayDateText : localization.messageSentStatus} </bdi></span>
                </label>
            </div>
        </div>
    </div>`;
};

const createBotResponseHTML = (response, showicon) => {
    var message = response.content.toString().replace(/["']/g, '').replace(/\n/g, '');
    
    let dislikeSrc = 'dislike-empty.svg';
    let likeSrc = 'like-empty.svg';      
    let dislikeStyle = '';  
    let likeStyle = ''; 

    let formattedMessage = response.message && response.message != "" ? response.message : response.content;
    let searchResultRedirectUrl = '';

    if(response.isAttributesQuestion && chatbotConfigration.searchResultRedirectUrl){
        searchResultRedirectUrl = appendReferenceId(response.referenceId)
        formattedMessage += `, ${localization.forDetails} <a href="${searchResultRedirectUrl}" target=_blank> ${localization.clickHere}</a>`;
        
    }

    if (response.isLiked === null || response.isLiked == undefined) {
        dislikeSrc = 'dislike-empty.svg';
        likeSrc = 'like-empty.svg';
        dislikeStyle = ''; 
        likeStyle = '';    
    } else if (response.isLiked === false) {
        dislikeSrc = 'dislike-filled.svg'; 
        likeSrc = 'like-empty.svg';       
        dislikeStyle = ''; 
        likeStyle = 'hide'; 
    } else if (response.isLiked === true) {
        dislikeSrc = 'dislike-empty.svg';  
        likeSrc = 'like-filled.svg';
        dislikeStyle = 'hide'; 
        likeStyle = '';
    }

    return `
    <div class="chatbotmessage">
        <div class="cb-flexi-col">
            <div class="cb-width-60-per cb-flexi-col cb-padding-10 align-items-end algin-self-end" style="text-align: ${response.language === 'English' ? 'left' : 'right'};">
                <div class="chat-card">
                    <label class="cb-flexi-col border-radius-8 cb-message gap-5 text-wrap">
                        <div><bdi>${formattedMessage}</bdi></div>
                        <span class="text-align-end timetext">
                            <bdi>
                                <img class="dislikeButton cursor-pointer ${dislikeStyle}" 
                                     src="${domain+imagesPath+dislikeSrc}" 
                                     alt="Dislike" 
                                     onclick="toggleLikeDislike('dislike', this, '${response.referenceId}')">
                                     
                                <img class="likeButton cursor-pointer ${likeStyle}" 
                                     src="${domain+imagesPath+likeSrc}" 
                                     alt="Like" 
                                     onclick="toggleLikeDislike('like', this, '${response.referenceId}')">
                                     
                                <img src="${domain+imagesPath}/copy-regular.svg" class="cursor-pointer" onclick="copyToClipboard('${response.isAttributesQuestion && searchResultRedirectUrl != '' ? searchResultRedirectUrl : message}', event)">                                  
                                ${response.displayDateText !== undefined ? response.displayDateText : response.responseDateDisplayText}
                            </bdi>
                        </span>
                    </label>
                    <!-- Chatbot Avatar -->
                    <img class="chat-avatar ${showicon ? '' : 'hide'}" src="${icon.avatar}">
                </div>
            </div>
        </div>
    </div>`;
};

const createErrorBotResponseHTML = (response, showicon) => {
    return `
    <div class="chatbotmessage">
        <div class="cb-flexi-col">
            <div class="cb-width-60-per cb-flexi-col cb-padding-10 align-items-end algin-self-end" style="text-align: ${chatbotConfigration.language === 'en' ? 'left' : 'right'};">
                <div class="chat-card">
                    <label class="cb-flexi-col border-radius-8 cb-message gap-5 text-wrap">
                        <div><bdi>${response}</bdi></div>
                    </label>
                    <!-- Chatbot Avatar -->
                    <img class="chat-avatar ${showicon ? '' : 'hide'}" src="${icon.avatar}">
                </div>
            </div>
        </div>
    </div>`;
};

var addBotResponseLoader = () => {
    document.getElementById("chat-suggestions-boxes").insertAdjacentHTML('beforeend', createLoaderHTML(false, false));
    document.getElementById("chat-input").disabled = true;
    document.getElementById("chat-suggestions-boxes").scrollTop = document.getElementById("chat-suggestions-boxes").scrollHeight;
};

// TODO: What is this ?
function isCharacterOrNumber(key) {
    const isEnglishLetter = /^[a-zA-Z]$/;  // English letters
    const isNumber = /^[0-9]$/;  // Single digit
    const isArabicLetter = /^[\u0600-\u06FF]$/;  // Arabic characters
    const specialChars = /[!@#$%^&*(),.?":{}|<>،؟؛…]/;  // Special characters

    // Check if any part of the string contains valid characters
    for (let char of key) {
        if (isEnglishLetter.test(char) || isArabicLetter.test(char) || isNumber.test(char) || specialChars.test(char)) {
            return true;
        }
    }
    
    return false;
}

function focusChatbotInput(chatbotinputlocation) {
    if (chatbotinputlocation === false) {
        document.getElementById('chat-input').removeAttribute('readonly');
        document.getElementById('chat-input').removeAttribute('disabled');
        document.getElementById('chat-input').style.display = 'block';
        document.getElementById('chat-input').focus();
    } else {
        document.getElementById('Popupchat-input').removeAttribute('readonly');
        document.getElementById('Popupchat-input').removeAttribute('disabled');
        document.getElementById('Popupchat-input').style.display = 'block';
        document.getElementById('Popupchat-input').focus();
    }
}

function checkChatbotInput(input, ispopup) {
    chatState.chatbottype = ispopup;
    if (ispopup) {
        if (isCharacterOrNumber(input)) {
            if (chatState.chatbottype === false) {
                document.getElementById("chatbot-mic").classList.add("hide");
            } else {
                document.getElementById("popup-chatbot-mic").classList.add("hide");
            }
            if (chatState.chatbottype === false) {
                document.querySelector(".cb-mainchat-send-icon").classList.remove("hide");
            } else {
                document.querySelector(".cb-popupchat-send-icon").classList.remove("hide");
            }
            if (chatState.chatbottype === false) {
                document.querySelector(".cb-mainchat-send-icon").style.visibility = "initial";
            } else {
                document.querySelector('.cb-popupchat-send-icon').style.visibility = "initial";
            }
        }
    } else {
        if (isCharacterOrNumber(input)) {
            if (chatState.chatbottype === false) {
                document.getElementById("chatbot-mic").classList.add("hide");
            } else {
                document.getElementById("popup-chatbot-mic").classList.add("hide");
            }
            if (chatState.chatbottype === false) {
                document.querySelector(".cb-mainchat-send-icon").classList.remove("hide");
            } else {
                document.querySelector(".cb-popupchat-send-icon").classList.remove("hide");
            }
            if (chatState.chatbottype === false) {
                document.querySelector(".cb-mainchat-send-icon").style.visibility = "initial";
            } else {
                document.querySelector('.cb-popupchat-send-icon').style.visibility = "initial";
            }
        }
    }

    if (input == '') {
        if (chatState.chatbottype === false) {
            document.querySelector(".cb-mainchat-send-icon").classList.add("hide");
        } else {
            document.querySelector(".cb-popupchat-send-icon").classList.add("hide");
        }
        if (chatState.chatbottype === false) {
            document.getElementById("chatbot-mic").classList.remove("hide");
        } else {
            document.getElementById("popup-chatbot-mic").classList.remove("hide");
        }
    }
}


function appendReferenceId(referenceId){
    let path = chatbotConfigration.searchResultRedirectUrl;
    const url = new URL(path);
    if(url.search){
        path = `${path}&aiSearch=true&id=${referenceId}`
    } else {
        if(url.pathname !== "/"){
            path = `${path}?aiSearch=true&id=${referenceId}`
        } else {
            path = `${path}/id=${referenceId}`
        }
    }
    
    return path;
}

function isAttributesQuestion(isPopupWindow = false){
    let res = false;    

    let suggestionBoxes = null;
    if(isPopupWindow){
        suggestionBoxes = document.querySelectorAll('.popupsuggestion-boxitem');
        if(suggestionBoxes[1].classList.contains('cb-clicked-sug')){
            res = true;
        }
    } else {
        suggestionBoxes = document.querySelectorAll('.suggestion-boxitem');
        if(suggestionBoxes[1].classList.contains('cb-clicked-sug')){
            res = true;
        }
    }
    
    suggestionBoxes.forEach((box) => box.classList.remove('cb-clicked-sug'));

    return res;
}