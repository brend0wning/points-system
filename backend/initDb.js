const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/points-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = mongoose.model('User', {
  username: String,
  password: String,
  name: String,
  role: String,
  points: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const users = [
  // Managers
  { username: 'abeougher', password: 'ashleyb', name: 'Ashley Beougher', role: 'manager', points: 0, isActive: true },
  { username: 'rbertsch', password: 'rachelb', name: 'Rachel Bertsch', role: 'manager', points: 0, isActive: true },
  { username: 'bdowning', password: 'brendand', name: 'Brendan Downing', role: 'manager', points: 0, isActive: true },
  { username: 'mglass', password: 'matayag', name: 'Mataya Glass', role: 'manager', points: 0, isActive: true },
  { username: 'sstevens', password: 'sarahs', name: 'Sarah Stevens', role: 'manager', points: 0, isActive: true },
  { username: 'rviswanath', password: 'remyav', name: 'Remya Viswanath', role: 'manager', points: 0, isActive: true },

  // Staff
  { username: 'scool', password: 'samc', name: 'Sam Cool', role: 'staff', points: 596, isActive: true },
  { username: 'rscott', password: 'rubys', name: 'Ruby Scott', role: 'staff', points: 245, isActive: true },
  { username: 'lwalling', password: 'lilyw', name: 'Lily Walling', role: 'staff', points: 990, isActive: true },
  { username: 'eredmond', password: 'elijahr', name: 'Elijah Redmond', role: 'staff', points: 1090, isActive: true },
  { username: 'afischer', password: 'aleahf', name: 'Aleah Fischer', role: 'staff', points: 805, isActive: true },
  { username: 'tgrimaldi', password: 'tammyg', name: 'Tammy Grimaldi', role: 'staff', points: 1371, isActive: true },
  { username: 'tvanderven', password: 'toryv', name: 'Tory VanderVen', role: 'staff', points: 735, isActive: true },
  { username: 'yandranovich', password: 'yannaa', name: 'Yanna Andranovich', role: 'staff', points: 527, isActive: true },
  { username: 'mhill', password: 'meganh', name: 'Megan Hill', role: 'staff', points: 280, isActive: true },
  { username: 'tdawkins', password: 'titusd', name: 'Titus Dawkins', role: 'staff', points: 40, isActive: true },
  { username: 'akemper', password: 'ainsleighk', name: 'Ainsleigh Kemper', role: 'staff', points: 270, isActive: true }
];

async function initializeDb() {
  try {
    await User.deleteMany({});
    await User.insertMany(users);
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDb();