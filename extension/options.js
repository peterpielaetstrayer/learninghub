// Options script for Learning Hub Companion

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const resetButton = document.getElementById('resetButton');
  const statusDiv = document.getElementById('status');
  
  // Load saved settings
  await loadSettings();
  
  // Event listeners
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSettings();
  });
  
  resetButton.addEventListener('click', async () => {
    await resetSettings();
  });
});

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'apiBaseUrl',
      'learningModeInterval',
      'maxContentLength'
    ]);
    
    document.getElementById('apiBaseUrl').value = result.apiBaseUrl || 'http://localhost:3000';
    document.getElementById('learningModeInterval').value = result.learningModeInterval || 10;
    document.getElementById('maxContentLength').value = result.maxContentLength || 5000;
  } catch (error) {
    console.error('Failed to load settings:', error);
    showStatus('Failed to load settings', 'error');
  }
}

async function saveSettings() {
  try {
    const settings = {
      apiBaseUrl: document.getElementById('apiBaseUrl').value,
      learningModeInterval: parseInt(document.getElementById('learningModeInterval').value),
      maxContentLength: parseInt(document.getElementById('maxContentLength').value)
    };
    
    // Validate settings
    if (!settings.apiBaseUrl) {
      showStatus('API Base URL is required', 'error');
      return;
    }
    
    if (settings.learningModeInterval < 5 || settings.learningModeInterval > 300) {
      showStatus('Learning Mode Interval must be between 5 and 300 seconds', 'error');
      return;
    }
    
    if (settings.maxContentLength < 1000 || settings.maxContentLength > 20000) {
      showStatus('Max Content Length must be between 1000 and 20000 characters', 'error');
      return;
    }
    
    await chrome.storage.sync.set(settings);
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', 'error');
  }
}

async function resetSettings() {
  try {
    const defaultSettings = {
      apiBaseUrl: 'http://localhost:3000',
      learningModeInterval: 10,
      maxContentLength: 5000
    };
    
    await chrome.storage.sync.set(defaultSettings);
    
    // Update form
    document.getElementById('apiBaseUrl').value = defaultSettings.apiBaseUrl;
    document.getElementById('learningModeInterval').value = defaultSettings.learningModeInterval;
    document.getElementById('maxContentLength').value = defaultSettings.maxContentLength;
    
    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    showStatus('Failed to reset settings', 'error');
  }
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}
