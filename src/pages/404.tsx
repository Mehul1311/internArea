import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">404</h1>
      <div className="bg-[#FF6A3D] px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <button className="mt-8">
        <Link
          href="/"
          className="relative inline-block text-sm font-medium text-[#FF6A3D] group active:text-orange-500 focus:outline-none focus:ring"
        >
          <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] group-hover:translate-y-0 group-hover:translate-x-0"></span>
          <span className="relative block px-8 py-3 bg-[#1A2238] border border-current">
            <div className="flex items-center gap-2 text-white">Go Home</div>
          </span>
        </Link>
      </button>
    </div>
  );
}
