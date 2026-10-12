import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!stats) return <p>Loading...</p>;

  const cards = [
    ['Total Books', stats.totalBooks, 'blue'],
    ['Students', stats.totalStudents, 'green'],
    ['Books Issued', stats.issuedBooks, 'orange'],
    ['Overdue', stats.overdueBooks, 'red'],
    ['Fines Collected', `₹${Number(stats.finesCollected).toFixed(2)}`, 'purple'],
  ];

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        {cards.map(([label, value, color]) => (
          <div key={label} className={`stat ${color}`}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
