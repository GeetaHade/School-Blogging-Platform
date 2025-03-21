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
          created_at: new Date(),
        },
      });
      console.log('Elasticsearch response:', result); // Log the full result to debug
      res.status(201).send(result);
    } catch (error) {
      console.error('Error saving post to Elasticsearch', error);
      res.status(500).send('Error saving post');
    }
});
  
app.get('/posts', async (req, res) => {
    try {
        const result = await client.search({
            index: 'posts',
            body: {
                query: {
                    match_all: {},
                },
            },
        });

        console.log('Elasticsearch response:', JSON.stringify(result.hits.hits, null, 2)); // Expanded logging

        // Extract the _source data correctly
        const posts = result.hits.hits.map(hit => hit._source);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts', error);
        res.status(500).send('Error fetching posts');
    }
});

  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
