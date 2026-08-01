import React from 'react';
import Head from 'next/head';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | InternArea</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>Your privacy is important to us. This policy outlines how we handle your data.</p>
            <h2 className="text-xl font-bold mt-6 mb-2">1. Data Collection</h2>
            <p>We collect basic information required for your profile, such as your name, email, education, and resume.</p>
            <h2 className="text-xl font-bold mt-6 mb-2">2. Data Usage</h2>
            <p>Your data is used solely to match you with appropriate internship and job opportunities. We do not sell your data to third parties.</p>
          </div>
        </div>
      </div>
    </>
  );
}
