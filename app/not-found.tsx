import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-timeback-bg to-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-timeback-primary font-cal mb-4">404</h1>
        <h2 className="text-2xl font-bold text-timeback-primary font-cal mb-4">Page Not Found</h2>
        <p className="text-timeback-primary opacity-75 font-cal mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="bg-timeback-primary text-white px-6 py-3 rounded-xl font-cal hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}