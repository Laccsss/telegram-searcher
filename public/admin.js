let channels = [];
let isEditing = false;
let categories = new Set();

// Check if already authenticated
function checkAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
        showAdminPanel();
    }
}

// Login function
function login() {
    const password = document.getElementById('password').value;
    if (password === 'Viktor123') {
        localStorage.setItem('adminAuthenticated', 'true');
        showAdminPanel();
    } else {
        alert('Invalid password');
    }
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    fetchChannels();
}

// Fetch and display channels
async function fetchChannels() {
    try {
        const response = await fetch('/data/channels.json?' + new Date().getTime());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        channels = data.channels;
        
        // Update categories
        categories = new Set(channels.flatMap(channel => channel.categories || []));
        updateCategoryFilter();
        
        // Display channels
        filterChannels();
    } catch (error) {
        console.error('Error fetching channels:', error);
        alert('Failed to load channels. Error: ' + error.message);
    }
}

// Update category filter options
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    [...categories].sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filter and display channels
function filterChannels() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    const filtered = channels.filter(channel => {
        // Check if matches search term
        const matchesSearch = 
            // Check channel name
            channel.name.toLowerCase().includes(searchTerm) ||
            // Check categories
            (channel.categories && channel.categories.some(cat => 
                cat.toLowerCase().includes(searchTerm)
            ));

        // Check if matches selected category filter
        const matchesCategory = !selectedCategory || 
            (channel.categories && channel.categories.includes(selectedCategory));
        
        return matchesSearch && matchesCategory;
    });
    
    displayChannels(filtered);
}

// Display channels in admin view
function displayChannels(channelsToShow = channels) {
    const channelsList = document.getElementById('adminChannelsList');
    channelsList.innerHTML = '';

    channelsToShow.forEach((channel, index) => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        
        card.innerHTML = `
            <h3>${escapeHtml(channel.name)}</h3>
            ${channel.categories ? `<div class="categories">${channel.categories.map(cat => 
                `<span class="category">${escapeHtml(cat)}</span>`).join(' ')}</div>` : ''}
            ${channel.description ? `<p>${escapeHtml(channel.description)}</p>` : ''}
            <a href="${escapeHtml(channel.link)}" target="_blank">View Channel</a>
            <div class="button-group">
                <button onclick="editChannel(${index})" class="edit-btn">Edit Channel</button>
                <button onclick="deleteChannel(${index})" class="delete-btn">Delete Channel</button>
            </div>
        `;
        
        channelsList.appendChild(card);
    });
}

// Edit channel
function editChannel(index) {
    const channel = channels[index];
    const form = document.getElementById('channelForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editIndex = document.getElementById('editIndex');

    form.name.value = channel.name;
    form.link.value = channel.link;
    form.category.value = channel.categories ? channel.categories.join(', ') : '';
    form.description.value = channel.description || '';

    formTitle.textContent = 'Edit Channel';
    submitBtn.textContent = 'Update Channel';
    cancelBtn.style.display = 'inline-block';
    editIndex.value = index;
    isEditing = true;

    form.scrollIntoView({ behavior: 'smooth' });
}

// Cancel editing
function cancelEdit() {
    const form = document.getElementById('channelForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editIndex = document.getElementById('editIndex');

    form.reset();
    formTitle.textContent = 'Add New Channel';
    submitBtn.textContent = 'Add Channel';
    cancelBtn.style.display = 'none';
    editIndex.value = '';
    isEditing = false;
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const channelData = {
        name: form.name.value,
        link: form.link.value,
        categories: form.category.value.split(',').map(cat => cat.trim()).filter(Boolean),
        description: form.description.value
    };

    if (isEditing) {
        const index = parseInt(form.editIndex.value);
        channels[index] = channelData;
    } else {
        channels.push(channelData);
    }

    // Download the updated channels.json file
    const blob = new Blob([JSON.stringify({ channels: channels }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'channels.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('The channels.json file has been downloaded. To update the site:\n1. Replace the data/channels.json file in your repository\n2. Commit and push the changes\n3. Netlify will automatically redeploy with the new channels');

    form.reset();
    if (isEditing) {
        cancelEdit();
    }
    displayChannels();
}

// Delete channel
function deleteChannel(index) {
    if (!confirm('Are you sure you want to delete this channel?')) {
        return;
    }

    channels.splice(index, 1);
    
    // Download the updated channels.json file
    const blob = new Blob([JSON.stringify({ channels: channels }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'channels.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('The channels.json file has been downloaded. To update the site:\n1. Replace the data/channels.json file in your repository\n2. Commit and push the changes\n3. Netlify will automatically redeploy with the new channels');

    displayChannels();
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

// Event listeners
document.getElementById('channelForm').addEventListener('submit', handleSubmit);
document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
document.getElementById('searchInput').addEventListener('input', filterChannels);
document.getElementById('categoryFilter').addEventListener('change', filterChannels);

// Initialize
checkAuth(); 