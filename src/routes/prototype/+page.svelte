<script lang="ts">
	const prototypes: { slug: string; title: string; description: string }[] = [
		{ slug: 'dashboard', title: 'Dashboard', description: 'Warm editorial to-do dashboard with priority hero, task cards, and quick add' },
	];
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<header class="mb-10">
		<h1 class="text-3xl font-bold text-gray-900">UI Prototypes</h1>
		<p class="mt-1 text-gray-500">Scratch pad for design ideas</p>
	</header>

	{#if prototypes.length === 0}
		<div class="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
			<p class="text-lg font-medium text-gray-400">No prototypes yet</p>
			<p class="mt-1 text-sm text-gray-400">
				Add a folder under <code class="rounded bg-gray-100 px-1">src/routes/prototype/</code> and
				register it above.
			</p>
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each prototypes as p}
				<li>
					<a
						href="/prototype/{p.slug}"
						class="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
					>
						<h2 class="text-lg font-semibold text-gray-800">{p.title}</h2>
						{#if p.description}
							<p class="mt-1 text-sm text-gray-500">{p.description}</p>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
