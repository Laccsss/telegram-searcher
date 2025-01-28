let channels = [];

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

// Display error message
function displayError(message) {
    const channelsList = document.getElementById('channelsList');
    channelsList.innerHTML = `
        <div class="error-message">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

// Display channels in the grid
function displayChannels(channelsToShow) {
    const channelsList = document.getElementById('channelsList');
    channelsList.innerHTML = '';

    if (channelsToShow.length === 0) {
        channelsList.innerHTML = `
            <div class="no-results">
                <p>No channels found matching your search.</p>
            </div>
        `;
        return;
    }

    channelsToShow.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        
        card.innerHTML = `
            <h3>${escapeHtml(channel.name)}</h3>
            ${channel.categories ? `<div class="categories">${channel.categories.map(cat => 
                `<span class="category">${escapeHtml(cat)}</span>`).join(' ')}</div>` : ''}
            ${channel.description ? `<p>${escapeHtml(channel.description)}</p>` : ''}
            <a href="${escapeHtml(channel.link)}" target="_blank">Join Channel</a>
        `;
        
        channelsList.appendChild(card);
    });
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Filter channels based on search input
function filterChannels() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = channels.filter(channel => {
        return channel.name.toLowerCase().includes(searchTerm) ||
               (channel.categories && channel.categories.some(cat => 
                   cat.toLowerCase().includes(searchTerm)
               ));
    });
    
    displayChannels(filtered);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterChannels);

// Initialize
fetchChannels(); 