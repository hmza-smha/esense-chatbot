class ChatbotService {
    constructor(apiService) {
        this.apiService = apiService;
    }
    
    async getConversationHistory(threadID = 0, page = 1) {
        
        const endpoint = '/Conversation/ThreadsByPeriod';
        const requestBody = {
            threadID:threadID,
            createdByUserId: this.apiService.chatbotCredentials.Id?.toString(),
            pageIndex: page,
        };
        const data = await this.apiService.post(endpoint, requestBody);
        if (thread.items.length == 0 || thread.length == 0) {
            thread.items = data;
            thread.periods = data.periods ? Object.keys(data.periods) : [];
        } else {
            if (data.periods && typeof data.periods === 'object') {
                thread.periods.forEach(k => {
                    if (thread.items.periods[k] && data.periods[k]) {
                        thread.items.periods[k] = [...thread.items.periods[k], ...data.periods[k]];
                    }
                });
            }
        }
        
        return data;
    }

    async seedAttributeResponseResult(referenceId, response, moduleName) {

        const endpoint = '/Conversation/SeedAttributeResponseResult';

        const requestBody = {
            messageReferenceId: referenceId,
            response: response,
            moduleName: moduleName
        };

        return await this.apiService.post(endpoint, requestBody);
    }

    async fetchConversationsHistory(threadID = 0, page = 1) {
        const endpoint = '/Conversation/History';
        const requestBody = {
            threadID: threadID,
            createdByUserId: this.apiService.chatbotCredentials.Id,
            pageIndex: page,
        };
        
        return await this.apiService.post(endpoint, requestBody);
    }

    async getAudioToken() {
        const endpoint = '/SpeechToText/GetSpeechToken';
        return await this.apiService.get(endpoint);
    }
   
    async sendMessageThread(threadID = 0, messages) {
        const endpoint = '/Conversation';
        const requestBody = {
            threadID: threadID,
            messages: messages,
            userID: this.apiService.chatbotCredentials.Id,      
        };

        return await this.apiService.post(endpoint, requestBody, false);
    }

    async deleteThread(threadIDs = []) {
        const endpoint = '/Conversation/Delete';
        const requestBody = {
            threadIDs: threadIDs,
            userID: this.apiService.chatbotCredentials.Id,
        };

        resetChatInterface()
        return await this.apiService.post(endpoint, requestBody);
    }

    async renameThread(threadID = 0, name) {
        const endpoint = '/Conversation/RenameThread';
        var id = parseInt(threadID)
        const requestBody = {
            threadID: id,
            name: name,
            userID: this.apiService.chatbotCredentials.Id,
        };

        return await this.apiService.post(endpoint, requestBody);
    }

    async messageReview(referenceId , isLiked, review) {
        const endpoint = '/Conversation/MessageReview';
        const requestBody = {
            referenceId: referenceId,
            isLiked: isLiked,
            review: review,
        };

        return await this.apiService.post(endpoint, requestBody);
    }

    async fetchChatbotInfo() {
        const endpoint = '/AIRawData/Info';
        return await this.apiService.get(endpoint);
    }
}