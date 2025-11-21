const express = require('express');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// In-memory storage for items and claims (would be replaced with a database in production)
let lostItems = [];
let claimRequests = [];
let nextItemId = 1;
let nextClaimId = 1;

// Helper function to run YOLO detection
const runYOLODetection = (imagePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'yolo_detector.py');
    const command = `python "${pythonScript}" "${imagePath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing YOLO detection: ${error}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`YOLO detection stderr: ${stderr}`);
      }
      
      try {
        // Check if stdout is valid JSON
        if (stdout && stdout.trim()) {
          const result = JSON.parse(stdout);
          resolve(result);
        } else {
          // If no output, return empty array
          resolve([]);
        }
      } catch (parseError) {
        console.error(`Error parsing YOLO output: ${parseError}`);
        console.error(`Raw output: ${stdout}`);
        // If parsing fails, return empty array instead of rejecting
        resolve([]);
      }
    });
  });
};

// Routes
app.get('/api/items', (req, res) => {
  res.json(lostItems);
});

app.get('/api/items/:id', (req, res) => {
  const item = lostItems.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const { title, category, location, description, dateFound } = req.body;
    
    // Run YOLO detection on the uploaded image only if an image was provided
    let yoloResults = [];
    if (req.file) {
      try {
        yoloResults = await runYOLODetection(req.file.path);
      } catch (yoloError) {
        console.error('YOLO detection failed:', yoloError);
        // Continue even if YOLO detection fails
      }
    }
    
    const newItem = {
      id: nextItemId.toString(),
      title: title || 'Unknown Item',
      category: category || 'other',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      location: location || 'Unknown Location',
      dateFound: dateFound || new Date().toISOString().split('T')[0],
      description: description || 'No description provided',
      status: 'available',
      detectedObjects: yoloResults
    };
    
    lostItems.push(newItem);
    nextItemId++;
    
    // Emit to all connected clients
    io.emit('itemAdded', newItem);
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.get('/api/claims', (req, res) => {
  res.json(claimRequests);
});

app.post('/api/claims', (req, res) => {
  try {
    const { itemId, itemTitle, itemImage, studentName, studentId, description } = req.body;
    
    const newClaim = {
      id: nextClaimId.toString(),
      itemId,
      itemTitle,
      itemImage,
      studentName,
      studentId,
      description,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    claimRequests.push(newClaim);
    nextClaimId++;
    
    // Update item status
    const item = lostItems.find(i => i.id === itemId);
    if (item) {
      item.status = 'pending';
      io.emit('itemUpdated', item);
    }
    
    // Emit to all connected clients
    io.emit('claimAdded', newClaim);
    
    res.status(201).json(newClaim);
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});

app.put('/api/claims/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const claim = claimRequests.find(c => c.id === req.params.id);
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    claim.status = status;
    
    // Update item status based on claim decision
    const item = lostItems.find(i => i.id === claim.itemId);
    if (item) {
      if (status === 'approved') {
        item.status = 'claimed';
      } else if (status === 'rejected') {
        item.status = 'available';
      }
      io.emit('itemUpdated', item);
    }
    
    // Emit to all connected clients
    io.emit('claimUpdated', claim);
    
    res.json(claim);
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ error: 'Failed to update claim status' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});