import { Metadata } from 'next';
import { LegalNav } from '@/components/legal/LegalNav';
import { ContactButton } from './ContactButton';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact AssetNinja',
  description: 'Get in touch with the AssetNinja support team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-ninja-black pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-[900px] mx-auto bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-xl">
        
        <LegalNav />
        
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Contact AssetNinja
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Have a question, feedback, or a DMCA request? We&apos;re here to help.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-12">
            <div className="flex items-start gap-4 text-amber-200/80 mb-6">
              <AlertCircle className="w-6 h-6 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-400 mb-2">Please check our FAQ first</h3>
                <p className="text-sm leading-relaxed">
                  Many common questions regarding licensing, commercial use, and downloading are already answered below or in our legal policies. To save your time, we kindly ask you to review them before submitting a ticket.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-amber-500/10 pt-6">
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Can I use AssetNinja images for commercial purposes?</h4>
                <p className="text-zinc-400 text-sm">Yes. All PNG images can be used for both personal and commercial projects without attribution. See our <a href="/terms" className="text-amber-400 hover:text-amber-300 underline">Terms of Use</a>.</p>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Are there any download limits?</h4>
                <p className="text-zinc-400 text-sm">Currently, there are no hard limits. However, we employ advertising (like PopAds and AdMax) to support our servers. See our <a href="/privacy" className="text-amber-400 hover:text-amber-300 underline">Privacy Policy</a> regarding tracking.</p>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">How can I report a DMCA or copyright issue?</h4>
                <p className="text-zinc-400 text-sm">Please follow the instructions in our <a href="/copyright" className="text-amber-400 hover:text-amber-300 underline">Copyright Policy</a> to submit a takedown request.</p>
              </div>
            </div>
          </div>

          <div className="text-center bg-black/30 border border-white/5 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
            <h3 className="text-xl font-bold text-white mb-4">Ready to reach out?</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Contact form coming soon. Please use the contact button below.
            </p>
            <ContactButton />
          </div>
        </div>

      </div>
    </div>
  );
}
