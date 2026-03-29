import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const marketingPages = [
	{ name: 'home', path: '+page.svelte' },
	{ name: 'about', path: 'about/+page.svelte' },
	{ name: 'roadmap', path: 'roadmap/+page.svelte' }
];

const dir = join(import.meta.dirname);

describe('Marketing page CTAs', () => {
	for (const { name, path } of marketingPages) {
		it(`${name} page has no hrefs pointing to demo login`, () => {
			const content = readFileSync(join(dir, path), 'utf-8');
			expect(content).not.toContain('/demo/better-auth/login');
		});

		it(`${name} page "Get Started" CTA links to /login`, () => {
			const content = readFileSync(join(dir, path), 'utf-8');
			// Match <a ...href="..."> blocks that contain "Get Started"
			const aTagPattern = /<a\b[^>]*>[\s\S]*?<\/a>/g;
			const getStartedTags = [...content.matchAll(aTagPattern)].filter((m) =>
				m[0].includes('Get Started')
			);
			expect(getStartedTags.length).toBeGreaterThan(0);
			for (const match of getStartedTags) {
				const hrefMatch = match[0].match(/href="([^"]+)"/);
				expect(hrefMatch?.[1]).toBe('/login');
			}
		});
	}
});
