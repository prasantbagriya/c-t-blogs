'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostForm from '../../PostForm';
import { Post } from '@/lib/types';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;
    fetch('/api/admin/posts')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or Server Busy');
        return res.json();
      })
      .then(data => {
        const found = data.find((p: Post) => p.id === id);
        if (found) setPost(found);
        else setError('Post not found');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Post Editor...</div>;
  if (error) return (
    <div style={{ padding: '2rem', color: '#dc2626' }}>
      <h3>Error: {error}</h3>
      <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px' }}>Retry</button>
    </div>
  );
  if (!post) return <div style={{ padding: '2rem' }}>Post not found.</div>;

  return <PostForm post={post} />;
}
