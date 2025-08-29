<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
      </div>
    </template>

    <div>
      <VChart
        ref="chartRef"
        :option="chartOption"
        :autoresize="true"
        :loading="isLoading"
        :style="{ height: height }"
        @click="handleChartClick"
        class="w-full"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import type { ComposeOption } from "echarts/core";
import type { BarSeriesOption } from "echarts/charts";
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  LegendComponentOption,
} from "echarts/components";
import type { ECElementEvent } from "echarts";
import { useChartInteractivity } from "~/composables/useChartInteractivity.js";
import type {
  ChartData,
  DrillContext,
  ChartClickParams,
} from "~/types/entities";

// Define the proper ECharts option type
type ECOption = ComposeOption<
  | BarSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
>;

interface Props {
  title?: string;
  data: ChartData;
  isLoading?: boolean;
  showOrientationToggle?: boolean;
  showSortOptions?: boolean;
  showExport?: boolean;
  colors?: string[];
  height?: string;
  stack?: boolean;
  showDataLabels?: boolean;
  chartType?: string;
  enableInteractivity?: boolean;
  drillContext?: DrillContext;
}

interface Emits {
  (e: "click", data: ChartClickParams): void;
  (e: "orientationChange", orientation: string): void;
  (e: "sortChange", sortBy: string): void;
  (e: "export", data: any): void;
  (
    e: "drill",
    data: { params: ChartClickParams; context: DrillContext; chartType: string }
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Bar Chart",
  isLoading: false,
  showOrientationToggle: true,
  showSortOptions: true,
  showExport: true,
  colors: () => ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
  height: "400px",
  stack: false,
  showDataLabels: false,
  chartType: "team_performance",
  enableInteractivity: true,
  drillContext: () => ({}),
});

const emit = defineEmits<Emits>();

const chartRef = ref<any>(null);
const orientation = ref<string>("vertical");
const sortBy = ref<string>("none");
const realTimeCleanup = ref<(() => void) | null>(null);

// Enhanced interactivity with composable
const {
  initializeChartInteractivity,
  handleChartClick: handleInteractiveChartClick,
  exportChart: exportInteractiveChart,
  createEnhancedTooltipFormatter,
  enableRealTimeUpdates,
  isExporting,
  exportProgress,
} = useChartInteractivity({
  customDrillHandlers: {
    [props.chartType]: (params: any, context: any) => {
      emit("drill", { params, context, chartType: props.chartType });
    },
  },
});

const orientationOptions = [
  { label: "Vertical", value: "vertical" },
  { label: "Horizontal", value: "horizontal" },
];

const sortOptions = [
  { label: "No Sort", value: "none" },
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
  { label: "By Name", value: "name" },
];

const processedData = computed(() => {
  if (!props.data || !props.data.categories || !props.data.series) {
    return { categories: [], series: [] };
  }

  let categories = [...props.data.categories];
  let series = props.data.series.map((s) => ({ ...s, data: [...s.data] }));

  // Apply sorting
  if (sortBy.value !== "none") {
    const indices = Array.from({ length: categories.length }, (_, i) => i);

    if (sortBy.value === "name") {
      indices.sort((a, b) => categories[a].localeCompare(categories[b]));
    } else {
      // Sort by first series values
      const firstSeriesData = series[0]?.data || [];
      indices.sort((a, b) => {
        const valueA = firstSeriesData[a] || 0;
        const valueB = firstSeriesData[b] || 0;
        return sortBy.value === "asc" ? valueA - valueB : valueB - valueA;
      });
    }

    // Reorder categories and series data based on sorted indices
    categories = indices.map((i) => categories[i]);
    series = series.map((s) => ({
      ...s,
      data: indices.map((i) => s.data[i]),
    }));
  }

  return { categories, series };
});

const chartOption = computed<ECOption>(() => {
  const { categories, series } = processedData.value;

  if (!categories.length || !series.length) {
    return {};
  }

  const isHorizontal = orientation.value === "horizontal";

  return {
    title: {
      show: false,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: createEnhancedTooltipFormatter(props.chartType, {
        showClickHint: props.enableInteractivity,
      }),
    },
    legend: {
      data: series.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      left: isHorizontal ? "15%" : "3%",
      right: "4%",
      bottom: series.length > 1 ? "15%" : "3%",
      top: "5%",
      containLabel: !isHorizontal,
    },
    xAxis: {
      type: isHorizontal ? "value" : "category",
      data: isHorizontal ? undefined : categories,
      axisLabel: {
        interval: 0,
        rotate: isHorizontal ? 0 : categories.length > 6 ? 45 : 0,
      },
    },
    yAxis: {
      type: isHorizontal ? "category" : "value",
      data: isHorizontal ? categories : undefined,
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: "bar",
      data: s.data,
      stack: props.stack ? "total" : undefined,
      itemStyle: {
        color: props.colors[index % props.colors.length],
      },
      label: {
        show: props.showDataLabels,
        position: isHorizontal ? "right" : "top",
        fontSize: 11,
      },
      emphasis: {
        focus: "series",
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: "rgba(0, 0, 0, 0.3)",
        },
      },
    })),
  };
});

const handleChartClick = async (params: any): Promise<void> => {
  // Convert ECElementEvent to ChartClickParams format
  const chartParams: ChartClickParams = {
    componentType: params.componentType,
    seriesType: params.seriesType || "bar",
    seriesIndex: params.seriesIndex || 0,
    seriesName: params.seriesName || "",
    name: params.name || "",
    dataIndex: params.dataIndex || 0,
    data: params.data,
    dataType: params.dataType,
    value: params.value as number | number[],
    color: params.color || "",
  };

  // Emit the basic click event
  emit("click", chartParams);

  // Handle interactive drilling if enabled
  if (props.enableInteractivity) {
    try {
      await handleInteractiveChartClick(props.chartType, chartParams, {
        orientation: orientation.value,
        sortBy: sortBy.value,
        drillContext: props.drillContext,
        chartData: props.data,
      });
    } catch (error) {
      console.error("Chart interaction failed:", error);
    }
  }
};

const handleOrientationChange = (value: any): void => {
  if (typeof value === "string") {
    orientation.value = value;
    emit("orientationChange", value);
  } else if (value && typeof value.value === "string") {
    orientation.value = value.value;
    emit("orientationChange", value.value);
  }
};

const handleSortChange = (value: any): void => {
  if (typeof value === "string") {
    sortBy.value = value;
    emit("sortChange", value);
  } else if (value && typeof value.value === "string") {
    sortBy.value = value.value;
    emit("sortChange", value.value);
  }
};

const exportChart = async (format: string = "png"): Promise<any> => {
  if (
    chartRef.value &&
    typeof chartRef.value.getEchartsInstance === "function"
  ) {
    try {
      const chartInstance = chartRef.value.getEchartsInstance();
      if (!chartInstance) {
        throw new Error("Chart instance not available");
      }

      const filename = `${props.title
        .replace(/\s+/g, "_")
        .toLowerCase()}_chart`;

      const result = await exportInteractiveChart(
        chartInstance,
        format,
        filename,
        props.data
      );

      emit("export", {
        format,
        filename,
        data: result,
        chartType: props.chartType,
      });

      return result;
    } catch (error) {
      console.error("Export failed:", error);
      emit("export", { error, chartType: props.chartType });
    }
  } else {
    console.warn("Chart not ready for export");
    emit("export", { error: "Chart not ready", chartType: props.chartType });
  }
};

// Watch for data changes and update chart
watch(
  () => props.data,
  async (newData) => {
    if (
      chartRef.value &&
      newData &&
      typeof chartRef.value.getEchartsInstance === "function"
    ) {
      await nextTick();
      try {
        const chartInstance = chartRef.value.getEchartsInstance();
        if (chartInstance) {
          chartInstance.setOption(chartOption.value, true);
        }
      } catch (error) {
        console.error("Failed to update chart:", error);
      }
    }
  },
  { deep: true }
);

// Watch for orientation changes
watch(orientation, async () => {
  if (
    chartRef.value &&
    typeof chartRef.value.getEchartsInstance === "function"
  ) {
    await nextTick();
    try {
      const chartInstance = chartRef.value.getEchartsInstance();
      if (chartInstance) {
        chartInstance.setOption(chartOption.value, true);
      }
    } catch (error) {
      console.error("Failed to update chart orientation:", error);
    }
  }
});

// Watch for sort changes
watch(sortBy, async () => {
  if (
    chartRef.value &&
    typeof chartRef.value.getEchartsInstance === "function"
  ) {
    await nextTick();
    try {
      const chartInstance = chartRef.value.getEchartsInstance();
      if (chartInstance) {
        chartInstance.setOption(chartOption.value, true);
      }
    } catch (error) {
      console.error("Failed to update chart sort:", error);
    }
  }
});

onMounted(async () => {
  // Wait for component to be fully mounted
  await nextTick();

  // Initialize chart with retry logic
  const initializeChart = async (retries = 3) => {
    if (
      chartRef.value &&
      typeof chartRef.value.getEchartsInstance === "function"
    ) {
      try {
        const chartInstance = chartRef.value.getEchartsInstance();

        if (!chartInstance && retries > 0) {
          // Chart not ready yet, retry after a short delay
          setTimeout(() => initializeChart(retries - 1), 100);
          return;
        }

        if (!chartInstance) {
          console.error("Failed to get ECharts instance after retries");
          return;
        }

        // Initialize interactivity features
        if (props.enableInteractivity) {
          initializeChartInteractivity(chartInstance, props.chartType, {
            enableAnimations: true,
            drillContext: props.drillContext,
          });
        }

        // Handle window resize
        const handleResize = () => {
          try {
            chartInstance.resize();
          } catch (error) {
            console.error("Chart resize failed:", error);
          }
        };

        window.addEventListener("resize", handleResize);

        // Setup real-time updates if needed
        if (props.enableInteractivity) {
          realTimeCleanup.value = enableRealTimeUpdates(chartInstance, 30000);
        }

        onUnmounted(() => {
          window.removeEventListener("resize", handleResize);
          if (realTimeCleanup.value) {
            realTimeCleanup.value();
          }
        });
      } catch (error) {
        console.error("Chart initialization failed:", error);
        if (retries > 0) {
          setTimeout(() => initializeChart(retries - 1), 100);
        }
      }
    } else if (retries > 0) {
      setTimeout(() => initializeChart(retries - 1), 100);
    }
  };

  await initializeChart();
});
</script>
