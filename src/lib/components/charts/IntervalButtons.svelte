<script lang="ts">
  import type { TimeInterval } from "$lib/types";

  // Props
  let {
    intervals = ["1m", "3m", "5m", "15m", "30m", "1h"],
    selected = ["5m"],
    current = "5m",
    onSelect,
    onCurrentChange,
    disabled = false,
  } = $props<{
    intervals: TimeInterval[];
    selected: TimeInterval[];
    current: TimeInterval;
    onSelect: (intervals: TimeInterval[]) => void;
    onCurrentChange?: (interval: TimeInterval) => void;
    disabled?: boolean;
  }>();

  // Handle interval toggle
  const toggleInterval = (interval: TimeInterval) => {
    if (disabled) return;

    let newSelected: TimeInterval[];

    if (selected.includes(interval)) {
      // Remove interval (but keep at least one)
      if (selected.length > 1) {
        newSelected = selected.filter((i) => i !== interval);
        // If we removed the current interval, switch to first remaining
        if (current === interval && onCurrentChange) {
          onCurrentChange(newSelected[0]);
        }
      } else {
        return; // Don't allow removing the last interval
      }
    } else {
      // Add interval
      newSelected = [...selected, interval];
    }

    onSelect(newSelected);
  };

  // Handle current interval change
  const setCurrentInterval = (interval: TimeInterval) => {
    if (disabled || !selected.includes(interval)) return;

    if (onCurrentChange) {
      onCurrentChange(interval);
    }
  };

  // Get button class for interval
  const getButtonClass = (interval: TimeInterval): string => {
    const baseClass = "btn btn-xs";

    if (disabled) {
      return `${baseClass} btn-disabled`;
    }

    if (current === interval) {
      return `${baseClass} btn-primary`;
    }

    if (selected.includes(interval)) {
      return `${baseClass} btn-outline btn-primary`;
    }

    return `${baseClass} btn-outline`;
  };

  // Format interval display
  const formatInterval = (interval: TimeInterval): string => {
    return interval;
  };

  // Group intervals by type for better layout
  const groupedIntervals = $derived(() => {
    if (!intervals || intervals.length === 0) {
      return { intraday: [], daily: [] };
    }

    const intraday = intervals.filter((i) => i.includes("m") || i === "1h");
    const daily = intervals.filter((i) => i.includes("d") || i.includes("w") || i.includes("M"));

    return { intraday, daily };
  });
</script>

<div class="flex flex-col gap-2">
  <!-- Intraday intervals -->
  {#if groupedIntervals && groupedIntervals.intraday && groupedIntervals.intraday.length > 0}
    <div class="flex flex-wrap gap-1">
      <span class="text-xs text-base-content/70 self-center mr-2">Intraday:</span>
      {#each groupedIntervals?.intraday ?? [] as interval}
        <button
          class={getButtonClass(interval)}
          onclick={() => {
            if (selected.includes(interval)) {
              setCurrentInterval(interval);
            } else {
              toggleInterval(interval);
            }
          }}
          oncontextmenu={(e) => {
            e.preventDefault();
            toggleInterval(interval);
          }}
          {disabled}
          title={selected.includes(interval)
            ? current === interval
              ? "Current interval"
              : "Click to switch, right-click to remove"
            : "Click to add interval"}
        >
          {formatInterval(interval)}
          {#if current === interval}
            <svg class="w-2 h-2 ml-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="2" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Daily/Weekly intervals -->
  {#if groupedIntervals?.daily?.length > 0}
    <div class="flex flex-wrap gap-1">
      <span class="text-xs text-base-content/70 self-center mr-2">Daily:</span>
      {#each groupedIntervals?.daily ?? [] as interval}
        <button
          class={getButtonClass(interval)}
          onclick={() => {
            if (selected.includes(interval)) {
              setCurrentInterval(interval);
            } else {
              toggleInterval(interval);
            }
          }}
          oncontextmenu={(e) => {
            e.preventDefault();
            toggleInterval(interval);
          }}
          {disabled}
          title={selected.includes(interval)
            ? current === interval
              ? "Current interval"
              : "Click to switch, right-click to remove"
            : "Click to add interval"}
        >
          {formatInterval(interval)}
          {#if current === interval}
            <svg class="w-2 h-2 ml-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="2" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Simple layout fallback -->
  {#if (groupedIntervals?.intraday?.length ?? 0) === 0 && (groupedIntervals?.daily?.length ?? 0) === 0}
    <div class="flex flex-wrap gap-1">
      {#each intervals ?? [] as interval}
        <button
          class={getButtonClass(interval)}
          onclick={() => {
            if (selected.includes(interval)) {
              setCurrentInterval(interval);
            } else {
              toggleInterval(interval);
            }
          }}
          oncontextmenu={(e) => {
            e.preventDefault();
            toggleInterval(interval);
          }}
          {disabled}
          title={selected.includes(interval)
            ? current === interval
              ? "Current interval"
              : "Click to switch, right-click to remove"
            : "Click to add interval"}
        >
          {formatInterval(interval)}
          {#if current === interval}
            <svg class="w-2 h-2 ml-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="2" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Help text -->
  {#if !disabled}
    <div class="text-xs text-base-content/50">Click to switch • Right-click to add/remove</div>
  {/if}
</div>

<style>
  /* Custom button styling */
  .btn-xs {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    line-height: 0.75rem;
    min-height: 1.25rem;
    height: 1.25rem;
  }

  /* Active state styling */
  .btn-primary {
    font-weight: 600;
  }

  /* Hover effects */
  .btn:not(.btn-disabled):hover {
    transform: translateY(-1px);
    transition: transform 0.1s ease;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .btn-xs {
      padding: 0.125rem 0.25rem;
      font-size: 0.5rem;
    }
  }
</style>
