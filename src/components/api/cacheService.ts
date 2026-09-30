// services/cacheService.ts
import endPoints from "./endPoints";

// ================= CACHE CONFIGURATION =================
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  isPattern?: boolean; // Whether this endpoint supports query parameters
}

export const CACHE_CONFIG: Record<string, CacheConfig> = {
  [endPoints.lookupsDropdown]: { ttl: 7 * 24 * 60 * 60 * 1000 },

  // 🌍 Geographic / Location data (rarely changes)
  "/region": { ttl: 30 * 24 * 60 * 60 * 1000, isPattern: true },
  "/zone": { ttl: 30 * 24 * 60 * 60 * 1000, isPattern: true },
  "/woreda": { ttl: 30 * 24 * 60 * 60 * 1000, isPattern: true },
  "/zone/region": { ttl: 30 * 24 * 60 * 60 * 1000, isPattern: true },
  "/woreda/zone": { ttl: 30 * 24 * 60 * 60 * 1000, isPattern: true },

  // MOE datasets (infrequently updated)
  [endPoints.impairments]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.schoolBackgrounds]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.enrollmentTypes]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.attritionCauses]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.semesters]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.programLevels]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.programModalities]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.academicYears]: { ttl: 30 * 24 * 60 * 60 * 1000 },

  // 🎓 Academic dropdowns (updated at start of each semester, but generally stable)
  [endPoints.departments]: { ttl: 30 * 24 * 60 * 60 * 1000, isPattern: true },
  [endPoints.classYears]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.courseSources]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.courseCategory]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.batchClassSemsterYear]: {
    ttl: 30 * 24 * 60 * 60 * 1000,
    isPattern: true,
  },
  [endPoints.batches]: { ttl: 30 * 24 * 60 * 60 * 1000, isPattern: true },
  [endPoints.studentStatus]: { ttl: 30 * 24 * 60 * 60 * 1000 },
  [endPoints.gradingSystem]: { ttl: 30 * 24 * 60 * 60 * 1000 },

  // DropDown options (change infrequently)
  [endPoints.allCourses]: { ttl: 7 * 24 * 60 * 60 * 1000, isPattern: true },
  [endPoints.courseLists]: { ttl: 7 * 24 * 60 * 60 * 1000, isPattern: true },
  [endPoints.studentUserNames]: {
    ttl: 7 * 24 * 60 * 60 * 1000,
    isPattern: true,
  },
  [endPoints.studentsSlip]: { ttl: 7 * 24 * 60 * 60 * 1000 },

  // Student Information (can be cached but with shorter TTL due to potential updates)
  [endPoints.getAllStudentsCGPA_VD]: {
    ttl: 7 * 24 * 60 * 60 * 1000,
    isPattern: true,
  },
  [endPoints.getAllStudentsCGPA_DN]: {
    ttl: 7 * 24 * 60 * 60 * 1000,
    isPattern: true,
  },
  [endPoints.getAllStudentsCGPA]: {
    ttl: 7 * 24 * 60 * 60 * 1000,
    isPattern: true,
  },
  [endPoints.departmentStudents]: {
    ttl: 7 * 24 * 60 * 60 * 1000,
    isPattern: true,
  },

  // DashBoards (cache for 1 day to balance freshness with performance)
  [endPoints.departmentHeadDashboard]: { ttl: 1 * 24 * 60 * 60 * 1000 },
  [endPoints.studentDashboard]: { ttl: 1 * 24 * 60 * 60 * 1000 },
  [endPoints.teacherDashboard]: { ttl: 1 * 24 * 60 * 60 * 1000 },
  [endPoints.deanDashboard]: { ttl: 1 * 24 * 60 * 60 * 1000 },
  [endPoints.getGeneralManagerDashboard]: { ttl: 1 * 24 * 60 * 60 * 1000 },
  [endPoints.viceDeanDashboard]: { ttl: 1 * 24 * 60 * 60 * 1000 },

  // Path parameter endpoints (with IDs)
  "/courses": { ttl: 7 * 24 * 60 * 60 * 1000, isPattern: true },
  "/students": { ttl: 7 * 24 * 60 * 60 * 1000, isPattern: true },

  // Applications
  [endPoints.applicantsList]: { ttl: 12 * 60 * 60 * 1000 }, // 1 day
};

const CACHE_STORE_NAME = "api-response-cache";
// =======================================================

const LOOKUPS_DROPDOWN_DEPENDENCIES = new Set<string>([
  endPoints.impairments,
  endPoints.schoolBackgrounds,
  endPoints.enrollmentTypes,
  endPoints.attritionCauses,
  endPoints.semesters,
  endPoints.programLevels,
  endPoints.programModalities,
  endPoints.academicYears,
  endPoints.departments,
  endPoints.classYears,
  endPoints.courseSources,
  endPoints.courseCategory,
  endPoints.batchClassSemsterYear,
  endPoints.batches,
  endPoints.studentStatus,
  endPoints.gradingSystem,
]);

const getBasePath = (url: string | undefined): string => {
  if (!url) return "";
  return url.split("?")[0];
};

// MODIFIED: Now uses FULL URL including query parameters
const generateCacheKey = (url: string | undefined): string => {
  if (!url) return "";
  // Use the full URL (with query params) for cache key
  const encoded = encodeURIComponent(url);
  return `https://app-cache.local/${encoded}`;
};

// Helper function to find matching cache config
const findCacheConfig = (url: string): CacheConfig | null => {
  const basePath = getBasePath(url);

  // First try exact match
  if (CACHE_CONFIG[basePath]) {
    return CACHE_CONFIG[basePath];
  }

  // Then try pattern matching for endpoints that support query params
  for (const [pattern, config] of Object.entries(CACHE_CONFIG)) {
    if (config.isPattern && basePath.startsWith(pattern)) {
      return config;
    }
  }

  return null;
};

export const getCachedResponse = async <T = any>(
  url: string,
  fetchFn: () => Promise<T>,
): Promise<T> => {
  const config = findCacheConfig(url);

  // If not configured for caching or Cache API unavailable, fetch normally
  if (!config || typeof caches === "undefined") {
    return fetchFn();
  }

  // Use FULL URL as cache key (includes query parameters)
  const dataKey = generateCacheKey(url);
  const metaKey = `${dataKey}/meta`;

  try {
    const cache = await caches.open(CACHE_STORE_NAME);

    // 1️⃣ Check expiry
    const metaRes = await cache.match(metaKey);
    let isExpired = true;

    if (metaRes) {
      const meta = await metaRes.json();
      isExpired = Date.now() - meta.timestamp > config.ttl;
    }

    // 2️⃣ Return cached data if valid
    if (!isExpired) {
      const dataRes = await cache.match(dataKey);
      if (dataRes) {
        console.log(`✅ [CACHE HIT] ${url}`);
        return dataRes.json() as Promise<T>;
      }
    }

    // 3️⃣ Fetch fresh data
    console.log(`🔄 [CACHE MISS/EXPIRED] Fetching ${url}...`);
    const data = await fetchFn();

    // 4️⃣ Save to cache
    await cache.put(
      metaKey,
      new Response(JSON.stringify({ timestamp: Date.now() }), {
        headers: { "Content-Type": "application/json" },
      }),
    );

    await cache.put(
      dataKey,
      new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      }),
    );

    console.log(`💾 [CACHED] ${url}`);
    return data;
  } catch (error) {
    console.warn(`⚠️ Cache failed for ${url}, falling back to network:`, error);
    return fetchFn(); // Safe fallback
  }
};

// MODIFIED: Clear cache for specific URL (including query params)
export const clearCacheForUrl = async (url: string): Promise<void> => {
  if (typeof caches === "undefined") return;

  const basePath = getBasePath(url);
  const dataKey = generateCacheKey(url);
  const metaKey = `${dataKey}/meta`;

  try {
    const cache = await caches.open(CACHE_STORE_NAME);
    await cache.delete(dataKey);
    await cache.delete(metaKey);

    // Keep lookupsDropdown in sync when one of its dependency endpoints is invalidated
    if (LOOKUPS_DROPDOWN_DEPENDENCIES.has(basePath)) {
      const lookupsDataKey = generateCacheKey(endPoints.lookupsDropdown);
      const lookupsMetaKey = `${lookupsDataKey}/meta`;
      await cache.delete(lookupsDataKey);
      await cache.delete(lookupsMetaKey);
      console.log(
        `🗑️ lookupsDropdown cache also cleared due to dependency invalidation: ${url}`,
      );
    }

    console.log(`🗑️ Cache cleared for ${url}`);
  } catch (error) {
    console.warn(`Failed to clear cache for ${url}:`, error);
  }
};

export const clearCacheByPattern = async (
  basePattern: string,
): Promise<void> => {
  if (typeof caches === "undefined") return;

  try {
    const cache = await caches.open(CACHE_STORE_NAME);
    const keys = await cache.keys();
    let deletedCount = 0;
    const deletedUrls: string[] = [];

    for (const request of keys) {
      const cacheUrl = request.url;
      // Decode to get the original URL
      const decodedUrl = decodeURIComponent(
        cacheUrl.replace("https://app-cache.local/", ""),
      );

      // Check if the decoded URL starts with the base pattern
      // This will match:
      // - Exact match: /courses
      // - With query params: /courses?anything
      // - With path params: /courses/123, /courses/123/students
      if (
        decodedUrl === basePattern ||
        decodedUrl.startsWith(`${basePattern}/`) ||
        decodedUrl.startsWith(`${basePattern}?`)
      ) {
        await cache.delete(request);

        // Also delete the corresponding meta key
        const metaKey = request.url.replace(/\/[^\/]+$/, "/meta");
        await cache.delete(metaKey);

        deletedCount++;
        deletedUrls.push(decodedUrl);
      }
    }

    // Also handle dependencies for lookupsDropdown
    if (LOOKUPS_DROPDOWN_DEPENDENCIES.has(basePattern)) {
      const lookupsKey = generateCacheKey(endPoints.lookupsDropdown);
      const lookupsMetaKey = `${lookupsKey}/meta`;
      await cache.delete(lookupsKey);
      await cache.delete(lookupsMetaKey);
      console.log(
        `🗑️ lookupsDropdown cache also cleared due to dependency invalidation for pattern: ${basePattern}`,
      );
    }

    console.log(
      `🗑️ [PATTERN CLEAR] Cleared ${deletedCount} cache entries for pattern "${basePattern}":`,
      deletedUrls.length > 0 ? deletedUrls : ["No matches found"],
    );
  } catch (error) {
    console.warn(`Failed to clear cache by pattern ${basePattern}:`, error);
  }
};

/**
 * Enhanced version of clearCacheByBasePath that handles both query and path parameters
 * This is an alias for clearCacheByPattern for backward compatibility
 */
export const clearCacheByBasePath = async (basePath: string): Promise<void> => {
  return clearCacheByPattern(basePath);
};

export const clearAllApiCache = async (): Promise<void> => {
  if (typeof caches !== "undefined") {
    await caches.delete(CACHE_STORE_NAME);
    console.log("🗑️ All API response caches cleared");
  }
};
