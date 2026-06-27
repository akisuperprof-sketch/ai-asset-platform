"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAutoFactoryPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock or fetch initial data
    setStats({
      approvedTotal: 100, // Replace with real fetch
      target: 1000,
      todayGenerated: 0,
      todayApproved: 0,
      todayFailed: 0,
      qaPassRate: "0%",
      queueCount: 0,
      isEnabled: false,
      dailyTarget: 30
    });
    setLoading(false);
  }, []);

  const handleManualRun = async (theme: string) => {
    if (!theme) return;
    alert(`Triggering Bulk Planner for theme: ${theme}`);
    try {
      await fetch('/api/admin/bulk-planner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-agent-token': 'temp-agent-token-123' },
        body: JSON.stringify({ theme })
      });
      alert('Bulk Planner triggered successfully!');
    } catch (e) {
      alert('Error triggering bulk planner');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Auto Factory (1000 Assets Goal)</h1>
        <Link href="/admin" className="text-blue-500 hover:underline">Back to Admin</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm font-semibold uppercase">Progress to 1000</h2>
          <p className="text-3xl font-bold">{stats.approvedTotal} / {stats.target}</p>
          <div className="w-full bg-gray-200 h-2 mt-4 rounded">
            <div className="bg-blue-500 h-2 rounded" style={{ width: `${Math.min(100, (stats.approvedTotal/stats.target)*100)}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm font-semibold uppercase">Today Approved</h2>
          <p className="text-3xl font-bold">{stats.todayApproved}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
          <h2 className="text-gray-500 text-sm font-semibold uppercase">Queue Status</h2>
          <p className="text-3xl font-bold">{stats.queueCount} items</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Factory Settings</h2>
        <div className="flex items-center space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Master Switch</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md border" defaultValue="off">
              <option value="on">ON (Auto Generating)</option>
              <option value="off">OFF (Paused)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Target</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md border" defaultValue="30">
              <option value="10">10 Assets / Day</option>
              <option value="30">30 Assets / Day</option>
              <option value="50">50 Assets / Day</option>
              <option value="100">100 Assets / Day</option>
            </select>
          </div>
          <div className="pt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Settings</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Manual Operations</h2>
        <div className="space-y-4">
          <div className="flex space-x-4 items-center">
            <input id="theme-input" type="text" placeholder="e.g. dog, business, arrow" className="border rounded px-3 py-2 w-64" />
            <button 
              onClick={() => {
                const val = (document.getElementById('theme-input') as HTMLInputElement).value;
                handleManualRun(val);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Trigger Bulk Planner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
