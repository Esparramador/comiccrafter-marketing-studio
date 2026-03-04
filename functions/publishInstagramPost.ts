import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const { post_id, image_url, copy, hashtags } = await req.json();

    if (!post_id || !image_url || !copy) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user profile with Instagram credentials
    const profiles = await base44.entities.UserProfile.filter(
      { user_email: user.email },
      '-created_date',
      1
    );

    if (!profiles[0]) {
      return Response.json(
        { error: 'Instagram not configured. Go to Settings.' },
        { status: 400 }
      );
    }

    const profile = profiles[0];
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || 'default-key';
    const accessToken = decryptToken(profile.instagram_token_encrypted, encryptionKey);
    const businessId = profile.instagram_business_id;

    // Step 1: Create media container
    const createMediaRes = await fetch(
      `https://graph.instagram.com/v18.0/${businessId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url,
          caption: `${copy}\n\n${hashtags || ''}`.trim(),
          access_token: accessToken,
        }),
      }
    );

    if (!createMediaRes.ok) {
      const error = await createMediaRes.json();
      throw new Error(`Instagram API error: ${error.error?.message || 'Unknown error'}`);
    }

    const mediaData = await createMediaRes.json();
    const mediaId = mediaData.id;

    // Step 2: Publish the media
    const publishRes = await fetch(
      `https://graph.instagram.com/v18.0/${businessId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: mediaId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishRes.ok) {
      const error = await publishRes.json();
      throw new Error(`Publish error: ${error.error?.message || 'Unknown error'}`);
    }

    const publishData = await publishRes.json();
    const instagramPostId = publishData.id;

    // Update post status
    await base44.entities.MarketingPost.update(post_id, {
      status: 'published',
      published_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      instagram_post_id: instagramPostId,
      message: 'Publicado en Instagram exitosamente',
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});