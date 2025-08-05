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
            <h3 className="text-lg font-semibold text-timeback-primary mb-2 font-cal">🔧 Setup Status</h3>
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
            <h3 className="text-2xl font-bold text-timeback-primary mb-4 font-cal">🚀 Next Steps to See Your Images</h3>
            
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
              <h4 className="font-semibold text-timeback-primary mb-2 font-cal">📊 What You&lsquo;ll See After Setup:</h4>
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