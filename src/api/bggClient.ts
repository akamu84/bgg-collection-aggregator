import axios from "axios";
import type { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { XMLParser } from "fast-xml-parser";
import type {
  CollectionResponse,
  ThingResponse,
  BGGCollectionItem,
  BGGThing,
} from "../types/bgg.types";

const BGG_API_BASE_URL = import.meta.env.DEV
  ? "/bgg"
  : "https://boardgamegeek.com/xmlapi2";

// Simple queue-based rate limiter to ensure at least 1s between requests
class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minTimeBetweenRequests = 1000; // 1 second between requests

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const diff = now - this.lastRequestTime;
          if (diff < this.minTimeBetweenRequests) {
            await this.delay(this.minTimeBetweenRequests - diff);
          }
          this.lastRequestTime = Date.now();
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processQueue().catch(() => {});
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        await job();
      }
    }
    this.processing = false;
  }

  private delay(ms: number) {
    return new Promise<void>((res) => setTimeout(res, ms));
  }
}

class BGGApiClient {
  private client: AxiosInstance;
  private parser: XMLParser;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: BGG_API_BASE_URL,
      timeout: 30000,
      headers: { Accept: "application/xml" },
    });

    axiosRetry(this.client, {
      retries: 5,
      retryDelay: (retryCount, error) => {
        const status = error.response?.status ?? 0;

        // Respect Retry-After header if provided
        const header = (error?.response?.headers?.["retry-after"] ??
          error?.response?.headers?.["Retry-After"]) as string | undefined;
        const retryAfterSeconds = header ? Number(header) : NaN;
        if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
          return retryAfterSeconds * 1000;
        }

        // For 202 responses (queued requests), use a shorter, more consistent delay
        if (status === 202) {
          return Math.min(2000 * retryCount, 10000); // 2s, 4s, 6s, 8s, 10s
        }

        // For other errors, use exponential backoff: 1s, 2s, 4s, 8s, 16s
        return Math.min(1000 * Math.pow(2, retryCount - 1), 16000);
      },
      retryCondition: (error) => {
        const status = error.response?.status ?? 0;
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          status === 429 ||
          status === 202 ||
          status >= 500
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        const status = error.response?.status ?? 0;
        const url = requestConfig?.url ?? "";

        if (status === 202) {
          console.log(
            `Retry attempt ${retryCount} for ${url}. Request was queued (202), waiting for processing...`
          );
        } else {
          console.log(
            `Retry attempt ${retryCount} for ${url}. Reason: ${status || error.message}`
          );
        }
      },
    });

    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "value",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
      processEntities: true,
    });

    this.rateLimiter = new RateLimiter();
  }

  private async fetchWithRateLimit<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.rateLimiter.throttle(async () => {
      const response = await this.client.get(url, {
        params,
        validateStatus: (s) => s === 200 || s === 202,
      });

      if (response.status === 202) {
        // Request was queued by BGG, need to retry
        console.log(
          `BGG request queued (202) for ${url}. Request will be retried automatically.`
        );
        const err = new Error("Request queued (202), will retry") as Error & {
          response?: { status: number };
        };
        err.response = { status: 202 };
        throw err;
      }

      const parsed = this.parser.parse(response.data);
      return parsed as T;
    });
  }

  async getUserCollection(username: string): Promise<BGGCollectionItem[]> {
    try {
      const response = await this.fetchWithRateLimit<CollectionResponse>(
        "/collection",
        {
          username,
          stats: 1,
          subtype: "boardgame",
          own: 1,
        }
      );

      if (!response.items || !response.items.item) return [];

      const items = Array.isArray(response.items.item)
        ? response.items.item
        : [response.items.item];
      return items;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 404) {
        console.warn(`User "${username}" not found or has no collection`);
        return [];
      }
      console.error(`Error fetching collection for ${username}:`, error);
      throw error;
    }
  }

  async getThingDetails(ids: string[]): Promise<BGGThing[]> {
    if (ids.length === 0) return [];
    try {
      const chunks = this.chunkArray(ids, 20);
      const results: BGGThing[] = [];
      for (const chunk of chunks) {
        const response = await this.fetchWithRateLimit<ThingResponse>(
          "/thing",
          {
            id: chunk.join(","),
            stats: 1,
            type: "boardgame",
          }
        );
        if (response.items && response.items.item) {
          const items = Array.isArray(response.items.item)
            ? response.items.item
            : [response.items.item];
          results.push(...items);
        }
      }
      return results;
    } catch (error) {
      console.error("Error fetching thing details:", error);
      throw error;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export const bggApiClient = new BGGApiClient();
