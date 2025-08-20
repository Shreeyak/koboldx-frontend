<script lang="ts">
  import type { OrderRequest, OrderSide, OrderType, OrderProduct } from "$lib/types";

  // Form state
  let selectedSymbol = $state("NIFTY");
  let side = $state<OrderSide>("BUY");
  let quantity = $state(50);
  let orderType = $state<OrderType>("MARKET");
  let price = $state<number | null>(null);
  let triggerPrice = $state<number | null>(null);
  let product = $state<OrderProduct>("MIS");
  let loading = $state(false);

  // Current market data (mock)
  let currentPrice = $state(24350.5);
  let bidPrice = $state(24350.25);
  let askPrice = $state(24350.75);

  // Quick quantity presets
  const quantityPresets = [25, 50, 75, 100, 150, 200];

  // Handle order placement
  const placeOrder = async (event: Event) => {
    event.preventDefault();
    if (loading) return;

    // Validation
    if (quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if ((orderType === "LIMIT" || orderType === "SL") && !price) {
      alert("Price is required for LIMIT and SL orders");
      return;
    }

    if ((orderType === "SL" || orderType === "SL-M") && !triggerPrice) {
      alert("Trigger price is required for SL orders");
      return;
    }

    loading = true;

    const orderRequest: OrderRequest = {
      symbol: selectedSymbol,
      side,
      quantity,
      order_type: orderType,
      product,
      price: price || undefined,
      trigger_price: triggerPrice || undefined,
      validity: "DAY",
    };

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Order placed:", orderRequest);
      alert(`${side} order placed successfully for ${quantity} ${selectedSymbol}`);

      // Reset form for market orders
      if (orderType === "MARKET") {
        // Keep symbol and product, reset others
        side = "BUY";
        quantity = 50;
        price = null;
        triggerPrice = null;
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      loading = false;
    }
  };

  // Quick buy/sell functions
  const quickBuy = () => {
    side = "BUY";
    orderType = "MARKET";
    price = null;
    triggerPrice = null;
  };

  const quickSell = () => {
    side = "SELL";
    orderType = "MARKET";
    price = null;
    triggerPrice = null;
  };

  // Set price to current market price
  const setMarketPrice = () => {
    if (side === "BUY") {
      price = askPrice;
    } else {
      price = bidPrice;
    }
  };

  // Calculate order value
  let orderValue = $derived(() => {
    const effectivePrice = orderType === "MARKET" ? (side === "BUY" ? askPrice : bidPrice) : price || currentPrice;
    return quantity * effectivePrice;
  });

  // Order type dependent fields
  let showPrice = $derived(orderType === "LIMIT" || orderType === "SL");
  let showTriggerPrice = $derived(orderType === "SL" || orderType === "SL-M");
</script>

<div class="space-y-4">
  <!-- Quick Actions -->
  <div class="flex gap-2">
    <button
      class="btn btn-success flex-1"
      class:btn-outline={side !== "BUY" || orderType !== "MARKET"}
      onclick={quickBuy}
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      Quick Buy
    </button>
    <button
      class="btn btn-error flex-1"
      class:btn-outline={side !== "SELL" || orderType !== "MARKET"}
      onclick={quickSell}
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
      </svg>
      Quick Sell
    </button>
  </div>

  <!-- Current Market Data -->
  <div class="stats stats-horizontal shadow-sm bg-base-200">
    <div class="stat py-2">
      <div class="stat-title text-xs">LTP</div>
      <div class="stat-value text-sm">₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="stat py-2">
      <div class="stat-title text-xs">Bid</div>
      <div class="stat-value text-sm text-error">₹{bidPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="stat py-2">
      <div class="stat-title text-xs">Ask</div>
      <div class="stat-value text-sm text-success">
        ₹{askPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </div>
    </div>
  </div>

  <!-- Order Form -->
  <form onsubmit={placeOrder} class="space-y-3">
    <!-- Symbol (read-only for now) -->
    <div class="form-control">
      <label class="label py-1">
        <span class="label-text text-xs font-medium">Symbol</span>
      </label>
      <input type="text" class="input input-bordered input-sm bg-base-200" value={selectedSymbol} readonly />
    </div>

    <!-- Side and Order Type -->
    <div class="grid grid-cols-2 gap-2">
      <div class="form-control">
        <label class="label py-1">
          <span class="label-text text-xs font-medium">Side</span>
        </label>
        <select class="select select-bordered select-sm" bind:value={side}>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label py-1">
          <span class="label-text text-xs font-medium">Type</span>
        </label>
        <select class="select select-bordered select-sm" bind:value={orderType}>
          <option value="MARKET">MARKET</option>
          <option value="LIMIT">LIMIT</option>
          <option value="SL">SL</option>
          <option value="SL-M">SL-M</option>
        </select>
      </div>
    </div>

    <!-- Quantity -->
    <div class="form-control">
      <label class="label py-1">
        <span class="label-text text-xs font-medium">Quantity</span>
      </label>
      <input
        type="number"
        class="input input-bordered input-sm"
        bind:value={quantity}
        min="1"
        step="1"
        placeholder="Enter quantity"
      />
      <!-- Quantity presets -->
      <div class="flex gap-1 mt-1">
        {#each quantityPresets as preset}
          <button
            type="button"
            class="btn btn-xs btn-outline"
            class:btn-active={quantity === preset}
            onclick={() => (quantity = preset)}
          >
            {preset}
          </button>
        {/each}
      </div>
    </div>

    <!-- Price (conditional) -->
    {#if showPrice}
      <div class="form-control">
        <label class="label py-1">
          <span class="label-text text-xs font-medium">Price</span>
          <button type="button" class="label-text-alt text-xs link link-primary" onclick={setMarketPrice}>
            Use Market
          </button>
        </label>
        <input
          type="number"
          class="input input-bordered input-sm"
          bind:value={price}
          min="0.05"
          step="0.05"
          placeholder="Enter price"
        />
      </div>
    {/if}

    <!-- Trigger Price (conditional) -->
    {#if showTriggerPrice}
      <div class="form-control">
        <label class="label py-1">
          <span class="label-text text-xs font-medium">Trigger Price</span>
        </label>
        <input
          type="number"
          class="input input-bordered input-sm"
          bind:value={triggerPrice}
          min="0.05"
          step="0.05"
          placeholder="Enter trigger price"
        />
      </div>
    {/if}

    <!-- Product -->
    <div class="form-control">
      <label class="label py-1">
        <span class="label-text text-xs font-medium">Product</span>
      </label>
      <select class="select select-bordered select-sm" bind:value={product}>
        <option value="MIS">MIS (Intraday)</option>
        <option value="CNC">CNC (Delivery)</option>
        <option value="NRML">NRML (Normal)</option>
      </select>
    </div>

    <!-- Order Summary -->
    <div class="alert alert-info py-2">
      <div class="text-xs">
        <div><strong>Order Value:</strong> ₹{orderValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
        <div>
          <strong>Side:</strong>
          {side} • <strong>Type:</strong>
          {orderType} • <strong>Product:</strong>
          {product}
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      class="btn w-full"
      class:btn-success={side === "BUY"}
      class:btn-error={side === "SELL"}
      disabled={loading}
    >
      {#if loading}
        <span class="loading loading-spinner loading-sm"></span>
        Placing Order...
      {:else}
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          ></path>
        </svg>
        {side}
        {quantity}
        {selectedSymbol}
      {/if}
    </button>
  </form>

  <!-- Risk Warning -->
  <div class="alert alert-warning py-2">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
      ></path>
    </svg>
    <span class="text-xs">Review order details before submission. Trading involves risk.</span>
  </div>
</div>

<style>
  /* Custom styling for form controls */
  .form-control .label {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .stats-horizontal .stat {
    padding: 0.5rem;
  }

  /* Responsive button sizing */
  @media (max-width: 768px) {
    .btn-xs {
      padding: 0.125rem 0.25rem;
      font-size: 0.625rem;
    }
  }
</style>
