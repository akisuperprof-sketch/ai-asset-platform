import { Metadata } from 'next';
import { LegalNav } from '@/components/legal/LegalNav';

export const metadata: Metadata = {
  title: 'AssetNinja Terms of Use',
  description: 'Terms of use for AssetNinja free PNG assets.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ninja-black pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-[900px] mx-auto bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-xl">
        
        <LegalNav />
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
          AssetNinja Terms of Use
        </h1>
        <p className="text-zinc-400 mb-12">Last Updated: June 2026</p>

        <div className="space-y-6 text-zinc-300 leading-relaxed">
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Overview</h2>
          <p>Welcome to AssetNinja.</p>
          <p>AssetNinja provides PNG image assets and graphic resources for personal and commercial use under the terms described below.</p>
          <p>By downloading or using any asset from this website, you agree to these Terms of Use.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. Permitted Use</h2>
          <p>You may use AssetNinja assets for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2 text-zinc-400">
            <li>Personal projects</li>
            <li>Commercial projects</li>
            <li>Websites</li>
            <li>Blogs</li>
            <li>Social media content</li>
            <li>Advertising materials</li>
            <li>Presentations</li>
            <li>Printed materials</li>
            <li>Video production</li>
            <li>Mobile applications</li>
            <li>Software products</li>
          </ul>
          <p className="mt-4">No attribution or credit is required.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. Modifications</h2>
          <p>You may:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2 text-zinc-400">
            <li>Edit assets</li>
            <li>Resize assets</li>
            <li>Combine assets</li>
            <li>Modify colors</li>
            <li>Incorporate assets into your own creative works</li>
          </ul>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Prohibited Use</h2>
          <p>You may NOT:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2 text-zinc-400">
            <li>Redistribute the original files</li>
            <li>Resell the original files</li>
            <li>Upload the original files to another stock website</li>
            <li>Create a competing asset library using AssetNinja files</li>
            <li>Offer AssetNinja files for download on another platform</li>
            <li>Claim ownership of the original assets</li>
          </ul>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Intellectual Property</h2>
          <p>All rights not expressly granted remain reserved by AssetNinja.</p>
          <p>Downloading an asset does not transfer ownership of intellectual property rights.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. AI Generated Content</h2>
          <p>Some assets available on AssetNinja may be created or assisted by artificial intelligence technologies.</p>
          <p>While reasonable efforts are made to review content quality and originality, AssetNinja does not guarantee that all assets are free from potential copyright, trademark, or other intellectual property claims.</p>
          <p>Users are responsible for evaluating suitability for their intended use.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">7. Disclaimer</h2>
          <p>All assets are provided &quot;as is&quot; without warranties of any kind.</p>
          <p>AssetNinja shall not be liable for any damages, losses, claims, or expenses arising from the use of assets downloaded from this website.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">8. Service Availability</h2>
          <p>AssetNinja may modify, suspend, or discontinue any part of the service at any time without notice.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">9. Changes to These Terms</h2>
          <p>These Terms of Use may be updated from time to time.</p>
          <p>Continued use of the website constitutes acceptance of any updated terms.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">10. Contact</h2>
          <p>For questions regarding these Terms of Use, please use the Contact page available on this website.</p>

        </div>
      </div>
    </div>
  );
}
