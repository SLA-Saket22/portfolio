const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

const JWT_SECRET  = process.env.JWT_SECRET  || 'super_secret_jwt_key_change_this';
const INVITE_CODE = process.env.INVITE_CODE || 'ADMIN-2024';

// ─── MongoDB Connection ─────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio_admin')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

// ─── Schemas ────────────────────────────────────────────────────────

// Legacy single-admin schema (kept for backward compatibility)
const AdminSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// New multi-user schema with roles and approval flow
const UserSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'editor', 'pending'], default: 'pending' },
  approved:  { type: Boolean, default: false },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  tech:        [String],
  liveUrl:     String,
  githubUrl:   String,
  image:       String,
  featured:    { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  content:   { type: String, required: true },
  excerpt:   String,
  tags:      [String],
  published: { type: Boolean, default: false },
  views:     { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  subject:   String,
  message:   { type: String, required: true },
  read:      { type: Boolean, default: false },
  starred:   { type: Boolean, default: false },
  replied:   { type: Boolean, default: false },
  ip:        String,
  createdAt: { type: Date, default: Date.now }
});

const SkillSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  category: String,
  level:    { type: Number, min: 0, max: 100, default: 80 },
  icon:     String,
  order:    { type: Number, default: 0 }
});

const Admin   = mongoose.model('Admin',   AdminSchema);
const User    = mongoose.model('User',    UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Blog    = mongoose.model('Blog',    BlogSchema);
const Message = mongoose.model('Message', MessageSchema);
const Skill   = mongoose.model('Skill',   SkillSchema);

// ─── JWT Middleware ─────────────────────────────────────────────────
// Supports both old Admin tokens and new User tokens
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user)          return res.status(401).json({ error: 'User not found' });
      if (!user.approved) return res.status(403).json({ error: 'Account pending approval' });
      req.admin = { id: user._id, username: user.username, role: user.role };
      req.user  = user;
    } else {
      req.admin = decoded; // legacy token
    }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ─── Seed default admin ─────────────────────────────────────────────
async function seedAdmin() {
  const legacyExists = await Admin.findOne({ username: 'admin' });
  if (!legacyExists) {
    const hashed = await bcrypt.hash('admin123', 12);
    await Admin.create({ username: 'admin', password: hashed });
    console.log('Default admin created (legacy): admin / admin123');
  }
  const userExists = await User.findOne({ username: 'admin' });
  if (!userExists) {
    const hashed = await bcrypt.hash('admin123', 12);
    await User.create({ username: 'admin', email: 'admin@example.com', password: hashed, role: 'admin', approved: true });
    console.log('Default admin created (users): admin / admin123');
    console.log('Invite code: ' + INVITE_CODE);
  }
}
seedAdmin();

// ═══════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════

// REGISTER (NEW)
// POST /api/auth/register
// Body: { username, email, password, inviteCode? }
// Correct inviteCode  => role=admin, approved=true (instant access)
// No / wrong code     => role=pending, approved=false (needs approval)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, inviteCode } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email and password are required' });
    if (username.trim().length < 3)
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address' });

    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const isAdmin = inviteCode && inviteCode.trim() === INVITE_CODE;
    const hashed  = await bcrypt.hash(password, 12);

    await User.create({
      username: username.trim(),
      email:    email.trim().toLowerCase(),
      password: hashed,
      role:     isAdmin ? 'admin' : 'pending',
      approved: isAdmin
    });

    res.status(201).json({
      message:  isAdmin
        ? 'Admin account created. You can now log in.'
        : 'Account created. Waiting for admin approval.',
      approved: isAdmin
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// LOGIN
// Tries new User collection first, falls back to legacy Admin
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    const user = await User.findOne({ username: username.trim() });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      if (!user.approved)
        return res.status(403).json({ error: 'Account pending approval. Contact the admin.' });
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        JWT_SECRET, { expiresIn: '7d' }
      );
      return res.json({ token, username: user.username, role: user.role });
    }

    // Legacy Admin fallback
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: admin.username, role: 'admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGE PASSWORD
app.post('/api/auth/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both fields are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    if (req.user) {
      const user  = await User.findById(req.user._id);
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ error: 'Current password incorrect' });
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();
    } else {
      const admin = await Admin.findById(req.admin.id);
      const match = await bcrypt.compare(currentPassword, admin.password);
      if (!match) return res.status(400).json({ error: 'Current password incorrect' });
      admin.password = await bcrypt.hash(newPassword, 12);
      await admin.save();
    }
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY TOKEN
app.get('/api/auth/verify', auth, (req, res) => {
  res.json({ valid: true, username: req.admin.username, role: req.admin.role || 'admin' });
});

// LIST USERS (admin only)
app.get('/api/auth/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// APPROVE / UPDATE USER
// PUT /api/auth/users/:id   Body: { approved?, role? }
app.put('/api/auth/users/:id', auth, async (req, res) => {
  try {
    const { approved, role } = req.body;
    const update = {};
    if (approved !== undefined) update.approved = approved;
    if (role)                   update.role     = role;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE USER
app.delete('/api/auth/users/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
//  PROJECTS ROUTES  (unchanged)
// ═══════════════════════════════════════════════════════════════════

app.get('/api/projects', async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  res.json(projects);
});

app.post('/api/projects', auth, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/projects/:id', auth, async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
//  BLOGS ROUTES  (unchanged)
// ═══════════════════════════════════════════════════════════════════

app.get('/api/blogs', async (req, res) => {
  const query = req.headers.authorization ? {} : { published: true };
  const blogs = await Blog.find(query).sort({ createdAt: -1 });
  res.json(blogs);
});

app.post('/api/blogs', auth, async (req, res) => {
  try {
    if (!req.body.slug) {
      req.body.slug = req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/blogs/:id', auth, async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(blog);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/blogs/:id', auth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
//  MESSAGES ROUTES  (unchanged)
// ═══════════════════════════════════════════════════════════════════

app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: 'Name, email & message required' });
    await Message.create({ name, email, subject, message, ip: req.ip });
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/messages', auth, async (req, res) => {
  const { filter } = req.query;
  let query = {};
  if (filter === 'unread')  query.read    = false;
  if (filter === 'starred') query.starred = true;
  const messages = await Message.find(query).sort({ createdAt: -1 });
  res.json(messages);
});

app.put('/api/messages/:id', auth, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(msg);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/messages/:id', auth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
//  SKILLS ROUTES  (unchanged)
// ═══════════════════════════════════════════════════════════════════

app.get('/api/skills', async (req, res) => {
  const skills = await Skill.find().sort({ order: 1 });
  res.json(skills);
});

app.post('/api/skills', auth, async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/skills/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/skills/:id', auth, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════
//  STATS ROUTE  (unchanged)
// ═══════════════════════════════════════════════════════════════════

app.get('/api/stats', auth, async (req, res) => {
  const [projects, blogs, messages, unread] = await Promise.all([
    Project.countDocuments(),
    Blog.countDocuments({ published: true }),
    Message.countDocuments(),
    Message.countDocuments({ read: false })
  ]);
  res.json({ projects, blogs, messages, unread });
});

// ═══════════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Admin invite code: ' + INVITE_CODE);
});