const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');

const app = express();
const port = 5001;

// Elasticsearch client setup
const client = new Client({ node: 'http://localhost:9200' });

app.use(cors());
app.use(bodyParser.json());

// Create a new post
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
                replies: [] // Initialize replies as an empty array
            },
        });

        res.json({ message: 'Post created', id: result._id });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Error creating post');
    }
});

// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const result = await client.search({
            index: 'posts',
            body: {
                query: { match_all: {} },
                size: 100, // Fetch up to 100 posts
            },
        });

        const posts = result.hits.hits.map(hit => ({
            id: hit._id, // Ensure posts have unique IDs
            ...hit._source,
        }));

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Error fetching posts');
    }
});
app.post('/posts/:postId/reply', async (req, res) => {
  const { postId } = req.params;  // Get the post ID from the URL
  const { user, content } = req.body; // Get the reply data from the request body
  
  try {
    // Fetch the post from Elasticsearch
    const result = await client.get({
      index: 'posts',
      id: postId,
    });

    // Check if replies exists and is an array; if not, initialize it as an empty array
    const replies = Array.isArray(result._source.replies) ? result._source.replies : [];

    // Add the new reply to the replies array
    const updatedPost = {
      ...result._source,
      replies: [
        ...replies,
        {
          user,
          content,
          created_at: new Date().toISOString(),
        },
      ],
    };

    // Update the post in Elasticsearch with the new reply
    await client.index({
      index: 'posts',
      id: postId,
      body: updatedPost,
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
