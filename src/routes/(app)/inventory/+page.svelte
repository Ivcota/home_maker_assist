<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { getExpirationStatus } from '$lib/domain/inventory/expiration.js';
	import type { StorageLocation } from '$lib/domain/inventory/food-item.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let activeTab = $state<'all' | StorageLocation>('all');
	let trackingType = $state('count');

	const tabs: { id: 'all' | StorageLocation; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'pantry', label: 'Pantry' },
		{ id: 'fridge', label: 'Fridge' },
		{ id: 'freezer', label: 'Freezer' }
	];

	const filteredItems = $derived(
		data.items
			.filter((item) => activeTab === 'all' || item.storageLocation === activeTab)
			.sort((a, b) => {
				if (a.expirationDate === null && b.expirationDate === null) return 0;
				if (a.expirationDate === null) return 1;
				if (b.expirationDate === null) return -1;
				return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
			})
	);

	const statusColors = {
		fresh: 'bg-green-100 text-green-700 border-green-200',
		'expiring-soon': 'bg-yellow-100 text-yellow-700 border-yellow-200',
		expired: 'bg-red-100 text-red-700 border-red-200'
	};

	const statusLabels = {
		fresh: 'Fresh',
		'expiring-soon': 'Expiring soon',
		expired: 'Expired'
	};
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Nunito+Sans:wght@300;400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#f8f6f3] font-[Nunito_Sans,sans-serif]">
	<nav class="border-b border-[#e8e2d9] bg-white">
		<div class="mx-auto flex max-w-5xl items-center px-6 py-4">
			<h1 class="font-[Cormorant_Garamond,serif] text-xl font-bold tracking-wide text-[#1a1714]">
				Home Maker Assist
			</h1>
		</div>
	</nav>

	<main class="mx-auto w-full max-w-5xl px-6 py-10">
		<!-- Hero -->
		<div
			class="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1714] via-[#252018] to-[#2a2520] p-8 sm:p-10"
		>
			<span class="mb-3 inline-block text-xs font-semibold tracking-[0.2em] text-[#c4a46a]">
				INVENTORY
			</span>
			<h2
				class="mb-3 font-[Cormorant_Garamond,serif] text-3xl font-bold leading-tight text-[#f0e6d3] sm:text-4xl"
			>
				Food Inventory
			</h2>
			<p class="max-w-xl text-base leading-relaxed text-[#9a9088]">
				{data.items.length === 0
					? 'Nothing in inventory yet. Add your first item below.'
					: `${data.items.length} item${data.items.length === 1 ? '' : 's'} in inventory`}
			</p>
		</div>

		<!-- Tab bar -->
		<div class="mb-6 flex gap-1 rounded-xl border border-[#e8e2d9] bg-white p-1">
			{#each tabs as tab}
				<button
					type="button"
					onclick={() => (activeTab = tab.id)}
					class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150
						{activeTab === tab.id
						? 'bg-[#1a1714] text-white shadow-sm'
						: 'text-[#8a8279] hover:bg-[#f0ebe4] hover:text-[#3a3632]'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Item list -->
		{#if filteredItems.length > 0}
			<section class="mb-10">
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredItems as item (item.id)}
						{@const status = item.expirationDate
							? getExpirationStatus(new Date(item.expirationDate))
							: null}
						<article
							class="rounded-xl border border-[#e8e2d9] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#c4a46a66]"
						>
							<div class="mb-1 flex items-start justify-between gap-2">
								<h3 class="font-[Cormorant_Garamond,serif] text-lg font-bold text-[#1a1714]">
									{item.name}
								</h3>
								<span
									class="shrink-0 rounded-full border border-[#e8e2d9] px-2 py-0.5 text-xs font-medium capitalize text-[#8a8279]"
								>
									{item.storageLocation}
								</span>
							</div>

							<p class="mb-3 text-xs font-medium tracking-[0.1em] text-[#8a8279]">
								{#if item.trackingType === 'amount'}
									{item.amount !== null ? `${item.amount}% remaining` : 'Amount not set'}
								{:else}
									{item.quantity !== null ? `Qty: ${item.quantity}` : 'Quantity not set'}
								{/if}
							</p>

							{#if item.expirationDate && status}
								<div class="flex items-center gap-2">
									<span
										class="rounded-full border px-2 py-0.5 text-xs font-medium {statusColors[status]}"
									>
										{statusLabels[status]}
									</span>
									<span class="text-xs text-[#8a8279]">
										{new Date(item.expirationDate).toLocaleDateString()}
									</span>
								</div>
							{/if}
						</article>
					{/each}
				</div>
			</section>
		{:else}
			<p class="mb-10 text-sm text-[#8a8279]">
				{activeTab === 'all' ? 'No items in inventory.' : `No items in ${activeTab}.`}
			</p>
		{/if}

		<!-- Add Item Form -->
		<section class="rounded-xl border border-[#e8e2d9] bg-white p-6 sm:p-8">
			<h3 class="mb-4 font-[Cormorant_Garamond,serif] text-lg font-bold text-[#1a1714]">
				Add Item
			</h3>
			<form method="post" action="?/create" use:enhance class="flex flex-col gap-4">
				<!-- Name -->
				<div class="flex flex-col gap-1.5">
					<label for="name" class="text-sm font-medium text-[#3a3632]">Name</label>
					<input
						id="name"
						type="text"
						name="name"
						required
						placeholder="e.g. Milk, Eggs, Pasta"
						class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] placeholder:text-[#b5aea4] shadow-sm outline-none transition-all duration-200 focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Storage location -->
					<div class="flex flex-col gap-1.5">
						<label for="storageLocation" class="text-sm font-medium text-[#3a3632]">
							Storage Location
						</label>
						<select
							id="storageLocation"
							name="storageLocation"
							value={activeTab === 'all' ? 'pantry' : activeTab}
							class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm outline-none transition-all duration-200 focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
						>
							<option value="pantry">Pantry</option>
							<option value="fridge">Fridge</option>
							<option value="freezer">Freezer</option>
						</select>
					</div>

					<!-- Tracking type -->
					<div class="flex flex-col gap-1.5">
						<label for="trackingType" class="text-sm font-medium text-[#3a3632]">Track by</label>
						<select
							id="trackingType"
							name="trackingType"
							bind:value={trackingType}
							class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm outline-none transition-all duration-200 focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
						>
							<option value="count">Count (qty)</option>
							<option value="amount">Amount (%)</option>
						</select>
					</div>
				</div>

				<!-- Amount or Quantity -->
				{#if trackingType === 'amount'}
					<div class="flex flex-col gap-1.5">
						<label for="amount" class="text-sm font-medium text-[#3a3632]">
							Amount remaining (%)
						</label>
						<input
							id="amount"
							type="number"
							name="amount"
							min="0"
							max="100"
							placeholder="0–100"
							class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm outline-none transition-all duration-200 focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
						/>
					</div>
				{:else}
					<div class="flex flex-col gap-1.5">
						<label for="quantity" class="text-sm font-medium text-[#3a3632]">Quantity</label>
						<input
							id="quantity"
							type="number"
							name="quantity"
							min="1"
							value="1"
							class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm outline-none transition-all duration-200 focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
						/>
					</div>
				{/if}

				<!-- Expiration date (optional) -->
				<div class="flex flex-col gap-1.5">
					<label for="expirationDate" class="text-sm font-medium text-[#3a3632]">
						Expiration date <span class="font-normal text-[#8a8279]">(optional)</span>
					</label>
					<input
						id="expirationDate"
						type="date"
						name="expirationDate"
						class="rounded-lg border border-[#ddd6cc] bg-white px-3.5 py-2.5 text-sm text-[#1a1714] shadow-sm outline-none transition-all duration-200 focus:border-[#c4a46a] focus:ring-2 focus:ring-[#c4a46a33]"
					/>
				</div>

				<div class="flex items-center gap-4">
					<button
						type="submit"
						class="rounded-lg bg-[#c4a46a] px-5 py-2.5 text-sm font-semibold tracking-wide text-[#1a1714] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4b87a] hover:shadow-md active:translate-y-0"
					>
						Add Item
					</button>
					{#if form?.message}
						<p
							class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm text-red-600"
						>
							{form.message}
						</p>
					{/if}
				</div>
			</form>
		</section>
	</main>
</div>
