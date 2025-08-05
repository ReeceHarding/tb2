import dynamic from 'next/dynamic';

const AIExperienceClient = dynamic(
  () => import('./AIExperienceClient'),
  { 
    ssr: false,
    loading: () => <AIExperienceLoader />
  }
);

export const revalidate = 0;

// Clean loading skeleton
function AIExperienceLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center font-cal">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
          <div className="w-full h-full border-2 border-timeback-primary border-t-timeback-primary rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-timeback-primary mb-2 font-cal">Preparing Your Experience</h2>
        <p className="text-timeback-primary font-cal">Loading AI capabilities...</p>
      </div>
    </div>
  );
}

export default function AIExperiencePage() {
  return <AIExperienceClient />;
}