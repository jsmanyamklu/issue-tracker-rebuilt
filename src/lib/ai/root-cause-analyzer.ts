import { llmClient } from './llm-client';
import { RootCauseAnalysis } from '@/types';

/**
 * Root Cause Analyzer
 * Uses LLM to analyze issues and suggest likely root causes
 */
export class RootCauseAnalyzer {
  /**
   * Analyze an issue to determine likely root cause
   */
  async analyze(
    title: string,
    description: string,
    logs?: string
  ): Promise<RootCauseAnalysis> {
    // Fallback if AI is not enabled
    if (!llmClient.isEnabled()) {
      return this.fallbackAnalysis();
    }

    const systemPrompt = `You are an expert software engineer specializing in debugging and root cause analysis.
Your task is to analyze issues and provide likely root causes and suggested fixes.

Provide your analysis in JSON format with:
- likely_cause: A clear explanation of the probable root cause
- suggested_fixes: Array of 2-4 specific actionable fixes
- related_components: Array of system components that might be involved
- confidence: Your confidence level (0.0-1.0)

Focus on being practical and actionable. Avoid generic advice.`;

    const userPrompt = `Analyze this issue and provide root cause analysis:

Title: ${title}

Description:
${description}

${logs ? `Logs/Error Messages:\n${logs}` : ''}

Provide your analysis in JSON format.`;

    try {
      const response = await llmClient.prompt(systemPrompt, userPrompt, {
        temperature: 0.4,
        maxTokens: 800,
        jsonMode: true,
      });

      const result = JSON.parse(response);

      return {
        likely_cause: result.likely_cause || 'Unable to determine root cause',
        suggested_fixes: Array.isArray(result.suggested_fixes)
          ? result.suggested_fixes
          : ['Review the issue details and investigate further'],
        related_components: Array.isArray(result.related_components)
          ? result.related_components
          : [],
        confidence: result.confidence || 0.7,
      };
    } catch (error) {
      console.error('Root cause analysis failed:', error);
      return this.fallbackAnalysis();
    }
  }

  /**
   * Analyze with additional context (comments, related issues)
   */
  async analyzeWithContext(
    title: string,
    description: string,
    context: {
      comments?: string[];
      relatedIssues?: string[];
      logs?: string;
    }
  ): Promise<RootCauseAnalysis> {
    const contextText = [
      context.comments?.length ? `\nComments:\n${context.comments.join('\n')}` : '',
      context.relatedIssues?.length ? `\nRelated Issues:\n${context.relatedIssues.join('\n')}` : '',
      context.logs ? `\nLogs:\n${context.logs}` : '',
    ].filter(Boolean).join('\n');

    return this.analyze(title, description + contextText, context.logs);
  }

  /**
   * Fallback analysis when AI is not available
   */
  private fallbackAnalysis(): RootCauseAnalysis {
    return {
      likely_cause: 'Unable to perform automatic root cause analysis (AI not enabled)',
      suggested_fixes: [
        'Review the issue description and any error messages',
        'Check recent code changes that might be related',
        'Reproduce the issue in a development environment',
      ],
      related_components: [],
      confidence: 0.3,
    };
  }
}

// Export singleton instance
export const rootCauseAnalyzer = new RootCauseAnalyzer();
