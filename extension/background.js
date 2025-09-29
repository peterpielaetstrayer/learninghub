// Background script for Learning Hub Companion

const API_BASE_URL = 'http://localhost:3000';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu
  chrome.contextMenus.create({
    id: 'save-to-inbox',
    title: 'Save to Learning Hub',
    contexts: ['selection', 'page']
  });

  // Set default settings
  chrome.storage.sync.set({
    apiBaseUrl: API_BASE_URL,
    learningModeEnabled: false,
    learningModeInterval: 10000 // 10 seconds
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-to-inbox') {
    try {
      // Get selected text or page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getPageContent
      });

      const content = results[0].result;
      
      // Capture screenshot if needed
      let screenshotDataUrl = null;
      if (!content.text && !content.selection) {
        try {
          const screenshot = await chrome.tabs.captureVisibleTab();
          screenshotDataUrl = screenshot;
        } catch (error) {
          console.error('Failed to capture screenshot:', error);
        }
      }

      // Send to API
      const response = await fetch(`${API_BASE_URL}/api/inbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: tab.url,
          title: tab.title,
          selection: content.selection,
          screenshotDataUrl: screenshotDataUrl
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Saved to inbox:', result.id);
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          title: 'Learning Hub',
          message: 'Content saved to inbox successfully!'
        });
      } else {
        throw new Error('Failed to save to inbox');
      }
    } catch (error) {
      console.error('Error saving to inbox:', error);
      chrome.notifications.create({
        type: 'basic',
        title: 'Learning Hub Error',
        message: 'Failed to save content to inbox'
      });
    }
  }
});

// Function to get page content (injected into page)
function getPageContent() {
  const selection = window.getSelection().toString().trim();
  const title = document.title;
  
  // If there's a selection, use it; otherwise try to get main content
  let text = selection;
  if (!text) {
    // Try to get main content from common selectors
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '#content',
      '.main-content'
    ];
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        text = element.innerText || element.textContent || '';
        break;
      }
    }
    
    // Fallback to body if no main content found
    if (!text) {
      text = document.body.innerText || document.body.textContent || '';
    }
  }
  
  return {
    text: text.substring(0, 10000), // Limit to 10k characters
    selection: selection,
    title: title
  };
}

// Learning Mode functionality
let learningModeInterval = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleLearningMode') {
    const { enabled } = request;
    
    if (enabled) {
      startLearningMode();
    } else {
      stopLearningMode();
    }
    
    sendResponse({ success: true });
  } else if (request.action === 'getLearningModeStatus') {
    sendResponse({ enabled: learningModeInterval !== null });
  }
});

function startLearningMode() {
  if (learningModeInterval) return;
  
  learningModeInterval = setInterval(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      
      // Get page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getPageContent
      });
      
      const content = results[0].result;
      
      if (!content.text) return;
      
      // Send to learning API
      const response = await fetch(`${API_BASE_URL}/api/learn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text.substring(0, 5000) // Limit content for learning mode
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Send to content script for display
        chrome.tabs.sendMessage(tab.id, {
          action: 'learningUpdate',
          data: result
        });
      }
    } catch (error) {
      console.error('Learning Mode error:', error);
    }
  }, 10000); // 10 second interval
}

function stopLearningMode() {
  if (learningModeInterval) {
    clearInterval(learningModeInterval);
    learningModeInterval = null;
  }
}
