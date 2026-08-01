import React from 'react';
import Head from 'next/head';

export default function Careers() {
  return (
    <>
      <Head>
        <title>Careers | InternArea</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Careers at InternArea</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>Join our mission to empower students globally. We are always looking for passionate individuals to join our team.</p>
            <p>Currently, there are no open positions. Please check back later or send your resume to <strong>careers@internarea.example.com</strong>.</p>
          </div>
        </div>
      </div>
    </>
  );
}
