import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import Modal from '../components/Modal.jsx';

const empty = { name: '', rollNo: '', email: '', department: '', phone: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const load = async (query = q) => {
    try {
      const { data } = await api.get('/students', { params: query ? { q: query } : {} });
      setStudents(data);
      setError('');
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => { load(''); }, []);

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (form.id) await api.put(`/students/${form.id}`, form);
      else await api.post('/students', form);
      setForm(null);
      load();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete student "${s.name}"?`)) return;
    try {
      await api.delete(`/students/${s.id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <h2>Students</h2>
        <div className="row">
          <input placeholder="Search name, roll no, email" value={q}
                 onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />
          <button className="btn" onClick={() => { setFormError(''); setForm(empty); }}>+ Add Student</button>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Roll No</th><th>Email</th><th>Department</th><th>Phone</th><th></th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.rollNo}</td><td>{s.email}</td><td>{s.department}</td><td>{s.phone}</td>
                <td className="actions">
                  <button className="btn small" onClick={() => { setFormError(''); setForm(s); }}>Edit</button>
                  <button className="btn small danger" onClick={() => remove(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan="6" className="muted center">No students found</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form.id ? 'Edit Student' : 'Add Student'} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            {formError && <div className="alert error">{formError}</div>}
            <label>Name</label>
            <input value={form.name} onChange={set('name')} required />
            <label>Roll number</label>
            <input value={form.rollNo} onChange={set('rollNo')} required />
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required />
            <label>Department</label>
            <input value={form.department || ''} onChange={set('department')} />
            <label>Phone</label>
            <input value={form.phone || ''} onChange={set('phone')} />
            <button className="btn">{form.id ? 'Update' : 'Save'}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
