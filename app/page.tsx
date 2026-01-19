'use client';

import { useState, ChangeEvent } from 'react';
import Link from "next/dist/client/link";

export default function JsonListFinder() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('');
  const searchKey = "favoriteGifs";
  const [results, setResults] = useState<Map<string, string> | null>(null);
  const [error, setError] = useState<string>('');
  const [listKeyName, setListKeyName] = useState<string>('');

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setJsonData(data);
          setFileName(file.name);
          setResults(null);
          setError('');
        } catch (err) {
          setError('Invalid JSON file!');
        }
      };
      reader.readAsText(file);
    }
  };

  const findListInJSON = (obj: any, key: string): any => {
    const search = (current: any): any => {
      if (current === null || current === undefined) return null;

      if (typeof current === 'object') {
        if (current.hasOwnProperty(key)) {
          const value = current[key];
          if (Array.isArray(value) || typeof value === 'object') {
            return value;
          }
        }

        for (const k in current) {
          const result = search(current[k]);
          if (result) return result;
        }
      }
      return null;
    };
    return search(obj);
  };

  const handleSearch = () => {
    if (!jsonData) {
      setError('Please upload a JSON file first!');
      return;
    }

    const key = searchKey.trim();
    if (!key) {
      setError('Could not find any GIFs in the JSON file!');
      return;
    }

    const temp = findListInJSON(jsonData, key);
    const foundList = findListInJSON(temp, "gifs")

    type GifEntry = { src: string };

    if (foundList && typeof foundList === 'object') {
      const gifMap = new Map<string, string>(
        Object.entries(foundList as Record<string, GifEntry>)
          .map(([id, gif]) => [id, gif.src])
      );
      setResults(gifMap);
      setListKeyName(key);
      setError('');
    }
    else {
      setError(`Key "${key}" not found or does not contain a list/array in the JSON file.`);
      setResults(null);
    }
  };

  const openAllGIFs = (results: Map<string, string>) => {
    for (const src of results.values()) {
      window.open(src, '_blank');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-5">
      <div className="max-w-8xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 text-center">
          <h1 className="text-4xl font-bold mb-2">Discord Tenor GIF Exporter</h1>
          <p className="text-purple-100">Upload your user.json file from a discord data package to list and download all tenor GIFs</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-5 mb-7 flex flex-col justify-center items-center">
            <p className="my-0.5 text-gray-600 font-semibold">Due to Tenor shutting down on June 30th, I created this page to be able to quickly find all of your GIFs in an exported discord data package without dealink with ~40k lines of JSON.</p>
            <p className="my-0.5 text-gray-600 font-semibold">1. Your account JSON is located in package/Account/user.json</p>
            <p className="my-0.5 text-gray-600 font-semibold">2. I do not own a tenor API key to be able to serve you a downloadable zip of all GIFs so you need to open each link yourself and save the GIF</p>
            <p className="my-0.5 text-gray-600 font-semibold">3. Even though the user.json file contains some personal infomation, nobody, including me, can access it because the code is processed in your browser and not on the server. (If you still want to check, <a href="https://github.com/SkyKingPX/dc-gif-exporter" target="_blank" className="underline text-purple-600">here's the GitHub repo.</a>)</p>
            <p className="my-0.5 text-gray-600 font-semibold">4. If you use the automatic download function, this will open [insert amount of GIFs saved to your account] tabs immediately so using a desktop device is recommended!</p>
            <p className="my-0.5 text-gray-600 font-semibold">5. The download function will not work until you disable all of your popup blockers and allow the page to open popups</p>
            <p className="my-0.5 text-gray-600 font-semibold">6. If you have any questions, feel free to open an issue on the GitHub repo.</p>
          </div>

          {/* Upload Section */}
          <div
            className={`border-3 border-dashed rounded-lg p-10 text-center mb-8 cursor-pointer transition-all ${
              fileName
                ? 'border-green-500 bg-green-50'
                : 'border-purple-600 hover:bg-purple-50 hover:border-purple-800'
            }`}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              type="file"
              id="fileInput"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div>
              {fileName ? (
                <h2 className="text-2xl font-semibold text-green-700">✅ {fileName} loaded successfully!</h2>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">📁 Click to Upload JSON File</h2>
                  <p className="text-gray-700">or drag and drop</p>
                </>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-8 flex justify-center gap-6">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform"
            >
              Find GIFs
            </button>
            {results && results.size > 0 && (
              <button
                onClick={() => results && openAllGIFs(results)}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 transition-transform"
              >
                Download All GIFs (Will open {results.size} new tabs!)
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 border-l-4 border-red-700">
              ❌ {error}
            </div>
          )}

          {/* Results */}
          {results && results.size > 0 && (
            <div className="mt-8">
              <div className="bg-purple-600 text-white p-4 rounded-t-lg font-semibold text-lg">
                Found {results.size} GIFs
              </div>

              <div className="border-2 border-purple-600 border-t-0 rounded-b-lg overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-16">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      ID (Tenor URL)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      SRC (Fallback if ID fails)
                    </th>
                  </tr>
                  </thead>

                  <tbody>
                  {Array.from(results.entries()).map(([id, src], index) => (
                    <tr
                      key={id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-800 break-all">
                        <Link target="_blank" href={id} className="underline text-purple-600">{id}</Link>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-800 break-all">
                        <Link target="_blank" href={src} className="underline text-purple-600">{src}</Link>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {results && results.size === 0 && (
            <div className="text-center text-gray-500 p-10">
              The list "{listKeyName}" is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}