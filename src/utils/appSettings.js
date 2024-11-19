async function getAppSettings() {
    try {
        const response = await fetch(domain+'/src/config/appsettings.json');

        if (!response.ok) throw new Error('Network response was not ok', response.status);

        return await response.json();

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return {};
    }
}
