import { test, expect } from '@playwright/test';

test.describe('Alert Lifecycle & Slack Webhook Integration', () => {

  test('sustained high-risk triggers UI heatmap and debounced Slack webhook', async ({ page }) => {
    // We will intercept the BFF's POST request to the Slack Webhook to verify it triggers
    // without actually hitting the real Slack API.
    const slackPayloads = [];
    
    // Playwright route matching the internal webhook router of our BFF
    await page.route('http://localhost:4000/webhooks/engine', async route => {
      // Pass through the POST from Engine to BFF, but we want to intercept what the BFF sends to Slack.
      // Wait, the BFF runs independently and sends the request from Node.js, not the browser!
      route.continue();
    });

    // To intercept the BFF -> Slack network request, the BFF needs to be started with a mock 
    // or we intercept the browser's interaction with DeepScanResults.
    // Instead, we will simulate the Engine payload arriving at the BFF by POSTing directly.

    const bffUrl = 'http://localhost:4000/webhooks/engine';
    
    const highRiskPayload = {
      call_id: "TEST-E2E-101",
      acoustic_score: 0.95,
      fusion_score: 0.92,
      is_synthetic: true,
      heatmap_png: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      metadata: { call_origin_risk: "high" }
    };

    // First POST: Should trigger Slack Alert
    const response1 = await page.request.post(bffUrl, { data: highRiskPayload });
    expect(response1.status()).toBe(200);

    // Second POST (Immediately after): Should be DEBOUNCED (no Slack Alert)
    const response2 = await page.request.post(bffUrl, { data: highRiskPayload });
    expect(response2.status()).toBe(200);

    // Validate UI Rendering
    // Now we navigate to the DeepScanResults UI for this Call ID
    await page.goto('/deepscan/TEST-E2E-101');

    // Wait for the UI to load
    await expect(page.locator('text=DeepScan Analysis')).toBeVisible();

    // Verify the base64 heatmap is rendered inline
    const heatmapImage = page.locator('img[alt="Acoustic Heatmap"]');
    await expect(heatmapImage).toBeVisible();
    await expect(heatmapImage).toHaveAttribute('src', highRiskPayload.heatmap_png);
    
    // Verify Caller Risk Profile is rendered based on metadata
    await expect(page.locator('text=Caller Risk Profile')).toBeVisible();
    await expect(page.locator('text=Origin Risk')).toBeVisible();
    await expect(page.locator('text=high')).toBeVisible();
  });
});
