import Anthropic from '@anthropic-ai/sdk';
import activityLogRepository from '@/repositories/ActivityLogRepository';
import activityLogService from '@/services/ActivityLogService';
import {
  ActivityInsights,
  InsightSummary,
  ActivityPattern,
  Prediction,
  Recommendation,
  AnalyticsMetrics,
} from '@/types';

/**
 * AI-powered log analyzer using Claude API
 */
class LogAnalyzer {
  private client: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Check if AI analysis is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Analyze activity logs and generate comprehensive insights
   */
  async analyzeActivityLogs(daysBack: number = 30): Promise<ActivityInsights> {
    if (!this.client) {
      return this.getFallbackInsights();
    }

    try {
      // Get activity logs for analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const logs = await activityLogRepository.findByDateRange(startDate, endDate, 1000);
      const stats = await activityLogService.getActivityStats(startDate, endDate);
      const metrics = await activityLogService.getAnalyticsMetrics();

      // Prepare data for AI analysis
      const analysisData = {
        summary: {
          total_logs: logs.length,
          date_range: { start: startDate, end: endDate },
          unique_users: new Set(logs.map((l) => l.user_id).filter(Boolean)).size,
        },
        action_stats: stats.action_type_stats,
        user_stats: stats.user_activity_stats,
        hourly_distribution: stats.hourly_distribution,
        daily_distribution: stats.daily_distribution,
        metrics,
        sample_logs: logs.slice(0, 50).map((log) => ({
          action_type: log.action_type,
          resource_type: log.resource_type,
          details: log.details,
          user: log.user?.name || 'Unknown',
          created_at: log.created_at,
        })),
      };

      // Call Claude API for analysis
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are an expert data analyst specializing in software project management and team performance analysis. Analyze the following activity logs and metrics from an issue tracking system.

# Data to Analyze:
${JSON.stringify(analysisData, null, 2)}

# Your Task:
Provide a comprehensive analysis with the following structure:

## 1. Summary Insights
- Key findings about team activity
- Overall trend (increasing, decreasing, stable)
- Most common activities
- Busiest times and days

## 2. Activity Patterns (identify 3-5 significant patterns)
For each pattern provide:
- Pattern type (e.g., "Frequent Reassignments", "Status Change Delays", etc.)
- Description of the pattern
- Frequency/occurrence
- Impact level (high/medium/low)
- Affected resources or areas

## 3. Predictions (3-5 data-driven predictions)
For each prediction provide:
- Type of prediction
- Description
- Confidence level (0-100)
- Timeframe
- Affected items

## 4. Recommendations (3-5 actionable recommendations)
For each recommendation provide:
- Category (process, team, tools, etc.)
- Title
- Description
- Priority (high/medium/low)
- Specific action items

Please provide your analysis in JSON format with this exact structure:
{
  "summary": {
    "key_findings": ["finding1", "finding2", ...],
    "trend": "increasing|decreasing|stable",
    "most_common_action": "action_type",
    "busiest_hour": number (0-23),
    "busiest_day": "day_name"
  },
  "patterns": [
    {
      "pattern_type": "string",
      "description": "string",
      "frequency": number,
      "impact": "high|medium|low",
      "affected_resources": ["resource1", ...]
    }
  ],
  "predictions": [
    {
      "prediction_type": "string",
      "description": "string",
      "confidence": number (0-100),
      "timeframe": "string",
      "affected_items": ["item1", ...]
    }
  ],
  "recommendations": [
    {
      "category": "string",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "action_items": ["action1", ...]
    }
  ]
}`,
          },
        ],
      });

      // Parse Claude's response
      const content = message.content[0];
      if (content.type === 'text') {
        const analysisText = content.text;

        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return this.formatInsights(analysis, logs.length);
        }
      }

      return this.getFallbackInsights();
    } catch (error) {
      console.error('Failed to analyze logs with AI:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Format AI analysis into ActivityInsights structure
   */
  private formatInsights(analysis: any, totalActions: number): ActivityInsights {
    const summary: InsightSummary = {
      total_actions: totalActions,
      active_users: 0, // Will be filled from metrics
      most_common_action: analysis.summary.most_common_action || 'issue_created',
      busiest_hour: analysis.summary.busiest_hour || 14,
      busiest_day: analysis.summary.busiest_day || 'Monday',
      trend: analysis.summary.trend || 'stable',
    };

    const patterns: ActivityPattern[] = (analysis.patterns || []).map((p: any) => ({
      pattern_type: p.pattern_type,
      description: p.description,
      frequency: p.frequency || 0,
      impact: p.impact,
      affected_resources: p.affected_resources || [],
    }));

    const predictions: Prediction[] = (analysis.predictions || []).map((p: any) => ({
      prediction_type: p.prediction_type,
      description: p.description,
      confidence: p.confidence || 50,
      timeframe: p.timeframe,
      affected_items: p.affected_items || [],
    }));

    const recommendations: Recommendation[] = (analysis.recommendations || []).map((r: any) => ({
      category: r.category,
      title: r.title,
      description: r.description,
      priority: r.priority,
      action_items: r.action_items || [],
    }));

    return {
      summary,
      patterns,
      predictions,
      recommendations,
      generated_at: new Date(),
    };
  }

  /**
   * Get fallback insights when AI is not available
   */
  private getFallbackInsights(): ActivityInsights {
    return {
      summary: {
        total_actions: 0,
        active_users: 0,
        most_common_action: 'N/A',
        busiest_hour: 14,
        busiest_day: 'Monday',
        trend: 'stable',
      },
      patterns: [
        {
          pattern_type: 'Info',
          description: 'AI analysis is not available. Please configure ANTHROPIC_API_KEY to enable AI-powered insights.',
          frequency: 0,
          impact: 'low',
          affected_resources: [],
        },
      ],
      predictions: [],
      recommendations: [
        {
          category: 'configuration',
          title: 'Enable AI Analytics',
          description: 'Configure ANTHROPIC_API_KEY environment variable to enable AI-powered log analysis and predictions.',
          priority: 'medium',
          action_items: [
            'Obtain an Anthropic API key from https://console.anthropic.com',
            'Add ANTHROPIC_API_KEY to your .env file',
            'Restart the application',
          ],
        },
      ],
      generated_at: new Date(),
    };
  }

  /**
   * Predict overdue risk for an issue
   */
  async predictOverdueRisk(
    issueId: string,
    issueDetails: {
      priority: string;
      type: string;
      assignee_id?: string;
      due_date?: string;
      created_at: Date;
    }
  ): Promise<{ risk_score: number; reasoning: string }> {
    if (!this.client) {
      return {
        risk_score: 50,
        reasoning: 'AI analysis not available',
      };
    }

    try {
      // Get historical data for similar issues
      const historicalLogs = await activityLogRepository.findByActionType(
        'issue_status_changed' as any,
        100
      );

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Analyze the risk of this issue becoming overdue:

Issue Details:
- Priority: ${issueDetails.priority}
- Type: ${issueDetails.type}
- Has Assignee: ${issueDetails.assignee_id ? 'Yes' : 'No'}
- Due Date: ${issueDetails.due_date || 'Not set'}
- Days Since Creation: ${Math.floor((Date.now() - issueDetails.created_at.getTime()) / (1000 * 60 * 60 * 24))}

Historical Data:
- Total similar issues resolved: ${historicalLogs.length}

Provide a risk score (0-100) and brief reasoning in JSON format:
{
  "risk_score": number,
  "reasoning": "brief explanation"
}`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return { risk_score: 50, reasoning: 'Unable to parse AI response' };
    } catch (error) {
      console.error('Failed to predict overdue risk:', error);
      return { risk_score: 50, reasoning: 'Prediction failed' };
    }
  }

  /**
   * Identify bottlenecks in the workflow
   */
  async identifyBottlenecks(): Promise<
    Array<{ stage: string; description: string; severity: string }>
  > {
    if (!this.client) {
      return [];
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const statusChanges = await activityLogRepository.findByActionType(
        'issue_status_changed' as any
      );

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Analyze the following status change logs to identify workflow bottlenecks:

${JSON.stringify(statusChanges.slice(0, 100), null, 2)}

Identify stages where issues tend to get stuck or take longer than normal. Provide results in JSON format:
[
  {
    "stage": "stage_name",
    "description": "explanation of bottleneck",
    "severity": "high|medium|low"
  }
]`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to identify bottlenecks:', error);
      return [];
    }
  }
}

export const logAnalyzer = new LogAnalyzer();
export default logAnalyzer;
