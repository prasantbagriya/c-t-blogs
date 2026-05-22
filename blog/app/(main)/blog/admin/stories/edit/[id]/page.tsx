'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StoryForm from '../../StoryForm';
import { WebStory } from '@/lib/types';

export default function EditStoryPage() {
  const params = useParams();
  const [story, setStory] = useState<WebStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;
    fetch('/api/admin/stories')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load stories');
        return res.json();
      })
      .then(data => {
        const found = data.find((s: WebStory) => s.id === id);
        if (found) setStory(found);
        else setError('Story not found');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Story Editor...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#dc2626' }}>Error: {error}</div>;
  if (!story) return <div style={{ padding: '2rem' }}>Story not found.</div>;

  return <StoryForm story={story} />;
}
