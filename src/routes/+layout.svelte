<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  
  // Layout components (will be created)
  import Header from "$lib/components/layout/Header.svelte";
  import LeftSidebar from "$lib/components/layout/LeftSidebar.svelte";
  import RightSidebar from "$lib/components/layout/RightSidebar.svelte";

  let { children } = $props();

  // State for responsive design
  let leftSidebarOpen = $state(true);
  let rightSidebarOpen = $state(true);

  // Screen size detection for responsive behavior
  let innerWidth = $state(0);

  $effect(() => {
    // Auto-collapse sidebars on smaller screens
    if (innerWidth < 1024) {
      // lg breakpoint
      leftSidebarOpen = false;
      rightSidebarOpen = false;
    } else {
      leftSidebarOpen = true;
      rightSidebarOpen = true;
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<svelte:window bind:innerWidth />

<div class="min-h-screen bg-base-100 text-base-content">
  <!-- Header -->
  <Header
    {leftSidebarOpen}
    {rightSidebarOpen}
    onToggleLeftSidebar={() => (leftSidebarOpen = !leftSidebarOpen)}
    onToggleRightSidebar={() => (rightSidebarOpen = !rightSidebarOpen)}
  />

  <!-- Main Content Grid -->
  <div class="flex h-[calc(100vh-60px)]">
    <!-- 60px is header height -->

    <!-- Left Sidebar -->
    <div
      class="
      {leftSidebarOpen ? 'w-80' : 'w-0'} 
      transition-all duration-300 ease-in-out
      bg-base-200 border-r border-base-300
      {leftSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    "
    >
      <LeftSidebar />
    </div>

    <!-- Center Panel - This is where page content will be rendered -->
    <div class="flex-1 flex flex-col overflow-auto">
      {@render children?.()}
    </div>

    <!-- Right Sidebar -->
    <div
      class="
      {rightSidebarOpen ? 'w-96' : 'w-0'} 
      transition-all duration-300 ease-in-out
      bg-base-200 border-l border-base-300
      {rightSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    "
    >
      <RightSidebar />
    </div>
  </div>
</div>

<!-- Mobile Navigation (shown when sidebars are collapsed) -->
{#if innerWidth < 1024}
  <div class="btm-nav btm-nav-lg bg-base-300">
    <button
      class="btn btn-ghost btn-sm"
      class:active={leftSidebarOpen}
      onclick={() => (leftSidebarOpen = !leftSidebarOpen)}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
      Instruments
    </button>

    <button
      class="btn btn-ghost btn-sm"
      class:active={rightSidebarOpen}
      onclick={() => (rightSidebarOpen = !rightSidebarOpen)}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        ></path>
      </svg>
      Charts
    </button>
  </div>
{/if}

<style>
  /* Smooth transitions for sidebar toggles */
  .transition-all {
    transition:
      width 0.3s ease-in-out,
      opacity 0.3s ease-in-out;
  }

  /* Ensure proper scrolling in panels */
  .overflow-auto {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--bc) / 0.2) transparent;
  }

  .overflow-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-auto::-webkit-scrollbar-thumb {
    background-color: hsl(var(--bc) / 0.2);
    border-radius: 3px;
  }

  .overflow-auto::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--bc) / 0.3);
  }
</style>
