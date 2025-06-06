<script lang="ts">
	import PanelRightIcon from 'lucide-svelte/icons/panel-right';
	import HomeIcon from 'lucide-svelte/icons/home';
	import ClockIcon from 'lucide-svelte/icons/clock';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import UsernameButton from '$lib/components/UsernameButton.svelte';

	let collapsed = false;

	function toggleCollapse() {
		collapsed = !collapsed;
	}
</script>

<div
	class="fixed top-4 z-50 transition-all duration-300"
	style="left: {collapsed ? '4.5rem' : '13.5rem'}"
>
	<button on:click={toggleCollapse} aria-label="Expandir o colapsar menú">
		<PanelRightIcon size={24} color="black" class="cursor-pointer text-inherit" />
	</button>
</div>

<!-- Layout -->
<div class="flex h-full flex-row justify-between">
	<!-- Sidebar -->
	<div
		class="sidebar h-100% flex min-h-screen flex-col justify-between {collapsed
			? 'collapsed'
			: 'expanded'}"
	>
		<nav class="mt-12 flex flex-col gap-2 px-2">
			<a href="/">
				<div
					class="nav-item flex cursor-pointer items-center space-x-3 rounded-lg p-3 {collapsed
						? 'justify-center'
						: ''}"
				>
					<HomeIcon size={24} color="white" class="shrink-0 text-inherit" />
					{#if !collapsed}
						<span class="inline text-white">Home</span>
					{/if}
				</div>
			</a>

			<a href="/history/admin">
				<div
					class="nav-item flex cursor-pointer items-center space-x-3 rounded-lg p-3 {collapsed
						? 'justify-center'
						: ''}"
				>
					<ClockIcon size={24} color="white" class="shrink-0 text-inherit" />
					{#if !collapsed}
						<span class="text-white">HistoryAdmin</span>
					{/if}
				</div>
			</a>
			<a href="/history/user">
				<div
					class="nav-item flex cursor-pointer items-center space-x-3 rounded-lg p-3 {collapsed
						? 'justify-center'
						: ''}"
				>
					<ClockIcon size={24} color="white" class="shrink-0 text-inherit" />
					{#if !collapsed}
						<span class="text-white">HistoryUser</span>
					{/if}
				</div>
			</a>

			<a href="/create">
				<div
					class="nav-item flex cursor-pointer items-center space-x-3 rounded-lg p-3 {collapsed
						? 'justify-center'
						: ''}"
				>
					<PlusIcon name="Plus" size={24} color="white" class="shrink-0 text-inherit" />
					{#if !collapsed}
						<span class="text-white">Create</span>
					{/if}
				</div>
			</a>
		</nav>
		<!-- User Account Section -->
		<div class="p-2">
			<UsernameButton isSidebarCollapsed={collapsed} />
		</div>
	</div>
</div>

<style>
	.sidebar {
		transition: width 0.3s;
		background-color: #af1624;
	}

	.sidebar.collapsed {
		width: 4rem;
	}

	.sidebar.expanded {
		width: 13rem;
	}

	.nav-item {
		transition: background-color 0.3s;
		border-radius: 15px;
	}

	.nav-item:hover {
		background-color: #840d18;
		border-radius: 15px;
		cursor: pointer;
	}
</style>
