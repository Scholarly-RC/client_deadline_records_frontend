/**
 * Composable for safe ECharts instance access
 * Handles timing issues and provides error handling for VChart refs
 */

import { ref, nextTick, type Ref } from 'vue';
import type { ECharts } from 'echarts';

interface WithEChartsInstanceOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface InitializeChartOptions {
  maxRetries?: number;
  retryDelay?: number;
}

interface ExportOptions {
  type?: 'png' | 'jpeg' | 'svg';
  pixelRatio?: number;
  backgroundColor?: string;
  [key: string]: any;
}

export const useEChartsInstance = () => {
  const isReady = ref(false);
  
  /**
   * Safely get ECharts instance with retry logic
   * @param chartRef - Vue ref to VChart component
   * @param maxRetries - Maximum number of retry attempts
   * @param retryDelay - Delay between retries in milliseconds
   * @returns Promise<ECharts|null>
   */
  const getEChartsInstance = async (chartRef: Ref<any>, maxRetries: number = 3, retryDelay: number = 100): Promise<ECharts | null> => {
    if (!chartRef?.value) {
      console.warn('Chart ref is not available')
      return null
    }
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check if getEchartsInstance method exists
        if (typeof chartRef.value.getEchartsInstance !== 'function') {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            continue
          }
          console.error('getEchartsInstance method not available on chart ref')
          return null
        }
        
        const instance = chartRef.value.getEchartsInstance()
        
        if (instance) {
          isReady.value = true
          return instance
        }
        
        // Instance not ready yet, wait and retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
        
      } catch (error) {
        console.error(`Attempt ${attempt + 1} to get ECharts instance failed:`, error)
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }
    
    console.error(`Failed to get ECharts instance after ${maxRetries + 1} attempts`);
    return null;
  };
  
  /**
   * Safely execute a function with ECharts instance
   * @param chartRef - Vue ref to VChart component
   * @param callback - Function to execute with the instance
   * @param options - Options for retry logic
   * @returns Promise<any>
   */
  const withEChartsInstance = async <T>(chartRef: Ref<any>, callback: (instance: ECharts) => T, options: WithEChartsInstanceOptions = {}): Promise<T> => {
    const { maxRetries = 3, retryDelay = 100, onError } = options
    
    try {
      const instance = await getEChartsInstance(chartRef, maxRetries, retryDelay)
      
      if (!instance) {
        const error = new Error('ECharts instance not available')
        if (onError) onError(error)
        throw error
      }
      
      return await callback(instance);
      
    } catch (error) {
      console.error('Error executing with ECharts instance:', error);
      if (onError) onError(error as Error);
      throw error;
    }
  };
  
  /**
   * Safely update chart option
   * @param chartRef - Vue ref to VChart component
   * @param option - ECharts option object
   * @param updateOptions - ECharts setOption parameters
   * @returns Promise<boolean>
   */
  const safeSetOption = async (chartRef: Ref<any>, option: any, updateOptions: any = {}): Promise<boolean> => {
    try {
      await nextTick()
      
      return await withEChartsInstance(chartRef, (instance) => {
        instance.setOption(option, updateOptions)
        return true;
      });
    } catch (error) {
      console.error('Failed to set chart option:', error);
      return false;
    }
  };
  
  /**
   * Safely resize chart
   * @param chartRef - Vue ref to VChart component
   * @returns Promise<boolean>
   */
  const safeResize = async (chartRef: Ref<any>): Promise<boolean> => {
    try {
      return await withEChartsInstance(chartRef, (instance) => {
        instance.resize();
        return true;
      });
    } catch (error) {
      console.error('Failed to resize chart:', error);
      return false;
    }
  };
  
  /**
   * Safely dispatch action to chart
   * @param chartRef - Vue ref to VChart component
   * @param payload - Action payload
   * @returns Promise<boolean>
   */
  const safeDispatchAction = async (chartRef: Ref<any>, payload: any): Promise<boolean> => {
    try {
      return await withEChartsInstance(chartRef, (instance) => {
        instance.dispatchAction(payload)
        return true
      })
    } catch (error) {
      console.error('Failed to dispatch action:', error)
      return false
    }
  }
  
  /**
   * Safely get data URL from chart
   * @param {Ref} chartRef - Vue ref to VChart component
   * @param {Object} options - Export options
   * @returns {Promise<string|null>}
   */
  const safeGetDataURL = async (chartRef: Ref<any>, options: ExportOptions = {}): Promise<string | null> => {
    try {
      return await withEChartsInstance(chartRef, (instance) => {
        return instance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff',
          ...options
        })
      })
    } catch (error) {
      console.error('Failed to get data URL:', error)
      return null
    }
  }
  
  /**
   * Initialize chart with proper timing
   * @param {Ref} chartRef - Vue ref to VChart component
   * @param {Function} initCallback - Initialization callback
   * @param {Object} options - Options for initialization
   * @returns {Promise<boolean>}
   */
  const initializeChart = async (chartRef: Ref<any>, initCallback: (instance: ECharts) => void, options: InitializeChartOptions = {}): Promise<boolean> => {
    const { maxRetries = 3, retryDelay = 100 } = options
    
    await nextTick()
    
    try {
      const instance = await getEChartsInstance(chartRef, maxRetries, retryDelay)
      
      if (!instance) {
        console.error('Failed to initialize chart: instance not available')
        return false
      }
      
      if (initCallback) {
        await initCallback(instance)
      }
      
      return true
      
    } catch (error) {
      console.error('Chart initialization failed:', error)
      return false
    }
  }
  
  return {
    isReady,
    getEChartsInstance,
    withEChartsInstance,
    safeSetOption,
    safeResize,
    safeDispatchAction,
    safeGetDataURL,
    initializeChart
  }
}