import PostForm from '../PostForm';
import { Suspense } from 'react';

export default function NewPostPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Sovereign Editor...</div>}>
      <PostForm />
    </Suspense>
  );
}
