import { useMemo, useState } from 'react'
import {
  Activity, ChevronRight, CircleHelp, FileCheck2, Layers3,
  ListChecks, MessageSquareText, MoreHorizontal, ShieldCheck, Sparkles, Ticket, UsersRound, Zap,
} from 'lucide-react'
import { Accounts } from './components/Accounts'
import { Analysis } from './components/Analysis'
import { Chat, initialMessages } from './components/Chat'
import { Dashboard } from './components/Dashboard'
import { JiraBridge } from './components/JiraBridge'
import { Requirements } from './components/Requirements'
import { TaskDetail, type DetailTab } from './components/TaskDetail'
import { actionMeta, type TaskAction } from './components/actions'
import { Modal } from './components/Ui'
import { tasks } from './data/mockData'
import type { ChatMember, ChatMessage, ChatSession, Task, TaskStatus } from './data/types'


type View = 'dashboard' | 'task' | 'chat' | 'jira' | 'analysis' | 'accounts' | 'requirements'

/** 侧边栏分组：前端本体（模板功能）+ 各功能 Agent 的展示位 + 覆盖说明 */
const navGroups: { title: string; items: { id: View; icon: React.ReactNode; label: string; hint: string }[] }[] = [
  {
    title: '前端 UI',
    items: [
      { id: 'dashboard', icon: <Layers3 />, label: '任务看板', hint: '任务总览 · 查询 · 人工操作' },
      { id: 'chat', icon: <MessageSquareText />, label: '智能对话', hint: '对话输入 · 历史 · 渲染' },
      { id: 'accounts', icon: <UsersRound />, label: '账号', hint: '账号 · 角色 · 权限' },
    ],
  },
  {
    title: '功能 Agent 展示位',
    items: [
      { id: 'jira', icon: <Ticket />, label: 'JIRA 集成', hint: 'JIRA Agent' },
      { id: 'analysis', icon: <Activity />, label: '智能分析诊断', hint: '分析 Agent' },
    ],
  },
  {
    title: '演示说明',
    items: [
      { id: 'requirements', icon: <ListChecks />, label: '需求覆盖说明', hint: '全模块逐条对照' },
    ],
  },
]

const navItems = navGroups.flatMap((group) => group.items)

const sessions: ChatSession[] = [
  { id: 'chat-1', title: '分析 PERF-2048 启动卡顿', updatedAt: '今天 10:46', origin: '用户对话', turns: 4, owner: '王工', preview: '已确认初始化串行阻塞，等待人工审核' },
  { id: 'chat-2', title: '查询待审核任务', updatedAt: '今天 09:31', origin: '用户对话', turns: 2, owner: '刘工', preview: '返回 1 条待审核任务' },
  { id: 'chat-3', title: '检查 PERF-2042 的 Trace', updatedAt: '昨天 09:20', origin: '用户对话', turns: 3, owner: '李工', preview: '缺少对比机 Trace，转待补资料' },
  { id: 'chat-4', title: 'TV Core 增量问题集分析', updatedAt: '今天 08:12', origin: '定时轮询', turns: 1, owner: 'Scheduler', preview: '命中 5 单，已生成待分析任务' },
]

const skillsAndCommands = [
  { kind: '命令', key: 'analyze', label: '发起完整分析', desc: '走固定流水线：JIRA → Trace → 知识库 → SmartPerfetto → 报告' },
  { kind: '命令', key: 'query', label: '查询知识库', desc: '只调用 Knowledge Agent，不进入分析流水线' },
  { kind: '命令', key: 'download', label: '下载附件 / Trace', desc: '仅调用 JIRA subAgent 下载文件' },
  { kind: 'skill', key: 'trace-check', label: 'Trace 合规校验', desc: '完整性、场景一致性、对比机配对、多 Trace 规则' },
  { kind: 'skill', key: 'confidence', label: '置信度评估', desc: '策略版本、数值计算、影响因素排序、结论分级' },
  { kind: 'skill', key: 'report', label: '诊断报告', desc: '模板版本、结构化报告、渲染前校验、导出' },
]

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedTask, setSelectedTask] = useState<Task>(tasks[0])
  const [detailTab, setDetailTab] = useState<DetailTab>('snapshot')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | '全部'>('全部')
  const [projectFilter, setProjectFilter] = useState('全部')
  const [traceFilter, setTraceFilter] = useState('全部')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')

  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id)
  const [sessionList, setSessionList] = useState(sessions)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages)

  const [newTaskModal, setNewTaskModal] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [members, setMembers] = useState<ChatMember[]>([
    { name: '王工', role: 'Reviewer', online: true, tag: '演示身份' },
    { name: '刘工', role: '审核人', online: true },
    { name: '李工', role: '工程师', online: true },
    { name: '陈工', role: '工程师', online: false },
    { name: '演示访客', role: '访客', online: false, tag: '只读' },
  ])

  const projects = useMemo(() => Array.from(new Set(tasks.map((task) => task.project))), [])

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const keyword = query.trim().toLowerCase()
    const matchStatus = statusFilter === '全部' || task.status === statusFilter
    const matchProject = projectFilter === '全部' || task.project === projectFilter
    const matchTrace = traceFilter === '全部' || task.traceStatus === traceFilter
    const matchQuery = !keyword || [task.id, task.title, task.project, task.owner, task.device, task.category, task.stage].join(' ').toLowerCase().includes(keyword)
    return matchStatus && matchProject && matchTrace && matchQuery
  }), [statusFilter, projectFilter, traceFilter, query])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }

  const openTask = (task: Task) => {
    setSelectedTask(task)
    setDetailTab('snapshot')
    setView('task')
  }

  /** 人工操作的统一入口：模拟状态流转 + 审计提示 */
  const runAction = (task: Task, action: TaskAction) => {
    notify(actionMeta[action].toast)
    void task
  }

  const resetFilters = () => {
    setStatusFilter('全部')
    setProjectFilter('全部')
    setTraceFilter('全部')
    setQuery('')
  }

  const navigate = (nextView: View) => {
    setView(nextView)
    if (nextView === 'dashboard') resetFilters()
  }

  const newSession = () => {
    const id = `chat-${sessionList.length + 1}`
    setSessionList((items) => [{ id, title: `新对话 ${items.length}`, updatedAt: '刚刚', origin: '用户对话', turns: 0, owner: '王工', preview: '尚未产生结果' }, ...items])
    setActiveSessionId(id)
    notify('已创建新的演示对话会话')
  }

  const deleteSession = (id: string) => {
    if (sessionList.length <= 1) return notify('至少保留一个演示会话')
    setSessionList((items) => items.filter((item) => item.id !== id))
    if (id === activeSessionId) setActiveSessionId(sessionList[0].id === id ? sessionList[1].id : sessionList[0].id)
    notify('已删除该演示会话（不影响本地数据）')
  }

  const toggleMember = (name: string) => setMembers((items) => items.map((member) => member.name === name ? { ...member, online: !member.online } : member))

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Zap size={19} /></span><span>Performance<br /><b>Agent</b></span></div>
      <div className="demo-badge"><Sparkles size={14} /> 演示环境 · 全部 Mock 数据</div>
      <nav>
        {navGroups.map((group) => <div className="nav-group" key={group.title}>
          <p className="nav-group-title">{group.title}</p>
          {group.items.map((item) => <button key={item.id} className={`nav-item ${(view === item.id || (item.id === 'dashboard' && view === 'task')) ? 'active' : ''}`} onClick={() => navigate(item.id)}>
            {item.icon}<span>{item.label}<small>{item.hint}</small></span>
          </button>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="capacity-mini"><span className="pulse" /> <span>4 / 6 并发槽位运行中</span></div>
        <button className="user-card" onClick={() => notify('当前为演示身份：王工 · 审核人')}>
          <span className="avatar">王</span>
          <span><b>王工</b><small>审核人 · 模拟身份</small></span>
          <MoreHorizontal size={17} />
        </button>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="breadcrumb">
          <span>Performance Agent</span><ChevronRight size={15} />
          <b>{view === 'task' ? `${selectedTask.id} · 任务详情` : navItems.find((item) => item.id === view)?.label}</b>
        </div>
        <div className="top-actions">
          <span className="req-chip"><FileCheck2 size={13} /> 前端 UI 演示</span>
          <button className="icon-button" onClick={() => setMembersOpen(true)} aria-label="对话成员"><UsersRound size={19} /></button>
          <button className="icon-button" onClick={() => notify('帮助中心为演示入口')} aria-label="帮助"><CircleHelp size={19} /></button>
          <span className="live-indicator"><i /> 系统运行正常</span>
        </div>
      </header>

      {view === 'dashboard' && <Dashboard
        filteredTasks={filteredTasks} statusFilter={statusFilter} query={query}
        projectFilter={projectFilter} traceFilter={traceFilter} projects={projects}
        onStatus={setStatusFilter} onQuery={setQuery} onProject={setProjectFilter} onTrace={setTraceFilter}
        onReset={resetFilters} onOpenTask={openTask} onAction={runAction}
      />}
      {view === 'task' && <TaskDetail
        task={selectedTask} tab={detailTab} onTab={setDetailTab}
        onBack={() => { setView('dashboard'); resetFilters() }}
        onAction={runAction} onNotify={notify}
      />}
      {view === 'chat' && <Chat
        sessions={sessionList} activeSessionId={activeSessionId} messages={chatMessages}
        skillsAndCommands={skillsAndCommands}
        onSelectSession={setActiveSessionId} onNewSession={newSession} onDeleteSession={deleteSession}
        onNotify={notify}
      />}
      {view === 'accounts' && <Accounts onNotify={notify} />}
      {view === 'jira' && <JiraBridge onNotify={notify} />}
      {view === 'analysis' && <Analysis onNotify={notify} />}
      {view === 'requirements' && <Requirements onNotify={notify} onGoTo={navigate} />}
    </main>

    {newTaskModal && <Modal
      eyebrow="模拟操作"
      title="发起分析任务"
      description="演示环境不会创建真实 JIRA 工单，只在本地生成一个待处理任务示例。"
      onClose={() => setNewTaskModal(false)}
      onConfirm={() => { setNewTaskModal(false); notify('已模拟发起分析任务，进入待处理队列') }}
    >
      <label className="field">JIRA 编号<input defaultValue="PERF-2052" /></label>
      <label className="field">触发方式<select defaultValue="手动指定单号"><option>手动指定单号</option><option>按 JQL 范围</option><option>定时轮询增量</option></select></label>
      <label className="field">备注<textarea defaultValue="演示用：请走完整流水线并输出报告" /></label>
    </Modal>}

    {membersOpen && <Modal
      eyebrow="账号概念"
      title="会话成员与并发席位"
      description="展示“多用户同时使用”时的成员与在线状态概念；演示环境不支持真正的多人协作。"
      onClose={() => setMembersOpen(false)}
      confirmLabel="知道了"
    >
      <div className="member-list">
        {members.map((member) => <button className={`member-row ${member.online ? 'online' : ''}`} key={member.name} onClick={() => toggleMember(member.name)}>
          <span className={`member-dot ${member.online ? 'online' : ''}`} />
          <span><b>{member.name}</b><small>{member.role}{member.tag ? ` · ${member.tag}` : ''}</small></span>
          <em>{member.online ? '在线' : '离线'}</em>
        </button>)}
      </div>
      <p className="modal-note">点击成员可切换在线状态，用于演示并发席位占用（本地状态，不持久化）。</p>
    </Modal>}

    {toast && <div className="toast"><ShieldCheck size={18} /> {toast}</div>}
  </div>
}

export default App
