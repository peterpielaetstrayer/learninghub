// Content script for Learning Hub Companion

// Learning Mode overlay
let learningOverlay = null;
let isLearningModeActive = false;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'learningUpdate') {
    showLearningUpdate(request.data);
  }
});

// Listen for keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Ctrl+L to toggle learning mode
  if (event.ctrlKey && event.key === 'l') {
    event.preventDefault();
    toggleLearningMode();
  }
  
  // Esc to close overlay
  if (event.key === 'Escape' && learningOverlay) {
    hideLearningOverlay();
  }
});

function toggleLearningMode() {
  if (isLearningModeActive) {
    stopLearningMode();
  } else {
    startLearningMode();
  }
}

function startLearningMode() {
  isLearningModeActive = true;
  createLearningOverlay();
  
  // Notify background script
  chrome.runtime.sendMessage({
    action: 'toggleLearningMode',
    enabled: true
  });
}

function stopLearningMode() {
  isLearningModeActive = false;
  hideLearningOverlay();
  
  // Notify background script
  chrome.runtime.sendMessage({
    action: 'toggleLearningMode',
    enabled: false
  });
}

function createLearningOverlay() {
  if (learningOverlay) return;
  
  learningOverlay = document.createElement('div');
  learningOverlay.id = 'learning-hub-overlay';
  learningOverlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: 500px;
    background: #1a1a1a;
    color: #ffffff;
    border: 2px solid #4f46e5;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    overflow-y: auto;
    cursor: move;
  `;
  
  learningOverlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; color: #4f46e5; font-size: 18px;">Learning Mode</h3>
      <button id="close-overlay" style="background: none; border: none; color: #ffffff; font-size: 20px; cursor: pointer;">×</button>
    </div>
    <div id="learning-content">
      <p style="margin: 0; color: #9ca3af;">Analyzing page content...</p>
    </div>
    <div style="margin-top: 15px; display: flex; gap: 10px;">
      <button id="save-card" style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">Save as Card</button>
      <button id="snooze" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">Snooze 10m</button>
    </div>
  `;
  
  document.body.appendChild(learningOverlay);
  
  // Add event listeners
  document.getElementById('close-overlay').addEventListener('click', hideLearningOverlay);
  document.getElementById('save-card').addEventListener('click', saveAsCard);
  document.getElementById('snooze').addEventListener('click', snoozeLearning);
  
  // Make draggable
  makeDraggable(learningOverlay);
}

function hideLearningOverlay() {
  if (learningOverlay) {
    learningOverlay.remove();
    learningOverlay = null;
  }
}

function showLearningUpdate(data) {
  if (!learningOverlay) return;
  
  const content = document.getElementById('learning-content');
  if (!content) return;
  
  content.innerHTML = `
    <div style="margin-bottom: 15px;">
      <h4 style="margin: 0 0 8px 0; color: #4f46e5; font-size: 16px;">Summary</h4>
      <p style="margin: 0; color: #e5e7eb;">${data.summary}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <h4 style="margin: 0 0 8px 0; color: #4f46e5; font-size: 16px;">Question</h4>
      <p style="margin: 0; color: #e5e7eb;">${data.question}</p>
    </div>
    <div>
      <h4 style="margin: 0 0 8px 0; color: #4f46e5; font-size: 16px;">Next Step</h4>
      <p style="margin: 0; color: #e5e7eb;">${data.next_step}</p>
    </div>
  `;
}

function saveAsCard() {
  // This would save the current learning content as a card
  // For now, just show a notification
  alert('Card saved! (This would integrate with the main app)');
}

function snoozeLearning() {
  // Hide overlay for 10 minutes
  hideLearningOverlay();
  setTimeout(() => {
    if (isLearningModeActive) {
      createLearningOverlay();
    }
  }, 10 * 60 * 1000); // 10 minutes
}

function makeDraggable(element) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  element.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  
  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    
    if (e.target === element || element.contains(e.target)) {
      isDragging = true;
    }
  }
  
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      xOffset = currentX;
      yOffset = currentY;
      
      element.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  }
  
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }
}
