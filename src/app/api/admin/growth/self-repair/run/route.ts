import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const adminToken = request.headers.get('x-agent-token');
    const isValidToken = adminToken === process.env.AGENT_SECRET_TOKEN || adminToken === process.env.ADMIN_API_SECRET;
    if (!isValidToken && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Gather System Status
    const { data: recentAlerts } = await adminClient
      .from('system_alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);
      
    const { data: failedJobs } = await adminClient
      .from('generation_jobs')
      .select('error_message')
      .in('status', ['failed', 'qa_failed'])
      .order('created_at', { ascending: false })
      .limit(10);

    // If everything is healthy, no need for repair
    if ((!recentAlerts || recentAlerts.length === 0) && (!failedJobs || failedJobs.length === 0)) {
       return NextResponse.json({ success: true, message: 'System Healthy. No repairs needed.' });
    }

    // 2. Self Repair Diagnosis (AI)
    const prompt = `You are the Self Repair Engine for AssetNinja (Phase 13-E).
Active System Alerts: ${JSON.stringify(recentAlerts || [])}
Recent Failed Jobs: ${JSON.stringify(failedJobs || [])}

TASK: Diagnose the root cause of these issues and propose a fix.
Output strictly in JSON format:
{
  "component": "cron | gemini | database | unknown",
  "issue_detected": "Brief description of the problem",
  "diagnosis": "Detailed analysis of why it occurred",
  "proposed_fix": "Actionable step to resolve it"
}
No markdown, just raw JSON object.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const diagnosisJson = JSON.parse(cleanText);

      // Save to self_repair_logs
      const { error: dbError } = await adminClient.from('self_repair_logs').insert({
        component: diagnosisJson.component,
        issue_detected: diagnosisJson.issue_detected,
        diagnosis: diagnosisJson.diagnosis,
        proposed_fix: diagnosisJson.proposed_fix
      });

      if (dbError) {
        console.warn("Could not save to self_repair_logs (maybe table is missing):", dbError.message);
      }
      
      // Post to System Alerts if it's critical
      if (recentAlerts && recentAlerts.length > 0) {
        await adminClient.from('system_alerts').insert({
           component: 'Self_Repair_Engine',
           severity: 'warning',
           message: `Self Repair Diagnosis: ${diagnosisJson.proposed_fix}`
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Self Repair Diagnosis completed.',
        diagnosis: diagnosisJson
      });
    }

    throw new Error('Failed to fetch from Gemini');

  } catch (error: any) {
    console.error('Self Repair AI Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
