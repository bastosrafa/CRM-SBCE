import { FunnelMetrics, WhatsAppData, CalendarData, MeetData, FormsData } from '../utils/types';

export class MetricsCalculator {
  
  // Calculate all funnel metrics based on API data
  static calculateFunnelMetrics(
    facebookAdsData: any,
    googleAdsData: any,
    whatsappData: WhatsAppData,
    calendarData: CalendarData,
    meetData: MeetData,
    formsData: FormsData,
    leadsData: any[]
  ): FunnelMetrics {
    
    // Ad Spend Calculations
    const adSpendMeta = facebookAdsData?.spend || 0;
    const adSpendGoogle = googleAdsData?.cost || 0;
    
    // Traffic & Lead Calculations
    const landingPageVisits = (facebookAdsData?.clicks || 0) + (googleAdsData?.clicks || 0);
    const leadsMeta = facebookAdsData?.leads || 0;
    const leadsGoogle = googleAdsData?.conversions || 0;
    const totalLeads = leadsMeta + leadsGoogle;
    
    // Landing Page Conversion Rate
    const landingPageConversion = landingPageVisits > 0 
      ? (totalLeads / landingPageVisits) * 100 
      : 0;
    
    // CPL Calculations
    const cplMeta = leadsMeta > 0 ? adSpendMeta / leadsMeta : 0;
    const cplGoogle = leadsGoogle > 0 ? adSpendGoogle / leadsGoogle : 0;
    const averageCPL = totalLeads > 0 ? (adSpendMeta + adSpendGoogle) / totalLeads : 0;
    
    // WhatsApp Contact & Response Calculations
    const contacted = whatsappData.uniqueContactedLeads;
    const contactedPercentage = totalLeads > 0 ? (contacted / totalLeads) * 100 : 0;
    const responded = whatsappData.uniqueRespondedLeads;
    const responseRate = contacted > 0 ? (responded / contacted) * 100 : 0;
    
    // Meeting Calculations
    const meetingsScheduledManual = calendarData.manuallyScheduled;
    const meetingsScheduledAuto = calendarData.autoScheduled;
    const totalMeetingsScheduled = meetingsScheduledManual + meetingsScheduledAuto;
    
    // Conversion Rates
    const responseToMeetingConversion = responded > 0 
      ? (totalMeetingsScheduled / responded) * 100 
      : 0;
    const leadToMeetingConversion = totalLeads > 0 
      ? (totalMeetingsScheduled / totalLeads) * 100 
      : 0;
    
    // Meeting Execution
    const meetingsHeld = meetData.completedMeetings;
    const meetingsHeldPercentage = totalMeetingsScheduled > 0 
      ? (meetingsHeld / totalMeetingsScheduled) * 100 
      : 0;
    const leadToMeetingHeldConversion = totalLeads > 0 
      ? (meetingsHeld / totalLeads) * 100 
      : 0;
    
    // Sales Calculations
    const enrollments = formsData.enrollments;
    const salesMeta = leadsData.filter(lead => 
      lead.source === 'Meta' && lead.columnId === 'closed'
    ).length;
    const salesOthers = leadsData.filter(lead => 
      lead.source !== 'Meta' && lead.columnId === 'closed'
    ).length;
    const totalSales = salesMeta + salesOthers;
    
    // Conversion Rates
    const meetingToSaleConversion = meetingsHeld > 0 
      ? (totalSales / meetingsHeld) * 100 
      : 0;
    const leadToSaleConversion = totalLeads > 0 
      ? (totalSales / totalLeads) * 100 
      : 0;
    
    // Revenue Calculations
    const revenueContracted = leadsData
      .filter(lead => lead.columnId === 'closed')
      .reduce((sum, lead) => sum + lead.value, 0);
    
    const revenueBilled = revenueContracted * 0.8; // 80% billing rate
    const revenueNet = revenueBilled * 0.9; // 90% net rate
    const averageTicket = totalSales > 0 ? revenueContracted / totalSales : 0;
    
    return {
      // Ad Spend
      adSpendMeta,
      adSpendGoogle,
      
      // Traffic & Leads
      landingPageVisits,
      leadsMeta,
      leadsGoogle,
      totalLeads,
      landingPageConversion,
      
      // CPL
      cplMeta,
      cplGoogle,
      averageCPL,
      
      // Contact & Response
      contacted,
      contactedPercentage,
      responded,
      responseRate,
      
      // Meetings
      meetingsScheduledManual,
      meetingsScheduledAuto,
      totalMeetingsScheduled,
      responseToMeetingConversion,
      leadToMeetingConversion,
      
      // Meeting Execution
      meetingsHeld,
      meetingsHeldPercentage,
      leadToMeetingHeldConversion,
      noShows: totalMeetingsScheduled - meetingsHeld,
      
      // Sales
      enrollments,
      salesMeta,
      salesOthers,
      totalSales,
      meetingToSaleConversion,
      leadToSaleConversion,
      
      // Revenue
      revenueContracted,
      revenueBilled,
      revenueNet,
      averageTicket
    };
  }
}