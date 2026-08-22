import { HelpArticle, SearchResult } from '../types/help.types';
import { ALL_HELP_ARTICLES, getCategoryBySlug } from '../data';

export function searchHelpArticles(rawQuery: string): SearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const queryTerms = query.split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  for (const article of ALL_HELP_ARTICLES) {
    const category = getCategoryBySlug(article.category);
    if (!category) continue;

    let score = 0;
    let matchedField: 'title' | 'description' | 'keywords' | 'content' = 'content';

    const titleLower = article.title.toLowerCase();
    const descLower = article.description.toLowerCase();
    const catTitleLower = category.title.toLowerCase();
    const keywordsLower = article.keywords.map((k) => k.toLowerCase());

    // 1. Exact Title Match
    if (titleLower.includes(query)) {
      score += 100;
      matchedField = 'title';
    }

    // 2. Keyword Matches
    for (const kw of keywordsLower) {
      if (kw === query) {
        score += 80;
        matchedField = 'keywords';
      } else if (kw.includes(query)) {
        score += 40;
        matchedField = 'keywords';
      }
    }

    // 3. Category match
    if (catTitleLower.includes(query) || article.category.includes(query)) {
      score += 30;
      matchedField = 'description';
    }

    // 4. Description match
    if (descLower.includes(query)) {
      score += 25;
      if (score < 50) matchedField = 'description';
    }

    // 5. Query Term breakdown
    let allTermsFound = true;
    for (const term of queryTerms) {
      const inTitle = titleLower.includes(term);
      const inKeywords = keywordsLower.some((k) => k.includes(term));
      const inDesc = descLower.includes(term);

      if (inTitle) score += 20;
      else if (inKeywords) score += 15;
      else if (inDesc) score += 10;
      else {
        // Check section contents
        let inContent = false;
        for (const sec of article.sections) {
          if (sec.heading && sec.heading.toLowerCase().includes(term)) {
            score += 8;
            inContent = true;
            break;
          }
          if (sec.paragraphs && sec.paragraphs.some((p) => p.toLowerCase().includes(term))) {
            score += 5;
            inContent = true;
            break;
          }
          if (sec.bullets && sec.bullets.some((b) => b.toLowerCase().includes(term))) {
            score += 5;
            inContent = true;
            break;
          }
        }
        if (!inContent) {
          allTermsFound = false;
        }
      }
    }

    if (score > 0) {
      // Bonus if all terms matched
      if (allTermsFound) score += 15;
      results.push({
        article,
        category,
        score,
        matchedField,
      });
    }
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}
