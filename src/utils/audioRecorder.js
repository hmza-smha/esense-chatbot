let serviceRegion = '';
let phrase = '';
let phrasing = '';
let subscriptionToken = '';  
let recognizer = null;
let isMicAccessGranted = false;
let mediaRecorder = null;
let audioChunks = [];
let chatState = {
    chatbottype: null 
};

async function checkMicrophoneAccssiblity(){
    const chatbotAudioButton = document.getElementById("chatbot-mic");
    const chatbotPopupAudioButton = document.getElementById("popup-chatbot-mic");
    const isMicrophonePermission = await checkMicrophonePermission()
    await bindChatbotAudioEvents();
    await bindPopupChatbotAudioEvents();

    if(!isMicrophonePermission)
    {
        chatbotAudioButton.src = domain+imagesPath+"microphone-slash-solid.svg";
        chatbotAudioButton.title = localization.micAccessDenied
        chatbotPopupAudioButton.src = domain+imagesPath+"microphone-slash-solid.svg";
        chatbotPopupAudioButton.title = localization.micAccessDenied
    }
}

async function fetchAudioToken() {
    try {
        phrase = '';
        const result = await chatbotService.getAudioToken();
        return result;
        } catch (error) {
        console.error('Error fetching audio token:', error);
        return null;
    }
}

async function initializeAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        handleMicAccess(stream);
    } catch (error) {
        handleMicError(error);
    }
}

function handleMicAccess(stream) {
    isMicAccessGranted = true;
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
}

function handleMicError(error) {
    isMicAccessGranted = false;
    document.querySelectorAll(".audioicon, .popupaudioicon").forEach(icon => {
        icon.src = domain+imagesPath+"/microphone-slash-solid.svg";
        icon.title = localization.micAccessDenied
        icon.classList.add("unclickable");
    });
    console.warn('Unable to access microphone:', error);
}

function toggleRecording(isRecording, isPopup) {
    chatState.chatbottype = isPopup;
    if (isRecording) {
        stopRecognition();
    } else {
        startRecognition();
    }
}

async function startRecognition() {
    try {
        if (!isMicAccessGranted) {
            console.error('Microphone access is not granted.');
            return;
        }

        const result = await fetchAudioToken();
        if (!result || !result.token || !result.region) {
            throw new Error('Failed to retrieve token or region.');
        }

        subscriptionToken = result.token;
        serviceRegion = result.region;
        initializeRecognizer();

    } catch (error) {
        console.error('Error initializing recognition:', error);
    }
}

function initializeRecognizer() {
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(subscriptionToken, serviceRegion);
    speechConfig.speechRecognitionLanguage = 'ar-SA'; // Set your language (Arabic in this case)
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    startRecognitionFlow();
}

function startRecognitionFlow() {
    const visualizer = chatState.chatbottype === false ? document.getElementById("visualizer") : document.getElementById("visualizer2");
    visualizer.style.zIndex = "0";

    const inputField = chatState.chatbottype === false ? document.getElementById("chat-input") : document.getElementById("Popupchat-input");
    inputField.setAttribute("placeholder", localization.recordingaudio);

    recognizer.recognizing = (s, e) => {
        phrasing = e.result.text;
    };

    recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            phrase += e.result.text;
            phrasing = phrase;
            updateChatInput();
        }
    };

    recognizer.startContinuousRecognitionAsync(
        () => {
            console.log('Recognition started successfully');
        },
        (error) => {
            console.error('Error starting speech recognition:', error);
        }
    );

    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        if (e.reason === SpeechSDK.CancellationReason.Error) {
            console.error(`CANCELED: ErrorDetails=${e.errorDetails}`);
        }
        stopRecognition();
    };

    recognizer.sessionStopped = (s, e) => {
        console.log('Session stopped event.');
        stopRecognition();
    };
}

function updateChatInput() {
    const targetInput = chatState.chatbottype === false ? document.getElementById("chat-input") : document.getElementById("Popupchat-input");
    targetInput.value = phrase;
}

function stopRecognition() {
    const visualizer = chatState.chatbottype === false ? document.getElementById("visualizer") : document.getElementById("visualizer2");
    visualizer.innerHTML = '';  // Clear visualizer content

    if (recognizer) {
        recognizer.stopContinuousRecognitionAsync(
            () => {
                handleRecognitionStopped();
            },
            (error) => {
                console.error('Error stopping recognition:', error);
            }
        );
    }
}

function handleRecognitionStopped() {
    const targetInput = chatState.chatbottype === false ? document.getElementById("chat-input") : document.getElementById("Popupchat-input");
    const placeholder = localization.chatText;
    
    targetInput.setAttribute("placeholder", placeholder);
    if (!phrasing) {
        targetInput.value = phrasing;
    }

    const micphone = chatState.chatbottype === false ? document.getElementById("chatbot-mic") : document.getElementById("popup-chatbot-mic");
    micphone.classList.add("unclickable");
    targetInput.disabled = false;
    micphone.classList.remove("unclickable");
    checkChatbotInput(phrasing, chatState.chatbottype);
}

function checkMicrophonePermission() {
    return new Promise((resolve, reject) => {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' })
                .then((permissionStatus) => {
                    var isMicAccessGranted = permissionStatus.state === 'granted';
                    resolve(isMicAccessGranted);
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            isMicAccessGranted=false
            reject(isMicAccessGranted);
        }
    });
}
