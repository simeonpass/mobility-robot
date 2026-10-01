import {expect, it} from 'vitest';
import {getAiReferralSource} from './ai-referral';
it('recognises tagged links and genuine AI referrers, rejects lookalikes and arbitrary source values', () => {
  expect(getAiReferralSource('https://mobilityrobot.co.uk/?utm_source=chatgpt.com', '')).toBe('chatgpt');
  expect(getAiReferralSource('https://mobilityrobot.co.uk/', 'https://www.perplexity.ai/search/example')).toBe('perplexity');
  expect(getAiReferralSource('https://mobilityrobot.co.uk/', 'https://chatgpt.com.attacker.example/')).toBeNull();
  expect(getAiReferralSource('https://mobilityrobot.co.uk/?utm_source=customer@example.com', '')).toBeNull();
  expect(getAiReferralSource('https://mobilityrobot.co.uk/', 'https://www.google.com/')).toBeNull();
});
