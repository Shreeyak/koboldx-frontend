<script lang="ts">
  import type { Account, Margin, WebSocketState } from "$lib/types";

  // Props for sidebar control
  let {
    leftSidebarOpen = $bindable(),
    rightSidebarOpen = $bindable(),
    onToggleLeftSidebar,
    onToggleRightSidebar,
  } = $props<{
    leftSidebarOpen: boolean;
    rightSidebarOpen: boolean;
    onToggleLeftSidebar: () => void;
    onToggleRightSidebar: () => void;
  }>();

  // Mock data for now - will be connected to stores later
  let account = $state<Account | null>(null);
  let margin = $state<Margin | null>(null);
  let wsState = $state<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    subscriptions: new Set(),
    lastMessage: null,
    reconnectAttempts: 0,
  });

  // Mock values for display
  let totalPnL = $state(+2450.5);
  let availableMargin = $state(125000);
  let currentTime = $state(new Date());

  // Update time every second
  $effect(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    return () => clearInterval(interval);
  });

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
</script>

<header class="navbar bg-base-200 border-b border-base-300 px-4 h-[60px] min-h-[60px]">
  <!-- Left side - Logo and sidebar toggle -->
  <div class="navbar-start">
    <div class="flex items-center gap-3">
      <!-- Mobile sidebar toggles -->
      <div class="dropdown lg:hidden">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
          <li><button onclick={onToggleLeftSidebar}>Instruments</button></li>
          <li><button onclick={onToggleRightSidebar}>Charts</button></li>
        </ul>
      </div>

      <!-- Desktop sidebar toggles -->
      <button
        class="btn btn-ghost btn-sm hidden lg:flex"
        onclick={onToggleLeftSidebar}
        class:btn-active={leftSidebarOpen}
        title="Toggle instruments panel"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m0-12h4m0 0v12m0-12V9a2 2 0 012 2v2a2 2 0 01-2 2h-4"
          ></path>
        </svg>
      </button>

      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-primary-content font-bold text-sm">KX</span>
        </div>
        <h1 class="text-xl font-bold text-base-content hidden sm:block">KoboldX</h1>
      </div>
    </div>
  </div>

  <!-- Center - Account info and stats -->
  <div class="navbar-center hidden md:flex">
    <div class="flex items-center gap-6 text-sm">
      <!-- P&L -->
      <div class="flex flex-col items-center">
        <span class="text-xs text-base-content/70">P&L</span>
        <span class="font-semibold {totalPnL >= 0 ? 'text-success' : 'text-error'}">
          {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
        </span>
      </div>

      <!-- Available Margin -->
      <div class="flex flex-col items-center">
        <span class="text-xs text-base-content/70">Available</span>
        <span class="font-semibold">{formatCurrency(availableMargin)}</span>
      </div>

      <!-- Current Time -->
      <div class="flex flex-col items-center">
        <span class="text-xs text-base-content/70">IST</span>
        <span class="font-mono font-semibold">{formatTime(currentTime)}</span>
      </div>
    </div>
  </div>

  <!-- Right side - Connection status and controls -->
  <div class="navbar-end">
    <div class="flex items-center gap-2">
      <!-- Connection Status -->
      <div class="flex items-center gap-2">
        <div
          class="
          w-2 h-2 rounded-full
          {wsState.connected ? 'bg-success' : wsState.connecting ? 'bg-warning animate-pulse' : 'bg-error'}
        "
        ></div>
        <span class="text-xs text-base-content/70 hidden sm:inline">
          {wsState.connected ? "Connected" : wsState.connecting ? "Connecting..." : "Disconnected"}
        </span>
      </div>

      <!-- Charts sidebar toggle -->
      <button
        class="btn btn-ghost btn-sm hidden lg:flex"
        onclick={onToggleRightSidebar}
        class:btn-active={rightSidebarOpen}
        title="Toggle charts panel"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          ></path>
        </svg>
      </button>

      <!-- Settings Dropdown -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li><a href="#settings">Settings</a></li>
          <li><a href="#theme">Theme</a></li>
          <li><a href="#help">Help</a></li>
          <li><hr class="my-1" /></li>
          <li><a href="#logout">Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
</header>

<style>
  .navbar {
    backdrop-filter: blur(10px);
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
