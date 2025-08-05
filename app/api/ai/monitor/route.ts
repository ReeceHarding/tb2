import { NextResponse } from 'next/server';
import { aiFallbackService } from '@/libs/ai-fallback';

export async function GET() {
  console.log('[AI Monitor API] Processing health check request');

  try {
    const metrics = aiFallbackService.getMetrics();
    const status = aiFallbackService.getProviderStatus();
    
    // Calculate overall health score
    const totalProviders = Object.keys(status).length;
    const availableProviders = metrics.availableProviders.length;
    const healthScore = (availableProviders / totalProviders) * 100;
    
    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'critical';
    if (healthScore >= 80) {
      overallStatus = 'healthy';
    } else if (healthScore >= 50) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'critical';
    }
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      overallStatus,
      healthScore: Math.round(healthScore),
      metrics: {
        totalProviders,
        availableProviders: availableProviders,
        totalFailures: metrics.totalFailures,
        availableProviderNames: metrics.availableProviders
      },
      providers: Object.entries(status).map(([name, data]) => ({
        name,
        available: data.available,
        failures: data.failures,
        lastFailure: data.lastFailure > 0 ? new Date(data.lastFailure).toISOString() : null,
        status: data.available ? 'operational' : 'circuit_breaker_open'
      })),
      actions: {
        resetFailures: '/api/ai/monitor/reset',
        viewLogs: 'Check application logs for detailed error information'
      }
    };
    
    console.log(`[AI Monitor API] Health check complete - Status: ${overallStatus}, Score: ${healthScore}%`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[AI Monitor API] Error during health check:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve AI service health status',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        overallStatus: 'unknown'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  console.log('[AI Monitor API] Processing provider failure reset request');

  try {
    aiFallbackService.resetProviderFailures();
    
    const updatedMetrics = aiFallbackService.getMetrics();
    
    console.log('[AI Monitor API] Successfully reset all provider failure counts');
    
    return NextResponse.json({
      success: true,
      message: 'All provider failure counts have been reset',
      timestamp: new Date().toISOString(),
      updatedMetrics: {
        totalFailures: updatedMetrics.totalFailures,
        availableProviders: updatedMetrics.availableProviders
      }
    });
    
  } catch (error) {
    console.error('[AI Monitor API] Error resetting provider failures:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset provider failure counts',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}