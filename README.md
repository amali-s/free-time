# FreeTime

A map-based web application that helps people find public and work-centric spaces to spend extended periods of time. Whether you're a traveler with hours to kill before check-in, a remote worker whose office is temporarily closed, or someone exploring a new city, FreeTime surfaces nearby spaces with the amenities you need.

## Problem

When people find themselves in an unfamiliar city with time to fill and work to do, there's no easy way to discover spaces that match their specific needs: wifi, outlets, seating, restrooms, or even luggage storage. Existing tools (Google Maps, Yelp) aren't designed around this question: *"Where can I comfortably spend the next few hours?"*

## Use Cases

### Ava -- Traveler with a laptop, no car, low battery
Ava is traveling to Denver. Her plane lands at 10am but hotel check-in isn't until 3pm. She has tasks to complete on her laptop, which is at 50% battery. She doesn't have a car and hasn't been to Denver in years. She needs to quickly find a nearby place with **wifi and an outlet** where she can sit and work for 3 hours.

### Brendon -- New in town, office closed, meetings in 15 minutes
Brendon just moved to Austin for an onsite role, but the office is closed for renovations and his apartment wifi won't be set up until tomorrow. He has two virtual meetings today -- one starting in 15 minutes. He needs a place that is **close by, has wifi, has seating, and is quiet enough** to take a call.

### Alex -- Traveler with luggage, exploring a new city
Alex just arrived in Bologna, Italy and doesn't check into his hotel for 4 hours. He wants to find a place where he can **store his luggage** and walk around freely until check-in.

## Features

1. **City detection and search** -- Opens to the user's current city via geolocation; supports searching and switching to any city
2. **Map and list views** -- Browse spaces on an interactive map or in a proximity-sorted list; see the total count of spaces in the selected city
3. **Amenity filters** -- Filter by wifi, bathroom, outlets, seating, and more
4. **Space detail cards** -- Tap a map pin or list item to see a detail card with tags (free, paid, cafe, wifi, bathroom, storage, etc.)
5. **Space count** -- Always visible total of how many spaces are available in the current city

## Space Types

- Public city spaces (parks, plazas, libraries)
- Cafes with seating and outlets
- Coworking spaces with day passes
- Lobbies and transit hubs
- Any space where a person can comfortably spend 1-5+ hours

## Status

Early stage -- foundational documents and design system established. See `CLAUDE.md` for technical direction and `design.md` for UX and visual design guidelines.
