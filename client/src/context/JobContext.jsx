import { createContext, useContext, useState, useCallback } from 'react';

const JobCtx = createContext(null);

const STORAGE_KEY = 'htb_jobs';
const NOTES_KEY = 'htb_notes';

function loadJobs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function JobProvider({ children }) {
  const [jobs, setJobsState] = useState(() => loadJobs());
  const [activeJobId, setActiveJobId] = useState(() => {
    const j = loadJobs();
    return j.length > 0 ? j[0].id : null;
  });
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_KEY) || '');

  const activeJob = jobs.find(j => j.id === activeJobId) || null;

  const addJob = useCallback((name = 'Yeni İş', ip = '') => {
    const job = { id: Date.now().toString(), name, ip, createdAt: new Date().toISOString() };
    setJobsState(prev => {
      const next = [job, ...prev];
      saveJobs(next);
      return next;
    });
    setActiveJobId(job.id);
    return job;
  }, []);

  const updateJob = useCallback((id, patch) => {
    setJobsState(prev => {
      const next = prev.map(j => j.id === id ? { ...j, ...patch } : j);
      saveJobs(next);
      return next;
    });
  }, []);

  const deleteJob = useCallback((id) => {
    setJobsState(prev => {
      const next = prev.filter(j => j.id !== id);
      saveJobs(next);
      if (activeJobId === id) setActiveJobId(next.length > 0 ? next[0].id : null);
      return next;
    });
  }, [activeJobId]);

  const saveNotes = useCallback((text) => {
    setNotes(text);
    localStorage.setItem(NOTES_KEY, text);
  }, []);

  return (
    <JobCtx.Provider value={{ jobs, activeJob, activeJobId, setActiveJobId, addJob, updateJob, deleteJob, notes, saveNotes }}>
      {children}
    </JobCtx.Provider>
  );
}

export const useJobs = () => useContext(JobCtx);
