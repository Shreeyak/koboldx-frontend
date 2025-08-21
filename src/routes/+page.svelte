<script lang="ts">
  // Panel components (will be created)
  import OrderPlacementPanel from "$lib/components/panels/OrderPlacementPanel.svelte";
  import OptionChainPanel from "$lib/components/panels/OptionChainPanel.svelte";
  import TradeLogPanel from "$lib/components/panels/TradeLogPanel.svelte";
</script>

<svelte:head>
  <title>KoboldX Trading Dashboard</title>
  <meta
    name="description"
    content="Professional options trading dashboard with real-time data and advanced analytics"
  />
</svelte:head>

<!-- Trading Dashboard Content -->
<div class="flex h-full flex-col gap-4 p-4">
  <!-- Order Placement Panel -->
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <h3 class="mb-3 card-title text-lg">Order Placement</h3>
      <OrderPlacementPanel />
    </div>
  </div>

  <!-- Option Chain Panel -->
  <div class="card flex-1 border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body flex flex-col p-4">
      <h3 class="mb-3 card-title text-lg">Option Chain</h3>
      <div class="flex-1 overflow-auto">
        <OptionChainPanel />
      </div>
    </div>
  </div>

  <!-- Trade Log Panel -->
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <h3 class="mb-3 card-title text-lg">Trade Log</h3>
      <TradeLogPanel />
    </div>
  </div>
</div>
