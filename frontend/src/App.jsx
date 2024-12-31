import React, { useState, useEffect } from 'react';
import axios from 'axios';

const POINT_AWARDS = [
  { id: 'meeting', name: 'Meeting Contingency', points: 30 },
  { id: 'catalyst80', name: 'Catalyst Audit (80-99%)', points: 15 },
  { id: 'catalyst100', name: 'Catalyst Audit (100%)', points: 30 },
  { id: 'fidelity80', name: 'Fidelity Check (80-99%)', points: 15 },
  { id: 'fidelity100', name: 'Fidelity Check (100%)', points: 30 },
  { id: 'phaseA', name: 'Phase A Evaluation', points: 90 },
  { id: 'phaseB', name: 'Phase B Evaluation', points: 120 },
  { id: 'phaseC', name: 'Phase C Evaluation', points: 150 },
  { id: 'rbtComplete', name: 'RBT Course Completion', points: 180 },
  { id: 'rbtCert', name: 'RBT (Re)Certification', points: 210 },
  { id: 'birthday', name: 'Birthday/Work Anniversary', points: 90 },
  { id: 'bonusGood', name: 'Good! Bonus', points: 15 },
  { id: 'bonusGreat', name: 'Great! Bonus', points: 30 },
  { id: 'bonusIncredible', name: 'Incredible! Bonus', points: 60 },
  { id: 'speech', name: 'Speech Bonus', points: 15 },
  { id: 'is', name: 'IS Bonus', points: 15 },
  { id: 'counselor', name: 'Counselor/Social Worker Bonus', points: 15 }
];

const PURCHASE_OPTIONS = [
  { id: 'lunch30', name: 'Lunch Break (30 min)', points: 60 },
  { id: 'late30', name: 'Late Arrival (30 min)', points: 30 },
  { id: 'late45', name: 'Late Arrival (45 min)', points: 45 },
  { id: 'early15', name: 'Early Out (15 min)', points: 15 },
  { id: 'early30', name: 'Early Out (30 min)', points: 30 },
  { id: 'early45', name: 'Early Out (45 min)', points: 45 },
  { id: 'store1', name: 'Store Item (1 item)', points: 15 },
  { id: 'store2', name: 'Staff Store (2 items)', points: 30 },
  { id: 'store3', name: 'Staff Store (3 items)', points: 45 },
  { id: 'eoar', name: 'EOAR Eats (Up to $15)', points: 900 }
];

const App = () => {
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedAward, setSelectedAward] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const API_URL = 'http://localhost:3001/api';

  useEffect(() => {
    if (user) {
      fetchTransactions();
      if (user.role === 'manager') {
        fetchPendingRequests();
        fetchStaffList();
      }
    }
  }, [user]);

  // API Calls
  const fetchStaffList = async () => {
    try {
      const response = await axios.get(`${API_URL}/staff-list`);
      setStaffList(response.data.filter(s => s.role === 'staff'));
    } catch (error) {
      setError('Error fetching staff list');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions/${user._id}`);
      setTransactions(response.data);
    } catch (error) {
      setError('Error fetching transactions');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/requests/pending`);
      setPendingRequests(response.data);
    } catch (error) {
      setError('Error fetching pending requests');
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
        role: selectedPortal
      });
      if (response.data.success) {
        setUser(response.data.user);
        setError('');
      }
    } catch (error) {
      setError('Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardPoints = async () => {
    try {
      const award = POINT_AWARDS.find(a => a.id === selectedAward);
      await axios.post(`${API_URL}/points/award`, {
        userId: selectedStaff,
        points: award.points,
        reason: award.name,
        managerId: user._id,
        managerName: user.name
      });
      await Promise.all([fetchStaffList(), fetchPendingRequests()]);
      setSelectedStaff('');
      setSelectedAward('');
      setError('Points awarded successfully');
    } catch (error) {
      setError('Error awarding points');
    }
  };

  const handlePurchaseRequest = async () => {
    try {
      const purchase = PURCHASE_OPTIONS.find(p => p.id === selectedPurchase);
      await axios.post(`${API_URL}/points/request`, {
        userId: user._id,
        points: purchase.points,
        reason: purchase.name
      });
      await fetchTransactions();
      setSelectedPurchase('');
      setError('Purchase request submitted');
    } catch (error) {
      setError('Error submitting purchase request');
    }
  };

  const handleRequestResponse = async (requestId, approved) => {
    try {
      await axios.post(`${API_URL}/rewards/respond`, {
        requestId,
        approved,
        managerId: user._id,
        managerName: user.name
      });
      await fetchPendingRequests();
      setError(`Request ${approved ? 'approved' : 'denied'}`);
    } catch (error) {
      setError('Error processing request');
    }
  };

  // Welcome Screen
  if (!selectedPortal) {
    return (
      <div className="welcome-container">
        <h1 className="welcome-title">guap.</h1>
        <div>
          <button className="portal-button staff-button" onClick={() => setSelectedPortal('staff')}>
            Staff Portal
          </button>
          <button className="portal-button manager-button" onClick={() => setSelectedPortal('manager')}>
            Manager Portal
          </button>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">
            {selectedPortal === 'staff' ? 'Staff Login' : 'Manager Login'}
          </h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            {error && <div className="text-red-500">{error}</div>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="form-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              onClick={() => setSelectedPortal(null)}
              className="form-button bg-gray-600 hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Staff Portal
  if (user.role === 'staff') {
    return (
      <div className="portal-layout">
        <h1 className="greeting">Hey {user.name.split(' ')[0]} :)</h1>
        <div className="points-display">You have {user.points} points to spend</div>

        <div className="section-box">
          <h2 className="section-title">Request to Use Points:</h2>
          <select
            value={selectedPurchase}
            onChange={(e) => setSelectedPurchase(e.target.value)}
            className="select-input"
          >
            <option value="">Select a purchase</option>
            {PURCHASE_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.points} points)
              </option>
            ))}
          </select>
          <button onClick={handlePurchaseRequest} className="action-button">
            Submit
          </button>
        </div>

        <div className="section-box">
          <h2 className="section-title">Recent Transactions</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction</th>
                <th>Points</th>
                <th>Status</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction._id} className="transaction-row">
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.reason}</td>
                  <td className={transaction.type === 'EARNED' ? 'transaction-positive' : 'transaction-negative'}>
                    {transaction.type === 'EARNED' ? '+' : '-'}{transaction.points}
                  </td>
                  <td>{transaction.status}</td>
                  <td>{transaction.approvedBy || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

 // Manager Portal
return (
  <div className="portal-layout">
    <h1 className="greeting">Hey {user?.name?.split(' ')[0]} :)</h1>

    <div className="section-box">
      <h2 className="section-title">Award Points</h2>
      <div className="form-group">
        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="select-input"
        >
          <option value="">Select staff member</option>
          {staffList && staffList.map(staff => (
            <option key={staff._id} value={staff._id}>
              {staff.name} ({staff.points} points)
            </option>
          ))}
        </select>

        <select
          value={selectedAward}
          onChange={(e) => setSelectedAward(e.target.value)}
          className="select-input"
        >
          <option value="">Select award type</option>
          {POINT_AWARDS.map(award => (
            <option key={award.id} value={award.id}>
              {award.name} ({award.points} points)
            </option>
          ))}
        </select>

        <button onClick={handleAwardPoints} className="action-button">
          Award Points
        </button>
      </div>
    </div>

    <div className="section-box">
      <h2 className="section-title">Staff Point Balances</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Staff Member</th>
            <th>Current Points</th>
          </tr>
        </thead>
        <tbody>
          {staffList && staffList.map(staff => (
            <tr key={staff._id} className="transaction-row">
              <td>{staff.name}</td>
              <td className="font-bold">{staff.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="section-box">
      <h2 className="section-title">Pending Requests</h2>
      {pendingRequests && pendingRequests.length > 0 ? (
        pendingRequests.map(request => (
          <div key={request._id} className="request-card">
            <div className="request-header">
              <span className="font-medium">{request.userId?.name || 'Staff member'} has a Pending Request</span>
            </div>
            <div className="request-text">
              <div>Request: {request.reason}</div>
              <div>Points: {request.points}</div>
              <div className="text-sm">
                Requested: {new Date(request.date).toLocaleString()}
              </div>
            </div>
            <div className="request-actions">
              <button onClick={() => handleRequestResponse(request._id, true)} className="approve-button">
                Approve
              </button>
              <button onClick={() => handleRequestResponse(request._id, false)} className="deny-button">
                Deny
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400">No pending requests</div>
      )}
    </div>
  </div>
);
}
export default App;