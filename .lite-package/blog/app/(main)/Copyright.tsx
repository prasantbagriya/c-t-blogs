'use client';

import { useState, useEffect } from 'react';

export default function Copyright() {
  const [year, setYear] = useState(2026); // Default stable value for SSR

  useEffect(() => {
    // Only updates on the client, preventing hydration & build errors
    setYear(new Date().getFullYear());
  }, []);

  return (
    <span>
      &copy; {year} ChatWizs Blogs.
    </span>
  );
}
