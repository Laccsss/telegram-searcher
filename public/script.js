// Fetch channels from the static JSON file
async function fetchChannels() {
    try {
        const response = await fetch('/data/channels.json?' + new Date().getTime());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        channels = data.channels;
        filterChannels();
    } catch (error) {
        console.error('Error fetching channels:', error);
        displayError('Failed to load channels. Please try again later. Error: ' + error.message);
    }
} 