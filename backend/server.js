// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/points-system');

// User Schema
const User = mongoose.model('User', {
  username: String,
  password: String,
  name: String,
  role: String,
  points: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

// Transaction Schema
// Update the Transaction Schema (replace the existing one)
const Transaction = mongoose.model('Transaction', {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Changed this line
  type: String,  // 'EARNED' or 'SPENT'
  points: Number,
  reason: String,
  approvedBy: String,
  date: { type: Date, default: Date.now },
  status: String  // 'PENDING', 'APPROVED', 'DENIED'
});

// In server.js, update the login route:
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log('Login attempt:', { username, password, role }); // Debug log
    
    const user = await User.findOne({ username, password, role });
    console.log('Found user:', user); // Debug log

    if (user && user.isActive) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get staff list
app.get('/api/staff-list', async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', isActive: true });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff list' });
  }
});

// Get transactions for a user
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      userId: req.params.userId,
      status: { $in: ['APPROVED', 'PENDING'] }
    }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Award points
app.post('/api/points/award', async (req, res) => {
  try {
    const { userId, points, reason, managerId, managerName } = req.body;
    
    // Create transaction
    await Transaction.create({
      userId,
      type: 'EARNED',
      points,
      reason,
      approvedBy: managerName,
      status: 'APPROVED'
    });

    // Update user points
    await User.findByIdAndUpdate(userId, { $inc: { points } });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error awarding points' });
  }
});

// Request points
app.post('/api/points/request', async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    console.log('New request:', { userId, points, reason }); // Debug log
    
    const transaction = await Transaction.create({
      userId,
      type: 'SPENT',
      points,
      reason,
      status: 'PENDING'
    });
    
    console.log('Created transaction:', transaction); // Debug log
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Get pending requests
app.get('/api/requests/pending', async (req, res) => {
  try {
    const requests = await Transaction.find({ 
      status: 'PENDING',
      type: 'SPENT'
    }).populate('userId');
    
    console.log('Pending requests:', requests); // Debug log
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});
// Respond to request
app.post('/api/rewards/respond', async (req, res) => {
  try {
    const { requestId, approved, managerId, managerName } = req.body;
    
    const request = await Transaction.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = approved ? 'APPROVED' : 'DENIED';
    request.approvedBy = managerName;
    await request.save();

    if (approved) {
      await User.findByIdAndUpdate(request.userId, {
        $inc: { points: -request.points }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});