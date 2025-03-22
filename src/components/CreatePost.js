import React, { useState } from 'react';
import { Button, TextField, FormControl, InputLabel, MenuItem, Select, Typography, Container, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const categories = ['Technology', 'Health', 'Education', 'Science', 'Lifestyle'];

const PEXELS_API_KEY = 'DobWylb0GnYydvusyd3xWQcVyKETPdg5FBRUYAmyWjekjDbbivKjVlxC';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to fetch a random image from Pexels API
  const fetchImage = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query: category,
          per_page: 1,
        },
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });
      setImageUrl(response.data.photos[0].src.medium);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching image:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      title,
      description,
      category,
      imageUrl,
      created_at: new Date().toISOString(),  // Add timestamp if needed
    };

    // Save the post to Elasticsearch
    try {
      await axios.post('http://localhost:5001/posts', postData);
      navigate('/');
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ padding: 4, mt: 8, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Create a New Post
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Title Field */}
            <TextField
              margin="normal"
              fullWidth
              label="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description Field */}
            <TextField
              margin="normal"
              fullWidth
              label="Post Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              multiline
              rows={4}
            />

            {/* Category Field */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Fetch Image Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={fetchImage}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Loading Image...' : 'Fetch Image'}
            </Button>

            {/* Display Image Preview */}
            {imageUrl && (
              <img src={imageUrl} alt="Post" style={{ width: '100%', marginTop: '16px' }} />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Create Post
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreatePost;
