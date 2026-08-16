import {
  AIAnalysis,
  AIAnalysisContext,
  AIAssessment,
  TradeDirection,
} from '@forex-platform/types';

/**
 * AI Provider interface - abstraction for different AI backends
 */
export interface AIProvider {
  readonly providerName: string;
  readonly modelName: string;
  analyze(context: AIAnalysisContext): Promise<AIAnalysis>;
}

/**
 * Mock AI Provider - deterministic analysis for development/testing
 */
export class MockAIProvider implements AIProvider {
  readonly providerName = 'mock';
  readonly modelName = 'mock-analyst-v1';

  async analyze(context: AIAnalysisContext): Promise<AIAnalysis> {
    // Simulate a small delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    const assessment = this.determineAssessment(context);
    const confidence = this.calculateConfidence(context);
    const summary = this.buildSummary(context, assessment);
    const reasons = this.extractReasons(context);
    const risks = this.extractRisks(context);
    const invalidationConditions = this.extractInvalidationConditions(context);

    return {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol: context.symbol,
      tradingMode: context.tradingMode,
      timeframe: context.timeframe,
      direction: this.parseDirection(context.opportunity.direction),
      assessment,
      confidence,
      summary,
      reasons,
      risks,
      invalidationConditions,
      suggestedObservation: this.buildObservation(context, assessment),
      analyzedAt: new Date(),
      model: this.modelName,
      provider: this.providerName,
      marketDataMode: context.marketDataMode,
      opportunityScore: context.opportunity.score,
    };
  }

  private determineAssessment(context: AIAnalysisContext): AIAssessment {
    const opportunity = context.opportunity;
    const market = context.marketState;

    // If score is very high and data is valid, the setup is favorable
    if (opportunity.score >= 80 && market?.dataStatus === 'ok') {
      return AIAssessment.FAVORABLE;
    }

    // If score is high and has supporting factors, still favorable
    if (opportunity.score >= 70 && opportunity.reasons.length >= 2) {
      return AIAssessment.FAVORABLE;
    }

    // If score is moderate and no major red flags, cautious
    if (opportunity.score >= 50 && opportunity.riskFlags.length <= 2) {
      return AIAssessment.CAUTIOUS;
    }

    // If score is low or data quality is poor, unfavorable
    if (opportunity.score < 50 || market?.dataStatus !== 'ok') {
      return AIAssessment.UNFAVORABLE;
    }

    return AIAssessment.NEUTRAL;
  }

  private calculateConfidence(context: AIAnalysisContext): number {
    const opportunity = context.opportunity;
    const market = context.marketState;

    let confidence = opportunity.confidence; // Start with opportunity confidence

    // Boost confidence if data is valid and we have enough history
    if (market?.dataStatus === 'ok' && market?.indicators?.valid) {
      confidence += 5;
    }

    // Reduce confidence if there are many risk flags
    if (opportunity.riskFlags.length > 3) {
      confidence -= 10;
    }

    // Ensure confidence is in valid range
    return Math.min(100, Math.max(0, Math.round(confidence)));
  }

  private buildSummary(
    context: AIAnalysisContext,
    assessment: AIAssessment
  ): string {
    const mode = context.tradingMode.toLowerCase();
    const direction = context.opportunity.direction.toUpperCase();

    if (assessment === AIAssessment.FAVORABLE) {
      return `The current ${mode} setup for ${direction} on ${context.symbol} is favorable. Market conditions align with the opportunity, and the technical structure supports the proposed direction.`;
    }

    if (assessment === AIAssessment.CAUTIOUS) {
      return `The current ${mode} setup for ${direction} on ${context.symbol} presents a mixed picture. While there are supporting factors, some elements warrant caution before committing capital.`;
    }

    if (assessment === AIAssessment.UNFAVORABLE) {
      return `The current ${mode} setup for ${direction} on ${context.symbol} faces headwinds. Data quality is insufficient or the technical structure does not strongly support the opportunity.`;
    }

    return `The current ${mode} setup for ${direction} on ${context.symbol} is neutral. Neither strong support nor significant opposition is evident in the current market structure.`;
  }

  private extractReasons(context: AIAnalysisContext): string[] {
    const reasons: string[] = [];

    // Use the opportunity reasons as the foundation
    reasons.push(...context.opportunity.reasons);

    // Add technical factors if available
    if (context.marketState?.trend) {
      reasons.push(
        `Market trend is ${String(context.marketState.trend).toLowerCase()}`
      );
    }

    if (context.marketState?.momentum) {
      reasons.push(
        `Momentum is ${String(context.marketState.momentum).toLowerCase()}`
      );
    }

    return reasons.slice(0, 5); // Limit to top 5 reasons
  }

  private extractRisks(context: AIAnalysisContext): string[] {
    const risks: string[] = [];

    // Use opportunity risk flags
    risks.push(...context.opportunity.riskFlags);

    // Add generic risks based on market conditions
    if (context.marketState?.volatility === 'EXTREME') {
      risks.push('Extreme volatility may increase execution risk');
    }

    if (!context.marketState?.indicators?.valid) {
      risks.push('Indicator data quality is insufficient');
    }

    return risks.slice(0, 4); // Limit to top 4 risks
  }

  private extractInvalidationConditions(context: AIAnalysisContext): string[] {
    const invalidations: string[] = [];

    if (
      context.marketState?.supportLevels &&
      context.marketState.supportLevels.length > 0
    ) {
      invalidations.push(
        `Price closes below ${context.marketState.supportLevels[0]?.price.toFixed(5)} support`
      );
    }

    if (
      context.marketState?.resistanceLevels &&
      context.marketState.resistanceLevels.length > 0
    ) {
      invalidations.push(
        `Price closes above ${context.marketState.resistanceLevels[0]?.price.toFixed(5)} resistance`
      );
    }

    invalidations.push('Momentum reverses sharply');

    return invalidations.slice(0, 3); // Limit to top 3 invalidation conditions
  }

  private buildObservation(
    context: AIAnalysisContext,
    assessment: AIAssessment
  ): string | null {
    if (assessment === AIAssessment.FAVORABLE) {
      return 'A confirmation candle or breakout above immediate resistance would strengthen this setup considerably.';
    }

    if (assessment === AIAssessment.CAUTIOUS) {
      return 'Wait for additional confirmation before committing. A break above/below key structure would clarify the direction.';
    }

    if (assessment === AIAssessment.UNFAVORABLE) {
      return 'Consider waiting for better market conditions or a significant change in structure.';
    }

    return null;
  }

  private parseDirection(directionStr: string): TradeDirection {
    const normalized = String(directionStr).toUpperCase();
    if (normalized.includes('SHORT')) {
      return TradeDirection.SHORT;
    }
    return TradeDirection.LONG;
  }
}

/**
 * Build a market analysis prompt for the AI
 * Do NOT include in mock provider; for real provider use only
 */
export function buildMarketAnalysisPrompt(context: AIAnalysisContext): string {
  return `You are a professional forex market analyst.

INSTRUCTIONS:

1. Analyze ONLY the information provided.
2. Do NOT invent market data or indicators.
3. Do NOT guarantee outcomes or claim certainty.
4. Do NOT execute trades or place orders.
5. Clearly distinguish observations from conclusions.
6. If information is missing, explicitly state that it is missing.
7. Focus on explaining the current technical setup based on the provided context.

MARKET DATA:
- Symbol: ${context.symbol}
- Trading Mode: ${context.tradingMode}
- Timeframe: ${context.timeframe}
- Current Price: ${context.currentPrice ?? 'not available'}
- Market Data Mode: ${context.marketDataMode}

OPPORTUNITY ASSESSMENT:
- Direction: ${context.opportunity.direction}
- Opportunity Score: ${context.opportunity.score}/100
- AI Confidence in Setup Quality: ${context.opportunity.confidence}%
- Supporting Factors:
${context.opportunity.reasons.map((r: string) => `  - ${r}`).join('\n')}
- Risk Flags:
${context.opportunity.riskFlags.map((r: string) => `  - ${r}`).join('\n')}

MARKET STATE:
${JSON.stringify(context.marketState, null, 2)}

TASK:

Provide a structured analysis that includes:
1. Assessment (FAVORABLE, CAUTIOUS, UNFAVORABLE, NEUTRAL)
2. Confidence level (0-100) - analytical confidence in the setup quality, NOT a probability
3. Summary (2-3 sentences explaining the setup)
4. Supporting factors (list of reasons why this setup makes sense)
5. Risks (list of potential headwinds)
6. Invalidation conditions (what would break the thesis)
7. Observation (suggested next step or confirmation)

Return the response as valid JSON.`;
}

/**
 * Validate an AI analysis response
 */
export function validateAIAnalysis(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Analysis must be an object');
    return { valid: false, errors };
  }

  const analysis = data as Record<string, unknown>;

  if (!analysis.symbol || typeof analysis.symbol !== 'string') {
    errors.push('symbol is required and must be a string');
  }

  if (
    typeof analysis.direction !== 'string' ||
    !['LONG', 'SHORT'].includes(analysis.direction)
  ) {
    errors.push('direction must be LONG or SHORT');
  }

  if (
    !analysis.assessment ||
    !Object.values(AIAssessment).includes(analysis.assessment as AIAssessment)
  ) {
    errors.push(
      `assessment must be one of: ${Object.values(AIAssessment).join(', ')}`
    );
  }

  if (
    typeof analysis.confidence !== 'number' ||
    analysis.confidence < 0 ||
    analysis.confidence > 100
  ) {
    errors.push('confidence must be a number between 0 and 100');
  }

  if (!analysis.summary || typeof analysis.summary !== 'string') {
    errors.push('summary is required and must be a string');
  }

  if (!Array.isArray(analysis.reasons)) {
    errors.push('reasons must be an array');
  }

  if (!Array.isArray(analysis.risks)) {
    errors.push('risks must be an array');
  }

  if (!Array.isArray(analysis.invalidationConditions)) {
    errors.push('invalidationConditions must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * AI Analyst Service - main entry point for AI analysis
 */
export class AIAnalystService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider ?? new MockAIProvider();
  }

  async analyze(context: AIAnalysisContext): Promise<AIAnalysis> {
    // Validate context first
    if (!context.symbol || !context.tradingMode || !context.timeframe) {
      throw new Error('AIAnalysisContext is missing required fields');
    }

    // Get analysis from provider
    const analysis = await this.provider.analyze(context);

    // Validate the response
    const validation = validateAIAnalysis(analysis);
    if (!validation.valid) {
      throw new Error(
        `AI response validation failed: ${validation.errors.join(', ')}`
      );
    }

    return analysis;
  }

  getProviderName(): string {
    return this.provider.providerName;
  }

  getModelName(): string {
    return this.provider.modelName;
  }
}
