"use client";

import { useEffect, useState } from "react";
import { reverseGeocode, toCitySlug } from "./reverse-geocode";
import type { City } from "../types/space";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  city: City | null;
  loading: boolean;
  error: string | null;
}

/**
 * Browser geolocation hook.
 *
 * On mount, requests the user's position. If granted, reverse-geocodes
 * coordinates to a city via Nominatim, then matches it against our cities API
 * (or constructs a City object from the geocode result).
 *
 * Returns { lat, lng, city, loading, error }.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    city: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Geolocation is not supported by this browser.",
      }));
      return;
    }

    // Wall-clock cap: some browsers / OS-level permission states cause
    // getCurrentPosition to never invoke either callback (the built-in
    // `timeout` option only covers the post-permission acquisition phase).
    // Without this, `loading` would stay true forever and the UI would
    // show skeleton loaders indefinitely.
    const geoTimeout = setTimeout(() => {
      setState((s) =>
        s.loading
          ? { ...s, loading: false, error: "Location timed out. Search for a city instead." }
          : s
      );
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Coordinates received — cancel the wall-clock timeout so it doesn't
        // fire while we're still waiting on the reverse-geocode network call.
        clearTimeout(geoTimeout);

        const { latitude: lat, longitude: lng } = position.coords;

        setState((s) => ({ ...s, lat, lng }));

        // Reverse geocode to find the city
        try {
          const result = await reverseGeocode(lat, lng);
          if (!result) {
            setState((s) => ({
              ...s,
              loading: false,
              error: "Could not determine city from your location.",
            }));
            return;
          }

          const slug = toCitySlug(result.cityName, result.region);

          // Check if this city exists in our database
          const res = await fetch(`/api/cities?q=${encodeURIComponent(result.cityName)}`);
          if (!res.ok) throw new Error(`Cities API error: ${res.status}`);
          const data = await res.json();
          const match = data.cities?.find(
            (c: City) => c.slug === slug
          );

          if (match) {
            setState((s) => ({ ...s, city: match, loading: false }));
          } else {
            // City not in our database — still set coordinates, but no city match
            setState((s) => ({
              ...s,
              loading: false,
              error: `${result.cityName} is not yet available. Try searching for a city.`,
            }));
          }
        } catch (err) {
          console.error("[useGeolocation] reverse-geocode failed:", err);
          setState((s) => ({
            ...s,
            loading: false,
            error: "Failed to reverse geocode your location.",
          }));
        }
      },
      (err) => {
        let message: string;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location permission denied. Search for a city instead.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location unavailable. Search for a city instead.";
            break;
          case err.TIMEOUT:
            message = "Location request timed out. Search for a city instead.";
            break;
          default:
            message = "Could not get your location. Search for a city instead.";
        }
        setState((s) => ({ ...s, loading: false, error: message }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );

    return () => clearTimeout(geoTimeout);
  }, []);

  return state;
}
