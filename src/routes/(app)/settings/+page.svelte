<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let profileName = $state(data.user.name ?? '');
	let passwordSubmitting = $state(false);
	let profileSubmitting = $state(false);
	let inviteSubmitting = $state(false);

	const profileSuccess = $derived(form?.field === 'profile' && form?.success);
	const profileError = $derived(form?.field === 'profile' && !form?.success ? form?.message : null);
	const passwordSuccess = $derived(form?.field === 'password' && form?.success);
	const passwordError = $derived(
		form?.field === 'password' && !form?.success ? form?.message : null
	);
	const inviteSuccess = $derived(form?.field === 'invite' && form?.success);
	const inviteError = $derived(form?.field === 'invite' && !form?.success ? form?.message : null);

	// The current invite link — either freshly generated or from loaded data
	const currentHousehold = $derived(
		(form?.field === 'invite' && form?.success ? form?.household : null) ?? data.household
	);
	const inviteLink = $derived(
		currentHousehold?.inviteCode
			? `${$page.url.origin}/invite/${currentHousehold.inviteCode}`
			: null
	);

	let copied = $state(false);
	async function copyInviteLink() {
		if (!inviteLink) return;
		await navigator.clipboard.writeText(inviteLink);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Settings — KeptNow</title>
</svelte:head>

<main class="mx-auto max-w-5xl px-6 pb-28 pt-8">
	<h1 class="mb-8 font-[Cormorant_Garamond,serif] text-3xl font-bold text-[#1a1714]">Settings</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">

	<!-- Profile Section -->
	<section class="rounded-2xl border border-[#e8e2d9] bg-white p-6 shadow-sm">
		<h2 class="mb-5 text-base font-semibold text-[#1a1714]">Profile</h2>

		<form
			method="post"
			action="?/updateProfile"
			use:enhance={() => {
				profileSubmitting = true;
				return async ({ update }) => {
					await update();
					profileSubmitting = false;
				};
			}}
			class="flex flex-col gap-4"
		>
			<div class="flex flex-col gap-1.5">
				<label for="name" class="text-sm font-medium text-[#3a3632]">Display name</label>
				<input
					id="name"
					name="name"
					type="text"
					bind:value={profileName}
					placeholder="Your name"
					required
					class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm transition-all duration-200 outline-none placeholder:text-[#b5aea4] focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium text-[#3a3632]">Email</label>
				<p class="rounded-lg border border-[#e8e2d9] bg-[#f8f6f3] px-3.5 py-2.5 text-sm text-[#8a8279]">
					{data.user.email}
				</p>
			</div>

			{#if profileError}
				<p class="text-sm text-red-600">{profileError}</p>
			{/if}

			{#if profileSuccess}
				<p class="text-sm text-green-700">Profile updated.</p>
			{/if}

			<div class="flex justify-end">
				<button
					type="submit"
					disabled={profileSubmitting}
					class="rounded-lg bg-[#c4a46a] px-4 py-2 text-sm font-semibold text-[#1a1714] shadow-sm transition-all duration-200 hover:bg-[#b8945a] disabled:opacity-50"
				>
					{profileSubmitting ? 'Saving…' : 'Save'}
				</button>
			</div>
		</form>
	</section>

	<!-- Password Section -->
	<section class="rounded-2xl border border-[#e8e2d9] bg-white p-6 shadow-sm md:row-start-1 md:col-start-2">
		<h2 class="mb-5 text-base font-semibold text-[#1a1714]">Change password</h2>

		<form
			method="post"
			action="?/changePassword"
			use:enhance={() => {
				passwordSubmitting = true;
				return async ({ update, result }) => {
					await update({ reset: result.type === 'success' });
					passwordSubmitting = false;
				};
			}}
			class="flex flex-col gap-4"
		>
			<div class="flex flex-col gap-1.5">
				<label for="currentPassword" class="text-sm font-medium text-[#3a3632]"
					>Current password</label
				>
				<input
					id="currentPassword"
					name="currentPassword"
					type="password"
					placeholder="••••••••"
					required
					class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm transition-all duration-200 outline-none placeholder:text-[#b5aea4] focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="newPassword" class="text-sm font-medium text-[#3a3632]">New password</label>
				<input
					id="newPassword"
					name="newPassword"
					type="password"
					placeholder="••••••••"
					required
					class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm transition-all duration-200 outline-none placeholder:text-[#b5aea4] focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="confirmPassword" class="text-sm font-medium text-[#3a3632]"
					>Confirm new password</label
				>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					placeholder="••••••••"
					required
					class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm transition-all duration-200 outline-none placeholder:text-[#b5aea4] focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
				/>
			</div>

			{#if passwordError}
				<p class="text-sm text-red-600">{passwordError}</p>
			{/if}

			{#if passwordSuccess}
				<p class="text-sm text-green-700">Password changed successfully.</p>
			{/if}

			<div class="flex justify-end">
				<button
					type="submit"
					disabled={passwordSubmitting}
					class="rounded-lg bg-[#c4a46a] px-4 py-2 text-sm font-semibold text-[#1a1714] shadow-sm transition-all duration-200 hover:bg-[#b8945a] disabled:opacity-50"
				>
					{passwordSubmitting ? 'Updating…' : 'Update password'}
				</button>
			</div>
		</form>
	</section>

	<!-- Household Section -->
	{#if data.household}
		<section class="rounded-2xl border border-[#e8e2d9] bg-white p-6 shadow-sm md:col-span-2">
			<h2 class="mb-1 text-base font-semibold text-[#1a1714]">Household</h2>
			<p class="mb-5 text-sm text-[#8a8279]">{data.household.name}</p>

			{#if inviteLink}
				<div class="mb-4">
					<label for="invite-link" class="mb-1.5 block text-sm font-medium text-[#3a3632]">Invite link</label>
					<div class="flex gap-2">
						<input
							id="invite-link"
							type="text"
							readonly
							value={inviteLink}
							class="flex-1 rounded-lg border border-[#ddd6cc] bg-[#f8f6f3] px-3.5 py-2.5 text-sm text-[#6b6560] outline-none"
						/>
						<button
							type="button"
							onclick={copyInviteLink}
							class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm font-medium text-[#3a3632] transition-colors hover:bg-[#f8f6f3]"
						>
							{copied ? 'Copied!' : 'Copy'}
						</button>
					</div>
					{#if currentHousehold?.inviteExpiresAt}
						<p class="mt-1.5 text-xs text-[#8a8279]">
							Expires {new Date(currentHousehold.inviteExpiresAt).toLocaleDateString()}
						</p>
					{/if}
				</div>
			{/if}

			{#if inviteSuccess && !inviteLink}
				<p class="mb-4 text-sm text-green-700">Invite link generated.</p>
			{/if}

			{#if inviteError}
				<p class="mb-4 text-sm text-red-600">{inviteError}</p>
			{/if}

			<form
				method="post"
				action="?/generateInvite"
				use:enhance={() => {
					inviteSubmitting = true;
					return async ({ update }) => {
						await update();
						inviteSubmitting = false;
					};
				}}
			>
				<button
					type="submit"
					disabled={inviteSubmitting}
					class="rounded-lg bg-[#c4a46a] px-4 py-2 text-sm font-semibold text-[#1a1714] shadow-sm transition-all duration-200 hover:bg-[#b8945a] disabled:opacity-50"
				>
					{inviteSubmitting
						? 'Generating…'
						: inviteLink
							? 'Generate new link'
							: 'Generate invite link'}
				</button>
			</form>
			<p class="mt-2 text-xs text-[#8a8279]">
				Generating a new link invalidates the previous one. Links expire after 7 days.
			</p>
		</section>
	{/if}

	</div>
</main>
