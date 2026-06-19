/**
 * blog-state.js — Shared mutable state for the blog subprocess.
 * Used by both app.js (writer) and server/index.js (reader).
 * Avoids circular imports between the two files.
 */

const isDev = process.env.NODE_ENV === 'development';

export const blogState = {
  ready: isDev ? true : false,
  port: parseInt(process.env.BLOG_PORT || (isDev ? '4289' : '4000'), 10),
};
