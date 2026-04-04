<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let confirming = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-[#f8f6f3] px-6">
	<div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
		<h1
			class="mb-2 font-[Cormorant_Garamond,serif] text-2xl font-bold tracking-wide text-[#1a1714]"
		>
			KeptNow
		</h1>

		{#if data.status === 'invalid'}
			<div class="mt-6">
				<h2 class="text-xl font-semibold text-[#1a1714]">Invalid invite link</h2>
				<p class="mt-2 text-sm text-[#8a8279]">
					This invite link is not valid. Ask the household owner to share a new one.
				</p>
			</div>
		{:else if data.status === 'expired'}
			<div class="mt-6">
				<h2 class="text-xl font-semibold text-[#1a1714]">Invite link expired</h2>
				<p class="mt-2 text-sm text-[#8a8279]">
					This invite link has expired (links are valid for 7 days). Ask the household owner to
					generate a new one.
				</p>
			</div>
		{:else if data.status === 'full'}
			<div class="mt-6">
				<h2 class="text-xl font-semibold text-[#1a1714]">Household is full</h2>
				<p class="mt-2 text-sm text-[#8a8279]">
					This household already has the maximum number of members (10). Ask the owner to remove
					someone first.
				</p>
			</div>
		{:else if data.status === 'already_member'}
			<div class="mt-6">
				<h2 class="text-xl font-semibold text-[#1a1714]">You're already a member</h2>
				<p class="mt-2 text-sm text-[#8a8279]">
					You're already in <strong>{data.household.name}</strong>.
				</p>
				<a
					href="/inventory"
					class="mt-6 block rounded-lg bg-[#c4a46a] px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-[#1a1714] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4b87a]"
				>
					Go to inventory
				</a>
			</div>
		{:else if data.status === 'confirm_switch'}
			<div class="mt-6">
				<h2 class="text-xl font-semibold text-[#1a1714]">Join {data.targetHousehold.name}?</h2>
				<p class="mt-2 text-sm text-[#8a8279]">
					You're currently in another household. Joining <strong
						>{data.targetHousehold.name}</strong
					> will remove you from your current household. Your contributed data stays with your old household.
				</p>

				{#if form?.status === 'full'}
					<p
						class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
					>
						This household is now full (10 members). You cannot join.
					</p>
				{:else if form?.status === 'expired'}
					<p
						class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
					>
						This invite link has expired. Ask the owner for a new one.
					</p>
				{:else if form?.status === 'invalid'}
					<p
						class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
					>
						This invite link is no longer valid.
					</p>
				{/if}

				<div class="mt-6 flex gap-3">
					<a
						href="/inventory"
						class="flex-1 rounded-lg border border-[#ddd6cc] bg-white px-4 py-2.5 text-center text-sm font-medium text-[#6b6560] transition-colors hover:bg-[#f8f6f3]"
					>
						Cancel
					</a>
					<form method="post" action="?/confirmJoin" use:enhance class="flex-1">
						<button
							type="submit"
							disabled={confirming}
							onclick={() => (confirming = true)}
							class="w-full rounded-lg bg-[#c4a46a] px-4 py-2.5 text-sm font-semibold tracking-wide text-[#1a1714] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4b87a] disabled:opacity-60"
						>
							{confirming ? 'Joining…' : 'Join household'}
						</button>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>
