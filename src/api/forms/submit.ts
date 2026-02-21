import { NextApiRequest, NextApiResponse } from 'next';
import { formService } from '../../services/formService';
import { leadAutoCreationService } from '../../services/leadAutoCreationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { form_id, instance_id, ...formData } = req.body;

    if (!form_id || !instance_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'form_id and instance_id are required' 
      });
    }

    // Get client IP and user agent
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Process form submission
    const submission = await formService.processSubmission(
      form_id,
      formData,
      Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent
    );

    if (!submission) {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to process form submission' 
      });
    }

    // Create lead from submission
    const lead = await formService.createLeadFromSubmission(submission);
    
    if (lead) {
      // Create lead in database
      const result = await leadAutoCreationService.createLeadFromForm(
        lead,
        instance_id
      );

      if (result.success) {
        console.log('✅ Lead created from form submission:', result.leadId);
      } else {
        console.error('❌ Error creating lead from form:', result.error);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('❌ Error processing form submission:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}









