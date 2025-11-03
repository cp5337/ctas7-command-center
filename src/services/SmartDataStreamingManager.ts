/**
 * Smart Data Streaming Manager
 * Handles real-time data updates with throttling and caching
 */

interface StreamingDataPoint {
  id: string;
  timestamp: number;
  data: any;
  priority: "critical" | "high" | "medium" | "low";
}

interface DataSubscription {
  id: string;
  callback: (data: any) => void;
  filter?: (data: any) => boolean;
  throttleMs: number;
  lastUpdate: number;
}

export class SmartDataStreamingManager {
  private subscriptions: Map<string, DataSubscription[]> = new Map();
  private dataCache: Map<string, StreamingDataPoint> = new Map();
  private updateQueue: StreamingDataPoint[] = [];
  private isProcessing: boolean = false;

  // Performance settings
  private maxCacheSize: number = 10000;
  private batchSize: number = 50;
  private processingInterval: number = 16; // ~60 FPS processing

  constructor() {
    this.startProcessingLoop();
    this.startCacheCleanup();
  }

  /**
   * Subscribe to data stream with throttling
   */
  subscribe(
    dataType: string,
    callback: (data: any) => void,
    options: {
      throttleMs?: number;
      filter?: (data: any) => boolean;
      priority?: "critical" | "high" | "medium" | "low";
    } = {}
  ): string {
    const subscriptionId = `${dataType}_${Date.now()}_${Math.random()}`;

    const subscription: DataSubscription = {
      id: subscriptionId,
      callback,
      filter: options.filter,
      throttleMs: options.throttleMs || 100, // Default 100ms throttling
      lastUpdate: 0,
    };

    if (!this.subscriptions.has(dataType)) {
      this.subscriptions.set(dataType, []);
    }

    this.subscriptions.get(dataType)!.push(subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from data stream
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.forEach((subs, dataType) => {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscriptions.delete(dataType);
        }
      }
    });
  }

  /**
   * Push new data to stream
   */
  pushData(
    dataType: string,
    id: string,
    data: any,
    priority: StreamingDataPoint["priority"] = "medium"
  ): void {
    const dataPoint: StreamingDataPoint = {
      id,
      timestamp: Date.now(),
      data,
      priority,
    };

    // Add to cache
    this.dataCache.set(`${dataType}_${id}`, dataPoint);

    // Add to update queue
    this.updateQueue.push(dataPoint);

    // Sort queue by priority
    this.updateQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Trigger immediate processing for critical data
    if (priority === "critical" && !this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Get cached data
   */
  getCachedData(dataType: string, id: string): StreamingDataPoint | undefined {
    return this.dataCache.get(`${dataType}_${id}`);
  }

  /**
   * Process update queue in batches
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.updateQueue.splice(0, this.batchSize);

    // Group by data type for efficient processing
    const groupedData = new Map<string, StreamingDataPoint[]>();
    batch.forEach((dataPoint) => {
      const dataType = this.getDataTypeFromPoint(dataPoint);
      if (!groupedData.has(dataType)) {
        groupedData.set(dataType, []);
      }
      groupedData.get(dataType)!.push(dataPoint);
    });

    // Process each data type
    for (const [dataType, dataPoints] of groupedData) {
      const subscriptions = this.subscriptions.get(dataType);
      if (!subscriptions) continue;

      dataPoints.forEach((dataPoint) => {
        subscriptions.forEach((subscription) => {
          const now = Date.now();

          // Check throttling
          if (now - subscription.lastUpdate < subscription.throttleMs) {
            return;
          }

          // Apply filter if provided
          if (subscription.filter && !subscription.filter(dataPoint.data)) {
            return;
          }

          // Execute callback
          try {
            subscription.callback(dataPoint.data);
            subscription.lastUpdate = now;
          } catch (error) {
            console.error("Error in data stream callback:", error);
          }
        });
      });
    }

    this.isProcessing = false;

    // Continue processing if more data is queued
    if (this.updateQueue.length > 0) {
      setTimeout(() => this.processQueue(), this.processingInterval);
    }
  }

  /**
   * Extract data type from data point ID
   */
  private getDataTypeFromPoint(dataPoint: StreamingDataPoint): string {
    // Assume format: "datatype_actualid"
    return dataPoint.id.split("_")[0] || "unknown";
  }

  /**
   * Start automatic processing loop
   */
  private startProcessingLoop(): void {
    setInterval(() => {
      if (!this.isProcessing && this.updateQueue.length > 0) {
        this.processQueue();
      }
    }, this.processingInterval);
  }

  /**
   * Clean up old cache entries
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      if (this.dataCache.size > this.maxCacheSize) {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutes

        // Remove old entries
        const toDelete: string[] = [];
        this.dataCache.forEach((dataPoint, key) => {
          if (now - dataPoint.timestamp > maxAge) {
            toDelete.push(key);
          }
        });

        toDelete.forEach((key) => this.dataCache.delete(key));
        console.log(`Cleaned up ${toDelete.length} old cache entries`);
      }
    }, 60000); // Check every minute
  }

  /**
   * Get streaming performance metrics
   */
  getMetrics() {
    const subscriptionCounts = new Map<string, number>();
    this.subscriptions.forEach((subs, dataType) => {
      subscriptionCounts.set(dataType, subs.length);
    });

    return {
      cacheSize: this.dataCache.size,
      queueLength: this.updateQueue.length,
      isProcessing: this.isProcessing,
      subscriptionTypes: Array.from(subscriptionCounts.entries()),
      totalSubscriptions: Array.from(subscriptionCounts.values()).reduce(
        (a, b) => a + b,
        0
      ),
      processingRate: `${this.batchSize} items per ${this.processingInterval}ms`,
    };
  }

  /**
   * Batch update multiple entities efficiently
   */
  batchUpdateEntities(
    updates: Array<{
      dataType: string;
      id: string;
      data: any;
      priority?: StreamingDataPoint["priority"];
    }>
  ): void {
    // Group updates by data type and priority
    const prioritized = updates.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = a.priority || "medium";
      const bPriority = b.priority || "medium";
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });

    // Push all updates
    prioritized.forEach((update) => {
      this.pushData(update.dataType, update.id, update.data, update.priority);
    });
  }
}
