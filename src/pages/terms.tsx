import React from 'react';
import Head from 'next/head';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | InternArea</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms and Conditions</h1>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>Welcome to InternArea. By accessing our platform, you agree to these terms.</p>
            <h2 className="text-xl font-bold mt-6 mb-2">1. Usage Policy</h2>
            <p>You agree to use our platform responsibly. Spamming, fake applications, and malicious behavior will lead to an immediate ban.</p>
            <h2 className="text-xl font-bold mt-6 mb-2">2. Liability</h2>
            <p>We are a facilitator connecting students and companies. We do not guarantee employment or internship placement.</p>
          </div>
        </div>
      </div>
    </>
  );
}
