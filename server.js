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

const axios = require('axios');


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

// OpenAI post reply route
app.post('/generate-reply', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer open_ai_key`, // replace this
          'Content-Type': 'application/json',
        },
      }
    );

    const aiReply = response.data.choices[0].message.content.trim();
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    res.status(500).send('Failed to generate AI reply');
  }
});

// Chatbot assistant route
app.post('/chatbot/recommend', async (req, res) => {
  const { latitude, longitude, message } = req.body;

  try {
    // Step 1: Get weather data
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: latitude,
        lon: longitude,
        units: 'metric',
        appid: 'weather_api_key' // replace with your OpenWeatherMap API key
      }
    });

    const weather = weatherResponse.data.weather[0].description;
    const temp = weatherResponse.data.main.temp;
    const city = weatherResponse.data.name;

    // Step 2: Get local events
    const serpResponse = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: 'live sports or events near me',
        location: city,
        api_key: 'serp_api_key'
      }
    });

    const events = serpResponse.data?.organic_results?.slice(0, 3).map((e, i) => `${i + 1}. ${e.title}`).join('\n') || 'No recent events found.';

    // Step 3: Send final prompt to OpenAI
    const fullPrompt = `User asked: "${message}".\nWeather in ${city}: ${weather}, ${temp}°C.\nCurrent local events:\n${events}\n\nRespond in a helpful and friendly way.`;

    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: fullPrompt }],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer open_ai_key`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = aiResponse.data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error('Error in /chatbot/recommend:', error.message);
    res.status(500).json({ error: 'Failed to generate recommendation.' });
  }
});
const formatPlaces = (places, type) => {
  return places.slice(0, 3).map((item) => ({
    name: item.title,
    type: type,
    details: {
      address: item.address || "Not Provided",
      latitude: item.gps_coordinates?.latitude || (41.8781 + Math.random() * 0.02),
      longitude: item.gps_coordinates?.longitude || (-87.6298 + Math.random() * 0.02),
      hours: item.hours || []
    }
  }));
};

app.post('/recommendations', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    // Weather API
    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat: latitude, lon: longitude, units: 'metric', appid: 'weather_api_key' }
    });

    const city = weatherRes.data.name;
    const weather = weatherRes.data.weather[0].description;
    const temp = weatherRes.data.main.temp;

    // Fetch events
    const search = async (query) => {
      try {
        const serp = await axios.get('https://serpapi.com/search.json', {
          params: { q: query, location: city, api_key: 'weather_api_key' }
        });
        let results = [];
        if (Array.isArray(serp.data.local_results?.places)) {
          results = serp.data.local_results.places;
        } else if (Array.isArray(serp.data.local_results)) {
          results = serp.data.local_results;
        } else if (Array.isArray(serp.data.organic_results)) {
          results = serp.data.organic_results;
        }
        return results;
      } catch (err) {
        console.error(`SerpAPI error:`, err.message);
        return [];
      }
    };

    const [rawRestaurants, rawConcerts, rawSports] = await Promise.all([
      search('restaurants near me'),
      search('live concerts near me'),
      search('live sports events near me')
    ]);

    const restaurants = formatPlaces(rawRestaurants, 'restaurant');
    const concerts = formatPlaces(rawConcerts, 'music');
    const sports = formatPlaces(rawSports, 'sports');

    // OpenAI summarization prompt
    const formatItems = (list) => list.map((item, i) => `${i + 1}. ${item.name} (${item.details.address})`).join('\n');

    const prompt = `
Generate recommendations based on:
City: ${city}
Weather: ${weather}, ${temp}°C

Top 3 Restaurants:
${formatItems(restaurants)}

Top 3 Musical Events:
${formatItems(concerts)}

Top 3 Sports Events:
${formatItems(sports)}

Write a fun and personalized activity suggestion summary for today.
`;

    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    }, {
      headers: {
        Authorization: `Bearer open_ai_key`,
        'Content-Type': 'application/json',
      }
    });

    const summary = openaiRes.data.choices[0].message.content.trim();

    res.json({
      city,
      weather,
      temperature: temp,
      restaurants,
      concerts,
      sports,
      summary
    });

  } catch (err) {
    console.error('Recommendation error:', err.message);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});





app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
