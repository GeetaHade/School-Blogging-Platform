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

// ✅ JWT middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  //console.log('Authorization header:', authHeader);

  if (!authHeader) return res.status(403).send('No token provided');

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Error:', err);
      return res.status(403).send('Invalid token');
    }
    //console.log('Authenticated user:', user);
    req.user = user;
    next();
  });
};

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

app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  //console.log("Received delete request for post ID:", postId); // 🔍 Log the ID

  try {
    const result = await client.delete({
      index: 'posts',
      id: postId,
    });

    //console.log("Elasticsearch delete response:", result); // ✅ See what Elasticsearch says

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    //console.error("Error deleting post:", error.meta?.body?.error || error.message); // ❌ Debug any error
    res.status(404).json({ message: 'Post not found or already deleted' });
  }
});


// ✅ Login route
app.post('/login', (req, res) => {
  const { username, password, role } = req.body;

  // Simplified for demonstration
  const user = { username, role };

  const token = jwt.sign(user, JWT_SECRET);

  res.json({ token });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
