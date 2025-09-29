// Popup script for Learning Hub Companion

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const learningModeToggle = document.getElementById('learningModeToggle');
  const openAppButton = document.getElementById('openApp');
  const optionsButton = document.getElementById('options');
  
  // Check connection status
  await checkConnectionStatus();
  
  // Load learning mode status
  await loadLearningModeStatus();
  
  // Event listeners
  learningModeToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await toggleLearningMode(enabled);
  });
  
  openAppButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
  
  optionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

async function checkConnectionStatus() {
  const statusDiv = document.getElementById('status');
  
  try {
    const response = await fetch('http://localhost:3000/api/stream');
    if (response.ok) {
      statusDiv.textContent = 'Connected to Learning Hub';
      statusDiv.className = 'status connected';
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    statusDiv.textContent = 'Not connected to Learning Hub';
    statusDiv.className = 'status disconnected';
  }
}

async function loadLearningModeStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getLearningModeStatus'
    });
    
    if (response && response.enabled) {
      document.getElementById('learningModeToggle').checked = true;
    }
  } catch (error) {
    console.error('Failed to load learning mode status:', error);
  }
}

async function toggleLearningMode(enabled) {
  try {
    await chrome.runtime.sendMessage({
      action: 'toggleLearningMode',
      enabled: enabled
    });
    
    // Update status
    const statusDiv = document.getElementById('status');
    if (enabled) {
      statusDiv.textContent = 'Learning Mode Active';
      statusDiv.className = 'status connected';
    } else {
      statusDiv.textContent = 'Learning Mode Inactive';
      statusDiv.className = 'status disconnected';
    }
  } catch (error) {
    console.error('Failed to toggle learning mode:', error);
    // Revert toggle
    document.getElementById('learningModeToggle').checked = !enabled;
  }
}
