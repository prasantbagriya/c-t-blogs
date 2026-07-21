import { getCollection, getDoc, addDoc, setDoc, updateDoc, deleteDoc } from './db.js';
import { appendToGoogleSheet } from './utils/googleSheets.js';
import { detectOptOut, detectScam, suggestReply } from './ai.js';

/**
 * Entry point for WhatsApp messages
 */
export async function processFlowMessage(incomingMsg, account) {
  return processUniversalMessage(incomingMsg, 'whatsapp', account);
}

/**
 * Entry point for Threads messages
 */
export async function processThreadsMessage(incomingMsg, account) {
  const { from, text, parentId, username } = incomingMsg;
  const recipient = from || incomingMsg.visitorId;
  const sessionId = `threads_${recipient}`;

  // 1. SCAM DETECTION
  const isScam = await detectScam(text || '');
  if (isScam) {
    console.log(`[FlowEngine] 🛡️ SCAM Detected in Threads comment: "${text}"`);
    await addDoc('threads_spam', {
      accountId: account.id,
      replyId: incomingMsg.threadId || incomingMsg.id,
      threadId: parentId || incomingMsg.threadId || incomingMsg.id,
      username: username || 'unknown',
      text: text || '',
      matched_keyword: 'AI_SCAM_DETECTOR',
      timestamp: new Date().toISOString(),
      uid: account.uid
    });
    // Optional: Auto-delete or flag for review. For now, we just save to spam collection.
    return false;
  }

  // 2. CHECK FOR CONTINUITY FLOW (Comment to DM)
  const session = await getDoc('flow_sessions', sessionId);
  if (!session && parentId) {
    try {
      const posts = await getCollection('threads_posts');
      const post = posts.find(p => p.threadId === parentId && p.continuity_flow_id);
      
      if (post && post.continuity_flow_id) {
        console.log(`[FlowEngine] 🔗 Comment detected on Thread ${parentId}. Starting Continuity Flow: ${post.continuity_flow_id}`);
        
        // Before running the flow, we should send a DM to start the conversation
        // The flow engine will handle the DM delivery via 'sendThreadsDM'
        return processUniversalMessage(incomingMsg, 'threads', { 
          ...account, 
          connectedFlowId: post.continuity_flow_id,
          useDM: true // Signal to use DM instead of public reply
        });
      }
    } catch (e) {
      console.warn('[FlowEngine] Continuity check failed:', e.message);
    }
  }

  // 3. REGULAR FLOW PROCESSING
  const handled = await processUniversalMessage(incomingMsg, 'threads', account);

  // 4. AI AGENT FALLBACK (Auto-reply)
  if (!handled && account.ai_enabled) {
    console.log(`[FlowEngine] 🤖 Threads AI Fallback triggered for: ${text}`);
    const agents = await getCollection('ai_agents');
    const agent = agents.find(a => a.uid === account.uid && a.isActive);
    
    if (agent) {
      const history = [{ sender: 'customer', text }];
      const context = {
        businessName: agent.name,
        description: agent.description,
        knowledgeBase: agent.knowledgeBase,
        persona: agent.persona
      };
      
      const aiReply = await suggestReply(history, context);
      if (aiReply && !aiReply.includes('[HANDOVER_REQUIRED]')) {
        await deliverMessage(recipient, aiReply, 'threads', { ...account, uid: account.uid }, { parentId });
        return true;
      }
    }
  }

  return handled;
}



/**
 * Entry point for Instagram messages
 */
export async function processInstagramMessage(incomingMsg, account) {
  const { from, text, mediaId, isComment } = incomingMsg;
  const recipient = from || incomingMsg.visitorId;
  const sessionId = `instagram_${recipient}`;

  // 1. CHECK FOR CONTINUITY FLOW (Comment to DM)
  const session = await getDoc('flow_sessions', sessionId);
  if (!session && isComment && mediaId) {
    try {
      const posts = await getCollection('instagram_posts');
      const post = posts.find(p => (p.instagramId === mediaId || p.id === mediaId) && p.continuity_flow_id);
      
      if (post && post.continuity_flow_id) {
        console.log(`[FlowEngine] 🔗 Comment detected on IG Post ${mediaId}. Starting Continuity Flow: ${post.continuity_flow_id}`);
        
        return processUniversalMessage(incomingMsg, 'instagram', { 
          ...account, 
          connectedFlowId: post.continuity_flow_id,
          useDM: true 
        });
      }
    } catch (e) {
      console.warn('[FlowEngine] Instagram Continuity check failed:', e.message);
    }
  }

  // 2. REGULAR FLOW PROCESSING
  const handled = await processUniversalMessage(incomingMsg, 'instagram', account);

  // 3. AI AGENT FALLBACK (Auto-reply)
  if (!handled && account.ai_enabled) {
    console.log(`[FlowEngine] 🤖 Instagram AI Fallback triggered for: ${text}`);
    const agents = await getCollection('ai_agents');
    const agent = agents.find(a => a.uid === account.uid && a.isActive);
    
    if (agent) {
      const history = [{ sender: 'customer', text }];
      const context = {
        businessName: agent.name,
        description: agent.description,
        knowledgeBase: agent.knowledgeBase,
        persona: agent.persona
      };
      
      const aiReply = await suggestReply(history, context);
      if (aiReply && !aiReply.includes('[HANDOVER_REQUIRED]')) {
        await deliverMessage(recipient, aiReply, 'instagram', { ...account, uid: account.uid }, { isComment, mediaId });
        return true;
      }
    }
  }

  return handled;
}

/**
 * Entry point for Website Widget messages
 */
export async function processWidgetMessage(incomingMsg) {
  const { widgetId, uid, visitorId, text, metadata, interactiveId, submissionData } = incomingMsg;

  // Fetch widget settings to get the connectedFlowId (if any)
  let connectedFlowId = null;
  if (widgetId) {
    try {
      const settings = await getDoc('widget_settings', widgetId);
      if (settings && settings.connectedFlowId) {
        connectedFlowId = settings.connectedFlowId;
      }
    } catch (e) {
      console.warn('[FlowEngine] Could not fetch widget settings:', e.message);
    }
  }

  const context = { id: widgetId, uid, connectedFlowId };
  return processUniversalMessage({ visitorId, text, metadata, interactiveId, submissionData }, 'widget', context);
}

async function logDebug(msg) {
  console.log(`[FlowEngine] ${msg}`);
}

export async function processUniversalMessage(incomingMsg, source, context) {
  try {
    const { from, visitorId, text, direction, interactiveId, submissionData } = incomingMsg;
    const uid = context.uid;
    const recipient = from || visitorId;
    const sessionId = `${source}_${recipient}`;

    // 1. Parallel fetch of required initial data
    const [session, blacklist, profiles] = await Promise.all([
      getDoc('flow_sessions', sessionId),
      getCollection('blacklist'),
      getCollection('customer_profiles')
    ]);
    
    // Cache blacklist and profiles in context for sub-functions
    context.blacklist = blacklist;
    context.profiles = profiles;

    // ✅ FIX #1: Prevent Loop - Ignore outbound messages
    if (direction === 'outbound') return false;

    // ✅ Suppression Check (Opt-out & Blacklist)
    const isBlacklisted = blacklist.some(b => b.phoneNumber === recipient || b.visitorId === recipient);
    const isOptOut = detectOptOut(text || '');

    if (isBlacklisted || isOptOut) {
      if (isOptOut && !isBlacklisted) {
        await addDoc('blacklist', { 
          phoneNumber: recipient, visitorId: recipient, reason: 'Opt-out keyword', createdAt: new Date().toISOString() 
        });
      }
      if (session) await deleteDoc('flow_sessions', sessionId);
      return false;
    }

    // 0. Handoff check
    const profile = profiles.find(p => p.visitorId === recipient || p.phone === recipient || p.id === recipient);
    if (profile) {
      const now = new Date();
      const handoffUntil = profile.handoffUntil ? new Date(profile.handoffUntil) : null;
      const lastInteraction = profile.lastInteraction ? new Date(profile.lastInteraction) : null;
      const minutesSinceLastInteraction = lastInteraction ? (now.getTime() - lastInteraction.getTime()) / (60 * 1000) : 999;
      const isIdle = minutesSinceLastInteraction > 10; 

      if ((profile.status === 'human' || (handoffUntil && now < handoffUntil)) && !isIdle) return false;
      await updateDoc('customer_profiles', profile.id, { lastInteraction: new Date().toISOString() });
    }

    // ✅ AUTO-CLOSE Timeout
    if (session && session.status === 'active' && session.updatedAt) {
      const timeoutMs = 10 * 60 * 1000;
      if (Date.now() - new Date(session.updatedAt).getTime() > timeoutMs) {
        await deleteDoc('flow_sessions', sessionId);
        return processUniversalMessage(incomingMsg, source, context); // Re-run as new trigger
      }
    }

    if (session && session.status === 'active') {
      const { flowId, currentNodeId, collectionName } = session;
      const allFlows = await getCollection(collectionName);
      let flow = allFlows.find(f => f.id === flowId);

      if (!flow || !flow.nodes) {
        const waFlows = await getCollection('chat_flows_whatsapp');
        flow = waFlows.find(f => f.id === flowId);
      }

      if (flow && flow.nodes && flow.edges) {
        const { nodes, edges } = flow;
        const sourceNode = nodes.find(n => n.id === currentNodeId);
        const outgoingEdges = edges.filter(e => e.source === currentNodeId);
        let matchedEdge = null;
        const lowerText = (text || '').toLowerCase().trim();
        const targetId = incomingMsg.interactiveId?.toString();

        for (const edge of outgoingEdges) {
          const handleId = edge.sourceHandle;
          if (sourceNode?.type === 'message' && sourceNode.data.buttons) {
            const btn = sourceNode.data.buttons.find(b => {
              const bId = b.id?.toString();
              const bLabel = (b.label || b.title || '').toLowerCase().trim();
              return targetId ? (bId === targetId && (handleId === bId || handleId === `${bId}_primary`)) : (bLabel === lowerText && (handleId === bId || handleId === `${bId}_primary`));
            });
            if (btn) matchedEdge = edge;
          } else if (sourceNode?.type === 'list') {
            const foundInList = (sourceNode.data.sections || []).some(sec => (sec.rows || []).some(r => {
              const rId = r.id?.toString();
              const rTitle = (r.title || '').toLowerCase().trim();
              return targetId ? (rId === targetId && (handleId === rId || handleId === `${rId}_primary`)) : (rTitle === lowerText && (handleId === rId || handleId === `${rId}_primary`));
            }));
            if (foundInList) matchedEdge = edge;
          } else if (sourceNode?.type === 'flow_form') {
            matchedEdge = outgoingEdges[0];
          } else if (sourceNode?.type === 'ask_location' && incomingMsg.location) {
            matchedEdge = outgoingEdges.find(e => e.sourceHandle === 'received');
            submissionData.latitude = incomingMsg.location.latitude;
            submissionData.longitude = incomingMsg.location.longitude;
          }
          if (matchedEdge) break;
        }

        if (matchedEdge) {
          await updateDoc('flow_sessions', sessionId, { status: 'completed' });
          if (submissionData && Object.keys(submissionData).length > 0 && profile) {
            await updateDoc('customer_profiles', profile.id, { ...submissionData, lastInteraction: new Date().toISOString() });
          }
          executeFlowFromNode(matchedEdge.target, nodes, edges, recipient, source, { ...context, lastMessage: text, ...submissionData }, flow.id, flow.collection || collectionName);
          return true;
        } else {
          // Global Search (optimized)
          let globalMatch = targetId ? edges.find(e => e.sourceHandle === `${targetId}_alt` || e.sourceHandle === `${targetId}_primary` || e.sourceHandle === targetId) : null;
          if (globalMatch) {
            await updateDoc('flow_sessions', sessionId, { status: 'completed' });
            executeFlowFromNode(globalMatch.target, nodes, edges, recipient, source, { ...context, lastMessage: text, ...submissionData }, flow.id, flow.collection || collectionName);
            return true;
          }
          await deleteDoc('flow_sessions', sessionId);
        }
      }
    }

    if (submissionData && Object.keys(submissionData).length > 0) return true;

    // Search across all flow collections in parallel
    const colls = source === 'widget' ? ['chat_flows_widget', 'chat_flows_whatsapp', 'chat_flows_instagram', 'chat_flows_threads'] : ['chat_flows_whatsapp', 'chat_flows_instagram', 'chat_flows_threads', 'chat_flows_widget'];
    const allCollsFlows = await Promise.all(colls.map(c => getCollection(c)));
    let allActiveFlows = allCollsFlows.flat().filter(f => {
      const isOwner = (f.uid === uid || (context.parentId && f.uid === context.parentId));
      if (!isOwner || f.status !== 'Active') return false;
      const allowedIds = f[`${source}AccountIds`] || (f[`${source}AccountId`] ? [f[`${source}AccountId`]] : (source === 'widget' ? (f.websiteAccountIds || f.widgetIds || (f.websiteAccountId ? [f.websiteAccountId] : (f.widgetId ? [f.widgetId] : []))) : []));
      return allowedIds.length === 0 || allowedIds.includes(context.id);
    });

    // Connected flow priority
    if (source === 'widget' && context.connectedFlowId) {
      const targetFlow = allActiveFlows.find(f => f.id === context.connectedFlowId);
      const triggerNode = targetFlow?.nodes?.find(n => n.type === 'trigger');
      if (triggerNode) {
        await deleteDoc('flow_sessions', sessionId);
        const executionResult = await executeFlowFromNode(triggerNode.id, targetFlow.nodes, targetFlow.edges, recipient, source, { ...context, lastMessage: text }, targetFlow.id, 'chat_flows_widget');
        updateDoc('chat_flows_widget', targetFlow.id, { analytics: { messagesRecieved: (targetFlow.analytics?.messagesRecieved || 0) + 1, repliesSent: (targetFlow.analytics?.repliesSent || 0) + (executionResult?.messagesSent || 0), lastTriggered: new Date().toISOString() } }).catch(() => {});
        return true;
      }
    }

    for (const flow of allActiveFlows) {
      const triggerNodes = (flow.nodes || []).filter(n => n.type === 'trigger' || (n.type === 'webhook' && n.data?.webhookEvent === 'google_sheets_new_row'));
      for (const triggerNode of triggerNodes) {
        if ((triggerNode.data?.platform || 'all') !== 'all' && triggerNode.data?.platform !== source) continue;
        let isMatched = triggerNode.type === 'webhook' ? !!incomingMsg.googleSheetsData : (triggerNode.data?.triggerType === 'Any Message');
        if (!isMatched && triggerNode.data?.triggerType === 'Keywords') {
          const keywords = Array.isArray(triggerNode.data.keywords) ? triggerNode.data.keywords : (triggerNode.data.keywords ? triggerNode.data.keywords.split(',').map(k => k.trim()) : []);
          isMatched = keywords.length === 0 || keywords.some(kw => kw && (text || '').toLowerCase().includes(kw.toLowerCase()));
        }
        if (isMatched) {
          await deleteDoc('flow_sessions', sessionId);
          const currentColl = flow.collection || (flow.platform === 'instagram' ? 'chat_flows_instagram' : flow.platform === 'threads' ? 'chat_flows_threads' : flow.platform === 'widget' ? 'chat_flows_widget' : 'chat_flows_whatsapp');
          const res = await executeFlowFromNode(triggerNode.id, flow.nodes, flow.edges, recipient, source, { ...context, lastMessage: text, ...incomingMsg.googleSheetsData, ...submissionData }, flow.id, currentColl);
          updateDoc(currentColl, flow.id, { analytics: { messagesRecieved: (flow.analytics?.messagesRecieved || 0) + 1, repliesSent: (flow.analytics?.repliesSent || 0) + (res?.messagesSent || 0), humanHandoffs: (flow.analytics?.humanHandoffs || 0) + (res?.handoffs || 0), lastTriggered: new Date().toISOString() } }).catch(() => {});
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error(`[FlowEngine] ${source.toUpperCase()} Error:`, error);
    if (error instanceof ReferenceError) {
      console.error(`[FlowEngine] Critical ReferenceError: ${error.message}. deleteDoc availability: ${typeof deleteDoc}, updateDoc availability: ${typeof updateDoc}`);
    }
    try {
      const fs = await import('fs/promises');
      await fs.appendFile('flow_error.log', `[${new Date().toISOString()}] ${source} error: ${error.stack}\n`);
    } catch (e) { }
  }
}

async function executeFlowFromNode(nodeId, nodes, edges, recipient, source, context, flowId, collectionName) {
  const result = { messagesSent: 0, handoffs: 0 };
  try {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.log(`[FlowEngine] ⚠️ Node ${nodeId} not found in flow.`);
      return result;
    }

    console.log(`[FlowEngine] 🚀 Processing node ${nodeId} (${node.type}) for ${recipient}`);

    // 1. Process Current Node Action
    if (node.type === 'message') {
      const { message: messageText, buttons } = node.data || {};
      if (messageText) {
        await deliverMessage(recipient, messageText, source, context, { buttons });
        result.messagesSent++;
      }

      // If interactive, STOP and wait for user
      if (buttons && buttons.length > 0) {
        const sessionId = `${source}_${recipient}`;
        console.log(`[FlowEngine] 💾 Saving session ${sessionId} at node ${node.id}`);
        await setDoc('flow_sessions', sessionId, {
          id: sessionId, flowId, currentNodeId: node.id, collectionName, recipient, source, status: 'active', updatedAt: new Date().toISOString()
        });
        return result;
      }
    }
    else if (node.type === 'list') {
      const { header, message, sections } = node.data || {};
      const bodyText = message || 'Please select an option from the list:';
      await deliverMessage(recipient, bodyText, source, context, {
        list: { header: header || 'Menu', sections }
      });
      result.messagesSent++;

      const sessionId = `${source}_${recipient}`;
      console.log(`[FlowEngine] 💾 Saving session ${sessionId} at list node ${node.id}`);
      await setDoc('flow_sessions', sessionId, {
        id: sessionId, flowId, currentNodeId: node.id, collectionName, recipient, source, status: 'active', updatedAt: new Date().toISOString()
      });
      return result;
    }
    else if (node.type === 'flow_form') {
      const { flowId, message, cta, screen } = node.data || {};
      const bodyText = message || 'Please fill out the form:';

      // Fetch the actual flow definition to get Meta ID and Structure
      let structure = null;
      let metaFlowId = null;
      let autoTicket = false;
      let firstScreenId = 'screen_1'; // Common default

      try {
        const flows = await getCollection('whatsapp_flows');
        const flowDef = flows.find(f => f.id === flowId || f.metaFlowId === flowId);
        if (flowDef) {
          structure = flowDef.structure;
          metaFlowId = flowDef.metaFlowId;
          autoTicket = flowDef.autoTicket || false;

          // Fallback screen logic
          if (structure && structure.screens && structure.screens.length > 0) {
            firstScreenId = structure.screens[0].id;
          }

          console.log(`[FlowEngine] Found flow definition: MetaID=${metaFlowId}, HasStructure=${!!structure}, AutoTicket=${autoTicket}, FirstScreen=${firstScreenId}`);
        } else {
          console.log(`[FlowEngine] ⚠️ Flow definition not found for ID: ${flowId}`);
        }
      } catch (e) {
        console.error('[FlowEngine] Error fetching flow structure:', e);
      }

      await deliverMessage(recipient, bodyText, source, context, {
        flow: {
          id: source === 'whatsapp' ? (metaFlowId || flowId) : flowId,
          cta,
          screen: screen || firstScreenId,
          structure
        }
      });
      result.messagesSent++;

      const sessionId = `${source}_${recipient}`;
      console.log(`[FlowEngine] 💾 Saving session ${sessionId} at flow_form node ${node.id} (AutoTicket: ${autoTicket})`);
      await setDoc('flow_sessions', sessionId, {
        id: sessionId, flowId, currentNodeId: node.id, collectionName, recipient, source, status: 'active', updatedAt: new Date().toISOString(), autoTicket
      });
      return result;
    }
    else if (node.type === 'wait') {
      const waitSeconds = parseInt(node.data?.wait || node.data?.waitDelay || 1);
      console.log(`[FlowEngine] ⏳ Waiting ${waitSeconds}s...`);
      await new Promise(resolve => setTimeout(resolve, Math.min(waitSeconds * 1000, 30000)));
    }
    else if (node.type === 'template') {
      const { templateName, languageCode, params } = node.data || {};
      if (templateName) {
        // Fetch template to get header info
        const templates = await getCollection('templates');
        const tpl = templates.find(t => t.name === templateName && t.uid === context.uid);

        const components = [];
        if (params && params.length > 0) {
          components.push({
            type: 'body',
            parameters: params.map(p => ({ type: 'text', text: p.value }))
          });
        }

        // Add Header if it's a media header
        if (tpl && tpl.components) {
          const header = tpl.components.find(c => c.type === 'HEADER');
          if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
            const mediaUrl = header.example?.header_handle?.[0] || tpl.mediaUrl;
            if (mediaUrl) {
              const type = header.format.toLowerCase();
              components.push({
                type: 'header',
                parameters: [{
                  type: type,
                  [type]: { link: mediaUrl }
                }]
              });
            }
          }
        }

        await deliverMessage(recipient, `[Template: ${templateName}]`, source, context, {
          template: { name: templateName, language: languageCode || 'en_US', components }
        });
        result.messagesSent++;
      }
    }
    else if (node.type === 'video') {
      const { videoUrl, message } = node.data || {};
      await deliverMessage(recipient, message || '', source, context, {
        video: { url: videoUrl }
      });
      result.messagesSent++;
    }
    else if (node.type === 'handoff') {
      const connectingMsg = node.data?.connectingMsg || "Connecting to agent...";
      await deliverMessage(recipient, connectingMsg, source, context, {});
      
      // Update or Create customer profile to human status
      const profiles = await getCollection('customer_profiles');
      let profile = profiles.find(p => p.visitorId === recipient || p.phone === recipient || p.id === recipient);
      
      const handoffUntil = new Date();
      handoffUntil.setHours(handoffUntil.getHours() + 24); // Handover for 24 hours
      
      const updateData = {
        status: 'human',
        handoffUntil: handoffUntil.toISOString(),
        lastInteraction: new Date().toISOString()
      };

      if (profile) {
        await updateDoc('customer_profiles', profile.id, updateData);
      } else {
        // Create new profile if missing
        await addDoc('customer_profiles', {
          ...updateData,
          uid: context.uid,
          visitorId: source === 'widget' ? recipient : null,
          phone: source === 'whatsapp' ? recipient : null,
          name: 'New Visitor',
          createdAt: new Date().toISOString()
        });
      }

      // 🗑️ CRITICAL: Delete active session so it doesn't try to continue or restart
      const sessionId = `${source}_${recipient}`;
      await deleteDoc('flow_sessions', sessionId).catch(() => {});

      await addDoc('messages', {
        uid: context.uid, visitorId: recipient, text: `🔔 HANDOFF REQUEST`, sender: 'system', source, needsHuman: true, status: 'handoff'
      });
      result.handoffs++;
      return result;
    }
    else if (node.type === 'time_routing') {
      const { startTime, endTime, days } = node.data || {};
      const now = new Date();
      // Convert to 1-7 (Mon-Sun)
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); 
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
      
      const workingDays = days || [1,2,3,4,5,6];
      const isWorkingDay = workingDays.includes(currentDay);
      const isWorkingTime = currentTime >= (startTime || '09:00') && currentTime <= (endTime || '18:00');
      
      const targetHandle = (isWorkingDay && isWorkingTime) ? 'open' : 'closed';
      const edge = edges.find(e => e.source === node.id && (e.sourceHandle === targetHandle || e.sourceHandle === `${targetHandle}_primary`));
      
      console.log(`[FlowEngine] 🕒 Time Routing: Day=${currentDay}, Time=${currentTime}, Working=${isWorkingDay && isWorkingTime} -> Handle=${targetHandle}`);
      
      if (edge) {
        return executeFlowFromNode(edge.target, nodes, edges, recipient, source, context, flowId, collectionName);
      }
    }
    else if (node.type === 'external_api') {
      const { webhookUrl, params, method = 'POST' } = node.data || {};
      console.log(`[FlowEngine] 🌐 Calling External API: ${webhookUrl}`);
      try {
        const payload = {};
        (params || []).forEach(p => {
          if (p.key) {
            // Use the same variable resolver as payment description
            const resolveVars = (text) => {
              if (!text) return text;
              const profiles = context.profiles || [];
              const profile = profiles.find(pr => pr.visitorId === recipient || pr.phone === recipient || pr.id === recipient) || {};
              return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
                return profile[key.trim()] || context[key.trim()] || match;
              });
            };
            payload[p.key] = resolveVars(p.value);
          }
        });
        
        // Use dynamic import for fetch to avoid issues in some environments
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(webhookUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'GET' ? undefined : JSON.stringify(payload)
        });
        
        console.log(`[FlowEngine] 🌐 API Response: ${response.status}`);
        const edge = edges.find(e => e.source === node.id);
        if (edge) return executeFlowFromNode(edge.target, nodes, edges, recipient, source, context, flowId, collectionName);
      } catch (e) {
        console.error('[FlowEngine] External API Error:', e);
        const edge = edges.find(e => e.source === node.id);
        if (edge) return executeFlowFromNode(edge.target, nodes, edges, recipient, source, context, flowId, collectionName);
      }
    }
    else if (node.type === 'ask_location') {
      const { message } = node.data || {};
      await deliverMessage(recipient, message || "Please share your location.", source, context, {});
      result.messagesSent++;
      
      const sessionId = `${source}_${recipient}`;
      await setDoc('flow_sessions', sessionId, {
        id: sessionId, flowId, currentNodeId: node.id, collectionName, recipient, source, status: 'active', updatedAt: new Date().toISOString()
      });
      return result;
    }
    else if (node.type === 'crm_update') {
      const { status, tag, isHotLead, department } = node.data || {};
      const profiles = await getCollection('customer_profiles');
      const profile = profiles.find(p => p.visitorId === recipient || p.phone === recipient || p.id === recipient);
      
      if (profile) {
        const updateData = {};
        if (status) updateData.status = status;
        if (tag) updateData.tag = tag;
        if (department) updateData.department = department;
        if (isHotLead !== undefined) updateData.isHotLead = isHotLead === 'true' || isHotLead === true;
        
        await updateDoc('customer_profiles', profile.id, updateData);
        console.log(`[FlowEngine] 👤 CRM Profile updated for ${recipient}`);
      } else {
        // Create profile if missing
        await addDoc('customer_profiles', {
          uid: context.uid,
          visitorId: recipient,
          phone: recipient,
          status: status || 'New',
          tag: tag || '',
          department: department || '',
          isHotLead: isHotLead === 'true' || isHotLead === true,
          createdAt: new Date().toISOString()
        });
      }
      
      const edge = edges.find(e => e.source === node.id);
      if (edge) return executeFlowFromNode(edge.target, nodes, edges, recipient, source, context, flowId, collectionName);
    }
    else if (node.type === 'mcp') {
      const { actionType } = node.data || {};
      console.log(`[FlowEngine] 🤖 MCP Action: ${actionType} for ${recipient}`);
      
      if (actionType === 'fetch') {
        // Fetch Order Status from Shopify
        const orders = await getCollection('shopify_orders');
        const userOrder = orders.filter(o => o.uid === context.uid && (o.phone?.includes(recipient) || o.email?.includes(recipient))).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        if (userOrder) {
          const statusMsg = `📦 *Order Found!*\n\n*Order:* ${userOrder.orderNumber}\n*Status:* ${userOrder.financialStatus}\n*Fulfillment:* ${userOrder.fulfillmentStatus}\n*Total:* ${userOrder.currency} ${userOrder.totalPrice}`;
          await deliverMessage(recipient, statusMsg, source, context);
          result.messagesSent++;
        } else {
          await deliverMessage(recipient, "❌ We couldn't find any recent orders associated with your number.", source, context);
          result.messagesSent++;
        }
      }
      
      const edge = edges.find(e => e.source === node.id);
      if (edge) return executeFlowFromNode(edge.target, nodes, edges, recipient, source, context, flowId, collectionName);
    }
    else if (node.type === 'catalog') {
       const { title, description } = node.data || {};
       // Fetch top 10 products from local DB
       const products = await getCollection('shopify_products');
       const userProducts = products.filter(p => p.uid === context.uid).slice(0, 10);
       
       if (userProducts.length > 0) {
         await deliverMessage(recipient, title || "Check out our catalog!", source, context, {
           catalog: { 
             title: title || "Our Products", 
             description: description || "Browse our latest items",
             products: userProducts.map(p => ({
               id: p.shopifyId,
               title: p.title,
               price: p.variants?.[0]?.price || '0',
               image: p.images?.[0]
             }))
           }
         });
         result.messagesSent++;
       } else {
         await deliverMessage(recipient, "Sorry, our catalog is currently empty. Please check back later!", source, context);
         result.messagesSent++;
       }
       
       const edge = edges.find(e => e.source === node.id);
       if (edge) return executeFlowFromNode(edge.target, nodes, edges, recipient, source, context, flowId, collectionName);
    }
    else if (node.type === 'payment') {
      const { amount: rawAmount, currency, description: rawDescription, paymentType, planId } = node.data || {};
      const uid = context.uid;

      // Safety Check: Ensure not blacklisted (double-check for recursive calls)
      const blacklist = await getCollection('blacklist');
      if (blacklist.some(b => b.phoneNumber === recipient || b.visitorId === recipient)) {
        console.log(`[FlowEngine] 🚫 Skipping payment link for blacklisted user ${recipient}`);
        return result;
      }

      // 1. Resolve variables in amount and description
      const resolveVars = (text) => {
        if (!text) return text;
        const profiles = context.profiles || []; // Ensure profiles are available
        const profile = profiles.find(p => p.visitorId === recipient || p.phone === recipient || p.id === recipient) || {};

        return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
          return profile[key.trim()] || context[key.trim()] || match;
        });
      };

      const amount = resolveVars(rawAmount);
      const description = resolveVars(rawDescription);

      if (!uid) {
        console.warn(`[FlowEngine] ⚠️ Generating payment link for ${recipient} but UID is missing in context!`);
      }

      const queryParams = new URLSearchParams({
        amount: amount || '',
        currency: currency || 'INR',
        uid: uid || '',
        visitorId: recipient || '',
        type: paymentType || 'one_time',
        planId: planId || '',
        description: description || 'ChatWiz Secure Payment'
      });
      
      const paymentLink = `${process.env.VITE_APP_URL || 'https://chatwiz.ai'}/pay/${flowId}/${nodeId}?${queryParams.toString()}`;
      console.log(`[FlowEngine] 💳 Payment Link Generated for ${recipient}: ${paymentLink}`);

      const bodyText = paymentType === 'subscription'
        ? `💳 *Subscription Required*\n\n${description || 'Please subscribe to proceed.'}`
        : `💳 *Payment Required*\n\n${description || 'Please complete your payment to proceed.'}\n\n*Amount:* ${currency || 'INR'} ${amount}`;

        await deliverMessage(recipient, bodyText, source, context, {
          buttons: [
            { id: 'pay_now', label: paymentType === 'subscription' ? 'Subscribe Now' : 'Pay Now', hasLink: true, url: paymentLink }
          ]
        });
      result.messagesSent++;

      // M-5 FIX: Save session so Razorpay webhook can resume flow via resumeFlowWithHandle
      const sessionId = `${source}_${recipient}`;
      console.log(`[FlowEngine] 💾 Saving session ${sessionId} at payment node ${node.id}`);
      await setDoc('flow_sessions', sessionId, {
        id: sessionId, flowId, currentNodeId: node.id, collectionName, recipient, source, status: 'active', updatedAt: new Date().toISOString()
      });
      return result;
    }
    else if (node.type === 'condition') {
      const conditionText = (node.data?.condition || '').toLowerCase().trim();
      const lastUserMessage = (context.lastMessage || '').toLowerCase().trim();
      const isTrue = lastUserMessage.includes(conditionText);
      const targetHandle = isTrue ? 'true' : 'false';

      console.log(`[FlowEngine] 🔄 Condition: "${lastUserMessage}" contains "${conditionText}"? ${isTrue}`);
      const branchEdge = edges.find(e => e.source === nodeId && e.sourceHandle === targetHandle);
      if (branchEdge) {
        return await executeFlowFromNode(branchEdge.target, nodes, edges, recipient, source, context, flowId, collectionName);
      }
      return result;
    }
    else if (node.type === 'google_sheets') {
      const { mapping, action } = node.data || {};
      const uid = context.uid;

      const allSettings = await getCollection('google_settings');
      const settings = allSettings.find(s => s.uid === uid);

      if (settings && settings.spreadsheetId) {
        try {
          const profile = (context.profiles || []).find(p => p.visitorId === recipient || p.phone === recipient) || {};
          const resolveVars = (text) => text.replace(/\{\{(.*?)\}\}/g, (match, key) => profile[key.trim()] || context[key.trim()] || match);

          let dataToLog = {};
          try {
            const parsedMapping = JSON.parse(mapping || '{}');
            Object.keys(parsedMapping).forEach(key => {
              dataToLog[key] = resolveVars(parsedMapping[key]);
            });
          } catch (e) { console.error('Mapping Parse Error', e); }

          await appendToGoogleSheet(settings.spreadsheetId, settings.sheetName || 'Sheet1', dataToLog);
          console.log(`[FlowEngine] ✅ Data synced to Google Sheet: ${settings.spreadsheetId}`);
        } catch (error) {
          console.error('[FlowEngine] ❌ Google Sheets Error:', error.message);
        }
      }
    }

    // 2. Continue to Next Nodes (Recursive)
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      // If it's a message/template sequence, add a natural delay
      if (['message', 'template', 'list'].includes(node.type)) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const sub = await executeFlowFromNode(edge.target, nodes, edges, recipient, source, context, flowId, collectionName);
      result.messagesSent += sub.messagesSent;
      result.handoffs += sub.handoffs;

      // If a sub-path hit an interactive node, we stop this branch
      if (result.messagesSent > 0 && sub.messagesSent === 0 && outgoingEdges.length === 1) {
        // already stopped in sub call
      }
    }
  } catch (err) {
    console.error(`[FlowEngine] ❌ Error in executeFlowFromNode at ${nodeId}:`, err);
  }

  return result;
}

async function deliverMessage(recipient, text, source, context, interactiveData = {}) {
  // ✅ NEW: Central Suppression Check
  const blacklist = context.blacklist || await getCollection('blacklist');
  if (blacklist.some(b => b.phoneNumber === recipient || b.visitorId === recipient)) {
    return null;
  }

  if (source === 'whatsapp') {
    return sendWhatsAppMessage(recipient, text, context, interactiveData);
  } else if (source === 'instagram') {
    return sendInstagramMessage(recipient, text, context, interactiveData);
  } else if (source === 'threads') {
    // Check if we should use DM (e.g. for Comment to DM flows)
    if (context.useDM) {
      return sendThreadsDM(recipient, text, context.uid);
    }
    return sendThreadsMessage(recipient, text, context.uid, interactiveData, context.parentId);
  } else if (source === 'widget') {
    return sendWidgetMessage(recipient, text, context, interactiveData);
  } else {
    return null;
  }
}

async function sendWidgetMessage(recipient, text, context, interactiveData = {}) {
  const uid = context.uid;
  const messageId = `wdg_auto_${Date.now()}`;
  
  // Save to history so it shows in Inbox
  await addDoc('messages', {
    id: messageId,
    uid,
    widgetId: context.id, // widgetId is stored in context.id
    visitorId: recipient,
    recipient,
    text,
    sender: 'admin',
    direction: 'outbound',
    senderName: 'Assistant',
    source: 'widget',
    chatId: recipient,
    timestamp: new Date().toISOString(),
    isAutomated: true,
    unread: true,
    interactive: interactiveData
  });

  console.log(`[FlowEngine] 📤 Widget Auto-reply queued for ${recipient}: "${text}"`);
  
  // The actual delivery for the widget is via polling or websocket, 
  // but for now we just return the text which will be sent in the API response.
  return { success: true, text, interactive: interactiveData };
}

async function sendInstagramMessage(recipientId, text, context, interactiveData = {}) {
  try {
    const uid = context.uid;
    const accounts = await getCollection('instagram_accounts');
    const account = accounts.find(acc => acc.uid === uid && acc.status === 'active') || accounts.find(acc => acc.uid === uid);

    if (!account || !account.pageAccessToken) {
      console.warn(`[FlowEngine] ⚠️ Instagram account or Page token not found for user ${uid}`);
      return;
    }

    const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${account.pageAccessToken}`;
    const payload = {
      recipient: { id: recipientId },
      message: { text }
    };

    // Support for Buttons (mapped to Quick Replies on Instagram)
    if (interactiveData.buttons && interactiveData.buttons.length > 0) {
      payload.message.quick_replies = interactiveData.buttons.map(btn => ({
        content_type: 'text',
        title: btn.label || btn.title,
        payload: btn.id?.toString() || btn.label
      }));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const messageId = data.message_id || `ig_auto_${Date.now()}`;
      await addDoc('messages', {
        id: messageId,
        uid,
        recipient: recipientId,
        text,
        sender: 'admin',
        direction: 'outbound',
        senderName: account.displayName || 'Instagram Assistant',
        source: 'instagram',
        instagramAccountId: account.id,
        chatId: recipientId,
        timestamp: new Date().toISOString(),
        isAutomated: true,
        unread: true,
        interactive: interactiveData
      });
      console.log(`[FlowEngine] 📤 Instagram Auto-reply sent to ${recipientId}: "${text}"`);
    } else {
      console.error('[FlowEngine] Instagram API Error:', data);
    }
  } catch (err) {
    console.error('[FlowEngine] Instagram Send Error:', err);
  }
}

/**
 * SEND THREADS MESSAGE
 * (Automation reply for Threads)
 */
export async function sendThreadsMessage(recipientId, text, uid, interactiveData = {}, parentId = null) {
  try {
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(acc => acc.uid === uid);

    if (!account || !account.accessToken) {
      console.warn(`[FlowEngine] ⚠️ Threads account not found for user ${uid}`);
      return;
    }

    const apiV = 'v1.0';
    // If we have a parentId, it's a reply to a thread (Public)
    const url = parentId 
      ? `https://graph.threads.net/${apiV}/${parentId}/replies?access_token=${account.accessToken}`
      : `https://graph.threads.net/${apiV}/me/threads?access_token=${account.accessToken}`;

    const payload = {
      text,
      ...(parentId ? {} : { media_type: 'TEXT' })
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      await addDoc('messages', {
        id: data.id || `th_auto_${Date.now()}`,
        uid,
        recipient: recipientId,
        text,
        sender: 'admin',
        direction: 'outbound',
        senderName: account.username || 'Threads Assistant',
        source: 'threads',
        threadsAccountId: account.id,
        chatId: recipientId,
        timestamp: new Date().toISOString(),
        isAutomated: true,
        unread: true,
        parentId: parentId || null
      });
      console.log(`[FlowEngine] 📤 Threads Public Reply sent: "${text}"`);
    } else {
      console.error('[FlowEngine] Threads API Error:', data);
    }
  } catch (err) {
    console.error('[FlowEngine] Threads Send Error:', err);
  }
}

/**
 * SEND THREADS DM
 * (Private Messaging for Threads)
 */
export async function sendThreadsDM(recipientId, text, uid) {
  try {
    const accounts = await getCollection('threads_accounts');
    const account = accounts.find(acc => acc.uid === uid);

    if (!account || !account.accessToken) {
      console.warn(`[FlowEngine] ⚠️ Threads account not found for user ${uid}`);
      return;
    }

    // Threads DM uses the standard Meta Message API structure
    const url = `https://graph.threads.net/v1.0/me/messages?access_token=${account.accessToken}`;
    const payload = {
      recipient: { id: recipientId },
      message: { text }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const messageId = data.message_id || `th_dm_${Date.now()}`;
      await addDoc('messages', {
        id: messageId,
        uid,
        recipient: recipientId,
        text,
        sender: 'admin',
        direction: 'outbound',
        senderName: account.username || 'Threads Assistant',
        source: 'threads',
        threadsAccountId: account.id,
        chatId: recipientId,
        timestamp: new Date().toISOString(),
        isAutomated: true,
        unread: true
      });
      console.log(`[FlowEngine] 📤 Threads Private DM sent to ${recipientId}: "${text}"`);
    } else {
      console.error('[FlowEngine] Threads DM API Error:', data);
    }
  } catch (err) {
    console.error('[FlowEngine] Threads DM Send Error:', err);
  }
}



export async function sendWhatsAppMessage(to, text, account, interactiveData = {}) {
  try {
    const payload = { messaging_product: 'whatsapp', to };
    const { buttons, list, template, catalog, flow } = interactiveData;

    if (template) {
      payload.type = 'template';
      payload.template = {
        name: template.name,
        language: { code: template.language || 'en_US' },
        components: template.components || []
      };
    } else if (flow && flow.id) {
      // ✅ WHATSAPP FLOW VALIDATION: Meta requires a numeric Flow ID
      const isNumericId = /^\d+$/.test(flow.id);

      if (!isNumericId) {
        console.error(`[FlowEngine] ❌ Cannot send WhatsApp Flow: ID "${flow.id}" is not a valid Meta numeric ID. Fallback to text.`);
        payload.type = 'text';
        payload.text = { body: `${text}\n\n(Note: Form could not be loaded. Please check flow configuration.)` };
      } else {
        payload.type = 'interactive';
        payload.interactive = {
          type: 'flow',
          body: { text: text || 'Please fill out the form:' },
          action: {
            name: 'flow',
            parameters: {
              flow_message_version: '3',
              flow_token: 'flow_token_' + Date.now(),
              flow_id: flow.id,
              flow_cta: flow.cta || 'Open Form',
              flow_action: 'navigate',
              flow_action_payload: { screen: flow.screen || 'screen_1' }
            }
          }
        };
      }
    } else if (buttons && buttons.length > 0) {
      // ✅ Handle URL Buttons
      const urlButtons = buttons.filter(b => b.hasLink && b.url);
      const replyButtons = buttons.filter(b => !(b.hasLink && b.url)).slice(0, 3);

      if (buttons.length === 1 && urlButtons.length === 1) {
        // Only one button and it's a URL -> Use cta_url
        payload.type = 'interactive';
        payload.interactive = {
          type: 'cta_url',
          body: { text: text || 'Here is your link:' },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: (urlButtons[0].label || 'Open Link').slice(0, 20),
              url: urlButtons[0].url
            }
          }
        };
      } else {
        // Mixed or multiple buttons -> Use reply buttons and append URLs to text
        let updatedText = text || 'Please select an option:';
        urlButtons.forEach(btn => {
          updatedText += `\n\n🔗 *${btn.label || 'Link'}*:\n${btn.url}`;
        });

        if (replyButtons.length > 0) {
          payload.type = 'interactive';
          payload.interactive = {
            type: 'button',
            body: { text: updatedText },
            action: {
              buttons: replyButtons.map(btn => ({
                type: 'reply',
                reply: { id: btn.id, title: (btn.label || btn.title || 'Option').slice(0, 20) }
              }))
            }
          };
        } else {
          payload.type = 'text';
          payload.text = { body: updatedText, preview_url: true };
        }
      }
    } else if (list && list.sections && list.sections.length > 0) {
      payload.type = 'interactive';
      payload.interactive = {
        type: 'list',
        header: list.header ? { type: 'text', text: list.header.slice(0, 60) } : undefined,
        body: { text: text || 'Please select an option from the menu below:' },
        footer: { text: account.name || 'ChatWizs Automation' },
        action: {
          button: 'Select Option',
          sections: list.sections.map(sec => ({
            title: (sec.title || 'Options').slice(0, 24),
            rows: (sec.rows || []).slice(0, 10).map(row => {
              let description = row.description;
              if (row.hasLink && row.url) {
                description = (description ? description + " " : "") + row.url;
              }
              return {
                id: row.id,
                title: (row.title || 'Item').slice(0, 24),
                description: description ? description.slice(0, 72) : undefined
              };
            })
          }))
        }
      };
    } else if (catalog && catalog.products && catalog.products.length > 0) {
      // ✅ Handle WhatsApp Product Catalog
      // Using Multi-Product Message format (requires Catalog ID, which we might not have)
      // Fallback: Send as an interactive list or formatted text if Catalog ID is missing
      payload.type = 'interactive';
      payload.interactive = {
        type: 'list',
        header: { type: 'text', text: catalog.title?.slice(0, 60) || 'Product Catalog' },
        body: { text: text || catalog.description || 'Browse our products below:' },
        footer: { text: account.name || 'ChatWizs' },
        action: {
          button: 'View Products',
          sections: [{
            title: 'Top Products',
            rows: catalog.products.slice(0, 10).map(p => ({
              id: `prod_${p.id}`,
              title: p.title.slice(0, 24),
              description: `Price: ${p.price}`.slice(0, 72)
            }))
          }]
        }
      };
    } else {
      payload.type = 'text';
      payload.text = { body: text, preview_url: true };
    }

    const response = await fetch(`https://graph.facebook.com/v20.0/${account.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok) {
      const messageId = data.messages?.[0]?.id || `auto_${Date.now()}`;
      await setDoc('messages', messageId, {
        id: messageId,
        sender: 'admin',
        direction: 'outbound',
        senderName: account.name || 'ChatWiz Bot',
        recipient: to,
        visitorId: to,
        text,
        timestamp: new Date().toISOString(),
        source: 'whatsapp',
        whatsappAccountId: account.id,
        uid: account.uid,
        isAutomated: true,
        unread: true,
        interactive: interactiveData
      });
      console.log(`[FlowEngine] 📤 WhatsApp Auto-reply sent to ${to}: "${text}"`);
    } else {
      console.error('[FlowEngine] WhatsApp API Error:', data);
    }
  } catch (err) {
    console.error('[FlowEngine] WhatsApp Send Error:', err);
  }
}

export async function resumeFlowWithHandle(recipient, source, handleId, context = {}) {
  const sessionId = `${source}_${recipient}`;
  const session = await getDoc('flow_sessions', sessionId);

  if (!session || session.status !== 'active') {
    console.log(`[FlowEngine] No active session for ${sessionId} to resume with handle ${handleId}`);
    return;
  }

  const { flowId, currentNodeId, collectionName } = session;
  const allFlows = await getCollection(collectionName || 'chat_flows_whatsapp');
  const flow = allFlows.find(f => f.id === flowId);

  if (flow && flow.nodes && flow.edges) {
    const edge = flow.edges.find(e => e.source === currentNodeId && e.sourceHandle === handleId);
    if (edge) {
      console.log(`[FlowEngine] 🚀 Resuming flow ${flowId} via handle "${handleId}"`);
      // Close current session before starting fresh path
      await updateDoc('flow_sessions', sessionId, { status: 'completed' });

      return executeFlowFromNode(edge.target, flow.nodes, flow.edges, recipient, source, { ...context, uid: session.uid }, flow.id, collectionName);
    } else {
      console.log(`[FlowEngine] No edge found from ${currentNodeId} with handle ${handleId}`);
    }
  }
}
