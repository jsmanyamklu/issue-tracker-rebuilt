import { llmClient } from './llm-client';
import { embeddingsService } from './embeddings-service';
import { query } from '@/lib/db';
import { Issue, SimilarIssue } from '@/types';

/**
 * Similar Issue Finder
 * Finds similar issues using vector embeddings and cosine similarity
 */
export class SimilarIssueFinder {
  /**
   * Find similar issues to a given issue
   */
  async findSimilar(
    issueId: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<SimilarIssue[]> {
    if (!llmClient.isEnabled()) {
      console.log('AI not enabled, returning empty similar issues');
      return [];
    }

    try {
      // Get embedding for the target issue
      const targetEmbedding = await embeddingsService.getEmbedding(issueId);

      if (!targetEmbedding) {
        console.log('No embedding found for issue, generating...');
        // Try to get issue details and generate embedding
        const issueResult = await query<Issue>(
          'SELECT * FROM issues WHERE id = $1',
          [issueId]
        );

        if (issueResult.rows.length === 0) {
          return [];
        }

        const issue = issueResult.rows[0];
        await embeddingsService.generateAndStoreEmbedding(
          issue.id,
          issue.title,
          issue.description || undefined
        );

        return this.findSimilar(issueId, limit, threshold);
      }

      // Get all other issue embeddings
      const embeddingsResult = await query<{
        issue_id: string;
        embedding: number[];
      }>(
        `SELECT issue_id, embedding
         FROM issue_embeddings
         WHERE issue_id != $1`,
        [issueId]
      );

      // Calculate similarities
      const similarities = embeddingsResult.rows.map((row) => ({
        issue_id: row.issue_id,
        similarity: embeddingsService.calculateSimilarity(
          targetEmbedding,
          row.embedding
        ),
      }));

      // Filter by threshold and sort by similarity
      const topSimilar = similarities
        .filter((s) => s.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      // Fetch issue details
      if (topSimilar.length === 0) {
        return [];
      }

      const issueIds = topSimilar.map((s) => s.issue_id);
      const issuesResult = await query<Issue>(
        `SELECT * FROM issues WHERE id = ANY($1::uuid[])`,
        [issueIds]
      );

      // Map to SimilarIssue objects
      const similarIssues: SimilarIssue[] = topSimilar.map((s) => {
        const issue = issuesResult.rows.find((i) => i.id === s.issue_id)!;
        return {
          issue,
          similarity_score: s.similarity,
          matching_aspects: this.extractMatchingAspects(s.similarity),
        };
      });

      return similarIssues;
    } catch (error) {
      console.error('Failed to find similar issues:', error);
      return [];
    }
  }

  /**
   * Find similar issues by text (without an existing issue)
   */
  async findSimilarByText(
    title: string,
    description?: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<SimilarIssue[]> {
    if (!llmClient.isEnabled()) {
      return [];
    }

    try {
      // Generate embedding for the text
      const text = `${title}\n${description || ''}`;
      const targetEmbedding = await llmClient.generateEmbedding(text);

      // Get all issue embeddings
      const embeddingsResult = await query<{
        issue_id: string;
        embedding: number[];
      }>('SELECT issue_id, embedding FROM issue_embeddings');

      // Calculate similarities
      const similarities = embeddingsResult.rows.map((row) => ({
        issue_id: row.issue_id,
        similarity: embeddingsService.calculateSimilarity(
          targetEmbedding,
          row.embedding
        ),
      }));

      // Filter by threshold and sort by similarity
      const topSimilar = similarities
        .filter((s) => s.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      // Fetch issue details
      if (topSimilar.length === 0) {
        return [];
      }

      const issueIds = topSimilar.map((s) => s.issue_id);
      const issuesResult = await query<Issue>(
        `SELECT * FROM issues WHERE id = ANY($1::uuid[])`,
        [issueIds]
      );

      // Map to SimilarIssue objects
      const similarIssues: SimilarIssue[] = topSimilar.map((s) => {
        const issue = issuesResult.rows.find((i) => i.id === s.issue_id)!;
        return {
          issue,
          similarity_score: s.similarity,
          matching_aspects: this.extractMatchingAspects(s.similarity),
        };
      });

      return similarIssues;
    } catch (error) {
      console.error('Failed to find similar issues by text:', error);
      return [];
    }
  }

  /**
   * Extract matching aspects based on similarity score
   */
  private extractMatchingAspects(similarity: number): string[] {
    if (similarity >= 0.9) {
      return ['Nearly identical issue', 'Same symptoms', 'Same context'];
    } else if (similarity >= 0.8) {
      return ['Very similar issue', 'Related symptoms'];
    } else if (similarity >= 0.7) {
      return ['Similar issue', 'Related context'];
    }
    return ['Potentially related'];
  }
}

// Export singleton instance
export const similarIssueFinder = new SimilarIssueFinder();
