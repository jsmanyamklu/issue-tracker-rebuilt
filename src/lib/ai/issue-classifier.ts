import { llmClient } from './llm-client';
import { IssueClassification, IssueType, IssuePriority } from '@/types';

/**
 * Issue Classifier
 * Uses LLM to automatically classify issues by type and priority
 */
export class IssueClassifier {
  /**
   * Classify an issue based on title and description
   */
  async classify(title: string, description?: string): Promise<IssueClassification> {
    // Fallback if AI is not enabled
    if (!llmClient.isEnabled()) {
      return this.fallbackClassification();
    }

    const systemPrompt = `You are an expert at analyzing software issues and bugs.
Your task is to classify issues by type and priority.

Issue Types:
- bug: Software defects, errors, or malfunctions
- feature: New functionality requests
- task: General work items or chores
- improvement: Enhancements to existing features

Priority Levels:
- low: Minor issues, cosmetic problems, nice-to-haves
- medium: Standard issues that should be addressed
- high: Important issues affecting core functionality
- critical: Severe issues blocking users, security vulnerabilities, data loss

Respond with ONLY a JSON object in this exact format:
{
  "type": "bug|feature|task|improvement",
  "priority": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation"
}`;

    const userPrompt = `Classify this issue:

Title: ${title}
${description ? `Description: ${description}` : ''}

Provide the classification in JSON format.`;

    try {
      const response = await llmClient.prompt(systemPrompt, userPrompt, {
        temperature: 0.3,
        maxTokens: 300,
        jsonMode: true,
      });

      const result = JSON.parse(response);

      return {
        type: result.type as IssueType,
        priority: result.priority as IssuePriority,
        confidence: result.confidence || 0.8,
        reasoning: result.reasoning || 'AI-generated classification',
      };
    } catch (error) {
      console.error('Issue classification failed:', error);
      return this.fallbackClassification();
    }
  }

  /**
   * Classify multiple issues in batch
   */
  async classifyBatch(issues: Array<{ title: string; description?: string }>): Promise<IssueClassification[]> {
    return Promise.all(issues.map(issue => this.classify(issue.title, issue.description)));
  }

  /**
   * Fallback classification when AI is not available
   */
  private fallbackClassification(): IssueClassification {
    return {
      type: IssueType.TASK,
      priority: IssuePriority.MEDIUM,
      confidence: 0.5,
      reasoning: 'Default classification (AI not enabled)',
    };
  }

  /**
   * Simple heuristic-based classification (no LLM)
   */
  classifyWithHeuristics(title: string, description?: string): IssueClassification {
    const text = `${title} ${description || ''}`.toLowerCase();

    // Determine type
    let type: IssueType = IssueType.TASK;
    if (text.includes('bug') || text.includes('error') || text.includes('crash') || text.includes('broken')) {
      type = IssueType.BUG;
    } else if (text.includes('feature') || text.includes('add') || text.includes('new')) {
      type = IssueType.FEATURE;
    } else if (text.includes('improve') || text.includes('enhance') || text.includes('optimize')) {
      type = IssueType.IMPROVEMENT;
    }

    // Determine priority
    let priority: IssuePriority = IssuePriority.MEDIUM;
    if (text.includes('critical') || text.includes('urgent') || text.includes('security') || text.includes('data loss')) {
      priority = IssuePriority.CRITICAL;
    } else if (text.includes('important') || text.includes('high priority') || text.includes('blocking')) {
      priority = IssuePriority.HIGH;
    } else if (text.includes('minor') || text.includes('cosmetic') || text.includes('nice to have')) {
      priority = IssuePriority.LOW;
    }

    return {
      type,
      priority,
      confidence: 0.6,
      reasoning: 'Heuristic-based classification',
    };
  }
}

// Export singleton instance
export const issueClassifier = new IssueClassifier();
