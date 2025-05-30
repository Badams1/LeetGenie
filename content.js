// Content script for LeetGenie
console.log('LeetGenie: Content script loaded');

// Wait for the page to be ready
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Function to get current user code
function getCurrentCode() {
    console.log('LeetGenie: Getting current code...');
    
    // Try Monaco editor first (new LeetCode interface)
    try {
        if (window.monaco && monaco.editor) {
            const editors = monaco.editor.getModels();
            if (editors && editors.length > 0) {
                const code = editors[0].getValue();
                console.log('LeetGenie: Found code via Monaco editor');
                return code;
            }
        }
    } catch (e) {
        console.log('LeetGenie: Monaco editor not available');
    }
    
    // Try CodeMirror (alternative editor)
    try {
        const codeMirrorElement = document.querySelector('.CodeMirror');
        if (codeMirrorElement && codeMirrorElement.CodeMirror) {
            const code = codeMirrorElement.CodeMirror.getValue();
            console.log('LeetGenie: Found code via CodeMirror');
            return code;
        }
    } catch (e) {
        console.log('LeetGenie: CodeMirror not available');
    }
    
    // Try textarea fallback
    const textarea = document.querySelector('textarea[data-mode-id]') || 
                    document.querySelector('textarea.inputarea') ||
                    document.querySelector('#editor textarea');
    
    if (textarea && textarea.value) {
        console.log('LeetGenie: Found code via textarea');
        return textarea.value;
    }
    
    console.log('LeetGenie: No code found');
    return '';
}

// Function to get problem details
function getProblemDetails() {
    const titleElement = document.querySelector('[data-cy="question-title"]') || 
                        document.querySelector('h1') ||
                        document.querySelector('.css-v3d350');
    
    const descriptionElement = document.querySelector('[data-track-load="description_content"]') ||
                              document.querySelector('.content__u3I1') ||
                              document.querySelector('.question-content');
    
    const title = titleElement ? titleElement.textContent.trim() : 'Unknown Problem';
    const description = descriptionElement ? descriptionElement.textContent.trim().substring(0, 1000) : '';
    
    return { title, description };
}

// Function to create and inject hint button
function createHintButton() {
    const button = document.createElement('button');
    button.id = 'leetgenie-hint-button';
    button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right: 6px;">
            <!-- Dark background for contrast -->
            <rect width="48" height="48" rx="8" fill="#2B2B2B"/>
            
            <!-- Bright yellow lightbulb -->
            <g transform="translate(24, 24)">
                <!-- Main bulb body -->
                <circle cx="0" cy="-4" r="10" fill="#FFD700" stroke="#FFA500" stroke-width="0.8"/>
                
                <!-- Filament lines -->
                <path d="M-4,-8 L4,-4 M-4,-4 L4,-8 M-2,0 L2,0" stroke="#FF8C00" stroke-width="1.5" stroke-linecap="round"/>
                
                <!-- Base/screw threads -->
                <rect x="-6" y="4" width="12" height="6" rx="1" fill="#D4AF37"/>
                <line x1="-6" y1="6" x2="6" y2="6" stroke="#B8860B" stroke-width="0.8"/>
                <line x1="-6" y1="8" x2="6" y2="8" stroke="#B8860B" stroke-width="0.8"/>
                
                <!-- Glow effect -->
                <circle cx="0" cy="-4" r="12" fill="none" stroke="#FFD700" stroke-width="0.5" opacity="0.3"/>
            </g>
        </svg>
        Get Hint
    `;
    button.className = 'leetgenie-hint-btn';
    
    button.addEventListener('click', handleHintRequest);
    
    console.log('LeetGenie: Button created');
    
    return button;
}

// Function to handle hint request
function handleHintRequest() {
    console.log('LeetGenie: Button clicked!');
    
    const button = document.getElementById('leetgenie-hint-button');
    if (!button) {
        console.error('LeetGenie: Button not found');
        return;
    }

    // Show loading state
    button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right: 6px; animation: spin 1s linear infinite;">
            <!-- Dark background for contrast -->
            <rect width="48" height="48" rx="8" fill="#2B2B2B"/>
            
            <!-- Bright yellow lightbulb -->
            <g transform="translate(24, 24)">
                <!-- Main bulb body -->
                <circle cx="0" cy="-4" r="10" fill="#FFD700" stroke="#FFA500" stroke-width="0.8"/>
                
                <!-- Filament lines -->
                <path d="M-4,-8 L4,-4 M-4,-4 L4,-8 M-2,0 L2,0" stroke="#FF8C00" stroke-width="1.5" stroke-linecap="round"/>
                
                <!-- Base/screw threads -->
                <rect x="-6" y="4" width="12" height="6" rx="1" fill="#D4AF37"/>
                <line x1="-6" y1="6" x2="6" y2="6" stroke="#B8860B" stroke-width="0.8"/>
                <line x1="-6" y1="8" x2="6" y2="8" stroke="#B8860B" stroke-width="0.8"/>
                
                <!-- Glow effect -->
                <circle cx="0" cy="-4" r="12" fill="none" stroke="#FFD700" stroke-width="0.5" opacity="0.3"/>
            </g>
        </svg>
        Getting Hint...
    `;
    button.disabled = true;

    // Get problem and code details
    const problemDetails = getProblemDetails();
    const currentCode = getCurrentCode();
    
    console.log('LeetGenie: Requesting hint for:', problemDetails.title);

    // Send message to background script
    chrome.runtime.sendMessage({
        action: 'getHint',
        problemTitle: problemDetails.title,
        problemDescription: problemDetails.description,
        currentCode: currentCode
    }, (response) => {
        console.log('LeetGenie: Received response:', response);
        
        // Restore button
        restoreButton();

        if (response && response.success) {
            showHint(response.hint);
        } else {
            showHint('Error: ' + (response?.error || 'Could not generate hint'));
        }
    });

    // Add timeout
    setTimeout(() => {
        if (button.disabled) {
            restoreButton();
            showHint('Request timed out. Please try again.');
        }
    }, 15000);
}

// Helper function to restore button state
function restoreButton() {
    const button = document.getElementById('leetgenie-hint-button');
    if (button) {
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 48 48" style="margin-right: 6px;">
                <!-- Dark background for contrast -->
                <rect width="48" height="48" rx="8" fill="#2B2B2B"/>
                
                <!-- Bright yellow lightbulb -->
                <g transform="translate(24, 24)">
                    <!-- Main bulb body -->
                    <circle cx="0" cy="-4" r="10" fill="#FFD700" stroke="#FFA500" stroke-width="0.8"/>
                    
                    <!-- Filament lines -->
                    <path d="M-4,-8 L4,-4 M-4,-4 L4,-8 M-2,0 L2,0" stroke="#FF8C00" stroke-width="1.5" stroke-linecap="round"/>
                    
                    <!-- Base/screw threads -->
                    <rect x="-6" y="4" width="12" height="6" rx="1" fill="#D4AF37"/>
                    <line x1="-6" y1="6" x2="6" y2="6" stroke="#B8860B" stroke-width="0.8"/>
                    <line x1="-6" y1="8" x2="6" y2="8" stroke="#B8860B" stroke-width="0.8"/>
                    
                    <!-- Glow effect -->
                    <circle cx="0" cy="-4" r="12" fill="none" stroke="#FFD700" stroke-width="0.5" opacity="0.3"/>
                </g>
            </svg>
            Get Hint
        `;
        button.disabled = false;
    }
}

// Function to show hint in a modal
function showHint(hintText) {
    // Remove existing modal if any
    const existingModal = document.getElementById('leetgenie-hint-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'leetgenie-hint-modal';
    modal.className = 'leetgenie-modal';
    
    modal.innerHTML = `
        <div class="leetgenie-modal-content">
            <div class="leetgenie-modal-header">
                <h3>Hint from LeetGenie</h3>
                <button class="leetgenie-modal-close">&times;</button>
            </div>
            <div class="leetgenie-hint-content">
                <p>${hintText}</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.leetgenie-modal-close').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Auto-close after 15 seconds
    setTimeout(() => {
        if (document.getElementById('leetgenie-hint-modal')) {
            modal.remove();
        }
    }, 15000);
}

// Function to inject the button
async function injectHintButton() {
    try {
        console.log('LeetGenie: Looking for injection point...');
        
        // Check if button already exists
        if (document.getElementById('leetgenie-hint-button')) {
            console.log('LeetGenie: Button already exists');
            return;
        }
        
        // Look for the tab header area (Description, Editorial, Solutions, Submissions)
        const tabSelectors = [
            '[role="tablist"]',
            '.flex.h-8.w-full.items-center.overflow-x-auto',
            'div[class*="flex"][class*="items-center"]:has([role="tab"])',
            'div:has([data-cy="question-detail-main-tabs"])',
            '.css-1bt0omd', // Common LeetCode tab container class
            'div.flex.items-center.space-x-6',
            'div.flex.h-full.items-center'
        ];
        
        let tabContainer = null;
        
        for (const selector of tabSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    // Check if this element contains tabs and is in the upper part of the page
                    const rect = element.getBoundingClientRect();
                    const hasTabs = element.querySelector('[role="tab"]') || 
                                   element.textContent.includes('Description') ||
                                   element.textContent.includes('Editorial') ||
                                   element.textContent.includes('Solutions');
                    
                    if (hasTabs && rect.top < 300) {
                        tabContainer = element;
                        console.log(`LeetGenie: Found tab container with selector: ${selector}`);
                        break;
                    }
                }
                if (tabContainer) break;
            } catch (e) {
                console.log(`LeetGenie: Selector ${selector} failed, trying next`);
            }
        }
        
        // Fallback: look for any element containing "Description" and "Solutions" in upper area
        if (!tabContainer) {
            console.log('LeetGenie: Trying fallback tab detection...');
            const allElements = document.querySelectorAll('div');
            for (const element of allElements) {
                const rect = element.getBoundingClientRect();
                const text = element.textContent || '';
                
                if (rect.top < 300 && rect.height < 100 && rect.height > 20 &&
                    text.includes('Description') && text.includes('Solutions')) {
                    tabContainer = element;
                    console.log('LeetGenie: Found tab container via fallback method');
                    break;
                }
            }
        }
        
        if (!tabContainer) {
            console.log('LeetGenie: No tab container found, falling back to original method');
            await fallbackInjectButton();
            return;
        }

        // Create the button with tab-like styling
        const button = createHintButton();
        if (!button) return;

        // Style the button to match tabs and position it to the right
        button.style.marginLeft = 'auto'; // Push to the right
        button.style.height = '32px';
        button.style.fontSize = '13px';
        button.style.padding = '6px 12px';
        button.style.borderRadius = '6px';
        button.style.alignSelf = 'center';
        button.style.flexShrink = '0';
        button.style.order = '999'; // Ensure it appears last (rightmost)

        // Insert the button into the tab container
        tabContainer.appendChild(button);
        
        // If the container is flex, make sure it stays flex
        const containerStyles = window.getComputedStyle(tabContainer);
        if (containerStyles.display !== 'flex') {
            tabContainer.style.display = 'flex';
            tabContainer.style.alignItems = 'center';
        }
        
        console.log('LeetGenie: Button injected successfully in tab header');
        
    } catch (error) {
        console.error('LeetGenie: Error injecting button:', error);
        
        // Fallback to original injection method
        console.log('LeetGenie: Falling back to original injection method');
        await fallbackInjectButton();
    }
}

// Fallback injection method (original behavior)
async function fallbackInjectButton() {
    try {
        console.log('LeetGenie: Using fallback injection method...');
        
        // Look for the problem description area
        const selectors = [
            '[data-track-load="description_content"]',
            '.content__u3I1',
            '.question-content',
            '[data-cy="question-title"]',
            'h1'
        ];
        
        let targetElement = null;
        
        for (const selector of selectors) {
            targetElement = document.querySelector(selector);
            if (targetElement) {
                console.log(`LeetGenie: Found fallback injection point with selector: ${selector}`);
                break;
            }
        }
        
        if (!targetElement) {
            console.log('LeetGenie: No fallback injection point found');
            return;
        }

        // Create container for the button
        let container = document.getElementById('leetgenie-hint-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'leetgenie-hint-container';
            container.className = 'leetgenie-hint-container';
            
            // Insert the container after the target element
            targetElement.insertAdjacentElement('afterend', container);
        }

        // Add the button to the container
        const button = createHintButton();
        if (button) {
            container.appendChild(button);
            console.log('LeetGenie: Button injected successfully using fallback method');
        }
        
    } catch (error) {
        console.error('LeetGenie: Error in fallback injection:', error);
    }
}

// Initialize when DOM is ready
function initialize() {
    console.log('LeetGenie: Initializing...');
    
    // Check if we're on a problem page
    if (!window.location.pathname.includes('/problems/')) {
        console.log('LeetGenie: Not on a problem page');
        return;
    }
    
    // Wait a bit for the page to load, then inject
    setTimeout(() => {
        injectHintButton();
    }, 2000);
    
    // Also try injecting on DOM mutations (in case of dynamic loading)
    const observer = new MutationObserver(() => {
        if (!document.getElementById('leetgenie-hint-button')) {
            setTimeout(injectHintButton, 1000);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
} 