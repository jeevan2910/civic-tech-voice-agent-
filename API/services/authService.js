const fs = require('fs');
const path = require('path');
const config = require('../config');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');

function getUsers() {
  if (!fs.existsSync(usersPath)) return [];
  const raw = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(raw);
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  
  if (!user) {
    return { success: false, message: 'No account found with this email address.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Invalid password. Please check your credentials.' };
  }

  // Create token (deterministic base64 demo token)
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department_id: user.department_id,
    department_name: user.department_name,
    title: user.title,
    avatar: user.avatar,
    timestamp: Date.now()
  };

  const token = Buffer.from(JSON.stringify(payload)).toString('base64');

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department_id: user.department_id,
      department_name: user.department_name,
      title: user.title,
      avatar: user.avatar
    }
  };
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const user = JSON.parse(raw);
    return user;
  } catch (e) {
    return null;
  }
}

module.exports = {
  login,
  verifyToken,
  getUsers
};
