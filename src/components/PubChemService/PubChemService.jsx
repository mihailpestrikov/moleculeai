const searchCache = {};

/**
 * Поиск молекул по названию через PubChem API
 * @param {string} query - Поисковый запрос (название молекулы)
 * @param {number} maxResults - Максимальное количество результатов
 * @returns {Promise<Array>} - Массив найденных молекул
 */
export async function searchMoleculesByName(query, maxResults = 5) {
  if (!query || query.trim() === "") {
    return [];
  }

  const trimmedQuery = query.toLowerCase().trim();

  if (searchCache[trimmedQuery]) {
    return searchCache[trimmedQuery];
  }

  if (trimmedQuery.length < 3) {
    console.log(
      "Query too short (less than 3 characters), skipping API request",
    );
    return [];
  }

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(trimmedQuery)}/json?limit=${maxResults * 2}`;
    console.log("Searching molecules by name:", url);

    const response = await fetch(url);

    if (!response.ok) {
      console.log("Search failed with status:", response.status);
      return [];
    }

    const data = await response.json();

    if (
      !data.dictionary_terms ||
      !data.dictionary_terms.compound ||
      data.dictionary_terms.compound.length === 0
    ) {
      console.log("No molecules found for query:", trimmedQuery);
      return [];
    }

    const moleculeNames = data.dictionary_terms.compound;

    const results = [];
    const processedCids = new Set();

    for (const name of moleculeNames) {
      if (results.length >= maxResults) break;

      try {
        const cidUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`;
        const cidResponse = await fetch(cidUrl);

        if (!cidResponse.ok) continue;

        const cidData = await cidResponse.json();

        if (
          !cidData.IdentifierList ||
          !cidData.IdentifierList.CID ||
          cidData.IdentifierList.CID.length === 0
        ) {
          continue;
        }

        const cid = cidData.IdentifierList.CID[0];

        if (processedCids.has(cid)) continue;
        processedCids.add(cid);

        const smilesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/CanonicalSMILES/JSON`;
        const smilesResponse = await fetch(smilesUrl);

        if (!smilesResponse.ok) continue;

        const smilesData = await smilesResponse.json();

        if (
          !smilesData.PropertyTable ||
          !smilesData.PropertyTable.Properties ||
          smilesData.PropertyTable.Properties.length === 0
        ) {
          continue;
        }

        const smiles = smilesData.PropertyTable.Properties[0].CanonicalSMILES;

        results.push({
          name: name,
          smiles: smiles,
          cid: cid,
        });
      } catch (error) {
        console.error(`Error processing molecule ${name}:`, error);
        continue;
      }
    }

    searchCache[trimmedQuery] = results;
    return results;
  } catch (error) {
    console.error("Error in search:", error);
    return [];
  }
}

/**
 * Получение дополнительной информации о молекуле
 * @param {number} cid - PubChem Compound ID
 * @returns {Promise<Object>} - Объект с информацией о молекуле
 */
export async function getMoleculeInfo(cid) {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularWeight,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount/JSON`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error getting molecule info: ${response.status}`);
    }

    const data = await response.json();
    return data.PropertyTable.Properties[0];
  } catch (error) {
    console.error(`Error fetching info for CID ${cid}:`, error);

    return {
      MolecularWeight: 0,
      XLogP: 0,
      HBondDonorCount: 0,
      HBondAcceptorCount: 0,
      RotatableBondCount: 0,
    };
  }
}
