'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData, PredictionsData, WellHealthScore } from '@/types/telemetry';

export function usePredictions(apiUrl?: string, wellId = 'BW-001', intervalMs = 3000) {
  const url = apiUrl || process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:4000';
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [predictions, setPredictions] = useState<PredictionsData | null>(null);
  const [healthScore, setHealthScore] = useState<WellHealthScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${url}/api/v1/pipeline/latest?well_id=${wellId}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const d = json.data;
          if (d.analytics) {
            setAnalytics(d.analytics);
            if (d.analytics.well_health_score) {
              setHealthScore(d.analytics.well_health_score);
            }
          }
          if (d.predictions) {
            setPredictions(d.predictions);
          }
        }
        setLastUpdated(new Date());
      }
      setIsLoading(false);
    } catch (err) {
      console.warn('Error polling predictions/analytics:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, intervalMs);
    return () => clearInterval(interval);
  }, [url, wellId, intervalMs]);

  return { analytics, predictions, healthScore, isLoading, lastUpdated, refetch: fetchResults };
}

export default usePredictions;
