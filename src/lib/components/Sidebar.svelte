<script lang="ts">
	let collapsed = false;

	function toggleCollapse() {
		collapsed = !collapsed;
	}
	import Icon from './Icon.svelte';
</script>

<div
	class="fixed top-4 z-50 transition-all duration-300"
	style="left: {collapsed ? '4.5rem' : '13.5rem'}"
>
	<button on:click={toggleCollapse} aria-label="Expandir o colapsar menú">
		<Icon name="PanelRight" size={24} color="black" />
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
					<Icon name="Home" size={24} color="white" />
					{#if !collapsed}
						<span class="text-white">Home</span>
					{/if}
				</div>
			</a>

			<a href="/history">
				<div
					class="nav-item flex cursor-pointer items-center space-x-3 rounded-lg p-3 {collapsed
						? 'justify-center'
						: ''}"
				>
					<Icon name="Clock" size={24} color="white" />
					{#if !collapsed}
						<span class="text-white">History</span>
					{/if}
				</div>
			</a>

			<a href="/create">
				<div
					class="nav-item flex cursor-pointer items-center space-x-3 rounded-lg p-3 {collapsed
						? 'justify-center'
						: ''}"
				>
					<Icon name="Plus" size={24} color="white" />
					{#if !collapsed}
						<span class="text-white">Create</span>
					{/if}
				</div>
			</a>
		</nav>
		<!-- Usuario -->
		<div class="flex items-center p-4 text-white">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
				<Icon name="User" size={24} color="white" />
			</div>
			{#if !collapsed}
				<span class="ml-3">Username</span>
			{/if}
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
