<script>
    let collapsed = false;
  
    function toggleCollapse() {
      collapsed = !collapsed;
    }
  </script>
  
  <style>
    .sidebar {
      transition: width 0.3s;
      background-color: #AF1624;
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
      background-color: #840D18;
      border-radius: 15px;
    }
  </style>
  
  <div class="flex flex-col h-screen sidebar {collapsed ? 'collapsed' : 'expanded'}">
    <!-- collapse button -->
    <div class="p-2 flex justify-end">
      <button on:click={toggleCollapse} class="text-white focus:outline-none" aria-label="Expandir o colapsar menú">
        <i class="fa fa-bars"></i>
      </button>
    </div>
  
    <!-- sidebar -->
    <nav class="flex flex-col gap-2 mt-2 px-2">
      <div class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer nav-item {collapsed ? 'justify-center' : ''}">
        <i class="fa fa-home text-white"></i>
        {#if !collapsed}
          <span class="text-white">Home</span>
        {/if}
      </div>
  
      <div class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer nav-item {collapsed ? 'justify-center' : ''}">
        <i class="fa fa-clock-rotate-left text-white"></i>
        {#if !collapsed}
          <span class="text-white">History</span>
        {/if}
      </div>
  
      <div class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer nav-item {collapsed ? 'justify-center' : ''}">
        <i class="fa fa-plus text-white"></i>
        {#if !collapsed}
          <span class="text-white">Create</span>
        {/if}
      </div>
    </nav>
  
    <!-- Spacer -->
    <div class="flex-grow"></div>
  
    <!-- Usuario
    <div class="flex items-center p-4 text-white">
      <div class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
        <i class="fa fa-user text-white"></i>
      </div>
      {#if !collapsed}
        <span class="ml-3">Username</span>
      {/if}
    </div> -->
  </div>
  