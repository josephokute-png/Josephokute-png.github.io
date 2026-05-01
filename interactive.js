// ============================================
// NUTRITRACE - ADVANCED NUTRITION CALCULATOR
// ============================================

// Nutrition database with specific nutrient degradation rates
const nutritionDatabase = {
  // Vegetables
  'Spinach': { vitaminC: 28, iron: 2.7, folate: 194, heatSensitivity: 0.7 },
  'Broccoli': { vitaminC: 89, iron: 0.7, folate: 63, heatSensitivity: 0.65 },
  'Carrots': { vitaminC: 5.9, iron: 0.3, folate: 19, heatSensitivity: 0.4 },
  'Tomatoes': { vitaminC: 13.7, iron: 0.3, folate: 15, heatSensitivity: 0.5 },
  'Bell Peppers': { vitaminC: 80, iron: 0.3, folate: 10, heatSensitivity: 0.75 },
  'Kale': { vitaminC: 93, iron: 1.6, folate: 141, heatSensitivity: 0.7 },
  'Potatoes': { vitaminC: 19.7, iron: 0.8, folate: 15, heatSensitivity: 0.5 },
  'Sweet Potatoes': { vitaminC: 2.4, iron: 0.6, folate: 11, heatSensitivity: 0.45 },
  
  // Proteins
  'Chicken Breast': { protein: 31, iron: 0.7, b12: 0.3, heatSensitivity: 0.3 },
  'Salmon': { protein: 25, iron: 0.8, omega3: 2.2, heatSensitivity: 0.35 },
  'Beef': { protein: 26, iron: 2.6, b12: 2.5, heatSensitivity: 0.4 },
  'Eggs': { protein: 13, iron: 1.2, vitaminD: 1.1, heatSensitivity: 0.45 },
  'Tofu': { protein: 8, iron: 1.5, calcium: 350, heatSensitivity: 0.25 },
  'Lentils': { protein: 9, iron: 3.3, folate: 181, heatSensitivity: 0.5 },
  
  // Fruits
  'Blueberries': { vitaminC: 9.7, antioxidants: 9.2, fiber: 2.4, heatSensitivity: 0.6 },
  'Strawberries': { vitaminC: 59, antioxidants: 2.3, fiber: 2.0, heatSensitivity: 0.65 },
  'Oranges': { vitaminC: 53, folate: 30, fiber: 2.4, heatSensitivity: 0.55 },
  'Bananas': { potassium: 358, vitaminB6: 0.4, fiber: 2.6, heatSensitivity: 0.3 },
  'Apples': { vitaminC: 4.6, fiber: 2.4, antioxidants: 3.1, heatSensitivity: 0.35 },
  
  // Grains
  'Quinoa': { protein: 4.4, iron: 1.5, magnesium: 64, heatSensitivity: 0.2 },
  'Brown Rice': { protein: 2.6, magnesium: 39, fiber: 1.8, heatSensitivity: 0.15 }
};

// Advanced cooking method coefficients
const cookingCoefficients = {
  steam: { factor: 0.92, description: "Steaming preserves most nutrients", icon: "" },
  boil: { factor: 0.75, description: "Boiling causes water-soluble nutrient loss", icon: "" },
  fry: { factor: 0.65, description: "Frying can degrade heat-sensitive nutrients", icon: "" }
};

// Nutrient-specific storage degradation rates (per hour)
const storageRates = {
  vitaminC: 0.08,
  folate: 0.06,
  antioxidants: 0.07,
  protein: 0.02,
  iron: 0.01,
  default: 0.03
};

// Cache DOM elements
const elements = {
  foodName: document.getElementById('foodName'),
  method: document.getElementById('method'),
  cookTime: document.getElementById('cookTime'),
  storeTime: document.getElementById('storeTime'),
  scoreText: document.getElementById('scoreText'),
  result: document.getElementById('result'),
  progressRing: document.querySelector('.ring')
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Add input validation listeners
  elements.cookTime.addEventListener('input', validateInputs);
  elements.storeTime.addEventListener('input', validateInputs);
  elements.foodName.addEventListener('change', updateFoodInfo);
  
  // Set default values
  if (!elements.cookTime.value) elements.cookTime.value = '15';
  if (!elements.storeTime.value) elements.storeTime.value = '2';
  
  // Show welcome message
  showWelcomeMessage();
});

// Input validation with restrictions
function validateInputs() {
  let cookTime = parseInt(elements.cookTime.value);
  let storeTime = parseInt(elements.storeTime.value);
  let hasError = false;
  
  // Cooking time restrictions (0-180 minutes)
  if (isNaN(cookTime) || cookTime < 0) {
    elements.cookTime.value = 0;
    cookTime = 0;
    hasError = true;
  } else if (cookTime > 180) {
    elements.cookTime.value = 180;
    cookTime = 180;
    showToast('Cooking time limited to 180 minutes for realistic results', 'warning');
    hasError = true;
  }
  
  // Storage time restrictions (0-72 hours)
  if (isNaN(storeTime) || storeTime < 0) {
    elements.storeTime.value = 0;
    storeTime = 0;
    hasError = true;
  } else if (storeTime > 72) {
    elements.storeTime.value = 72;
    storeTime = 72;
    showToast('Storage time limited to 72 hours (food safety limit)', 'warning');
    hasError = true;
  }
  
  // Show spoilage warning for long storage
  if (storeTime > 24 && !hasError) {
    showToast('Food stored over 24 hours may have significant nutrient loss and safety concerns', 'warning');
  }
  
  return !hasError;
}

// Update food info display
function updateFoodInfo() {
  const selectedFood = elements.foodName.value;
  if (selectedFood && nutritionDatabase[selectedFood]) {
    const info = nutritionDatabase[selectedFood];
    const nutrients = Object.keys(info).filter(k => k !== 'heatSensitivity');
    const nutrientList = nutrients.slice(0, 3).map(n => {
      const icons = { vitaminC: '', iron: '', protein: '', folate: '', antioxidants: '' };
      return `${icons[n] || ''} ${n}: ${info[n]}${n.includes('vitamin') ? 'mg' : n.includes('protein') ? 'g' : ''}`;
    }).join(' • ');
    
    // Show food info in result area
    const resultDiv = elements.result;
    resultDiv.innerHTML = `<div style="background: #e6f7f0; padding: 8px; border-radius: 8px; margin-bottom: 10px; font-size: 12px;">
      ${selectedFood}: ${nutrientList}
    </div>`;
    resultDiv.classList.add('visible', 'info');
  }
}

// Main calculation function
function calculateNutrition() {
  // Validate inputs first
  if (!validateInputs()) return;
  
  // Check if food is selected
  const foodName = elements.foodName.value;
  if (!foodName) {
    showToast('Please select a food item first', 'error');
    elements.result.innerHTML = '<div style="text-align: center; padding: 1rem;">Please select a food to analyze</div>';
    elements.result.classList.add('visible', 'error');
    updateProgress(0);
    return;
  }
  
  // Get values
  const method = elements.method.value;
  const cookTime = parseFloat(elements.cookTime.value) || 0;
  const storeTime = parseFloat(elements.storeTime.value) || 0;
  
  // Get food-specific data
  const foodData = nutritionDatabase[foodName] || { heatSensitivity: 0.5 };
  
  // Calculate cooking impact
  const cookingFactor = cookingCoefficients[method]?.factor || 0.85;
  const cookingImpact = cookingFactor - (cookTime * 0.002);
  
  // Calculate storage impact with food-specific sensitivity
  const storageRate = foodData.heatSensitivity || 0.5;
  const storageImpact = 1 - (storeTime * 0.015 * storageRate);
  
  // Calculate final retention score
  let score = (cookingImpact * 0.6 + storageImpact * 0.4) * 100;
  
  // Apply nutrient-specific adjustments
  if (foodData.vitaminC) {
    const vitaminCLoss = cookTime * 0.3 + storeTime * 5;
    score -= Math.min(25, vitaminCLoss * 0.2);
  }
  
  // Ensure score stays within realistic bounds (10-98%)
  score = Math.min(98, Math.max(10, Math.round(score)));
  
  // Update progress circle with animation
  updateProgress(score);
  
  // Generate detailed result message
  const resultMessage = generateResultMessage(score, method, cookTime, storeTime, foodName);
  const resultHTML = `
    <div class="result-content">
      <div class="result-icon">${score >= 70 ? 'GOOD' : score >= 40 ? 'MODERATE' : 'CRITICAL'}</div>
      <div class="result-text">
        <strong>${score >= 70 ? 'Excellent!' : score >= 40 ? 'Moderate Loss' : 'Critical Loss'}</strong>
        <p>${resultMessage}</p>
      </div>
    </div>
    <div class="result-details">
      <div class="detail-item">
        <span>Cooking factor:</span>
        <span>${Math.round(cookingImpact * 100)}%</span>
      </div>
      <div class="detail-item">
        <span>Storage factor:</span>
        <span>${Math.round(storageImpact * 100)}%</span>
      </div>
      <div class="detail-item">
        <span>Overall retention:</span>
        <span><strong>${score}%</strong></span>
      </div>
    </div>
    ${score < 40 ? '<div class="recommendation">Tip: Try steaming instead of boiling to preserve more nutrients!</div>' : ''}
    ${storeTime > 12 ? '<div class="recommendation">Store food in airtight containers in the refrigerator to slow degradation.</div>' : ''}
  `;
  
  elements.result.innerHTML = resultHTML;
  elements.result.classList.add('visible');
  
  // Trigger animation
  triggerConfetti(score);
  
  // Save to history
  saveToHistory(foodName, method, cookTime, storeTime, score);
  
  // Play subtle sound effect (optional - requires Web Audio API)
  playCompletionSound(score);
}

// Generate detailed result message
function generateResultMessage(score, method, cookTime, storeTime, foodName) {
  const methodInfo = cookingCoefficients[method] || { description: "standard cooking", icon: "🍳" };
  
  if (score >= 80) {
    return `Excellent! Your ${foodName} retained ${score}% of its nutrients. ${methodInfo.description} for ${cookTime} minutes was optimal.`;
  } else if (score >= 60) {
    return `Good retention at ${score}%. ${methodInfo.description} for ${cookTime} minutes and ${storeTime} hours storage caused moderate loss. Consume within the next day.`;
  } else if (score >= 40) {
    return `Significant nutrient loss (${score}% retained). ${methodInfo.description} and ${storeTime}h storage reduced nutritional value. Consider shorter cooking times.`;
  } else {
    return `Critical nutrient loss! Only ${score}% retained. ${methodInfo.description} for ${cookTime} minutes combined with ${storeTime}h storage severely degraded nutrients. Consume immediately or prepare fresh.`;
  }
}

// Update progress circle with animation
function updateProgress(score) {
  const circle = elements.progressRing;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Animate the change
  circle.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  circle.style.strokeDashoffset = offset;
  
  // Update color based on score
  if (score >= 70) {
    circle.style.stroke = '#48bb78';
    elements.scoreText.style.color = '#276749';
  } else if (score >= 40) {
    circle.style.stroke = '#ed8936';
    elements.scoreText.style.color = '#c05621';
  } else {
    circle.style.stroke = '#e53e3e';
    elements.scoreText.style.color = '#c53030';
  }
  
  // Animate the number count-up
  animateNumber(elements.scoreText, 0, score, 800);
}

// Animate number counting up
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current + '%';
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Save analysis to localStorage history
function saveToHistory(food, method, cookTime, storeTime, score) {
  const history = JSON.parse(localStorage.getItem('nutritrace_history') || '[]');
  history.unshift({
    id: Date.now(),
    food,
    method,
    cookTime,
    storeTime,
    score,
    date: new Date().toLocaleString()
  });
  
  // Keep only last 20 entries
  if (history.length > 20) history.pop();
  localStorage.setItem('nutritrace_history', JSON.stringify(history));
}

// Show toast notification
function showToast(message, type = 'info') {
  // Create toast element if it doesn't exist
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  
  const icons = { info: '', warning: '', error: '', success: '' };
  toast.innerHTML = `${icons[type]} ${message}`;
  toast.className = `toast-notification show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Trigger confetti effect for high scores
function triggerConfetti(score) {
  if (score >= 85) {
    // Simple confetti effect - removed confetti animation
    const colors = ['#48bb78', '#3b8b7a', '#f39c12', '#e74c3c'];
    for (let i = 0; i < 30; i++) {
      createConfettiPiece(colors[i % colors.length]);
    }
  }
}

function createConfettiPiece(color) {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  confetti.style.backgroundColor = color;
  confetti.style.left = Math.random() * 100 + '%';
  confetti.style.animationDuration = Math.random() * 2 + 1 + 's';
  confetti.style.opacity = Math.random();
  document.body.appendChild(confetti);
  
  setTimeout(() => {
    confetti.remove();
  }, 2000);
}

// Play completion sound (optional, requires user interaction first)
let audioEnabled = false;
function playCompletionSound(score) {
  if (!audioEnabled || score < 60) return;
  
  // Simple beep using Web Audio API (optional)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = score >= 85 ? 523.25 : 440;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
    }, 200);
  } catch(e) {
    // Silently fail if audio not supported
  }
}

// Enable audio on first user click
document.addEventListener('click', function enableAudio() {
  audioEnabled = true;
  document.removeEventListener('click', enableAudio);
}, { once: true });

// Show welcome message on first visit
function showWelcomeMessage() {
  const visited = localStorage.getItem('nutritrace_visited');
  if (!visited) {
    setTimeout(() => {
      showToast('Welcome to NutriTrace! Select a food to see how cooking and storage affect nutrition.', 'info');
      localStorage.setItem('nutritrace_visited', 'true');
    }, 500);
  }
}

// Open presentation with proper restrictions
function openPresentation() {
  const presentationFile = "NutriTrace_Presentation.pptx";
  
  // Check if file exists (simulated check)
  showToast('Loading presentation...', 'info');
  
  // Simulate file check with delay
  setTimeout(() => {
    // Create download link with restrictions
    const link = document.createElement('a');
    link.href = presentationFile;
    link.download = "NutriTrace_Presentation.pptx";
    link.target = "_blank";
    
    // Add restriction: Limit downloads to 5 per session
    const downloadCount = parseInt(sessionStorage.getItem('downloadCount') || '0');
    
    if (downloadCount >= 5) {
      showToast('Download limit reached. Please refresh the page to continue.', 'warning');
      return;
    }
    
    // Track download
    sessionStorage.setItem('downloadCount', (downloadCount + 1).toString());
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
    showToast(`Presentation opened (${4 - downloadCount} downloads remaining)`, 'success');
  }, 800);
}

// Export functions for global access
window.calculateNutrition = calculateNutrition;
window.openPresentation = openPresentation;