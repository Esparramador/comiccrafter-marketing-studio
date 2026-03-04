import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, imageUrl, copy, hashtags } = await req.json();

    if (!postId || !imageUrl || !copy) {
      return Response.json(
        { error: 'postId, imageUrl y copy son requeridos' },
        { status: 400 }
      );
    }

    const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    const businessAccountId = Deno.env.get('INSTAGRAM_BUSINESS_ACCOUNT_ID');

    if (!accessToken || !businessAccountId) {
      return Response.json(
        { error: 'Instagram credentials no configurados. Configura INSTAGRAM_ACCESS_TOKEN (long-lived) e INSTAGRAM_BUSINESS_ACCOUNT_ID' },
        { status: 500 }
      );
    }

    // Step 1: Set post to PENDING state (waiting for publication)
    await base44.entities.MarketingPost.update(postId, {
      status: 'pending',
    });

    // Step 2: Upload image to Instagram (create media container)
    const mediaCaption = `${copy}\n\n${hashtags}`;

    const uploadRes = await fetch(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: mediaCaption,
          access_token: accessToken,
        }),
      }
    );

    if (!uploadRes.ok) {
      const error = await uploadRes.json();
      // Revert to draft on error
      await base44.entities.MarketingPost.update(postId, { status: 'draft' });
      return Response.json(
        { error: `Instagram API error: ${error.error?.message || 'Unknown'}` },
        { status: 400 }
      );
    }

    const uploadData = await uploadRes.json();
    const mediaId = uploadData.id;

    // Step 3: Publish the media (2-step flow)
    const publishRes = await fetch(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media_publish`,
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
      // Revert to draft on error
      await base44.entities.MarketingPost.update(postId, { status: 'draft' });
      return Response.json(
        { error: `Publish failed: ${error.error?.message || 'Unknown'}` },
        { status: 400 }
      );
    }

    const publishData = await publishRes.json();

    // Step 4: Update post status to PUBLISHED with Instagram ID
    await base44.entities.MarketingPost.update(postId, {
      status: 'published',
      instagram_post_id: publishData.id,
      published_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      instagramPostId: publishData.id,
      message: 'Post publicado exitosamente en Instagram',
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});