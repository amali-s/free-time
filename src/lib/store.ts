import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Amenity, City } from "./types/space";

interface AppState {
  /** Currently selected city */
  activeCity: City | null;
  setActiveCity: (city: City) => void;

  /** Active amenity filters */
  activeFilters: Amenity[];
  toggleFilter: (filter: Amenity) => void;
  clearFilters: () => void;

  /** Currently selected space ID (for detail view) */
  selectedSpaceId: string | null;
  selectSpace: (id: string | null) => void;

  /** User's geolocation coordinates */
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number }) => void;

  /** View mode — "list" for Phase 1, "canvas" enabled in Phase 6 */
  viewMode: "list" | "canvas";
  setViewMode: (mode: "list" | "canvas") => void;

  /** Spaces saved by swiping right — persisted to localStorage */
  savedSpaces: string[];
  saveSpace: (id: string) => void;
  unsaveSpace: (id: string) => void;
}

/**
 * Persistence policy:
 *   - savedSpaces: kept across reloads (heart state survives a browser refresh)
 *   - everything else: ephemeral. Filters, selected space, geolocation, and
 *     view mode are intentionally NOT persisted — re-opening the app should
 *     start from a clean slate at the user's current location.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeCity: null,
      setActiveCity: (city) => set({ activeCity: city, selectedSpaceId: null }),

      activeFilters: [],
      toggleFilter: (filter) =>
        set((state) => ({
          activeFilters: state.activeFilters.includes(filter)
            ? state.activeFilters.filter((f) => f !== filter)
            : [...state.activeFilters, filter],
        })),
      clearFilters: () => set({ activeFilters: [] }),

      selectedSpaceId: null,
      selectSpace: (id) => set({ selectedSpaceId: id }),

      userLocation: null,
      setUserLocation: (loc) => set({ userLocation: loc }),

      viewMode: "list",
      setViewMode: (mode) => set({ viewMode: mode }),

      savedSpaces: [],
      saveSpace: (id) =>
        set((state) => ({
          savedSpaces: state.savedSpaces.includes(id)
            ? state.savedSpaces
            : [...state.savedSpaces, id],
        })),
      unsaveSpace: (id) =>
        set((state) => ({
          savedSpaces: state.savedSpaces.filter((s) => s !== id),
        })),
    }),
    {
      name: "freetime-app",
      storage: createJSONStorage(() => localStorage),
      // Whitelist the slice we actually want to outlive a session.
      partialize: (state) => ({ savedSpaces: state.savedSpaces }),
      version: 1,
    }
  )
);
