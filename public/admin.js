let channels = [];
let isEditing = false;
let categories = new Set();

// Fetch and display channels
async function fetchChannels() {
    try {
        const response = await fetch('/api/channels');
        channels = await response.json();
        
        // Update categories
        categories = new Set(channels.flatMap(channel => channel.categories || []));
        updateCategoryFilter();
        
        // Display channels
        filterChannels();
    } catch (error) {
        console.error('Error fetching channels:', error);
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
            // Check description
            (channel.description && channel.description.toLowerCase().includes(searchTerm)) ||
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
        category: form.category.value,
        description: form.description.value
    };

    try {
        const index = form.editIndex.value;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/channels/${index}` : '/api/channels';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(channelData)
        });

        if (response.ok) {
            form.reset();
            if (isEditing) {
                cancelEdit();
            }
            await fetchChannels();
        } else {
            const error = await response.json();
            alert(error.error || `Failed to ${isEditing ? 'update' : 'add'} channel`);
        }
    } catch (error) {
        console.error(`Error ${isEditing ? 'updating' : 'adding'} channel:`, error);
        alert(`Failed to ${isEditing ? 'update' : 'add'} channel`);
    }
}

// Delete channel
async function deleteChannel(index) {
    if (!confirm('Are you sure you want to delete this channel?')) {
        return;
    }

    try {
        const response = await fetch(`/api/channels/${index}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await fetchChannels();
        } else {
            alert('Failed to delete channel');
        }
    } catch (error) {
        console.error('Error deleting channel:', error);
        alert('Failed to delete channel');
    }
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

// Initial load
fetchChannels(); 