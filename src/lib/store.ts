import { create } from "zustand";
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
}

export const useAppStore = create<AppState>((set) => ({
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
}));
