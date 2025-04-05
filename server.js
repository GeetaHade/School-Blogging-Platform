// backend/server.js or index.js
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5001;

const client = new Client({ node: 'http://localhost:9200' });

app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'your_secret_key';

// 🔒 Improved JWT Auth Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);

  if (!authHeader) return res.status(403).send('No token provided');

  const token = authHeader.split(' ')[1]; // Extract Bearer token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Error:', err);
      return res.status(403).send('Invalid token');
    }
    req.user = user;
    next();
  });
};

// 🔐 Dummy login endpoint (you can integrate real DB later)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Replace this with DB lookup logic
  if (email && password) {
    const username = email.split('@')[0];
    const role = 'Student';

    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token, username, role });
  }

  res.status(400).send('Invalid credentials');
});

// ✅ Create post
app.post('/posts', async (req, res) => {
  const { title, description, category, imageUrl } = req.body;

  try {
    const result = await client.index({
      index: 'posts',
      body: {
        title,
        description,
        category,
        imageUrl,
        created_at: new Date().toISOString(),
        replies: [],
      },
    });

    res.json({ message: 'Post created', id: result._id });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Error creating post');
  }
});

// ✅ Get all posts
app.get('/posts', async (req, res) => {
  try {
    const result = await client.search({
      index: 'posts',
      body: {
        query: { match_all: {} },
        size: 100,
      },
    });

    const posts = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source,
    }));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Error fetching posts');
  }
});

// ✅ Add reply
app.post('/posts/:postId/reply', authenticateJWT, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const user = req.user;

  try {
    const result = await client.get({ index: 'posts', id: postId });
    const replies = Array.isArray(result._source.replies) ? result._source.replies : [];

    const updatedPost = {
      ...result._source,
      replies: [
        ...replies,
        {
          user: user.username,
          content,
          created_at: new Date().toISOString(),
        },
      ],
    };

    await client.update({
      index: 'posts',
      id: postId,
      body: {
        doc: updatedPost,
      },
    });

    res.status(200).json({ message: 'Reply added successfully' });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).send('Error adding reply');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
