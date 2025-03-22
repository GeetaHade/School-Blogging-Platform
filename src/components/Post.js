import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, CardMedia, Grid, Container } from '@mui/material';

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/posts');
        console.log('Fetched data:', response.data); // Debugging to check the response format

        // Ensure the response data is an array and correctly formatted
        if (Array.isArray(response.data)) {
          setPosts(response.data); // Store the correct data format
        } else {
          console.error('No posts found or incorrect data format');
        }
      } catch (error) {
        console.error('Error fetching posts', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  alt={post.title}
                  height="140"
                  image={post.imageUrl}  // Ensure the correct field is used
                />
                <CardContent>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {post.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No posts available.
          </Typography>
        )}
      </Grid>
    </Container>
  );
}

export default Posts;
