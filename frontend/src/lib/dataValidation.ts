interface PlayerItem {
  id: string;
  name: string;
  country: string;
  gender: string;
}

interface TeamItem {
  id: string;
  name: string;
  type: string;
  category?: string;
}

export function validateCricketData(players: PlayerItem[], teams: TeamItem[]) {
  if (process.env.NODE_ENV !== "development") return;

  const playerIds = new Set<string>();
  const teamIds = new Set<string>();
  const playerUniqueKeys = new Set<string>();
  const teamUniqueKeys = new Set<string>();
  const countryWhitespaceCheck = new Set<string>();

  console.log("[Data Validation] Running database sanity checks...");

  // Check players
  players.forEach((player) => {
    // 1. Check duplicate player IDs
    if (playerIds.has(player.id)) {
      console.warn(`[Data Validation] DUPLICATE PLAYER ID: "${player.id}" for player "${player.name}"`);
    } else {
      playerIds.add(player.id);
    }

    // 2. Check duplicate player names within the same country + gender
    const playerKey = `${player.name.toLowerCase().trim()}|${player.country.toLowerCase().trim()}|${player.gender.toLowerCase().trim()}`;
    if (playerUniqueKeys.has(playerKey)) {
      console.warn(`[Data Validation] DUPLICATE PLAYER ENTRY: "${player.name}" in country "${player.country}" (${player.gender})`);
    } else {
      playerUniqueKeys.add(playerKey);
    }

    // 3. Check for malformed country names (with extra whitespaces or case mismatches)
    const rawCountry = player.country;
    const cleanCountry = rawCountry.trim();
    if (rawCountry !== cleanCountry) {
      console.warn(`[Data Validation] MALFORMED COUNTRY (trailing/leading spaces): "${rawCountry}" for player "${player.name}"`);
    }
    const lowerCountry = cleanCountry.toLowerCase();
    if (countryWhitespaceCheck.has(lowerCountry)) {
      // Find if we have case variations
      // We store the first variant we encountered
    } else {
      countryWhitespaceCheck.add(lowerCountry);
    }
  });

  // Check teams
  teams.forEach((team) => {
    // 1. Check duplicate team IDs
    if (teamIds.has(team.id)) {
      console.warn(`[Data Validation] DUPLICATE TEAM ID: "${team.id}" for team "${team.name}"`);
    } else {
      teamIds.add(team.id);
    }

    // 2. Check duplicate team names within type/category
    const cat = team.category ? team.category.toLowerCase().trim() : "";
    const teamKey = `${team.name.toLowerCase().trim()}|${team.type.toLowerCase().trim()}|${cat}`;
    if (teamUniqueKeys.has(teamKey)) {
      console.warn(`[Data Validation] DUPLICATE TEAM ENTRY: "${team.name}" (${team.type}, category: ${team.category || 'none'})`);
    } else {
      teamUniqueKeys.add(teamKey);
    }
  });

  // Verify all country values are normalized across players dataset
  const allCountries = Array.from(new Set(players.map(p => p.country)));
  const normalizedCountries = new Set<string>();
  allCountries.forEach((country) => {
    const norm = country.toLowerCase().trim();
    if (normalizedCountries.has(norm)) {
      console.warn(`[Data Validation] DUPLICATE COUNTRY VARIATION: Multiple spellings/casing of country found: "${country}"`);
    } else {
      normalizedCountries.add(norm);
    }
  });

  console.log("[Data Validation] Sanity checks complete.");
}
