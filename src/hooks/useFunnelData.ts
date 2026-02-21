import { useState, useEffect } from 'react';
import { FunnelMetrics } from '../utils/types';
import { APIService } from '../services/apiService';
import { MetricsCalculator } from '../services/metricsCalculator';

interface DateRange {
  startDate: string;
  endDate: string;
}

export const useFunnelData = (dateRange: DateRange, leads: any[]) => {
  const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiService = APIService.getInstance();

  const fetchFunnelData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch data from all APIs in parallel
      const [
        facebookAdsData,
        googleAdsData,
        whatsappData,
        calendarData,
        meetData,
        formsData
      ] = await Promise.all([
        apiService.getFacebookAdsData(dateRange),
        apiService.getGoogleAdsData(dateRange),
        apiService.getWhatsAppData(dateRange),
        apiService.getGoogleCalendarData(dateRange),
        apiService.getGoogleMeetData(dateRange),
        apiService.getGoogleFormsData(dateRange)
      ]);

      // Calculate metrics based on all data sources
      const calculatedMetrics = MetricsCalculator.calculateFunnelMetrics(
        facebookAdsData,
        googleAdsData,
        whatsappData,
        calendarData,
        meetData,
        formsData,
        leads
      );

      setFunnelMetrics(calculatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Error fetching funnel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, [dateRange.startDate, dateRange.endDate]);

  return {
    funnelMetrics,
    loading,
    error,
    refetch: fetchFunnelData
  };
};