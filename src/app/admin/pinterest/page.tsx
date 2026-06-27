"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPinterestPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from an API that queries supabase
    // For now, we'll just mock the state or show an empty list
    setLoading(false);
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pinterest Distribution</h1>
        <Link href="/admin" className="text-blue-500 hover:underline">Back to Admin</Link>
      </div>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Scheduled & Draft Pins</h2>
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No pins scheduled yet. Auto Factory will generate drafts automatically.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Image</th>
                <th className="pb-2">Title</th>
                <th className="pb-2">Board</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b">
                  <td className="py-2"><img src={post.pin_url} alt="" className="w-16 h-16 object-cover rounded" /></td>
                  <td className="py-2">{post.title}</td>
                  <td className="py-2">{post.board_name}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">{post.status}</span>
                  </td>
                  <td className="py-2">
                    <button className="text-blue-500 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
