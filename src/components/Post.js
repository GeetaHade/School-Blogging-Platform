import React, { useState, useEffect } from 'react';
import { TextField, Button, Card, CardContent, Typography, Grid, CardMedia } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Keep only the necessary imports
import axios from 'axios';

const PEXELS_API_KEY = 'DobWylb0GnYydvusyd3xWQcVyKETPdg5FBRUYAmyWjekjDbbivKjVlxC'; // Add your API key here

const Post = () => {
  const { user } = useAuth(); // Removed logout, since it's not used
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [posts, setPosts] = useState([]);

  // Fetch a random image from Pexels API
  const fetchImage = async () => {
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
        params: {
          query: 'blog',
          per_page: 1,
          page: Math.floor(Math.random() * 100) + 1, // Randomize results
        },
      });

      if (response.data.photos.length > 0) {
        setImage(response.data.photos[0].src.medium);
      } else {
        setImage('https://via.placeholder.com/400x300?text=No+Image');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      setImage('https://via.placeholder.com/400x300?text=No+Image'); // Fallback image
    }
  };

  useEffect(() => {
    fetchImage();
  }, []);

  // Handle post creation
  const handlePostCreation = () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    const newPost = {
      title,
      description,
      date: new Date().toLocaleDateString(),
      image,
      imageLabel: 'Post Image',
    };

    setPosts([newPost, ...posts]);
    setTitle('');
    setDescription('');
    fetchImage(); // Fetch a new image for the next post
  };

  if (!user) {
    return (
      <Typography variant="h5" gutterBottom>
        Please log in to create a post.
      </Typography>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Create a New Post
      </Typography>

      {/* Post Creation Form */}
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handlePostCreation}
        sx={{ mt: 2 }}
      >
        Create Post
      </Button>

      {/* Display Created Posts */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {posts.map((post, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: 200,
                  objectFit: 'cover',
                }}
                image={post.image}
                alt={post.imageLabel}
              />
              <CardContent>
                <Typography component="h2" variant="h5" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {post.date}
                </Typography>
                <Typography variant="body1" paragraph>
                  {post.description}
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  Continue reading...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Post;
