import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";

function SubmissionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosClient.get(`/solve/submissions/user?limit=50`);
        setItems(Array.isArray(data.submissions) ? data.submissions : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return "text-white/60";
    const s = status.toLowerCase();
    if (s === "accepted" || s === "success") return "text-emerald-400";
    if (s === "wrong answer" || s === "wrong") return "text-rose-400";
    if (s === "pending" || s === "processing") return "text-amber-400";
    if (s.includes("error") || s.includes("failed")) return "text-rose-400";
    return "text-white/60";
  };

  const formatLanguage = (lang) => {
    if (!lang) return "N/A";
    return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
  };

  if (loading) return <div className="p-6 text-white/70">Loading...</div>;

  return (
    <div className="text-white">
      <h2 className="text-xl font-semibold mb-4">Your Submissions</h2>
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
        <div className="bg-white/5 px-4 py-3 text-sm text-white/70 border-b border-white/10">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium">
            <div className="col-span-4">Problem</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Runtime</div>
            <div className="col-span-2">Memory</div>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {items.map((s) => (
            <div
              key={s._id}
              className="px-4 py-3 hover:bg-white/5 transition cursor-pointer"
              onClick={() => setSelectedSubmission(selectedSubmission === s._id ? null : s._id)}
            >
              <div className="grid grid-cols-12 gap-4 text-sm items-center">
                <div className="col-span-4">
                  {s.problemId?.title ? (
                    <Link
                      to={`/problem/${s.problemId._id || s.problemId}`}
                      className="text-emerald-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {s.problemId.title}
                    </Link>
                  ) : (
                    <span className="text-white/60">Problem {s.problemId || "N/A"}</span>
                  )}
                </div>
                <div className="col-span-2 text-white/70">{formatLanguage(s.language)}</div>
                <div className={`col-span-2 font-medium capitalize ${getStatusColor(s.status)}`}>
                  {s.status || "Pending"}
                </div>
                <div className="col-span-2 text-white/70">
                  {s.runTime ? `${s.runTime} ms` : s.status === "pending" ? "..." : "N/A"}
                </div>
                <div className="col-span-2 text-white/70">
                  {s.memoryUsed ? `${s.memoryUsed} KB` : s.status === "pending" ? "..." : "N/A"}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedSubmission === s._id && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/60">Submitted:</span>
                      <span className="ml-2 text-white/80">
                        {new Date(s.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Test Cases:</span>
                      <span className="ml-2 text-white/80">
                        {s.testcasePassed || 0}/{s.totalTestcases || 0}
                      </span>
                    </div>
                  </div>
                  {s.compilerErrors && (
                    <div>
                      <span className="text-white/60">Compiler Errors:</span>
                      <pre className="mt-1 p-2 bg-rose-400/10 border border-rose-400/20 rounded text-rose-300 whitespace-pre-wrap">
                        {s.compilerErrors}
                      </pre>
                    </div>
                  )}
                  {s.code && (
                    <div>
                      <span className="text-white/60">Code:</span>
                      <pre className="mt-1 p-2 bg-white/5 border border-white/10 rounded text-white/80 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {s.code}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-4 py-10 text-white/60 text-center">No submissions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionsPage;


