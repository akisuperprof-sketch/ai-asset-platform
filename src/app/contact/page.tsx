import { Metadata } from 'next';
import { LegalNav } from '@/components/legal/LegalNav';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | AssetNinja',
  description: 'Get in touch with the AssetNinja support team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Contact Support
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Have a question, feedback, or need help with a generated asset? 
            Send us a message and our team will get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">How do I use the generated assets?</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  All downloaded assets come with a transparent background (PNG format) and can be dragged directly into Canva, Photoshop, or your website editor.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Can I request specific asset categories?</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Yes! We prioritize categories based on user demand. Please send us your suggestions using the contact form.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Are the assets free for commercial use?</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Yes, all approved assets are generated for commercial use. Please review our Terms of Use for any specific restrictions regarding redistribution.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <LegalNav />
            </div>
          </div>

          {/* Contact Form Section */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
