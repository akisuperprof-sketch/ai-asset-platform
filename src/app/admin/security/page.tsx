import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security & Operations - ASSETNINJA Admin',
  robots: { index: false, follow: false },
};

export default function SecurityDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Security & Operations</h1>
          <p className="text-gray-400">System protection, rate limits, and kill switches status.</p>
        </div>
        <div className="space-x-4">
          <Link href="/admin/studio" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Studio
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Kill Switches (ENV)</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
              <span className="text-gray-300">Download API</span>
              <span className={`px-3 py-1 rounded text-xs font-medium ${process.env.DOWNLOAD_ENABLED !== 'false' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {process.env.DOWNLOAD_ENABLED !== 'false' ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
              <span className="text-gray-300">QA Audit API</span>
              <span className={`px-3 py-1 rounded text-xs font-medium ${process.env.QA_AUDIT_ENABLED !== 'false' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {process.env.QA_AUDIT_ENABLED !== 'false' ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
              <span className="text-gray-300">Search Tracking</span>
              <span className={`px-3 py-1 rounded text-xs font-medium ${process.env.SEARCH_TRACKING_ENABLED !== 'false' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {process.env.SEARCH_TRACKING_ENABLED !== 'false' ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
              <span className="text-gray-300">Generation API (TBD)</span>
              <span className={`px-3 py-1 rounded text-xs font-medium ${process.env.GENERATE_ENABLED !== 'false' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {process.env.GENERATE_ENABLED !== 'false' ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Managed via Vercel Environment Variables.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Protection Policies</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Download Abuse Guard:</strong> 10/min, 60/hr, 200/day. Bot UAs blocked.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Search Spam Guard:</strong> 20/min. XSS characters blocked. Length limited.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Admin Guard:</strong> 30/min. D_STRATEGY_KEY strictly enforced.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Gemini Cost Guard:</strong> 5/min. Prevents runaway QA audit charges.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Security Headers:</strong> X-Frame-Options, X-Content-Type-Options active.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
