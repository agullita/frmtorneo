import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Push encryption following RFC 8291
async function encryptPayload(
  payload: string,
  p256dh: string,
  auth: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  // Generate local key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Export local public key
  const localPublicKeyRaw = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);

  // Import subscriber's public key
  const subscriberPublicKeyBytes = base64UrlDecode(p256dh);
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw',
    subscriberPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // Decode auth secret
  const authSecret = base64UrlDecode(auth);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key and nonce using HKDF
  const { contentEncryptionKey, nonce } = await deriveKeys(
    sharedSecret,
    authSecret,
    salt,
    subscriberPublicKeyBytes,
    localPublicKey
  );

  // Encrypt payload
  const payloadBytes = new TextEncoder().encode(payload);
  const paddedPayload = addPadding(payloadBytes);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    contentEncryptionKey,
    paddedPayload
  );

  return {
    ciphertext: new Uint8Array(encrypted),
    salt,
    localPublicKey,
  };
}

function base64UrlDecode(input: string): Uint8Array {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function deriveKeys(
  sharedSecret: Uint8Array,
  authSecret: Uint8Array,
  salt: Uint8Array,
  subscriberPublicKey: Uint8Array,
  localPublicKey: Uint8Array
): Promise<{ contentEncryptionKey: CryptoKey; nonce: Uint8Array }> {
  // PRK = HKDF-Extract(auth_secret, shared_secret)
  const prk = await hkdfExtract(authSecret, sharedSecret);

  // Key info for IKM derivation
  const keyInfoPrefix = new TextEncoder().encode('WebPush: info\0');
  const keyInfo = concatArrays(keyInfoPrefix, subscriberPublicKey, localPublicKey);

  // IKM = HKDF-Expand(PRK, key_info, 32)
  const ikm = await hkdfExpand(prk, keyInfo, 32);

  // CEK info
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const cekPrk = await hkdfExtract(salt, ikm);
  const cekBytes = await hkdfExpand(cekPrk, cekInfo, 16);

  const contentEncryptionKey = await crypto.subtle.importKey(
    'raw',
    cekBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Nonce info
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
  const nonce = await hkdfExpand(cekPrk, nonceInfo, 12);

  return { contentEncryptionKey, nonce };
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    salt.length > 0 ? salt : new Uint8Array(32),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const result = await crypto.subtle.sign('HMAC', key, ikm);
  return new Uint8Array(result);
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    prk,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const result = new Uint8Array(length);
  let prev = new Uint8Array(0);
  let offset = 0;
  let counter = 1;

  while (offset < length) {
    const input = concatArrays(prev, info, new Uint8Array([counter]));
    const output = await crypto.subtle.sign('HMAC', key, input);
    prev = new Uint8Array(output);
    
    const toCopy = Math.min(prev.length, length - offset);
    result.set(prev.subarray(0, toCopy), offset);
    offset += toCopy;
    counter++;
  }

  return result;
}

function concatArrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function addPadding(payload: Uint8Array): Uint8Array {
  // aes128gcm format: payload + delimiter (0x02) + padding zeros
  // The delimiter 0x02 marks the end of the payload
  const padded = new Uint8Array(payload.length + 1);
  padded.set(payload, 0);
  padded[payload.length] = 0x02; // Delimiter byte
  return padded;
}

async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64: string,
  publicKeyBase64: string
): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  // Import private key - VAPID keys from web-push are raw 32-byte private keys
  // We need to create a JWK to import them properly
  const privateKeyBytes = base64UrlDecode(privateKeyBase64);
  const publicKeyBytes = base64UrlDecode(publicKeyBase64);
  
  // For P-256 curve, the public key is 65 bytes (0x04 + 32 bytes X + 32 bytes Y)
  // The private key is 32 bytes (the D value)
  const x = publicKeyBytes.slice(1, 33);  // Skip the 0x04 prefix
  const y = publicKeyBytes.slice(33, 65);
  const d = privateKeyBytes;
  
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: base64UrlEncode(x),
    y: base64UrlEncode(y),
    d: base64UrlEncode(d),
  };

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsigned)
  );

  // The signature from WebCrypto is in IEEE P1363 format (r || s), each 32 bytes
  const signatureBytes = new Uint8Array(signature);
  const signatureB64 = base64UrlEncode(signatureBytes);

  return `${unsigned}.${signatureB64}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, url, icon } = await req.json();

    console.log('Sending push notification:', { title, body, url });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notificationPayload = JSON.stringify({
      title: title || 'Torneo FRM',
      body: body || 'Tienes una nueva notificación',
      icon: icon || '/icon-192.png',
      badge: '/icon-transp.png',
      vibrate: [100, 50, 100],
      url: url || '/'
    });

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        const endpoint = new URL(sub.endpoint);
        const audience = `${endpoint.protocol}//${endpoint.host}`;

        // Encrypt payload
        const { ciphertext, salt, localPublicKey } = await encryptPayload(
          notificationPayload,
          sub.p256dh,
          sub.auth
        );

        // Create request body with aes128gcm format
        const recordSize = new Uint8Array(4);
        new DataView(recordSize.buffer).setUint32(0, 4096, false);
        
        const requestBody = concatArrays(
          salt,
          recordSize,
          new Uint8Array([localPublicKey.length]),
          localPublicKey,
          ciphertext
        );

        // Create VAPID JWT
        const jwt = await createVapidJwt(audience, 'mailto:admin@torneo-frm.com', vapidPrivateKey, vapidPublicKey);

        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aes128gcm',
            'TTL': '86400',
            'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
          },
          body: requestBody,
        });

        if (response.ok || response.status === 201) {
          sent++;
          console.log(`Notification sent to: ${sub.endpoint.substring(0, 50)}...`);
        } else {
          failed++;
          const errorText = await response.text();
          console.error(`Failed to send to ${sub.endpoint}: ${response.status} ${errorText}`);
          errors.push(`${response.status}: ${errorText}`);

          // Remove invalid subscriptions (410 Gone or 404 Not Found)
          if (response.status === 410 || response.status === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
            console.log('Removed invalid subscription:', sub.endpoint.substring(0, 50));
          }
        }
      } catch (err) {
        failed++;
        console.error('Error sending to subscription:', err);
        errors.push(String(err));
      }
    }

    console.log(`Push notifications: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent, 
        failed,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
