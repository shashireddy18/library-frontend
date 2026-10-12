import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAll = async (status = filter) => {
    try {
      const [i, b, s] = await Promise.all([
        api.get('/issues', { params: { status } }),
        api.get('/books'),
        api.get('/students'),
      ]);
      setIssues(i.data);
      setBooks(b.data);
      setStudents(s.data);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => { loadAll('ALL'); }, []);

  const issueBook = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/issues', { studentId: Number(studentId), bookId: Number(bookId) });
      setSuccess('Book issued successfully');
      setStudentId(''); setBookId('');
      loadAll();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const returnBook = async (id) => {
    setError(''); setSuccess('');
    try {
      const { data } = await api.put(`/issues/${id}/return`);
      setSuccess(Number(data.fine) > 0
        ? `Book returned. Fine to collect: ₹${Number(data.fine).toFixed(2)}`
        : 'Book returned. No fine.');
      loadAll();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const changeFilter = (f) => { setFilter(f); loadAll(f); };

  return (
    <>
      <h2>Issue / Return Books</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form className="card issue-form" onSubmit={issueBook}>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
          <option value="">Select student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
        </select>
        <select value={bookId} onChange={(e) => setBookId(e.target.value)} required>
          <option value="">Select book</option>
          {books.filter((b) => b.availableCopies > 0).map((b) => (
            <option key={b.id} value={b.id}>{b.title} — {b.availableCopies} available</option>
          ))}
        </select>
        <button className="btn">Issue Book</button>
      </form>

      <div className="tabs">
        {['ALL', 'ISSUED', 'RETURNED'].map((f) => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => changeFilter(f)}>
            {f === 'ALL' ? 'All' : f === 'ISSUED' ? 'Issued' : 'Returned'}
          </button>
        ))}
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Book</th><th>Student</th><th>Issued</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {issues.map((r) => (
              <tr key={r.id}>
                <td>{r.bookTitle}</td>
                <td>{r.studentName} <span className="muted">({r.rollNo})</span></td>
                <td>{r.issueDate}</td>
                <td>{r.dueDate}</td>
                <td>{r.returnDate || '—'}</td>
                <td>{Number(r.fine) > 0 ? `₹${Number(r.fine).toFixed(2)}` : '—'}</td>
                <td>
                  <span className={`badge ${r.status === 'RETURNED' ? 'ok' : r.overdueDays > 0 ? 'bad' : 'warn'}`}>
                    {r.status === 'ISSUED' && r.overdueDays > 0 ? `OVERDUE ${r.overdueDays}d` : r.status}
                  </span>
                </td>
                <td>
                  {r.status === 'ISSUED' && (
                    <button className="btn small" onClick={() => returnBook(r.id)}>Return</button>
                  )}
                </td>
              </tr>
            ))}
            {issues.length === 0 && <tr><td colSpan="8" className="muted center">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
