import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, CardMedia, Grid, Container, TextField, Button } from '@mui/material';

function Posts() {
    const [posts, setPosts] = useState([]);
    const [replyInputs, setReplyInputs] = useState({});

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5001/posts');
                console.log('Fetched data:', response.data);

                if (Array.isArray(response.data)) {
                    setPosts(response.data);
                } else {
                    console.error('No posts found or incorrect data format');
                }
            } catch (error) {
                console.error('Error fetching posts', error);
            }
        };

        fetchPosts();
    }, []);

    const handleReplyChange = (postId, event) => {
        setReplyInputs((prev) => ({
            ...prev,
            [postId]: event.target.value,
        }));
    };

    const handleReplySubmit = async (postId) => {
        const content = replyInputs[postId];
        if (!content.trim()) return;

        try {
            const response = await axios.post(`http://localhost:5001/posts/${postId}/reply`, { user: 'Anonymous', content });
            console.log('Reply added:', response.data);

            // Update the posts array with the new reply by modifying the specific post
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              replies: [
                                  ...post.replies,
                                  { user: 'Anonymous', content, created_at: new Date().toISOString() },
                              ],
                          }
                        : post
                )
            );
            setReplyInputs({ ...replyInputs, [postId]: '' });
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} key={post.id}>
                            <Card>
                                <CardMedia component="img" alt={post.title} height="140" image={post.imageUrl} />
                                <CardContent>
                                    <Typography variant="h6">{post.title}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {post.description}
                                    </Typography>

                                    {/* Display Replies */}
                                    {post.replies && post.replies.length > 0 && (
                                        <div>
                                            <Typography variant="subtitle1" sx={{ mt: 2 }}>Replies:</Typography>
                                            {post.replies.map((reply, index) => (
                                                <Typography key={`${post.id}-reply-${index}`} variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                                                    <strong>{reply.user}:</strong> {reply.content}
                                                </Typography>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
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
