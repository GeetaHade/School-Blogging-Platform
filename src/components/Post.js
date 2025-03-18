import React, { useState, useEffect } from 'react';
import { TextField, Button, Card, CardContent, Typography, Grid, CardMedia } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PEXELS_API_KEY = 'DobWylb0GnYydvusyd3xWQcVyKETPdg5FBRUYAmyWjekjDbbivKjVlxC';

const Post = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [posts, setPosts] = useState([]);

  // Load posts from localStorage for the specific user
  useEffect(() => {
    if (user) {
      const storedPosts = JSON.parse(localStorage.getItem(`posts_${user.username}`)) || [];
      setPosts(storedPosts);
      fetchImage();
    }
  }, [user]);

  // Save posts to localStorage when posts change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`posts_${user.username}`, JSON.stringify(posts));
    }
  }, [posts, user]);

  const fetchImage = async () => {
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
        params: {
          query: 'blog',
          per_page: 1,
          page: Math.floor(Math.random() * 100) + 1,
        },
      });

      if (response.data.photos.length > 0) {
        setImage(response.data.photos[0].src.medium);
      } else {
        setImage('https://via.placeholder.com/400x300?text=No+Image');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      setImage('https://via.placeholder.com/400x300?text=No+Image');
    }
  };

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
      author: user.username,
      replies: [],
    };

    setPosts([newPost, ...posts]);
    setTitle('');
    setDescription('');
    fetchImage(); // Fetch a new image for the next post
  };

  // Handle post reply
  const handleReply = (index, reply) => {
    const updatedPosts = [...posts];
    updatedPosts[index].replies.push(reply);
    setPosts(updatedPosts);
  };

  // Handle delete post (for moderators)
  const handleDeletePost = (index) => {
    const updatedPosts = posts.filter((_, i) => i !== index);
    setPosts(updatedPosts);
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
                  {post.date} — by {post.author}
                </Typography>
                <Typography variant="body1" paragraph>
                  {post.description}
                </Typography>

                {/* Replies */}
                {post.replies.map((reply, idx) => (
                  <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                    ➡️ {reply}
                  </Typography>
                ))}

                {/* Reply Input */}
                <TextField
                  label="Reply"
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleReply(index, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  sx={{ mt: 1 }}
                />

                {/* Delete Button - Only for Moderators */}
                {user?.role === 'Moderator' && (
                  <Button
                    color="error"
                    onClick={() => handleDeletePost(index)}
                    sx={{ mt: 1 }}
                  >
                    Delete Post
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Post;
