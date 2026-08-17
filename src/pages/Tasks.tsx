import { useState } from 'react'
import { useApp } from '../store'
import type { Task, Priority, TaskStatus } from '../types'

const PRIORITIES: Priority[] = ['high', 'medium', 'low']
const PRIORITY_COLORS: Record<Priority, string> = { high: '#ec407a', medium: '#fb8c00', low: '#43a047' }
const PRIORITY_BG: Record<Priority, string> = { high: 'rgba(236,64,122,0.08)', medium: 'rgba(251,140,0,0.08)', low: 'rgba(67,160,71,0.08)' }
const PRIORITY_LABELS: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const CATEGORIES = ['Work', 'Study', 'Personal', 'Health', 'Creative', 'Other']

const EMPTY_FORM = {
  title: '', description: '', priority: 'medium' as Priority,
  category: '', estimatedPomodoros: 2, status: 'todo' as TaskStatus, tags: [] as string[],
}

export default function Tasks() {
  const { data, addTask, updateTask, deleteTask, setActiveTask } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const [tagInput, setTagInput] = useState('')

  const filtered = data.tasks.filter(t => filter === 'all' || t.status === filter)
  const activeTask = data.activeTaskId

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(true) }
  const openEdit = (task: Task) => {
    setForm({ title: task.title, description: task.description ?? '', priority: task.priority, category: task.category ?? '', estimatedPomodoros: task.estimatedPomodoros, status: task.status, tags: task.tags ?? [] })
    setEditId(task.id); setShowForm(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    if (editId) {
      updateTask(editId, { title: form.title.trim(), description: form.description.trim() || undefined, priority: form.priority, category: form.category || undefined, estimatedPomodoros: form.estimatedPomodoros, status: form.status, tags: form.tags })
    } else {
      addTask({ title: form.title.trim(), description: form.description.trim() || undefined, priority: form.priority, category: form.category || undefined, estimatedPomodoros: form.estimatedPomodoros, status: form.status, tags: form.tags })
    }
    setShowForm(false); setEditId(null)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }))
    setTagInput('')
  }

  const counts = { all: data.tasks.length, todo: data.tasks.filter(t => t.status === 'todo').length, inProgress: data.tasks.filter(t => t.status === 'inProgress').length, completed: data.tasks.filter(t => t.status === 'completed').length }

  const inputStyle: React.CSSProperties = { width: '100%', background: '#faf7f4', border: '1.5px solid rgba(126,87,194,0.15)', borderRadius: '10px', padding: '10px 14px', color: '#1a1028', fontFamily: 'Outfit', fontSize: '14px', outline: 'none' }

  return (
    <div className="animate-fade-up" style={{ padding: '28px 24px 100px', maxWidth: '720px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces', fontSize: '32px', fontWeight: '400', color: '#1a1028' }}>Tasks</h1>
          <p style={{ fontSize: '14px', color: '#a08ccc', marginTop: '4px' }}>{counts.completed} completed · {counts.todo + counts.inProgress} remaining</p>
        </div>
        <button onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #7e57c2, #ec407a)', border: 'none', borderRadius: '12px', padding: '10px 18px', color: 'white', fontSize: '14px', fontFamily: 'Outfit', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(126,87,194,0.3)', transition: 'opacity 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Task
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['all', 'todo', 'inProgress', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontFamily: 'Outfit', fontWeight: filter === f ? '600' : '400', border: `1.5px solid ${filter === f ? '#7e57c2' : 'rgba(126,87,194,0.15)'}`, background: filter === f ? 'rgba(126,87,194,0.1)' : 'white', color: filter === f ? '#7e57c2' : '#a08ccc', cursor: 'pointer', transition: 'all 0.2s' }}>
            {f === 'all' ? `All (${counts.all})` : f === 'todo' ? `Todo (${counts.todo})` : f === 'inProgress' ? `In Progress (${counts.inProgress})` : `Done (${counts.completed})`}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #f3efff, #fce8f3)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>✦</p>
            <p style={{ fontFamily: 'Fraunces', fontSize: '18px', color: '#5c3d99', marginBottom: '6px' }}>{filter === 'completed' ? 'Nothing completed yet' : 'No tasks here'}</p>
            <p style={{ fontSize: '14px', color: '#a08ccc' }}>{filter === 'all' ? 'Add your first task to get started.' : 'Try a different filter.'}</p>
          </div>
        )}

        {filtered.map(task => (
          <div key={task.id} className="card transition-all duration-200"
            style={{ padding: '15px 18px', opacity: task.status === 'completed' ? 0.65 : 1, border: activeTask === task.id ? '1.5px solid rgba(126,87,194,0.4)' : '1px solid rgba(126,87,194,0.1)', background: activeTask === task.id ? 'rgba(126,87,194,0.03)' : 'white' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

              {/* Checkbox */}
              <button onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' })}
                style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', borderRadius: '50%', border: `2px solid ${task.status === 'completed' ? '#43a047' : 'rgba(126,87,194,0.25)'}`, background: task.status === 'completed' ? 'rgba(67,160,71,0.12)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.25s' }}>
                {task.status === 'completed' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#43a047" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </button>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '15px', color: '#1a1028', fontWeight: '600', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</p>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: PRIORITY_COLORS[task.priority] }} />
                  {task.category && <span style={{ fontSize: '11px', color: '#7e57c2', background: 'rgba(126,87,194,0.08)', borderRadius: '99px', padding: '2px 9px', fontWeight: '500' }}>{task.category}</span>}
                  {task.status === 'inProgress' && <span style={{ fontSize: '11px', color: '#fb8c00', background: 'rgba(251,140,0,0.1)', borderRadius: '99px', padding: '2px 9px', fontWeight: '600' }}>In Progress</span>}
                </div>
                {task.description && <p style={{ fontSize: '13px', color: '#a08ccc', marginTop: '4px', lineHeight: 1.5 }}>{task.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {task.estimatedPomodoros > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: task.estimatedPomodoros }).map((_, i) => (
                          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < task.completedPomodoros ? '#7e57c2' : 'rgba(126,87,194,0.15)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', color: '#a08ccc', fontFamily: 'DM Mono' }}>{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                    </div>
                  )}
                  {task.tags?.map(tag => (
                    <span key={tag} style={{ fontSize: '11px', color: '#ec407a', background: 'rgba(236,64,122,0.07)', borderRadius: '99px', padding: '2px 9px' }}>#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button onClick={() => setActiveTask(activeTask === task.id ? null : task.id)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1.5px solid ${activeTask === task.id ? 'rgba(126,87,194,0.5)' : 'rgba(126,87,194,0.15)'}`, background: activeTask === task.id ? 'rgba(126,87,194,0.1)' : 'white', color: activeTask === task.id ? '#7e57c2' : '#c4b0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  title="Focus on this">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </button>
                <button onClick={() => openEdit(task)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.15)', background: 'white', color: '#c4b0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#7e57c2')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#c4b0e0')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button onClick={() => deleteTask(task.id)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.15)', background: 'white', color: '#c4b0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ec407a'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,64,122,0.35)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#c4b0e0'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(126,87,194,0.15)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6 M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(26,16,40,0.35)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="animate-slide-in" style={{ width: '100%', maxWidth: '520px', borderRadius: '24px', padding: '28px', marginBottom: '16px', background: 'white', boxShadow: '0 24px 64px rgba(126,87,194,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Fraunces', fontSize: '22px', color: '#1a1028', fontWeight: '400' }}>{editId ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowForm(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid rgba(126,87,194,0.2)', background: 'transparent', color: '#a08ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input placeholder="Task title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#7e57c2')} onBlur={e => (e.target.style.borderColor = 'rgba(126,87,194,0.15)')} />

              <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#7e57c2')} onBlur={e => (e.target.style.borderColor = 'rgba(126,87,194,0.15)')} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#a08ccc', marginBottom: '6px', fontWeight: '500' }}>Priority</p>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {PRIORITIES.map(p => (
                      <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                        style={{ flex: 1, padding: '7px 0', borderRadius: '9px', fontSize: '12px', border: `1.5px solid ${form.priority === p ? PRIORITY_COLORS[p] : 'rgba(126,87,194,0.12)'}`, background: form.priority === p ? PRIORITY_BG[p] : 'white', color: form.priority === p ? PRIORITY_COLORS[p] : '#a08ccc', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: form.priority === p ? '600' : '400', transition: 'all 0.2s' }}>
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#a08ccc', marginBottom: '6px', fontWeight: '500' }}>Pomodoros</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setForm(f => ({ ...f, estimatedPomodoros: Math.max(1, f.estimatedPomodoros - 1) }))}
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.15)', background: 'white', color: '#7e57c2', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>−</button>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '18px', color: '#1a1028', minWidth: '24px', textAlign: 'center' }}>{form.estimatedPomodoros}</span>
                    <button onClick={() => setForm(f => ({ ...f, estimatedPomodoros: Math.min(12, f.estimatedPomodoros + 1) }))}
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid rgba(126,87,194,0.15)', background: 'white', color: '#7e57c2', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>+</button>
                  </div>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#a08ccc', marginBottom: '6px', fontWeight: '500' }}>Category</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, category: f.category === c ? '' : c }))}
                      style={{ padding: '5px 13px', borderRadius: '99px', fontSize: '12px', border: `1.5px solid ${form.category === c ? '#7e57c2' : 'rgba(126,87,194,0.15)'}`, background: form.category === c ? 'rgba(126,87,194,0.09)' : 'white', color: form.category === c ? '#7e57c2' : '#a08ccc', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: form.category === c ? '600' : '400', transition: 'all 0.2s' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#a08ccc', marginBottom: '6px', fontWeight: '500' }}>Tags</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '7px' }}>
                  {form.tags.map(tag => (
                    <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ec407a', background: 'rgba(236,64,122,0.08)', borderRadius: '99px', padding: '3px 10px' }}>
                      #{tag}
                      <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a08ccc', fontSize: '13px', lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag + Enter" style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => (e.target.style.borderColor = '#7e57c2')} onBlur={e => (e.target.style.borderColor = 'rgba(126,87,194,0.15)')} />
                  <button onClick={addTag} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(126,87,194,0.1)', border: '1.5px solid rgba(126,87,194,0.2)', color: '#7e57c2', cursor: 'pointer', fontSize: '13px', fontFamily: 'Outfit', fontWeight: '600' }}>Add</button>
                </div>
              </div>

              <button onClick={handleSubmit}
                style={{ marginTop: '4px', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #7e57c2, #ec407a)', border: 'none', color: 'white', fontSize: '15px', fontFamily: 'Outfit', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 16px rgba(126,87,194,0.3)', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {editId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
