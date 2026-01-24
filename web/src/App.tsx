import { useState, useEffect } from "react";
import { ForwarderItem } from "./components/ForwarderItem";
import { Settings } from "lucide-react";

interface Forwarder {
  alias: string;
  destinations: string[];
  email: string;
  [key: string]: any;
}

function App() {
  const [domain, setDomain] = useState("");
  const [forwarders, setForwarders] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Token state
  const [storedToken, setStoredToken] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mxroute_api_token");
    if (token) {
      setStoredToken(token);
    } else {
      setShowTokenInput(true);
    }
  }, []);

  const handleSaveToken = (token: string) => {
    setStoredToken(token);
    localStorage.setItem("mxroute_api_token", token);
    setShowTokenInput(false);
  };

  const getHeaders = () => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;
    return headers;
  };

  const fetchList = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/list/${domain}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401)
          throw new Error("Unauthorized: Invalid API Token");
        throw new Error(`Error: ${res.statusText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setForwarders(data);
      } else {
        console.warn("Received non-array data:", data);
        setForwarders([]);
        setError("Received unexpected data format");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch(`/api/delete/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || res.statusText);
      }

      setForwarders((prev) => prev.filter((item) => item.email !== email));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Failed to delete: ${err.message}`);
      } else {
        alert("Failed to delete");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            MXRoute Bitwarden Plugin
          </h1>
          <button
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            title="API Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {showTokenInput && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              API Configuration
            </h2>
            <div className="flex gap-4">
              <input
                type="password"
                placeholder="Enter Server API Token"
                value={storedToken}
                onChange={(e) => setStoredToken(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSaveToken(storedToken)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Save
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This token is saved in your browser's local storage.
            </p>
          </div>
        )}

        <form
          onSubmit={fetchList}
          className="bg-white p-6 rounded-lg shadow-md mb-8 flex gap-4"
        >
          <input
            type="text"
            placeholder="Enter domain (e.g. example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Loading..." : "Fetch List"}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">Forwarders</h2>
          </div>
          {forwarders.length === 0 ? (
            <div className="p-6 text-gray-500 text-center">
              No forwarders found (or none fetched yet).
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {forwarders.map((item, idx) => (
                <ForwarderItem
                  key={item.email || idx}
                  email={item.email}
                  destinations={item.destinations}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
