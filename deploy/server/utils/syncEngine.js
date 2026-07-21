import fs from 'fs';
import path from 'path';
import { getDoc, updateDoc } from '../db.js';

/**
 * Sync Engine - Handles deep knowledge ingestion for the AI Agent.
 */

// Simple crawler to fetch text from a URL
async function crawlUrl(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Simple regex to strip HTML tags (for a robust system, use a parser like cheerio)
    const text = html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    return text.substring(0, 10000); // Limit to 10k chars for now
  } catch (error) {
    console.error(`[Sync Engine] Error crawling ${url}:`, error);
    return "";
  }
}

/**
 * Main sync function for an agent
 */
export async function syncAgentKnowledge(agentId) {
  const agent = await getDoc('ai_agents', agentId);
  if (!agent) return { error: 'Agent not found' };

  console.log(`[Sync Engine] Starting sync for agent: ${agent.name} (${agentId})`);
  
  const tasks = [];

  // 1. Crawl Website
  if (agent.websiteUrl) {
    tasks.push(crawlUrl(agent.websiteUrl).then(webText => `\n--- WEBSITE CONTENT (${agent.websiteUrl}) ---\n${webText}\n`));
  }

  // 2. Social Context
  if (agent.socialHandle) {
    tasks.push(Promise.resolve(`\n--- SOCIAL CONTEXT (${agent.socialHandle}) ---\n${agent.socialBio || 'No social bio provided.'}\n`));
  }

  // 3. PDF Data
  if (agent.pdfData?.length > 0) {
    agent.pdfData.forEach(pdf => {
      tasks.push(Promise.resolve(`\n--- PDF DATA (${pdf.name}) ---\n${pdf.text}\n`));
    });
  }

  const results = await Promise.all(tasks);
  const newKnowledge = results.join('');

  // Update the agent's knowledge brain
  await updateDoc('ai_agents', agentId, {
    knowledgeBase: newKnowledge,
    lastSynced: new Date().toISOString()
  });

  return { success: true, lastSynced: new Date().toISOString() };
}

/**
 * Daily Global Sync Task
 */
export async function runGlobalSync(agents) {
  console.log(`[Sync Engine] Running global sync for ${agents.length} agents...`);
  for (const agent of agents) {
    if (agent.autoSync) {
      await syncAgentKnowledge(agent.id);
    }
  }
}
