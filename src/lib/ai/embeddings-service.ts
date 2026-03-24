import { llmClient } from './llm-client';
import { query } from '@/lib/db';
import { cosineSimilarity } from '@/lib/utils';

/**
 * Embeddings Service
 * Manages vector embeddings for issues
 */
export class EmbeddingsService {
  /**
   * Generate and store embedding for an issue
   */
  async generateAndStoreEmbedding(
    issueId: string,
    title: string,
    description?: string
  ): Promise<void> {
    if (!llmClient.isEnabled()) {
      console.log('AI not enabled, skipping embedding generation');
      return;
    }

    try {
      // Combine title and description for embedding
      const text = `${title}\n${description || ''}`;

      // Generate embedding
      const embedding = await llmClient.generateEmbedding(text);

      // Store in database
      await query(
        `INSERT INTO issue_embeddings (issue_id, embedding, model)
         VALUES ($1, $2, $3)
         ON CONFLICT (issue_id)
         DO UPDATE SET embedding = $2, model = $3, updated_at = CURRENT_TIMESTAMP`,
        [issueId, embedding, 'text-embedding-ada-002']
      );

      console.log(`Embedding generated and stored for issue ${issueId}`);
    } catch (error) {
      console.error('Failed to generate/store embedding:', error);
      // Don't throw - embeddings are optional
    }
  }

  /**
   * Get embedding for an issue
   */
  async getEmbedding(issueId: string): Promise<number[] | null> {
    try {
      const result = await query<{ embedding: number[] }>(
        'SELECT embedding FROM issue_embeddings WHERE issue_id = $1',
        [issueId]
      );

      return result.rows[0]?.embedding || null;
    } catch (error) {
      console.error('Failed to get embedding:', error);
      return null;
    }
  }

  /**
   * Calculate similarity score between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    return cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Delete embedding for an issue
   */
  async deleteEmbedding(issueId: string): Promise<void> {
    try {
      await query('DELETE FROM issue_embeddings WHERE issue_id = $1', [issueId]);
    } catch (error) {
      console.error('Failed to delete embedding:', error);
    }
  }

  /**
   * Batch generate embeddings for multiple issues
   */
  async batchGenerateEmbeddings(
    issues: Array<{ id: string; title: string; description?: string }>
  ): Promise<void> {
    for (const issue of issues) {
      await this.generateAndStoreEmbedding(issue.id, issue.title, issue.description);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Export singleton instance
export const embeddingsService = new EmbeddingsService();
