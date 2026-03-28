<svelte:head>
	<title>Roadmap — Home Maker Assist</title>
</svelte:head>

<!-- HERO -->
<section class="bg-[#1a1714] px-6 py-28 sm:py-36">
	<div class="mx-auto max-w-3xl">
		<span class="mb-6 inline-block text-xs font-semibold tracking-[0.2em] text-[#c4a46a]">
			ROADMAP
		</span>
		<h1
			class="mb-6 font-[Cormorant_Garamond,serif] text-5xl font-bold leading-tight text-[#f0e6d3] sm:text-6xl"
		>
			Where we are.<br />
			<em class="font-normal italic text-[#c4a46a]">Where we're going.</em>
		</h1>
		<p class="text-xl leading-relaxed text-[#9a9088]">
			Home Maker Assist is being built in phases. Here's the full plan — and what's live right now.
		</p>
	</div>
</section>

<!-- TIMELINE -->
<section class="bg-[#f8f6f3] px-6 py-20">
	<div class="mx-auto max-w-3xl">
		<div class="relative">
			<!-- Vertical line -->
			<div
				class="absolute left-[1.1rem] top-0 h-full w-0.5 bg-gradient-to-b from-[#c4a46a] via-[#c4a46a40] to-transparent sm:left-[1.35rem]"
			></div>

			<div class="space-y-16">
				<!-- Phase 1: Foundation — CURRENT -->
				<div class="relative flex gap-6 sm:gap-8">
					<div class="relative flex-shrink-0">
						<div
							class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#c4a46a] shadow-[0_0_0_4px_#f8f6f3,0_0_0_6px_#c4a46a66]"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1714" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41M12 6a6 6 0 100 12 6 6 0 000-12z" />
							</svg>
						</div>
					</div>
					<div class="flex-1 pb-2">
						<div class="mb-1 flex flex-wrap items-center gap-3">
							<h2 class="font-[Cormorant_Garamond,serif] text-3xl font-bold text-[#1a1714]">
								Phase 1: Foundation
							</h2>
							<span
								class="rounded-full bg-[#c4a46a] px-3 py-0.5 text-xs font-semibold tracking-wide text-[#1a1714]"
							>
								CURRENT PHASE
							</span>
						</div>
						<p class="mb-6 text-sm leading-relaxed text-[#7a756e]">
							The bedrock — authentication, task management, and the infrastructure that everything
							else is built on.
						</p>

						<div class="grid gap-3 sm:grid-cols-2">
							{#each [
								{ label: 'User authentication & accounts', status: 'live' },
								{ label: 'Task creation & management', status: 'live' },
								{ label: 'Task completion tracking', status: 'live' },
								{ label: 'Per-user data isolation', status: 'live' },
								{ label: 'Marketing site & roadmap', status: 'in-progress' },
								{ label: 'App dashboard shell', status: 'in-progress' }
							] as feature}
								<div class="flex items-center gap-3 rounded-lg border border-[#e8e2d9] bg-white px-4 py-3">
									{#if feature.status === 'live'}
										<span class="h-2 w-2 flex-shrink-0 rounded-full bg-[#6b8f71]"></span>
										<span class="text-sm text-[#3a3632]">{feature.label}</span>
									{:else if feature.status === 'in-progress'}
										<span class="h-2 w-2 flex-shrink-0 rounded-full bg-[#c4a46a]"></span>
										<span class="text-sm text-[#3a3632]">{feature.label}</span>
									{:else}
										<span class="h-2 w-2 flex-shrink-0 rounded-full bg-[#d0ccc7]"></span>
										<span class="text-sm text-[#8a8279]">{feature.label}</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Phase 2: AI Assistant -->
				<div class="relative flex gap-6 sm:gap-8">
					<div class="relative flex-shrink-0">
						<div
							class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#c4a46a40] bg-[#f8f6f3]"
						>
							<div class="h-2.5 w-2.5 rounded-full bg-[#c4a46a40]"></div>
						</div>
					</div>
					<div class="flex-1 pb-2">
						<div class="mb-1 flex flex-wrap items-center gap-3">
							<h2 class="font-[Cormorant_Garamond,serif] text-3xl font-bold text-[#3a3632]">
								Phase 2: AI Assistant
							</h2>
							<span
								class="rounded-full border border-[#c4a46a40] px-3 py-0.5 text-xs font-semibold tracking-wide text-[#8a8279]"
							>
								NEXT
							</span>
						</div>
						<p class="mb-6 text-sm leading-relaxed text-[#7a756e]">
							An AI assistant grounded in your household context — not a generic chatbot.
						</p>

						<div class="grid gap-3 sm:grid-cols-2">
							{#each [
								'Natural language task creation',
								'Meal planning suggestions',
								'Smart shopping list generation',
								'Proactive household reminders',
								'Context-aware recommendations',
								'Chat interface in the app'
							] as label}
								<div class="flex items-center gap-3 rounded-lg border border-[#e8e2d9] bg-white px-4 py-3 opacity-75">
									<span class="h-2 w-2 flex-shrink-0 rounded-full bg-[#d0ccc7]"></span>
									<span class="text-sm text-[#8a8279]">{label}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Phase 3: Inventory Management -->
				<div class="relative flex gap-6 sm:gap-8">
					<div class="relative flex-shrink-0">
						<div
							class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#c4a46a26] bg-[#f8f6f3]"
						>
							<div class="h-2.5 w-2.5 rounded-full bg-[#c4a46a26]"></div>
						</div>
					</div>
					<div class="flex-1 pb-2">
						<div class="mb-4">
							<h2 class="font-[Cormorant_Garamond,serif] text-3xl font-bold text-[#5a5248]">
								Phase 3: Inventory Management
							</h2>
						</div>
						<p class="mb-6 text-sm leading-relaxed text-[#8a8279]">
							Track everything in your home — pantry, supplies, appliances — with automatic
							low-stock alerts.
						</p>

						<div class="grid gap-3 sm:grid-cols-2">
							{#each [
								'Pantry tracking',
								'Household supply management',
								'Appliance & warranty registry',
								'Automatic low-stock alerts',
								'Barcode scanning support',
								'AI-powered reorder suggestions'
							] as label}
								<div class="flex items-center gap-3 rounded-lg border border-[#eee9e3] bg-[#faf9f7] px-4 py-3 opacity-60">
									<span class="h-2 w-2 flex-shrink-0 rounded-full bg-[#ddd8d2]"></span>
									<span class="text-sm text-[#9a9088]">{label}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Phase 4: MCP & Integrations -->
				<div class="relative flex gap-6 sm:gap-8">
					<div class="relative flex-shrink-0">
						<div
							class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#c4a46a1a] bg-[#f8f6f3]"
						>
							<div class="h-2.5 w-2.5 rounded-full bg-[#c4a46a1a]"></div>
						</div>
					</div>
					<div class="flex-1 pb-2">
						<div class="mb-4">
							<h2 class="font-[Cormorant_Garamond,serif] text-3xl font-bold text-[#6b6560]">
								Phase 4: MCP & Integrations
							</h2>
						</div>
						<p class="mb-6 text-sm leading-relaxed text-[#8a8279]">
							Open Home Maker Assist to the tools and services you already use. Become the hub.
						</p>

						<div class="grid gap-3 sm:grid-cols-2">
							{#each [
								'Calendar sync (Google, Apple)',
								'Grocery delivery integration',
								'Recipe API connections',
								'Smart home device support',
								'MCP server for AI agents',
								'Webhook & automation support'
							] as label}
								<div class="flex items-center gap-3 rounded-lg border border-[#eee9e3] bg-[#faf9f7] px-4 py-3 opacity-50">
									<span class="h-2 w-2 flex-shrink-0 rounded-full bg-[#ddd8d2]"></span>
									<span class="text-sm text-[#9a9088]">{label}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Legend -->
		<div class="mt-16 flex flex-wrap items-center gap-6 border-t border-[#e8e2d9] pt-8">
			<span class="text-xs font-semibold tracking-[0.15em] text-[#8a8279]">LEGEND</span>
			<div class="flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-[#6b8f71]"></span>
				<span class="text-xs text-[#5a5248]">Live</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-[#c4a46a]"></span>
				<span class="text-xs text-[#5a5248]">In Progress</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-[#d0ccc7]"></span>
				<span class="text-xs text-[#5a5248]">Planned</span>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="bg-[#1a1714] px-6 py-20 text-center">
	<div class="mx-auto max-w-xl">
		<h2 class="mb-4 font-[Cormorant_Garamond,serif] text-3xl font-bold text-[#f0e6d3]">
			Want to influence what gets built next?
		</h2>
		<p class="mb-8 text-base leading-relaxed text-[#9a9088]">
			Early access members help shape the roadmap. Sign up and tell us what matters most to your
			household.
		</p>
		<a
			href="/demo/better-auth/login"
			class="inline-block rounded-lg bg-[#c4a46a] px-8 py-3.5 text-sm font-semibold tracking-wide text-[#1a1714] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4b87a]"
		>
			Get Started — It's Free
		</a>
	</div>
</section>
