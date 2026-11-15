import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import { blankRecord, courses, formatDate, loadRecords, saveRecords, statuses } from './records.js';
import './styles.css';

const filters = [
  { key: 'all', label: 'Tüm çalışmalar' },
  ...Object.entries(statuses).map(([key, label]) => ({ key, label })),
];

function StatusPill({ status }) {
  return <span className={'status-pill ' + status}><span className="status-dot" />{statuses[status]}</span>;
}

function Modal({ label, close, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <div className="dialog-content">
        {children}
      </div>
    </dialog>
  );
}

function RecordForm({ record, save, close }) {
  const [draft, setDraft] = useState(() => record ?? blankRecord());
  const [titleError, setTitleError] = useState('');
  const heading = record ? 'Çalışmayı düzenle' : 'Yeni çalışma';

  function update(event) {
    const { name, value } = event.target;
    if (name === 'title') setTitleError('');
    setDraft({ ...draft, [name]: value });
  }

  function submit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (title === '') {
      setTitleError('Çalışma başlığını yaz.');
      event.currentTarget.elements.title.focus();
      return;
    }
    save({ ...draft, title, id: draft.id ?? crypto.randomUUID() });
  }

  return (
    <Modal label={heading} close={close}>
      <div className="dialog-heading">
        <h2>{heading}</h2>
        <button type="button" className="close-button" onClick={close} aria-label="Kapat">×</button>
      </div>
      <form className="record-form" onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="record-title">Çalışma başlığı</label>
          <input id="record-title" name="title" autoFocus required maxLength={100} value={draft.title} onChange={update}
            aria-invalid={titleError ? 'true' : undefined} aria-describedby={titleError ? 'title-error' : undefined}
            placeholder="Örn. TaskFlow API taslağı" />
          {titleError && <span id="title-error" className="form-error">{titleError}</span>}
        </div>
        <div className="field-row">
          <div className="form-field">
            <label htmlFor="record-course">Ders</label>
            <select id="record-course" name="course" value={draft.course} onChange={update}>
              {courses.map((course) => <option key={course}>{course}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="record-date">Tarih</label>
            <input id="record-date" name="date" type="date" required value={draft.date} onChange={update} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="record-status">Durum</label>
          <select id="record-status" name="status" value={draft.status} onChange={update}>
            {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={close}>Vazgeç</button>
          <button type="submit" className="primary-button">{record ? 'Değişiklikleri kaydet' : 'Çalışmayı ekle'}</button>
        </div>
      </form>
    </Modal>
  );
}

function RecordsList({ records, edit, remove }) {
  return (
    <ul className="records-list">
      {records.map((record) => (
        <li className="record" key={record.id}>
          <div className="record-title">
            <span className={'course-icon ' + record.course.toLowerCase()} aria-hidden="true"><i /></span>
            <div><strong>{record.title}</strong><span className="inline-course">{record.course}</span></div>
          </div>
          <span className="record-course">{record.course}</span>
          <time dateTime={record.date}>{formatDate(record.date)}</time>
          <div className="record-status"><StatusPill status={record.status} /></div>
          <div className="row-actions">
            <button className="row-button" type="button" onClick={() => edit(record)} aria-label={record.title + ' düzenle'}>Düzenle</button>
            <button className="row-button danger" type="button" onClick={() => remove(record)} aria-label={record.title + ' sil'}>Sil</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [records, setRecords] = useState(loadRecords);
  const [filter, setFilter] = useState('all');
  const [course, setCourse] = useState('all');
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null);
  const [deletion, setDeletion] = useState(null);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);

  const totals = { all: records.length, planned: 0, active: 0, completed: 0 };
  for (const record of records) totals[record.status] += 1;

  const needle = search.trim().toLocaleLowerCase('tr');
  const visible = records.filter((record) => (
    (filter === 'all' || record.status === filter) &&
    (course === 'all' || record.course === course) &&
    record.title.toLocaleLowerCase('tr').includes(needle)
  ));
  const completion = totals.all ? Math.round(totals.completed / totals.all * 100) : 0;

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 3800);
    return () => clearTimeout(timeout);
  }, [notice, records]);

  function commit(next, message) {
    setRecords(next);
    try {
      saveRecords(next);
      setStorageError(false);
      setNotice(message);
    } catch {
      setStorageError(true);
      setNotice('');
    }
  }

  function save(record) {
    const editing = editor.record !== null;
    const next = editing
      ? records.map((existing) => existing.id === record.id ? record : existing)
      : [record, ...records];
    commit(next, editing ? 'Çalışma güncellendi.' : 'Çalışma eklendi.');
    if (!editing || (filter !== 'all' && filter !== record.status)) setFilter('all');
    if (!editing || (course !== 'all' && course !== record.course)) setCourse('all');
    if (!editing || !record.title.toLocaleLowerCase('tr').includes(needle)) setSearch('');
    setEditor(null);
  }

  function remove() {
    commit(records.filter((record) => record.id !== deletion.id), 'Çalışma silindi.');
    setDeletion(null);
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>staj<span>.</span></strong><small>Çalışma Panosu</small></span>
        </div>
        <nav className="status-filters" aria-label="Duruma göre filtrele">
          {filters.map(({ key, label }) => (
            <button className={'nav-filter ' + key} type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
              <span className="nav-indicator" aria-hidden="true" />
              <span>{label}</span>
              <span className="nav-count">{totals[key]}</span>
            </button>
          ))}
        </nav>
        <section className="progress-card" aria-labelledby="progress-title">
          <h2 id="progress-title">Tamamlanma</h2>
          <strong>%{completion}</strong>
          <progress aria-label="Tamamlanma yüzdesi" max="100" value={completion} />
          <span>{totals.completed} / {totals.all} çalışma tamamlandı</span>
        </section>
      </aside>

      <main>
        <header className="page-header">
          <div>
            <h1>Çalışma Panosu</h1>
            <p>Staj çalışmalarını planla ve ilerlemeni takip et.</p>
          </div>
          <button type="button" className="primary-button add-button" onClick={() => setEditor({ record: null })}>
            <span aria-hidden="true">+</span> Yeni çalışma
          </button>
        </header>

        <section aria-label="Çalışma özeti" className="stats">
          {Object.entries(statuses).map(([key, label]) => (
            <div className={'stat ' + key} key={key}>
              <span className="stat-icon" aria-hidden="true"><i /></span>
              <div><span>{label}</span><strong>{totals[key]}</strong></div>
            </div>
          ))}
        </section>

        {storageError && <p className="storage-warning" role="alert">Tarayıcı kaydetme izni vermedi. Bu değişiklikler sayfayı yenileyene kadar kalır.</p>}
        <section className="records-panel" aria-labelledby="records-title">
          <div className="panel-header">
            <div className="panel-title">
              <h2 id="records-title">{filter === 'all' ? 'Çalışmalar' : statuses[filter]}</h2>
              <span>{visible.length} kayıt</span>
            </div>
            <div className="tools">
              <label className="search-box">
                <span aria-hidden="true" />
                <input type="search" aria-label="Çalışma ara" placeholder="Çalışma ara" value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
              <select aria-label="Derse göre filtrele" value={course} onChange={(event) => setCourse(event.target.value)}>
                <option value="all">Tüm dersler</option>
                {courses.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
          {visible.length ? (
            <>
              <div className="table-header" aria-hidden="true">
                <span>Çalışma</span><span>Ders</span><span>Tarih</span><span>Durum</span><span>İşlemler</span>
              </div>
              <RecordsList records={visible} edit={(record) => setEditor({ record })} remove={setDeletion} />
            </>
          ) : (
            <div className="empty-state">
              <strong>{records.length ? 'Eşleşen çalışma yok' : 'Henüz çalışma yok'}</strong>
              <p>{records.length ? 'Aramayı veya filtreleri değiştir.' : 'İlk kaydını ekleyerek çalışmaya başla.'}</p>
              {records.length > 0 && (
                <button type="button" className="secondary-button" onClick={() => { setFilter('all'); setCourse('all'); setSearch(''); }}>
                  Filtreleri temizle
                </button>
              )}
            </div>
          )}
        </section>
      </main>
      {editor && <RecordForm record={editor.record} save={save} close={() => setEditor(null)} />}
      {deletion && (
        <Modal label="Çalışmayı sil" close={() => setDeletion(null)}>
          <div className="dialog-heading"><h2>Çalışmayı sil</h2></div>
          <p className="delete-message">“{deletion.title}” panodan silinecek.</p>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" autoFocus onClick={() => setDeletion(null)}>Vazgeç</button>
            <button type="button" className="delete-button" onClick={remove}>Sil</button>
          </div>
        </Modal>
      )}
      <div role="status" className={notice ? 'toast visible' : 'toast'}>{notice}</div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
