import { Metadata } from 'next';
import { LegalNav } from '@/components/legal/LegalNav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AssetNinja Copyright Policy',
  description: 'Copyright and DMCA policy for AssetNinja.',
};

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-ninja-black pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-[900px] mx-auto bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-xl">
        
        <LegalNav />
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Copyright Policy
        </h1>
        <p className="text-zinc-400 mb-12">Last Updated: June 2026</p>

        <div className="space-y-6 text-zinc-300 leading-relaxed">
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4">1. Copyright Information</h2>
          <p>AssetNinja provides free PNG assets for both personal and commercial use. While we strive to ensure all content is safe for use, we respect the intellectual property rights of others.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">2. AI Generated Content Notice</h2>
          <p>Many of the assets on AssetNinja are generated or enhanced using Artificial Intelligence (AI) models. Because of the nature of AI generation, it is possible that generated outputs may inadvertently resemble existing copyrighted works.</p>
          <p>AssetNinja does not claim absolute copyright ownership over raw AI-generated outputs, but we maintain rights over our curation, background removal processes, layout, and database structure.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">3. DMCA Process</h2>
          <p>We comply with the Digital Millennium Copyright Act (DMCA). If you believe that your copyrighted work has been copied or used on our platform in a way that constitutes copyright infringement, please submit a formal takedown request.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">4. Takedown Requests</h2>
          <p>To submit a takedown request, please provide the following information via our <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">Contact Page</Link>:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2 text-zinc-400">
            <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing, including the specific URL on AssetNinja.</li>
            <li>Your contact information (name, address, telephone number, and email).</li>
            <li>A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
          </ul>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">5. Counter Notice</h2>
          <p>If you believe your content was removed by mistake or misidentification, you may submit a counter-notice containing your contact information, identification of the removed material, a statement under penalty of perjury that you have a good faith belief the removal was a mistake, and your consent to jurisdiction.</p>

          <hr className="border-white/10 my-12" />

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">6. Intellectual Property Rights</h2>
          <p>The AssetNinja brand, logo, website design, and code are the exclusive property of AssetNinja and may not be copied or reproduced without permission.</p>

        </div>
      </div>
    </div>
  );
}
