'use client';

import MarketingImageGallery from '@/components/MarketingImageGallery';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestGalleryPage() {
  return (
    <div className="min-h-screen bg-timeback-bg">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 font-cal">
          <h1 className="text-4xl font-bold text-timeback-primary mb-4 font-cal">
            📸 Brand-Safe Marketing Gallery Test
          </h1>
          <p className="text-xl text-timeback-primary max-w-3xl mx-auto mb-8 font-cal">
            Testing our marketing images component with your 121 brand-safe images from Alpha Schools and other institutions.
          </p>
          
          <div className="bg-timeback-bg border border-timeback-primary rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-timeback-primary mb-2 font-cal flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Setup Status
        </h3>
            <div className="text-left space-y-2 text-sm font-cal">
              <div className="flex items-center">
                <span className="w-4 h-4 bg-timeback-bg rounded-full mr-3"></span>
                <span>Database tables need to be created in Supabase</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-timeback-bg rounded-full mr-3"></span>
                <span>121 images need to be uploaded to Supabase Storage</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-timeback-bg rounded-full mr-3"></span>
                <span>Gallery component is ready and integrated</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Marketing Image Gallery Component */}
        <div className="max-w-7xl mx-auto">
          <MarketingImageGallery 
            maxImages={20}
            showFilters={true}
            className="bg-white rounded-2xl shadow-2xl p-8"
          />
        </div>

        <div className="text-center mt-16 font-cal">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Next Steps to See Your Images
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 text-left font-cal">
              <div className="border border-timeback-primary rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <span className="w-8 h-8 bg-timeback-bg text-timeback-primary rounded-full flex items-center justify-center text-sm font-bold mr-3 font-cal">1</span>
                  <h4 className="font-semibold font-cal">Database Setup</h4>
                </div>
                <p className="text-sm text-timeback-primary font-cal">
                  Run the SQL schema in your Supabase dashboard to create the marketing_images tables.
                </p>
              </div>
              
              <div className="border border-timeback-primary rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <span className="w-8 h-8 bg-timeback-bg text-timeback-primary rounded-full flex items-center justify-center text-sm font-bold mr-3 font-cal">2</span>
                  <h4 className="font-semibold font-cal">Upload Images</h4>
                </div>
                <p className="text-sm text-timeback-primary font-cal">
                  Run `npm run setup-marketing-images` to upload all 121 brand-safe images.
                </p>
              </div>
              
              <div className="border border-timeback-primary rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <span className="w-8 h-8 bg-timeback-bg text-timeback-primary rounded-full flex items-center justify-center text-sm font-bold mr-3 font-cal">3</span>
                  <h4 className="font-semibold font-cal">See Results</h4>
                </div>
                <p className="text-sm text-timeback-primary font-cal">
                  Refresh this page to see your 121 professional marketing images in action!
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-timeback-bg border border-timeback-primary rounded-xl">
              <h4 className="font-semibold text-timeback-primary mb-2 font-cal flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                What You&lsquo;ll See After Setup:
              </h4>
              <ul className="text-sm text-timeback-primary space-y-1 font-cal">
                <li>• 79 images from Alpha School Austin (Stock Images, Event Flyers, Brand Assets)</li>
                <li>• 11 images from Alpha School Brownsville (CampBTX materials)</li>
                <li>• 10 images from GT School (GAACC Gala, Showcases, Signage)</li>
                <li>• Professional logos, social media graphics, business materials</li>
                <li>• Full-screen modal viewer with download functionality</li>
                <li>• Filter by school type, category, and content type</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}