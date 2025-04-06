import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, CardMedia, Grid, Container, TextField, Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/posts');
        if (Array.isArray(response.data)) {
          setPosts(response.data);
        } else {
          console.error('Unexpected data format');
        }
      } catch (error) {
        console.error('Error fetching posts', error);
      }
    };

    fetchPosts();
  }, []);

  const handleReplyChange = (postId, event) => {
    setReplyInputs(prev => ({
      ...prev,
      [postId]: event.target.value,
    }));
  };

  const handleReplySubmit = async (postId) => {
    const content = replyInputs[postId];
    if (!content.trim()) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in to reply.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/posts/${postId}/reply`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  replies: [
                    ...post.replies,
                    { user: user.username, content, created_at: new Date().toISOString() },
                  ],
                }
              : post
          )
        );
        setReplyInputs({ ...replyInputs, [postId]: '' });
      } else {
        console.error('Failed to add reply:', response);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };
  
  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You must be logged in as a moderator to delete a post.');
      return;
    }
  
    //console.log("Attempting to delete post with ID:", postId); // 🔍 Debug log to check the postId
  
    try {
      const response = await axios.delete(`http://localhost:5001/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      //console.log("Delete response:", response); // 🔍 Debug log to see the response from backend
  
      if (response.status === 200) {
        alert('Post deleted successfully.');
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId)); // Remove deleted post from UI
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Post not found or already deleted.');
      } else {
        alert('An error occurred while deleting the post.');
      }
      //console.error('Error deleting post:', error); // Detailed error log
    }
  };
  
  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {posts.length > 0 ? (
          posts.map(post => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card>
                <CardMedia component="img" height="140" image={post.imageUrl} alt={post.title} />
                <CardContent>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body2">{post.description}</Typography>

                  {post.replies?.length > 0 && (
                    <div>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>Replies:</Typography>
                      {post.replies.map((reply, index) => (
                        <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                          <strong>{reply.user || 'Anonymous'}:</strong> {reply.content}
                        </Typography>
                      ))}
                    </div>
                  )}

                  {user && (
                    <>
                      <TextField
                        label="Write a reply..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ mt: 2 }}
                        value={replyInputs[post.id] || ''}
                        onChange={(e) => handleReplyChange(post.id, e)}
                      />
                      <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleReplySubmit(post.id)}>
                        Reply
                      </Button>
                      {user.role === 'Moderator' && (
                        <Button
                          variant="outlined"
                          color="error"
                          sx={{ mt: 1, ml: 1 }}
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No posts available.</Typography>
        )}
      </Grid>
    </Container>
  );
}

export default Posts;
