/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDocFromServer } from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Ignore AbortError as it's usually a side effect of component unmounting or browser navigation
  if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
    console.log(`Firestore request aborted for ${operationType} on ${path}`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    // Attempt to read a non-existent doc from a 'test' collection
    // This is just to verify we can reach the server and permissions are roughly correct for the applet
    await getDocFromServer(doc(db, 'system', 'handshake'));
  } catch (error: any) {
    if (error.message?.includes('Missing or insufficient permissions')) {
      console.warn("Firestore connection check: Permissions not yet active or denied.");
    } else if (error.message?.includes('the client is offline')) {
      console.error("Firestore connection check: Client is offline.");
    } else {
      console.error("Firestore connection check failed:", error);
    }
  }
}
