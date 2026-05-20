/**
 * blog-state.js — Shared mutable state for the blog subprocess.
 * Used by both app.js (writer) and server/index.js (reader).
 * Avoids circular imports between the two files.
 */

export const blogState = {
  ready: false,
  port: parseInt(process.env.BLOG_PORT || '4000', 10),
};
