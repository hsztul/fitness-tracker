// Configuration
const TOTAL_DAYS = 56; // 8 weeks
const FINAL_TARGET = 100;
const REST_DAY_INTERVAL = 7; // Every 7th day is a rest day
const REST_DAY_FACTOR = 0.5; // Rest day targets are 50% of regular

// Initialize or retrieve progress from local storage
let progress = JSON.parse(localStorage.getItem('fitnessProgress')) || {
  day: 1,
  pushups: [],
  situps: [],
  currentPushupTarget: 10, // Starting target
  currentSitupTarget: 10   // Starting target
};

// Ensure that currentPushupTarget and currentSitupTarget are initialized
if (progress.currentPushupTarget === undefined) {
  progress.currentPushupTarget = 10;
}

if (progress.currentSitupTarget === undefined) {
  progress.currentSitupTarget = 10;
}

// Save progress to local storage
const saveProgress = () => {
  localStorage.setItem('fitnessProgress', JSON.stringify(progress));
};

// Reset progress
const resetProgress = () => {
  progress = {
    day: 1,
    pushups: [],
    situps: [],
    currentPushupTarget: 10,
    currentSitupTarget: 10
  };
  saveProgress();
  render();
  updateChart();
};

// Calculate today's targets based on the algorithm
const calculateTodayTargets = () => {
  let pushups = progress.currentPushupTarget;
  let situps = progress.currentSitupTarget;

  // Check if today is a rest day
  if (progress.day % REST_DAY_INTERVAL === 0) {
    pushups = Math.floor(pushups * REST_DAY_FACTOR);
    situps = Math.floor(situps * REST_DAY_FACTOR);
  }

  return { pushups, situps };
};

// Initialize Chart.js
let progressChart;

const initializeChart = () => {
  const ctx = document.getElementById('progressChart').getContext('2d');
  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: progress.pushups.map((_, index) => `Day ${index + 1}`),
      datasets: [
        {
          label: 'Push-ups',
          data: progress.pushups,
          borderColor: 'rgba(59, 130, 246, 1)', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: false,
          tension: 0.1
        },
        {
          label: 'Sit-ups',
          data: progress.situps,
          borderColor: 'rgba(16, 185, 129, 1)', // Green
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Day'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Repetitions'
          },
          suggestedMax: 120
        }
      }
    }
  });
};

// Update Chart Data
const updateChart = () => {
  if (!progressChart) {
    initializeChart();
    return;
  }

  progressChart.data.labels = progress.pushups.map((_, index) => `Day ${index + 1}`);
  progressChart.data.datasets[0].data = progress.pushups;
  progressChart.data.datasets[1].data = progress.situps;
  progressChart.update();
};

// Render the app
const render = () => {
  const app = document.getElementById('app');
  const { pushups: todayPushups, situps: todaySitups } = calculateTodayTargets();

  app.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-md">
      <p class="mb-4 text-gray-700">Day ${progress.day} of ${TOTAL_DAYS}</p>
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Today's Targets:</h2>
        <div class="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div class="w-full md:w-1/2">
            <p class="font-medium">Push-ups</p>
            <p class="text-lg">${todayPushups}</p>
          </div>
          <div class="w-full md:w-1/2">
            <p class="font-medium">Sit-ups</p>
            <p class="text-lg">${todaySitups}</p>
          </div>
        </div>
        ${progress.day % REST_DAY_INTERVAL === 0 ? '<p class="text-sm text-gray-500 mt-2">Rest Day: Reduced Targets</p>' : ''}
      </div>
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Log Your Progress:</h2>
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:space-x-4">
            <div class="flex-1">
              <label class="block text-gray-700">Push-ups Completed:</label>
              <input type="number" id="pushupsInput" class="mt-1 p-2 border rounded w-full" min="0">
            </div>
            <div class="flex-1">
              <label class="block text-gray-700">Sit-ups Completed:</label>
              <input type="number" id="situpsInput" class="mt-1 p-2 border rounded w-full" min="0">
            </div>
          </div>
          <button id="saveButton" class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
        </div>
      </div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Progress:</h2>
        <button id="openReset" class="text-red-500 hover:text-red-700">Reset Progress</button>
      </div>
      <ul id="progressList" class="list-disc pl-5 max-h-60 overflow-y-auto">
        ${progress.pushups.map((p, index) => `
          <li>
            <span class="font-medium">Day ${index + 1}:</span> 
            Push-ups - ${p || 0}, Sit-ups - ${progress.situps[index] || 0}
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  // Add event listener to the save button
  document.getElementById('saveButton').addEventListener('click', () => {
    const pushupsCompleted = parseInt(document.getElementById('pushupsInput').value) || 0;
    const situpsCompleted = parseInt(document.getElementById('situpsInput').value) || 0;

    // Prevent logging beyond the total days
    if (progress.day > TOTAL_DAYS) {
      alert('Congratulations! You have reached your 8-week goal.');
      return;
    }

    // Log the completed exercises
    progress.pushups.push(pushupsCompleted);
    progress.situps.push(situpsCompleted);

    // Adjust the next day's targets based on today's performance
    const { pushups: todayTarget, situps: todaySitupTarget } = calculateTodayTargets();

    // Push-ups adjustment
    if (pushupsCompleted >= todayTarget) {
      progress.currentPushupTarget = Math.min(progress.currentPushupTarget + 1, FINAL_TARGET);
    } else {
      progress.currentPushupTarget = Math.max(progress.currentPushupTarget - 1, 1);
    }

    // Sit-ups adjustment
    if (situpsCompleted >= todaySitupTarget) {
      progress.currentSitupTarget = Math.min(progress.currentSitupTarget + 1, FINAL_TARGET);
    } else {
      progress.currentSitupTarget = Math.max(progress.currentSitupTarget - 1, 1);
    }

    // Increment the day
    progress.day += 1;

    // Ensure the final day's target is 100
    const daysLeft = TOTAL_DAYS - progress.day + 1;
    if (progress.day <= TOTAL_DAYS) {
      progress.currentPushupTarget = Math.min(progress.currentPushupTarget + Math.ceil((FINAL_TARGET - progress.currentPushupTarget) / daysLeft), FINAL_TARGET);
      progress.currentSitupTarget = Math.min(progress.currentSitupTarget + Math.ceil((FINAL_TARGET - progress.currentSitupTarget) / daysLeft), FINAL_TARGET);
    }

    saveProgress();
    render();
    updateChart();
  });

  // Add event listener to open reset modal
  document.getElementById('openReset').addEventListener('click', () => {
    document.getElementById('resetModal').classList.remove('hidden');
  });
};

// Handle Reset Modal
const setupResetModal = () => {
  const resetModal = document.getElementById('resetModal');
  const cancelReset = document.getElementById('cancelReset');
  const confirmReset = document.getElementById('confirmReset');

  cancelReset.addEventListener('click', () => {
    resetModal.classList.add('hidden');
  });

  confirmReset.addEventListener('click', () => {
    resetProgress();
    resetModal.classList.add('hidden');
  });

  // Close modal when clicking outside the modal content
  window.addEventListener('click', (e) => {
    if (e.target === resetModal) {
      resetModal.classList.add('hidden');
    }
  });
};

// Initialize the app
const init = () => {
  render();
  setupResetModal();
  initializeChart();
  updateChart();
};

// Run the app
init();
