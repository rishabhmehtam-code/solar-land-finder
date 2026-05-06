'use client';

import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-slate-50">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">☀️ Solar Land Finder</h1>
                <p className="text-sm text-slate-600 mt-1">Identify viable land parcels for solar farms</p>
              </div>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Open Finder
              </Link>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🗺️</div>
                <h3 className="font-semibold text-slate-900 mb-2">Interactive Map</h3>
                <p className="text-sm text-slate-600">Visualize land parcels near substations with real-time filtering and proximity analysis.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-slate-900 mb-2">Smart Rankings</h3>
                <p className="text-sm text-slate-600">Get 10-20 top parcels ranked by proximity, cost, slope, and grid access factors.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">📥</div>
                <h3 className="font-semibold text-slate-900 mb-2">Export Options</h3>
                <p className="text-sm text-slate-600">Download parcel data as PDF reports, Excel sheets, or KMZ files for Google Earth.</p>
              </div>
            </div>

            <div className="mt-16 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm mb-3">1</div>
                  <h4 className="font-medium text-slate-900 mb-2">Enter Location</h4>
                  <p className="text-sm text-slate-600">Search for a substation or enter latitude/longitude coordinates.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm mb-3">2</div>
                  <h4 className="font-medium text-slate-900 mb-2">Set Parameters</h4>
                  <p className="text-sm text-slate-600">Define search radius, plant capacity (MWAC), and land requirements.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm mb-3">3</div>
                  <h4 className="font-medium text-slate-900 mb-2">View Results</h4>
                  <p className="text-sm text-slate-600">See top parcels on map with details and viability scores.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm mb-3">4</div>
                  <h4 className="font-medium text-slate-900 mb-2">Export & Compare</h4>
                  <p className="text-sm text-slate-600">Download reports and compare top 3 parcels side-by-side.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
    </>
  );
}
