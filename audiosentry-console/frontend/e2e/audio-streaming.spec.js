import { test, expect } from '@playwright/test';

test.describe('Audio Streaming & WebSocket Transmission', () => {

  test('mocks getUserMedia, chunks audio to 32k samples, and transmits via WebSocket', async ({ page }) => {
    // 1. Mock getUserMedia to supply a custom MediaStream
    // We can simulate an AudioContext and pass an oscillator or an empty stream to test the chunking logic.
    await page.addInitScript(() => {
      // Create a fake MediaStream using Web Audio API
      const ctx = new AudioContext({ sampleRate: 16000 });
      const oscillator = ctx.createOscillator();
      const dest = ctx.createMediaStreamDestination();
      oscillator.connect(dest);
      oscillator.start();

      // Override getUserMedia
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        return dest.stream;
      };
    });

    // 2. Intercept WebSocket connections to the Engine
    // We capture sent frames to verify the 32,000 Float32 chunking
    const wsMessages = [];
    let initialConfigPayload = null;

    page.on('websocket', ws => {
      ws.on('framesent', event => {
        if (typeof event.payload === 'string') {
          try {
            const data = JSON.parse(event.payload);
            if (data.type === 'config') {
              initialConfigPayload = data;
            }
          } catch (e) {}
        } else {
          // Binary audio payload (Float32Array)
          wsMessages.push(event.payload);
        }
      });
    });

    await page.goto('/');

    // Ensure we are ready and click 'Start Call'
    await expect(page.locator('text=Ready for Call')).toBeVisible();
    await page.click('button:has-text("Start Call")');

    // Wait until at least one binary audio chunk is transmitted
    await expect.poll(() => wsMessages.length, { timeout: 10000 }).toBeGreaterThan(0);

    // Stop the stream
    await page.click('button:has-text("Stop Mic Stream")');

    // Assert that the initial CRM config was sent
    expect(initialConfigPayload).not.toBeNull();
    expect(initialConfigPayload.metadata).toBeDefined();

    // Assert that the binary frame size corresponds to exactly 32,000 Float32 samples.
    // 32,000 samples * 4 bytes per float = 128,000 bytes.
    const firstAudioChunk = wsMessages[0];
    expect(firstAudioChunk.byteLength).toBe(128000);
  });
});
