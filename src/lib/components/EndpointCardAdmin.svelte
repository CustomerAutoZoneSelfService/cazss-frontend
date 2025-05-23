<script lang="ts">
	let {
		id,
		title,
		// description, // Not used in this component
		historyCard = false,
		useDate = '',
		onClick = () => {},
		userInitial = 'U',
		username = 'Username'
	} = $props<{
		id: number;
		title: string;
		description: string;
		historyCard?: boolean;
		useDate?: string;
		onClick?: () => void;
		userInitial?: string;
		username?: string;
	}>();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onClick();
		}
	}
</script>

<div
	class="group bg-gray-light hover:bg-accent-red relative flex h-fit cursor-pointer items-center justify-between gap-4 rounded-3xl p-4 shadow-lg"
	onclick={onClick}
	onkeydown={handleKeydown}
	tabindex="0"
	role="button"
	data-endpoint-id={id}
>
	<!--Usuario -->
	<div class="flex items-center gap-4">
		<div
			class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 font-bold text-white"
		>
			{userInitial}
		</div>
		<div class="text-near-black group-hover:text-white">
			<span class="font-semibold">{username}</span> used <strong>{title}</strong>
		</div>
	</div>

	<!-- Fecha/Hora -->
	{#if historyCard}
		<div class="text-near-black ml-auto text-sm group-hover:text-white">
			{useDate}
		</div>
	{/if}
</div>
