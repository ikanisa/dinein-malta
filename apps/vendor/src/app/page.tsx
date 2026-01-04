'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorHome() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <p className="text-white">Redirecting to login...</p>
    </div>
  );
}
