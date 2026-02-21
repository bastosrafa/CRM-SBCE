// =====================================================
// HEALTH CHECK - RAILWAY
// =====================================================

export default async function handler(req, res) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.VITE_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // TODO: Verificar conexão Supabase
        whatsapp: 'available', // TODO: Verificar WhatsApp API
        calendar: 'available'  // TODO: Verificar Google Calendar
      }
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
