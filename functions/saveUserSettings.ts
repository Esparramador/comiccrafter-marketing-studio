import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple XOR encryption for tokens (client-side should also encrypt before sending)
function encryptToken(token, key) {
  const encoded = new TextEncoder().encode(token);
  const keyBytes = new TextEncoder().encode(key.padEnd(token.length, '0'));
  const encrypted = [];
  for (let i = 0; i < encoded.length; i++) {
    encrypted.push(encoded[i] ^ keyBytes[i % keyBytes.length]);
  }
  return btoa(String.fromCharCode(...encrypted));
}

function decryptToken(encryptedToken, key) {
  const decoded = atob(encryptedToken);
  const decodedBytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    decodedBytes[i] = decoded.charCodeAt(i);
  }
  const keyBytes = new TextEncoder().encode(key.padEnd(decoded.length, '0'));
  const decrypted = [];
  for (let i = 0; i < decodedBytes.length; i++) {
    decrypted.push(decodedBytes[i] ^ keyBytes[i % keyBytes.length]);
  }
  return new TextDecoder().decode(new Uint8Array(decrypted));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      user_email,
      instagram_business_id,
      instagram_token,
      auto_publish_enabled,
      publish_schedule_enabled,
      notification_email,
      profile_id,
    } = await req.json();

    if (!user_email || !instagram_business_id || !instagram_token) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Encrypt token using a simple cipher (consider adding a proper encryption library)
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || 'default-key';
    const encryptedToken = encryptToken(instagram_token, encryptionKey);

    // Update or create UserProfile
    if (profile_id) {
      await base44.entities.UserProfile.update(profile_id, {
        instagram_business_id,
        instagram_token_encrypted: encryptedToken,
        auto_publish_enabled,
        publish_schedule_enabled,
        notification_email,
      });
    } else {
      await base44.entities.UserProfile.create({
        user_email,
        instagram_business_id,
        instagram_token_encrypted: encryptedToken,
        auto_publish_enabled,
        publish_schedule_enabled,
        notification_email,
      });
    }

    return Response.json({
      success: true,
      message: 'Configuración guardada exitosamente',
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});