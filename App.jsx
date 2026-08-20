import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Calendar,
  CheckSquare,
  BookOpen,
  Clock,
  DollarSign,
  ArrowRight,
  Circle,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  Users,
  Trash2,
  LogOut,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import Login from "./Login";

const ACCENT = "#5B5FEF";
const ACCENT_BG = "#EEF0FF";
const INK = "#1A1B2E";
const MUTED = "#8A8D9B";
const BORDER = "#ECEDF3";

// ---------------------------------------------------------------------------
// Shared UI bits (same look as the design mockup)
// ---------------------------------------------------------------------------

function StatusPill({ status }) {
  const map = {
    Scheduled: { bg: "#EEF0FF", fg: "#5B5FEF" },
    Completed: { bg: "#EAF7EE", fg: "#1E9E52" },
    Cancelled: { bg: "#FBECEC", fg: "#D14343" },
  };
  const c = map[status] || map.Scheduled;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.fg, whiteSpace: "nowrap" }}>
      <Circle size={6} fill={c.fg} color={c.fg} />
      {status}
    </span>
  );
}

function Card({ children, style }) {
  return <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, ...style }}>{children}</div>;
}

function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: ACCENT, marginBottom: 8 }}>{eyebrow}</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: INK, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ACCENT, color: "#fff", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
      {children}
    </button>
  );
}

const inputStyle = { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, color: INK, boxSizing: "border-box", fontFamily: "inherit" };

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{label}</label>
      {children}
    </div>
  );
}

function FormPanel({ title, onClose, onSubmit, submitLabel, children }) {
  return (
    <Card style={{ padding: 18, marginBottom: 16, background: "#FBFBFE" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: INK, fontSize: 14.5 }}>{title}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex" }}>
          <X size={16} />
        </button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
        <div><PrimaryButton type="submit">{submitLabel}</PrimaryButton></div>
      </form>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: ACCENT_BG, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>
        <Icon size={17} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: INK }}>{value}</div>
      </div>
    </Card>
  );
}

function DateBadge({ date }) {
  const d = new Date(date + "T00:00:00");
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return (
    <div style={{ background: ACCENT_BG, color: ACCENT, borderRadius: 10, width: 52, height: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
      <div style={{ fontSize: 17, lineHeight: 1 }}>{day}</div>
      <div style={{ fontSize: 10, lineHeight: 1, marginTop: 2 }}>{month}</div>
    </div>
  );
}

function EmptyNote({ text }) {
  return <div style={{ border: "1px dashed #D9DAE6", borderRadius: 12, padding: "18px 20px", color: "#B3B5C4", fontSize: 14 }}>{text}</div>;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function OverviewPage({ lessons, homework, vocab, studentName, goTo }) {
  const nextLesson = lessons.find((l) => l.status === "Scheduled");
  const pendingHomework = homework.filter((h) => h.status === "pending").length;
  const recentVocab = [...vocab].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 2);

  return (
    <>
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: ACCENT, marginBottom: 8 }}>YOUR LEARNING WORKSPACE</div>
        <h1 style={{ fontSize: 34, fontWeight: 700, color: INK, margin: 0 }}>Good morning, {studentName.split(" ")[0]}</h1>
        <p style={{ color: MUTED, fontSize: 15, marginTop: 8 }}>A clear view of your next steps and progress.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon={Calendar} label="Next lesson" value={nextLesson ? `${nextLesson.date} · ${nextLesson.time.split("–")[0]}` : "None scheduled"} />
        <StatCard icon={CheckSquare} label="Homework" value={`${pendingHomework} pending`} />
        <StatCard icon={Clock} label="Attendance" value="92%" />
        <StatCard icon={DollarSign} label="Lesson balance" value="See payments" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: ACCENT }}>NEXT UP</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginTop: 4 }}>Your next lesson</div>
            </div>
            <button onClick={() => goTo("lessons")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex" }}>
              <ArrowRight size={18} />
            </button>
          </div>
          {nextLesson ? (
            <div style={{ background: "#F7F8FC", borderRadius: 12, padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
              <DateBadge date={nextLesson.date} />
              <div>
                <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>{nextLesson.title}</div>
                <div style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>{nextLesson.date} · {nextLesson.time}</div>
                <div style={{ marginTop: 8 }}><StatusPill status={nextLesson.status} /></div>
              </div>
            </div>
          ) : (
            <EmptyNote text="No upcoming lessons scheduled yet." />
          )}
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: ACCENT }}>FOCUS</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginTop: 4 }}>Recent vocabulary</div>
            </div>
            <button onClick={() => goTo("vocabulary")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex" }}>
              <BookOpen size={17} />
            </button>
          </div>
          {recentVocab.length ? (
            recentVocab.map((v, i) => (
              <div key={v.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < recentVocab.length - 1 ? "1px solid #F0F1F6" : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, marginTop: 7, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: INK, fontSize: 14 }}>{v.word}</div>
                  <div style={{ color: MUTED, fontSize: 13 }}>{v.translation}</div>
                </div>
              </div>
            ))
          ) : (
            <EmptyNote text="No words added yet." />
          )}
        </Card>
      </div>
    </>
  );
}

function LessonsPage({ lessons, isTeacher, students, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: students?.[0]?.id || "", title: "", date: "", time: "", status: "Scheduled" });
  const list = [...lessons].sort((a, b) => (a.date < b.date ? 1 : -1));
  const studentName = (id) => students?.find((s) => s.id === id)?.name || "—";

  return (
    <>
      <PageHeader
        eyebrow="SCHEDULE"
        title="Lessons"
        subtitle={isTeacher ? "All lessons across your students." : "Everything you've had, and everything coming up."}
        action={isTeacher && <PrimaryButton onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Add lesson</PrimaryButton>}
      />
      {isTeacher && showForm && (
        <FormPanel
          title="Schedule a lesson"
          onClose={() => setShowForm(false)}
          submitLabel="Add lesson"
          onSubmit={() => {
            if (!form.title || !form.date || !form.time) return;
            onAdd(form);
            setForm({ student_id: students?.[0]?.id || "", title: "", date: "", time: "", status: "Scheduled" });
            setShowForm(false);
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Student">
              <select style={inputStyle} value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
              </select>
            </Field>
          </div>
          <Field label="Topic / title">
            <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Conversation practice" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date"><input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <Field label="Time"><input style={inputStyle} placeholder="10:00–11:00" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
          </div>
        </FormPanel>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length ? list.map((l) => (
          <Card key={l.id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <DateBadge date={l.date} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>{l.title}</div>
              <div style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>{isTeacher && <>{studentName(l.student_id)} · </>}{l.date} · {l.time}</div>
            </div>
            <StatusPill status={l.status} />
            {isTeacher && <button onClick={() => onDelete(l.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D9DAE6", display: "flex" }}><Trash2 size={15} /></button>}
          </Card>
        )) : <EmptyNote text="No lessons yet." />}
      </div>
    </>
  );
}

function HomeworkPage({ homework, isTeacher, students, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: students?.[0]?.id || "", title: "", lesson: "", due: "" });
  const pending = homework.filter((h) => h.status === "pending");
  const done = homework.filter((h) => h.status === "done");
  const studentName = (id) => students?.find((s) => s.id === id)?.name || "—";

  const Row = ({ h }) => (
    <Card key={h.id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      {!isTeacher && (
        <button onClick={() => onUpdate(h.id, { status: h.status === "pending" ? "done" : "pending" })} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
          {h.status === "done" ? <CheckCircle2 size={22} color="#1E9E52" /> : <Circle size={22} color="#C7C9D9" />}
        </button>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: h.status === "done" ? "#B3B5C4" : INK, fontSize: 15, textDecoration: h.status === "done" ? "line-through" : "none" }}>{h.title}</div>
        <div style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>{isTeacher && <>{studentName(h.student_id)} · </>}From: {h.lesson || "—"}</div>
        {!isTeacher && (
          <input placeholder="Add a note for your tutor (optional)" defaultValue={h.note} onBlur={(e) => onUpdate(h.id, { note: e.target.value })} style={{ ...inputStyle, marginTop: 8, fontSize: 13 }} />
        )}
        {isTeacher && h.note && <div style={{ color: MUTED, fontSize: 12.5, marginTop: 6, fontStyle: "italic" }}>Note: {h.note}</div>}
      </div>
      <div style={{ color: MUTED, fontSize: 13, whiteSpace: "nowrap" }}>Due {h.due}</div>
      {isTeacher && <button onClick={() => onDelete(h.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D9DAE6", display: "flex" }}><Trash2 size={15} /></button>}
    </Card>
  );

  return (
    <>
      <PageHeader
        eyebrow="ASSIGNMENTS"
        title="Homework"
        subtitle={`${pending.length} pending · ${done.length} completed`}
        action={isTeacher && <PrimaryButton onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Assign homework</PrimaryButton>}
      />
      {isTeacher && showForm && (
        <FormPanel
          title="Assign homework"
          onClose={() => setShowForm(false)}
          submitLabel="Assign"
          onSubmit={() => {
            if (!form.title || !form.due) return;
            onAdd({ ...form, status: "pending", note: "" });
            setForm({ student_id: students?.[0]?.id || "", title: "", lesson: "", due: "" });
            setShowForm(false);
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Student">
              <select style={inputStyle} value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Due date"><input type="date" style={inputStyle} value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
          </div>
          <Field label="Task"><input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Write 5 sentences using Present Perfect" /></Field>
          <Field label="Related lesson (optional)"><input style={inputStyle} value={form.lesson} onChange={(e) => setForm({ ...form, lesson: e.target.value })} placeholder="e.g. Grammar: Present Perfect" /></Field>
        </FormPanel>
      )}
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 10 }}>PENDING</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{pending.length ? pending.map((h) => <Row h={h} key={h.id} />) : <EmptyNote text="Nothing pending." />}</div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 10 }}>COMPLETED</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{done.length ? done.map((h) => <Row h={h} key={h.id} />) : <EmptyNote text="Nothing completed yet." />}</div>
      </div>
    </>
  );
}

function VocabularyPage({ vocab, isTeacher, students, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ student_id: students?.[0]?.id || "", word: "", translation: "", date: today });
  const studentName = (id) => students?.find((s) => s.id === id)?.name || "—";
  const groups = vocab.reduce((acc, v) => { (acc[v.date] = acc[v.date] || []).push(v); return acc; }, {});

  return (
    <>
      <PageHeader
        eyebrow="WORD BANK"
        title="Vocabulary"
        subtitle={`${vocab.length} word${vocab.length === 1 ? "" : "s"} collected.`}
        action={isTeacher && <PrimaryButton onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Add word</PrimaryButton>}
      />
      {isTeacher && showForm && (
        <FormPanel
          title="Add a vocabulary word"
          onClose={() => setShowForm(false)}
          submitLabel="Add word"
          onSubmit={() => {
            if (!form.word || !form.translation) return;
            onAdd(form);
            setForm({ student_id: students?.[0]?.id || "", word: "", translation: "", date: today });
            setShowForm(false);
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Student">
              <select style={inputStyle} value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Date"><input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Word"><input style={inputStyle} value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="e.g. thoughtful" /></Field>
            <Field label="Translation"><input style={inputStyle} value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} placeholder="продуманий" /></Field>
          </div>
        </FormPanel>
      )}
      {Object.keys(groups).length ? Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([date, words]) => (
        <div key={date} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 10 }}>{date}</div>
          <Card style={{ overflow: "hidden" }}>
            {words.map((v, i) => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: i < words.length - 1 ? "1px solid #F0F1F6" : "none" }}>
                <Sparkles size={15} color={ACCENT} style={{ flexShrink: 0 }} />
                <div style={{ fontWeight: 700, color: INK, fontSize: 15, width: isTeacher ? 150 : 200 }}>{v.word}</div>
                <div style={{ color: MUTED, fontSize: 14, flex: 1 }}>{v.translation}</div>
                {isTeacher && <div style={{ color: "#C7C9D9", fontSize: 12.5, marginRight: 8 }}>{studentName(v.student_id)}</div>}
                {isTeacher && <button onClick={() => onDelete(v.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D9DAE6", display: "flex" }}><Trash2 size={14} /></button>}
              </div>
            ))}
          </Card>
        </div>
      )) : <EmptyNote text="No words added yet." />}
    </>
  );
}

function StudentsPage({ students, lessons, homework, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  return (
    <>
      <PageHeader
        eyebrow="ROSTER"
        title="Students"
        subtitle={`${students.length} student${students.length === 1 ? "" : "s"}.`}
        action={<PrimaryButton onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Add student</PrimaryButton>}
      />
      {showForm && (
        <FormPanel
          title="Add a student"
          onClose={() => setShowForm(false)}
          submitLabel="Add student"
          onSubmit={() => {
            if (!form.name) return;
            onAdd(form);
            setForm({ name: "", email: "" });
            setShowForm(false);
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Name"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></Field>
            <Field label="Email"><input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" /></Field>
          </div>
          <p style={{ color: MUTED, fontSize: 12, margin: 0 }}>
            Use the exact email they'll sign up with — that's how their account gets linked automatically.
          </p>
        </FormPanel>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {students.map((s) => {
          const lessonsCount = lessons.filter((l) => l.student_id === s.id).length;
          const pendingHw = homework.filter((h) => h.student_id === s.id && h.status === "pending").length;
          return (
            <Card key={s.id} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: ACCENT_BG, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{s.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>{s.name}</div>
                <div style={{ color: MUTED, fontSize: 13 }}>{s.email || "no email on file"}</div>
              </div>
              <div style={{ color: MUTED, fontSize: 13 }}>{lessonsCount} lessons</div>
              <div style={{ color: pendingHw ? "#D97706" : MUTED, fontSize: 13, width: 110 }}>{pendingHw} pending hw</div>
              <button onClick={() => onDelete(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D9DAE6", display: "flex" }}><Trash2 size={15} /></button>
            </Card>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// App shell — auth gate + data loading + routing
// ---------------------------------------------------------------------------

const STUDENT_NAV = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "lessons", label: "Lessons", icon: Calendar },
  { key: "homework", label: "Homework", icon: CheckSquare },
  { key: "vocabulary", label: "Vocabulary", icon: BookOpen },
];
const TEACHER_NAV = [
  { key: "students", label: "Students", icon: Users },
  { key: "lessons", label: "Lessons", icon: Calendar },
  { key: "homework", label: "Homework", icon: CheckSquare },
  { key: "vocabulary", label: "Vocabulary", icon: BookOpen },
];

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [homework, setHomework] = useState([]);
  const [vocab, setVocab] = useState([]);
  const [page, setPage] = useState("overview");
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingData(true);
      setError("");
      try {
        const { data: prof, error: profErr } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profErr) throw profErr;
        setProfile(prof);

        const isTeacher = prof.role === "teacher";
        const studentFilter = isTeacher ? null : prof.student_id;

        const [studentsRes, lessonsRes, homeworkRes, vocabRes] = await Promise.all([
          isTeacher ? supabase.from("students").select("*").order("name") : supabase.from("students").select("*").eq("id", studentFilter),
          studentFilter ? supabase.from("lessons").select("*").eq("student_id", studentFilter) : supabase.from("lessons").select("*"),
          studentFilter ? supabase.from("homework").select("*").eq("student_id", studentFilter) : supabase.from("homework").select("*"),
          studentFilter ? supabase.from("vocab").select("*").eq("student_id", studentFilter) : supabase.from("vocab").select("*"),
        ]);

        if (studentsRes.error) throw studentsRes.error;
        if (lessonsRes.error) throw lessonsRes.error;
        if (homeworkRes.error) throw homeworkRes.error;
        if (vocabRes.error) throw vocabRes.error;

        setStudents(studentsRes.data || []);
        setLessons(lessonsRes.data || []);
        setHomework(homeworkRes.data || []);
        setVocab(vocabRes.data || []);
      } catch (e) {
        setError(e.message || "Failed to load data.");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [session]);

  if (session === undefined) return <FullscreenMsg text="Loading…" />;
  if (session === null) return <Login />;
  if (loadingData || !profile) return <FullscreenMsg text="Loading workspace…" />;
  if (error) return <FullscreenMsg text={error} isError />;

  const isTeacher = profile.role === "teacher";
  const myStudent = isTeacher ? null : students.find((s) => s.id === profile.student_id);

  // ---- mutators (optimistic update + Supabase write) ----
  const addStudent = async (form) => {
    const { data, error } = await supabase.from("students").insert(form).select().single();
    if (!error) setStudents((prev) => [...prev, data]);
  };
  const deleteStudent = async (id) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (!error) setStudents((prev) => prev.filter((s) => s.id !== id));
  };
  const addLesson = async (form) => {
    const { data, error } = await supabase.from("lessons").insert(form).select().single();
    if (!error) setLessons((prev) => [...prev, data]);
  };
  const deleteLesson = async (id) => {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (!error) setLessons((prev) => prev.filter((l) => l.id !== id));
  };
  const addHomework = async (form) => {
    const { data, error } = await supabase.from("homework").insert(form).select().single();
    if (!error) setHomework((prev) => [...prev, data]);
  };
  const updateHomework = async (id, patch) => {
    setHomework((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
    await supabase.from("homework").update(patch).eq("id", id);
  };
  const deleteHomework = async (id) => {
    const { error } = await supabase.from("homework").delete().eq("id", id);
    if (!error) setHomework((prev) => prev.filter((h) => h.id !== id));
  };
  const addVocab = async (form) => {
    const { data, error } = await supabase.from("vocab").insert(form).select().single();
    if (!error) setVocab((prev) => [...prev, data]);
  };
  const deleteVocab = async (id) => {
    const { error } = await supabase.from("vocab").delete().eq("id", id);
    if (!error) setVocab((prev) => prev.filter((v) => v.id !== id));
  };

  const navItems = isTeacher ? TEACHER_NAV : STUDENT_NAV;
  const effectivePage = navItems.some((n) => n.key === page) ? page : navItems[0].key;

  const renderPage = () => {
    switch (effectivePage) {
      case "students":
        return <StudentsPage students={students} lessons={lessons} homework={homework} onAdd={addStudent} onDelete={deleteStudent} />;
      case "lessons":
        return <LessonsPage lessons={lessons} isTeacher={isTeacher} students={students} onAdd={addLesson} onDelete={deleteLesson} />;
      case "homework":
        return <HomeworkPage homework={homework} isTeacher={isTeacher} students={students} onAdd={addHomework} onUpdate={updateHomework} onDelete={deleteHomework} />;
      case "vocabulary":
        return <VocabularyPage vocab={vocab} isTeacher={isTeacher} students={students} onAdd={addVocab} onDelete={deleteVocab} />;
      default:
        return myStudent ? (
          <OverviewPage lessons={lessons} homework={homework} vocab={vocab} studentName={myStudent.name} goTo={setPage} />
        ) : (
          <EmptyNote text="Your tutor hasn't linked your account to a student profile yet." />
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F8FC", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: 232, background: "#fff", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", padding: "20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 24px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>S</div>
          <div style={{ fontWeight: 700, color: INK, fontSize: 15 }}>Student Portal</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "#B3B5C4", padding: "0 8px 10px" }}>
          {isTeacher ? "TEACHER WORKSPACE" : "STUDENT WORKSPACE"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const active = effectivePage === item.key;
            return (
              <button key={item.key} onClick={() => setPage(item.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: active ? ACCENT_BG : "transparent", color: active ? ACCENT : "#5B5D6E", fontWeight: active ? 700 : 500, fontSize: 14, textAlign: "left" }}>
                <item.icon size={17} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: ACCENT_BG, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {isTeacher ? "T" : myStudent?.name.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: INK, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isTeacher ? "Your workspace" : myStudent?.name}</div>
              <div style={{ color: "#B3B5C4", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user.email}</div>
            </div>
            <button onClick={() => supabase.auth.signOut()} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#B3B5C4", display: "flex" }} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
          <div style={{ fontSize: 14, color: "#B3B5C4" }}>
            Workspace <span style={{ margin: "0 6px" }}>/</span>
            <span style={{ color: "#5B5D6E" }}>{navItems.find((n) => n.key === effectivePage)?.label}</span>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1E9E52" }} title="Connected" />
        </div>
        <div style={{ padding: 32, flex: 1 }}>{renderPage()}</div>
      </div>
    </div>
  );
}

function FullscreenMsg({ text, isError }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: isError ? "#D14343" : MUTED, fontFamily: "Inter, sans-serif", padding: 24, textAlign: "center" }}>
      {text}
    </div>
  );
}
