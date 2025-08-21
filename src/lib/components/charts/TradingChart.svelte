<script lang="ts">
  import type { Candle, ChartMarker } from "$lib/types";

  // Props
  let {
    data = [],
    markers = [],
    indicators = [],
    loading = false,
    height = 300,
    title = "Chart",
  } = $props<{
    data: Candle[];
    markers?: ChartMarker[];
    indicators?: any[];
    loading?: boolean;
    height?: number;
    title?: string;
  }>();

  // Chart container reference
  let chartContainer = $state<HTMLDivElement>();
  let chart: any = null;
  let candlestickSeries: any = null;

  // Chart creation effect
  $effect(() => {
    if (!chartContainer) return;

    // Dynamically import lightweight-charts to avoid SSR issues
    import("lightweight-charts")
      .then(({ createChart, ColorType }) => {
        if (chart) {
          chart.remove();
        }

        chart = createChart(chartContainer!, {
          width: chartContainer!.clientWidth,
          height: height,
          layout: {
            background: { color: "transparent", type: ColorType.Solid },
            textColor: "#d1d5db",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          },
          grid: {
            vertLines: { color: "#374151" },
            horzLines: { color: "#374151" },
          },
          crosshair: {
            mode: 1,
            horzLine: {
              visible: true,
              labelVisible: true,
              style: 0,
              width: 1,
              color: "#6b7280",
              labelBackgroundColor: "#1f2937",
            },
            vertLine: {
              visible: true,
              labelVisible: true,
              style: 0,
              width: 1,
              color: "#6b7280",
              labelBackgroundColor: "#1f2937",
            },
          },
          rightPriceScale: {
            borderColor: "#374151",
            textColor: "#d1d5db",
          },
          timeScale: {
            borderColor: "#374151",
            timeVisible: true,
            secondsVisible: false,
          },
          handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
            horzTouchDrag: true,
            vertTouchDrag: true,
          },
          handleScale: {
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
          },
        });

        // Add candlestick series
        candlestickSeries = chart.addCandlestickSeries({
          upColor: "#22c55e",
          downColor: "#ef4444",
          borderDownColor: "#ef4444",
          borderUpColor: "#22c55e",
          wickDownColor: "#ef4444",
          wickUpColor: "#22c55e",
        });

        // Set initial data
        if (data.length > 0) {
          candlestickSeries.setData(data);
        }

        // Handle resize
        const resizeChart = () => {
          if (chart && chartContainer) {
            chart.applyOptions({
              width: chartContainer.clientWidth,
              height: height,
            });
          }
        };

        const resizeObserver = new ResizeObserver(resizeChart);
        resizeObserver.observe(chartContainer!);

        return () => {
          resizeObserver.disconnect();
          if (chart) {
            chart.remove();
          }
        };
      })
      .catch((error) => {
        console.error("Failed to load lightweight-charts:", error);
      });
  });

  // Update data when it changes
  $effect(() => {
    if (candlestickSeries && data.length > 0) {
      candlestickSeries.setData(data);
    }
  });

  // Update markers when they change
  $effect(() => {
    if (candlestickSeries && markers.length > 0) {
      // Note: In lightweight-charts v5, markers are handled differently
      // This is a placeholder - actual implementation would use createSeriesMarkers
      console.log("Markers updated:", markers);
    }
  });
</script>

<div class="w-full h-full relative">
  {#if loading}
    <!-- Loading overlay -->
    <div class="absolute inset-0 flex items-center justify-center bg-base-100/80 z-10">
      <div class="flex flex-col items-center gap-2">
        <span class="loading loading-spinner loading-md"></span>
        <span class="text-sm text-base-content/70">Loading chart...</span>
      </div>
    </div>
  {/if}

  <!-- Chart container -->
  <div
    bind:this={chartContainer}
    class="w-full bg-base-100 rounded border border-base-300 chart-container"
    style="height: {height}px;"
  >
    {#if !chartContainer || data.length === 0}
      <!-- Empty state -->
      <div class="w-full h-full flex items-center justify-center text-base-content/60">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            ></path>
          </svg>
          <p class="text-sm">No chart data available</p>
          <p class="text-xs mt-1">Data will appear when available</p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Chart info overlay -->
  {#if title && data.length > 0}
    <div class="absolute top-2 left-2 bg-base-100/90 rounded px-2 py-1 text-xs font-medium">
      {title}
    </div>
  {/if}
</div>

<style>
  /* Ensure chart container has proper styling */
  :global(.tv-lightweight-charts) {
    border-radius: 0.375rem;
  }

  /* Hide scrollbars on chart container */
  .chart-container {
    overflow: hidden;
  }
</style>
