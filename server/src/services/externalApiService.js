/**
 * Look up publication metadata from Crossref by DOI using native fetch.
 * Gracefully handles invalid DOIs, network failures, timeouts, etc.
 */
export const lookupCrossrefDoi = async (doi) => {
  if (!doi || typeof doi !== 'string') {
    return {
      success: false,
      message: 'A valid DOI string must be provided.',
    };
  }

  // Clean DOI format (remove https://doi.org/ prefix if present)
  const cleanDoi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();

  if (!cleanDoi) {
    return {
      success: false,
      message: 'Invalid DOI format.',
    };
  }

  try {
    const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FacultyAdvancementApp/1.0 (mailto:admin@institution.edu)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (response.status === 404) {
      return {
        success: false,
        message: 'DOI not found in Crossref registry.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: `External Crossref service returned status ${response.status}`,
      };
    }

    const data = await response.json();

    if (data && data.message) {
      const item = data.message;

      // Extract publication date
      let pubDate = null;
      if (item.published && item.published['date-parts'] && item.published['date-parts'][0]) {
        const parts = item.published['date-parts'][0];
        pubDate = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
      } else if (item.created && item.created['date-parts'] && item.created['date-parts'][0]) {
        const parts = item.created['date-parts'][0];
        pubDate = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
      }

      // Authors array
      const authors = (item.author || []).map((a, idx) => ({
        name: `${a.given || ''} ${a.family || ''}`.trim() || 'Unknown',
        affiliation: a.affiliation && a.affiliation[0] ? a.affiliation[0].name : '',
        isCorresponding: idx === 0,
        contributionRole: idx === 0 ? 'First Author' : 'Co-Author',
      }));

      // Determine category
      let pubType = 'journal';
      if (item.type === 'proceedings-article') {
        pubType = 'conference';
      } else if (item.type === 'book') {
        pubType = 'book';
      } else if (item.type === 'book-chapter') {
        pubType = 'book_chapter';
      }

      return {
        success: true,
        source: 'Crossref',
        data: {
          title: Array.isArray(item.title) ? item.title[0] : item.title || '',
          journalOrConferenceName: Array.isArray(item['container-title'])
            ? item['container-title'][0]
            : item['container-title'] || '',
          publisher: item.publisher || '',
          publicationDate: pubDate || new Date(),
          volume: item.volume || '',
          issue: item.issue || '',
          pageNumbers: item.page || '',
          doi: cleanDoi,
          isbnIssn: Array.isArray(item.ISSN) ? item.ISSN.join(', ') : item.ISSN || '',
          authors,
          publisherUrl: item.URL || `https://doi.org/${cleanDoi}`,
          citationCount: item['is-referenced-by-count'] || 0,
          publicationType: pubType,
        },
      };
    }

    return {
      success: false,
      message: 'No metadata found for this DOI in Crossref database.',
    };
  } catch (err) {
    return {
      success: false,
      message: `External metadata lookup unavailable: ${err.message}`,
    };
  }
};
