class ApiService {
    constructor(baseURL) {
        if (!baseURL) {
            throw new Error("URL error! Message: No URL provided");
        }
        this.baseURL = baseURL;
        this.chatbotCredentials = this.initialize();
    }

    async initialize() {
        this.chatbotCredentials = await this.getChatbotCredentials();

        if(!!this.chatbotCredentials.ExpiresDate){
            const date = new Date(this.chatbotCredentials.ExpiresDate);
            this.chatbotCredentials.exp = date.getTime();

        } else {
            const currentDate = new Date();
            const oneHourLater = new Date(currentDate.getTime() + 60 * 60 * 1000); // 1 hour default expiration token
            this.chatbotCredentials.exp = oneHourLater.getTime();
        }
    }

    async send(method, endpoint, body, viewToaster = true){

        let payload = {
            method: method,
            headers: await this.getHeaders()
        }

        if(method != 'GET'){
            payload.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, payload);
            if (!response.ok) {
                return this.handleError(response, viewToaster);
            }
    
            return this.handleResponse(response);
        } catch(error){
            return this.handleError(error, viewToaster);
        }
    }

    async getChatbotCredentials() {
        try {
            const credentials = await chatbotConfigration?.getChatbotCredentials();

            if (credentials) {
                return credentials;
            }

        } catch (error) {
            throw Error("Unable to get credentials");
        }
    }

    async refreshToken() {
        try {
            const credentials = await chatbotConfigration?.getChatbotCredentials();

            if (credentials) {
                this.chatbotCredentials = credentials;
            }

        } catch (error) {
            throw new Error("Unable to refresh token.");
        }
    }

    isTokenExpired(credentials) {
        const expiry = credentials?.exp;
        if (!expiry) return false;
        const now = Math.floor(Date.now() / 1000);
        return now > expiry;
    }

    async ensureToken() {
        if (!this.chatbotCredentials || !this.chatbotCredentials.AccessToken || this.isTokenExpired(this.chatbotCredentials)) {
            await this.refreshToken();
        }
    }

    async get(endpoint, viewToaster = true) {
        return this.send('GET', endpoint, viewToaster);
    }

    async post(endpoint, requestBody, viewToaster = true) {
        return this.send('POST', endpoint, requestBody, viewToaster);
    }

    async put(endpoint, data, viewToaster = true) {
        return this.send('PUT', endpoint, data, viewToaster);
    }

    async delete(endpoint, viewToaster = true) {
        return this.send('DELETE', endpoint, viewToaster);
    }

    async getHeaders() {
        await this.ensureToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.chatbotCredentials?.AccessToken) {
            headers['Authorization'] = `Bearer ${this.chatbotCredentials.AccessToken}`;
        }
        headers['culture'] = chatbotConfigration.language;
        return headers;
    }

    async handleResponse(response) {
        const text = await response.text();

        if (text === '') {
            return {};
        }

        try {
            return JSON.parse(text); 
        } 
        catch (error) {
            return text;
        }
    }

    async handleError(response, viewToaster = true) {
        if(viewToaster){
            showChatBotTostr("error",localization.error)
        }
        return {
            code: response.status,
            error: response.statusText
        }
    }
}
