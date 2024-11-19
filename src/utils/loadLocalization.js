async function loadLocalization() {
    try {
        const response = await fetch(domain+'/src/config/localization.json');
        if (!response.ok) throw new Error('Network response was not ok', response.status);

        const data = await response.json();
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                (chatbotConfigration.language === 'ar') ? value?.ar : value?.en
            ])
        );
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return {};
    }
}

async function getLocalization(chatbotConfigration) {
    try {
        let localization = await loadLocalization();

        const setText = (id, text) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerText = text;
            }
        };

        setText("cb-conversation", chatbotConfigration.language === 'en' 
            ? chatbotConfigration.localization.conversation.en 
            : chatbotConfigration.localization.conversation.ar);
        setText("cb-searchtext", localization.searchtext);
        setText("cb-about", localization.about);
        setText("cb-Hello", localization.hello);
        setText("cb-Help", chatbotConfigration.language === 'en' 
            ? chatbotConfigration.localization.help.en 
            : chatbotConfigration.localization.help.ar);
        setText("newconversition", localization.newConversition);
        setText("cb-CreatedCorrespondence", localization.about);
        setText("cb-popupWordSearch", localization.searchtext);

        const mainLogo = document.getElementById("mainlogo");
        if (mainLogo) mainLogo.setAttribute("src", icon.logo);

        const sideLogo = document.getElementById("sidelogo");
        if (sideLogo) sideLogo.setAttribute("src", icon.sideLogo);

        const chatInput = document.getElementById("chat-input");
        if (chatInput) chatInput.setAttribute("placeholder", localization.chatText);

        const popupChatInput = document.getElementById("Popupchat-input");
        if (popupChatInput) popupChatInput.setAttribute("placeholder", localization.chatText);

        const avatars = document.querySelectorAll(".chat-avatar");
        avatars.forEach(avatar => {
            avatar.setAttribute("src", icon.avatar);
        });

        return localization;

    } catch (error) {
        console.error("Error fetching localization data:", error);
    }
}
