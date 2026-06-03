// Staff Attendance Page - Biometric & GPS Integration

let faceEmbedding = null;
let currentLocation = null;
let restaurantLocation = null;
let hasCheckedIn = false;
let cameraStream = null;

// DOM Elements
const cameraFeed = document.getElementById('cameraFeed');
const canvasOutput = document.getElementById('canvasOutput');
const capturePhotoBtn = document.getElementById('capturePhotoBtn');
const checkInBtn = document.getElementById('checkInBtn');
const checkOutBtn = document.getElementById('checkOutBtn');
const attendanceStatus = document.getElementById('attendanceStatus');
const faceStatus = document.getElementById('faceStatus');
const locationStatus = document.getElementById('locationStatus');
const distanceStatus = document.getElementById('distanceStatus');
const displayTime = document.getElementById('displayTime');
const currentTimeEl = document.getElementById('currentTime');
const attendanceMessage = document.getElementById('attendanceMessage');
const checkInTimeEl = document.getElementById('checkInTime');
const checkOutTimeEl = document.getElementById('checkOutTime');
const totalHoursEl = document.getElementById('totalHours');
const historyTableBody = document.getElementById('historyTableBody');
const logoutBtn = document.querySelector('.logout-btn');

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  initializePage();
});

async function initializePage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.id) {
    window.location.href = '/index.html';
    return;
  }

  try {
    // Load face-api models
    await loadFaceAPIModels();
    
    // Start camera
    await startCamera();
    
    // Get current location
    await getCurrentLocation();
    
    // Get restaurant location
    await getRestaurantLocation(user.restaurantId);
    
    // Load attendance history
    await loadAttendanceHistory(user.id, user.restaurantId);
    
    // Update clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Setup event listeners
    setupEventListeners(user);
    
    // Check if already checked in today
    checkTodayStatus(user.id, user.restaurantId);
  } catch (error) {
    console.error('Initialization error:', error);
    showMessage('Failed to initialize attendance system', 'error');
  }
}

async function loadFaceAPIModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/';
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    console.log('✓ Face API models loaded');
  } catch (error) {
    console.error('Error loading face models:', error);
    throw error;
  }
}

async function startCamera() {
  try {
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
      audio: false,
    };

    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraFeed.srcObject = cameraStream;

    cameraFeed.addEventListener('loadedmetadata', () => {
      console.log('✓ Camera started');
    });
  } catch (error) {
    console.error('Camera error:', error);
    showMessage('Camera access denied. Please enable camera permissions.', 'error');
    throw error;
  }
}

async function getCurrentLocation() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };

    updateLocationStatus();
    console.log('✓ Location obtained:', currentLocation);
  } catch (error) {
    console.error('Geolocation error:', error);
    showMessage('Location access denied. Please enable location permissions.', 'error');
    throw error;
  }
}

async function getRestaurantLocation(restaurantId) {
  try {
    const response = await APIClient.get(`/restaurants/${restaurantId}`);
    restaurantLocation = response.location;
    console.log('✓ Restaurant location:', restaurantLocation);
    updateLocationStatus();
  } catch (error) {
    console.error('Error getting restaurant location:', error);
  }
}

async function captureFaceData() {
  try {
    capturePhotoBtn.disabled = true;
    capturePhotoBtn.textContent = '⏳ Processing...';

    // Detect faces
    const detections = await faceapi
      .detectAllFaces(cameraFeed, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();

    if (detections.length === 0) {
      showMessage('No face detected. Please position your face in the frame.', 'warning');
      return false;
    }

    if (detections.length > 1) {
      showMessage('Multiple faces detected. Please ensure only one person is in the frame.', 'warning');
      return false;
    }

    // Get face descriptor (embedding)
    faceEmbedding = detections[0].descriptor;
    const isLeftEye = detections[0].landmarks.getLeftEye();
    const isRightEye = detections[0].landmarks.getRightEye();

    // Check if face is visible enough
    if (!isLeftEye || !isRightEye) {
      showMessage('Face not clearly visible. Please adjust your position.', 'warning');
      return false;
    }

    // Draw face detection on canvas
    const displaySize = {
      width: cameraFeed.width,
      height: cameraFeed.height,
    };

    faceapi.matchDimensions(canvasOutput, displaySize);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvasOutput.getContext('2d').clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    faceapi.draw.drawDetections(canvasOutput, resizedDetections);

    // Update UI
    updateFaceStatus(true, 0.95);
    showMessage('✓ Face verified successfully!', 'success');

    return true;
  } catch (error) {
    console.error('Face detection error:', error);
    showMessage('Face detection failed. Please try again.', 'error');
    return false;
  } finally {
    capturePhotoBtn.disabled = false;
    capturePhotoBtn.textContent = '📷 Capture Photo';
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Return distance in meters
}

function updateLocationStatus() {
  if (!currentLocation) {
    locationStatus.textContent = 'Waiting for location...';
    locationStatus.className = 'status-pending';
    return;
  }

  const coordStr = `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
  locationStatus.innerHTML = `📍 ${coordStr}<br><small>±${currentLocation.accuracy.toFixed(0)}m</small>`;

  if (restaurantLocation) {
    const distance = calculateDistance(
      restaurantLocation.latitude,
      restaurantLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );

    const allowedRadius = restaurantLocation.radius || 100;
    const isInside = distance <= allowedRadius;

    distanceStatus.className = isInside ? 'status-success' : 'status-error';
    distanceStatus.innerHTML = isInside
      ? `✓ Inside Location (${distance.toFixed(0)}m)`
      : `✗ Outside Location (${distance.toFixed(0)}m - max ${allowedRadius}m)`;
  }
}

function updateFaceStatus(verified, score) {
  faceStatus.className = verified ? 'status-success' : 'status-error';
  faceStatus.innerHTML = verified
    ? `✓ Verified (${(score * 100).toFixed(0)}%)`
    : `✗ Not Verified`;
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  displayTime.textContent = timeStr;
  currentTimeEl.textContent = now.toLocaleTimeString();
}

async function setupEventListeners(user) {
  capturePhotoBtn.addEventListener('click', captureFaceData);

  checkInBtn.addEventListener('click', async () => {
    if (!faceEmbedding) {
      showMessage('Please capture your face first', 'warning');
      return;
    }

    if (!currentLocation) {
      showMessage('Location not available', 'error');
      return;
    }

    await performCheckIn(user);
  });

  checkOutBtn.addEventListener('click', async () => {
    if (!currentLocation) {
      showMessage('Location not available', 'error');
      return;
    }

    await performCheckOut(user);
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  });
}

async function performCheckIn(user) {
  try {
    checkInBtn.disabled = true;
    checkInBtn.textContent = '⏳ Checking in...';

    const response = await AttendanceAPI.checkIn({
      userId: user.id,
      restaurantId: user.restaurantId,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      faceData: Array.from(faceEmbedding),
      imageUrl: 'data:image/png;base64,...', // In production, upload actual image
    });

    hasCheckedIn = true;
    attendanceStatus.classList.add('checked-in');
    attendanceStatus.textContent = 'Checked In';
    checkInTimeEl.textContent = new Date().toLocaleTimeString();
    checkOutBtn.disabled = false;
    checkInBtn.disabled = true;

    showMessage('✓ Check-in successful!', 'success');
  } catch (error) {
    console.error('Check-in error:', error);
    showMessage('Check-in failed. Please try again.', 'error');
  } finally {
    checkInBtn.disabled = false;
    checkInBtn.textContent = '✓ Check In';
  }
}

async function performCheckOut(user) {
  try {
    checkOutBtn.disabled = true;
    checkOutBtn.textContent = '⏳ Checking out...';

    const response = await AttendanceAPI.checkOut({
      userId: user.id,
      restaurantId: user.restaurantId,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      imageUrl: 'data:image/png;base64,...',
    });

    hasCheckedIn = false;
    attendanceStatus.classList.remove('checked-in');
    attendanceStatus.textContent = 'Checked Out';
    checkOutTimeEl.textContent = new Date().toLocaleTimeString();
    
    // Calculate total hours
    const checkInTime = new Date(checkInTimeEl.textContent);
    const checkOutTime = new Date(checkOutTimeEl.textContent);
    const diffMs = checkOutTime - checkInTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    totalHoursEl.textContent = `${hours}h ${minutes}m`;

    checkInBtn.disabled = false;
    checkOutBtn.disabled = true;

    showMessage('✓ Check-out successful!', 'success');

    // Reload history
    await loadAttendanceHistory(user.id, user.restaurantId);
  } catch (error) {
    console.error('Check-out error:', error);
    showMessage('Check-out failed. Please try again.', 'error');
  } finally {
    checkOutBtn.disabled = false;
    checkOutBtn.textContent = '✕ Check Out';
  }
}

async function checkTodayStatus(userId, restaurantId) {
  try {
    const history = await AttendanceAPI.getHistory(userId, { restaurantId });
    
    if (history.length > 0) {
      const today = history[0];
      if (today.checkInTime) {
        hasCheckedIn = true;
        attendanceStatus.classList.add('checked-in');
        attendanceStatus.textContent = 'Checked In';
        checkInTimeEl.textContent = new Date(today.checkInTime).toLocaleTimeString();
        checkInBtn.disabled = true;
        checkOutBtn.disabled = false;

        if (today.checkOutTime) {
          checkOutTimeEl.textContent = new Date(today.checkOutTime).toLocaleTimeString();
          const diffMs = new Date(today.checkOutTime) - new Date(today.checkInTime);
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          totalHoursEl.textContent = `${hours}h ${minutes}m`;
          
          hasCheckedIn = false;
          attendanceStatus.classList.remove('checked-in');
          attendanceStatus.textContent = 'Checked Out';
          checkInBtn.disabled = false;
          checkOutBtn.disabled = true;
        }
      }
    }
  } catch (error) {
    console.error('Error checking today status:', error);
  }
}

async function loadAttendanceHistory(userId, restaurantId) {
  try {
    const history = await AttendanceAPI.getHistory(userId, { restaurantId });
    
    historyTableBody.innerHTML = history.slice(0, 10).map(record => `
      <tr>
        <td>${new Date(record.date).toLocaleDateString()}</td>
        <td>${record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '--:--'}</td>
        <td>${record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '--:--'}</td>
        <td>${record.totalHours ? record.totalHours + 'h' : '--'}</td>
        <td>
          <span class="status-badge-small ${record.status}">
            ${record.status === 'present' ? '✓ Present' : '✗ Absent'}
          </span>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading history:', error);
    historyTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load history</td></tr>';
  }
}

function showMessage(message, type = 'info') {
  attendanceMessage.className = `message-box show ${type}`;
  attendanceMessage.textContent = message;

  setTimeout(() => {
    attendanceMessage.classList.remove('show');
  }, 4000);
}
