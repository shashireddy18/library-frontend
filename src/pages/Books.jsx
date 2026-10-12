import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import Modal from '../components/Modal.jsx';

const empty = { title: '', author: '', isbn: '', category: '', totalCopies: 1 };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const load = async (query = q) => {
    try {
      const { data } = await api.get('/books', { params: query ? { q: query } : {} });
      setBooks(data);
      setError('');
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => { load(''); }, []);

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = { ...form, totalCopies: Number(form.totalCopies) };
    try {
      if (form.id) await api.put(`/books/${form.id}`, payload);
      else await api.post('/books', payload);
      setForm(null);
      load();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    try {
      await api.delete(`/books/${b.id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <h2>Books</h2>
        <div className="row">
          <input placeholder="Search title, author, ISBN" value={q}
                 onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />
          <button className="btn" onClick={() => { setFormError(''); setForm(empty); }}>+ Add Book</button>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Title</th><th>Author</th><th>ISBN</th><th>Category</th><th>Available</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td><td>{b.author}</td><td>{b.isbn}</td><td>{b.category}</td>
                <td><span className={`badge ${b.availableCopies > 0 ? 'ok' : 'bad'}`}>{b.availableCopies}</span></td>
                <td>{b.totalCopies}</td>
                <td className="actions">
                  <button className="btn small" onClick={() => { setFormError(''); setForm(b); }}>Edit</button>
                  <button className="btn small danger" onClick={() => remove(b)}>Delete</button>
                </td>
              </tr>
            ))}
            {books.length === 0 && <tr><td colSpan="7" className="muted center">No books found</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form.id ? 'Edit Book' : 'Add Book'} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            {formError && <div className="alert error">{formError}</div>}
            <label>Title</label>
            <input value={form.title} onChange={set('title')} required />
            <label>Author</label>
            <input value={form.author} onChange={set('author')} required />
            <label>ISBN</label>
            <input value={form.isbn} onChange={set('isbn')} required />
            <label>Category</label>
            <input value={form.category || ''} onChange={set('category')} />
            <label>Total copies</label>
            <input type="number" min="1" value={form.totalCopies} onChange={set('totalCopies')} required />
            <button className="btn">{form.id ? 'Update' : 'Save'}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
