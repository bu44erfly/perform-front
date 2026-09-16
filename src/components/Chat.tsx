import { useEffect, useRef, useState } from 'react'
import {
  Bot, Check, Command, Copy, CornerDownRight, Download, Info, MessageSquareText,
  Redo2, RefreshCw, SquarePen, ThumbsDown, ThumbsUp, Trash2,
} from 'lucide-react'
import {
  drawioReply, historyReply, mermaidReply, plainReply, tableReply,
} from '../data/mockData'
import type { ChatMessage, ChatSession } from '../data/types'
import { ChatRenderer } from './Diagrams'
import { DataTable } from './Ui'

interface Props {
  sessions: ChatSession[]
  activeSessionId: string
  messages: ChatMessage[]
  skillsAndCommands?: { kind: string; key: string; label: string; desc: string }[]
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
  onNotify: (message: string) => void
}

const initialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content: `你好，我是 **Performance Agent** 的网页端助手（演示环境）。

我可以接收自然语言指示，判断意图后调度各个功能 subAgent，例如：

| 你的说法 | 我会做的事 |
| --- | --- |
| 分析 PERF-2048 的启动卡顿 | 走完整流水线：JIRA → Trace → 知识库 → SmartPerfetto → 报告 |
| 查一下 PERF-2042 的知识库 | 只调用 Knowledge Agent，不进入分析流水线 |
| 项目 = TV Core 且未分析 | 先把自然语言转成 JQL，确认问题集后再触发 |

点下面的示例按钮可以先看渲染效果（Markdown 表格、mermaid 流程图、drawio 泳道图）。`,
  },
]

const promptChips: { label: string; text: string }[] = [
  { label: '分析 PERF-2048 启动卡顿', text: '分析 PERF-2048 的启动卡顿，并检查 Trace 是否合规' },
  { label: '查询待审核任务', text: '查询当前待审核的任务' },
  { label: '渲染 mermaid 流程图', text: '__demo_mermaid__' },
  { label: '渲染 drawio 泳道图', text: '__demo_drawio__' },
  { label: '接续历史对话继续追踪', text: '__demo_history__' },
  { label: '表格 + SQL 代码块', text: '__demo_table__' },
  { label: '纯文本答复', text: '__demo_plain__' },
]

/** 长任务折叠成进度卡片：模拟一个编排子任务的步骤推进 */
function ProgressCard() {
  const steps = ['JIRA Agent 采集', 'Trace 合规校验', '知识库检索', 'SmartPerfetto 分析', '报告生成']
  const [step, setStep] = useState(0)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    const timer = window.setInterval(() => setStep((value) => (value >= steps.length ? 0 : value + 1)), 700)
    return () => window.clearInterval(timer)
  }, [])
  return <div className="progress-card">
    <button className="progress-head" onClick={() => setExpanded((value) => !value)}>
      <span className="typing-dots"><i /><i /><i /></span>
      <span className="progress-title">正在编排 subAgent · 第 {Math.min(step + 1, steps.length)} / {steps.length} 步</span>
      <span className="progress-toggle">{expanded ? '收起' : '展开'}</span>
    </button>
    {expanded && <ul className="progress-steps">
      {steps.map((label, index) => <li key={label} className={index < step ? 'done' : index === step ? 'current' : ''}>
        <span className="progress-dot">{index < step ? <Check size={11} /> : index + 1}</span>
        <span>{label}</span>
        <em>{index < step ? '完成' : index === step ? '进行中' : '等待'}</em>
      </li>)}
    </ul>}
  </div>
}

export function Chat({ sessions, activeSessionId, messages, skillsAndCommands = [], onSelectSession, onNewSession, onDeleteSession, onNotify }: Props) {
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages)
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down' | null>>({})
  const [copied, setCopied] = useState<number | null>(null)
  const [slashOpen, setSlashOpen] = useState(false)
  const composerRef = useRef<HTMLDivElement>(null)

  // 切换会话时载入该会话的消息（演示：仅首个会话有内容）
  useEffect(() => {
    setLocalMessages(activeSessionId === sessions[0]?.id ? messages : [
      { role: 'assistant', content: `这是历史会话 **${sessions.find((item) => item.id === activeSessionId)?.title ?? ''}** 的模拟回放。\n\n演示环境只保留首条会话的完整上下文，其他会话用于展示「查看历史对话记录」的入口。` },
    ])
    setFeedback({})
  }, [activeSessionId, messages, sessions])

  useEffect(() => { threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' }) }, [localMessages])

  const append = (message: ChatMessage) => setLocalMessages((items) => [...items, message])

  const send = (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || pending) return
    const preset = presetMap[text]
    append({ role: 'user', content: preset ? preset.display : text })
    setInput('')
    setPending(true)
    window.setTimeout(() => {
      append({ role: 'assistant', content: replyFor(text, preset).content, render: replyFor(text, preset).render })
      setPending(false)
    }, 620)
  }

  const copyMessage = (index: number, content: string) => {
    navigator.clipboard?.writeText(content).catch(() => {})
    setCopied(index)
    window.setTimeout(() => setCopied(null), 1600)
    onNotify('已复制该条消息内容')
  }

  const regenerate = (index: number) => {
    onNotify('已模拟重新生成该条答复（演示不重跑编排）')
    void index
  }

  const quote = (content: string) => {
    const snippet = content.replace(/\s+/g, ' ').slice(0, 80)
    setInput((value) => (value ? `${value}\n` : '') + `> ${snippet}\n`)
    onNotify('已引用该条消息到输入框')
  }

  const setFeedbackValue = (index: number, value: 'up' | 'down') =>
    setFeedback((items) => ({ ...items, [index]: items[index] === value ? null : value }))

  const exportMessage = (index: number, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `message-${index + 1}.md`
    link.click()
    URL.revokeObjectURL(url)
    onNotify('已导出该条消息为 Markdown')
  }

  const pickSlash = (key: string, label: string) => {
    setInput(`/${key} `)
    setSlashOpen(false)
    onNotify(`已加载命令「${label}」，发送后由编排层调度对应 subAgent`)
  }

  const onComposerChange = (value: string) => {
    setInput(value)
    setSlashOpen(value.endsWith('/') || value.endsWith('@'))
  }

  return <section className="page chat-page">
    <div className="chat-layout">
      <aside className="chat-history">
        <button className="new-chat" onClick={onNewSession}><SquarePen size={16} /> 新建对话</button>
        <p className="eyebrow">历史对话</p>
        {sessions.map((session) => <div className={`history-item ${session.id === activeSessionId ? 'active' : ''}`} key={session.id}>
          <button onClick={() => onSelectSession(session.id)}>
            <MessageSquareText size={15} />
            <span><b>{session.title}</b><small>{session.origin} · {session.turns} 轮 · {session.updatedAt}</small></span>
          </button>
          <button className="history-delete" title="删除该历史会话（模拟）" onClick={() => onDeleteSession(session.id)}><Trash2 size={14} /></button>
        </div>)}
        <div className="chat-note"><Info size={15} /> 对话为本地规则模拟，请求不会离开浏览器；接入后由编排层决定调用哪些 subAgent。</div>
      </aside>

      <div className="chat-thread">
        <div className="chat-header">
          <div><p className="eyebrow">对话界面</p><h1>智能对话工作区</h1></div>
          <div className="chat-header-meta">
            <span className="subtle-label"><span className="dot" /> 6 个 subAgent 可用（模拟）</span>
          </div>
        </div>

        <div className="messages" ref={threadRef}>
          {localMessages.map((message, index) => <div key={index} className={`message ${message.role}`}>
            <span className="message-avatar">{message.role === 'user' ? '王' : <Bot size={18} />}</span>
            <div className="message-body">
              <div className="message-content">
                <ChatRenderer content={message.content} render={message.render} />
              </div>
              <div className="message-actions">
                {message.role === 'assistant' && <button title="复制" onClick={() => copyMessage(index, message.content)}>{copied === index ? <Check size={13} /> : <Copy size={13} />}</button>}
                {message.role === 'assistant' && <button title="重新生成" onClick={() => regenerate(index)}><RefreshCw size={13} /></button>}
                <button title="引用追问" onClick={() => quote(message.content)}><CornerDownRight size={13} /></button>
                <button title="导出为 Markdown" onClick={() => exportMessage(index, message.content)}><Download size={13} /></button>
                {message.role === 'assistant' && <span className="feedback-sep" />}
                {message.role === 'assistant' && <button title="有用" className={feedback[index] === 'up' ? 'on up' : ''} onClick={() => setFeedbackValue(index, 'up')}><ThumbsUp size={13} /></button>}
                {message.role === 'assistant' && <button title="有误" className={feedback[index] === 'down' ? 'on down' : ''} onClick={() => setFeedbackValue(index, 'down')}><ThumbsDown size={13} /></button>}
              </div>
            </div>
          </div>)}
          {pending && <div className="message assistant"><span className="message-avatar"><Bot size={18} /></span><div className="message-body"><ProgressCard /></div></div>}
        </div>

        <div className="suggestions">
          {promptChips.map((chip) => <button key={chip.label} onClick={() => send(chip.text)}>{chip.label}</button>)}
        </div>

        <div className="chat-composer" ref={composerRef}>
          <div className="composer-tools">
            <button className="slash-chip" onClick={() => { onComposerChange(input + ' /'); }}>/</button>
            <button className="slash-chip at" onClick={() => { onComposerChange(input + ' @'); }}>@</button>
            <span className="composer-hint">用 <b>/</b> 或 <b>@</b> 加载命令与 skill</span>
          </div>
          {slashOpen && skillsAndCommands.length > 0 && <div className="slash-menu">
            {skillsAndCommands.map((item) => <button key={item.key} onClick={() => pickSlash(item.key, item.label)}>
              <span className="slash-kind">{item.kind}</span>
              <span className="slash-body"><b>/{item.key} · {item.label}</b><small>{item.desc}</small></span>
            </button>)}
          </div>}
          <textarea
            value={input}
            onChange={(event) => onComposerChange(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }}
            placeholder="例如：分析 PERF-2048 的启动卡顿并检查 Trace；或输入 / 或 @ 加载命令与 skill"
          />
          <button className="primary-button" onClick={() => send()} disabled={pending}>发送</button>
          <small><Command size={12} /> Enter 发送 · Shift + Enter 换行 · 演示数据不出站</small>
        </div>
      </div>
    </div>

    <div className="chat-side-panels">
      <section className="panel-card">
        <p className="eyebrow">意图识别</p><h2>输入检查与意图识别</h2>
        <DataTable columns={['用户输入示例', '意图判断', '下一步']} minWidth={0}>
          <tr><td>“帮我分析 PERF-2048”</td><td><span className="simple-status ok">指定单号</span></td><td>直接创建分析任务</td></tr>
          <tr><td>“TV Core 里没分析过的问题”</td><td><span className="simple-status ok">范围查询</span></td><td>自然语言转 JQL 后确认</td></tr>
          <tr><td>“下载一下附件”</td><td><span className="simple-status neutral">子任务</span></td><td>仅调用 JIRA subAgent</td></tr>
          <tr><td>“你好 / 今天天气”</td><td><span className="simple-status warn">无关输入</span></td><td>提示缺少关键信息，等待重输</td></tr>
        </DataTable>
        <p className="card-footnote">演示环境用规则表模拟意图识别，真实实现由编排层完成。</p>
      </section>
      <section className="panel-card">
        <p className="eyebrow">渲染能力</p><h2>渲染矩阵</h2>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>Markdown</b><small>标题、列表、表格、引用、代码块（marked + DOMPurify）</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>mermaid</b><small>实时渲染为流程图 / 时序图，失败时回退源码</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>drawio</b><small>解析 mxGraphModel 渲染图形，并可下载 .drawio 源文件</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>其他图表</b><small>暂以代码块呈现，后续可扩展 ECharts 等</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>结构化内容</b><small>表格、SQL / 代码块、Trace 时间区间引用、关键指标卡片</small></div></div>
      </section>
      <section className="panel-card">
        <p className="eyebrow">消息级操作</p><h2>单条消息操作</h2>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>复制 / 重新生成 / 导出</b><small>单条消息可复制、重新生成，导出为 Markdown</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>引用追问</b><small>把上一条回答引用到输入框继续追问</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>反馈</b><small>对单条回答标记「有用 / 有误」</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>跳转</b><small>跳转到底层报告或原始 JIRA（待真实数据接入）</small></div></div>
      </section>
      <section className="panel-card">
        <p className="eyebrow">并发处理</p><h2>多用户 / 多问题单并发</h2>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>当前并发</b><small>3 位用户在线，2 个对话工作项进行中</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>排队策略</b><small>超出账号并发上限的请求进入队列，按提交顺序调度</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>待决策</b><small>游客身份、每人独立账号、跨用户取消权限</small></div></div>
        <button className="text-button" onClick={() => onNotify('已模拟跳转到「账号与并发」页（演示提示）')}>查看详细策略 →</button>
      </section>
    </div>
  </section>
}

const presetMap: Record<string, { display: string; reply: ChatMessage }> = {
  __demo_mermaid__: {
    display: '把当前流水线用 mermaid 画出来',
    reply: { role: 'assistant', content: mermaidReply, render: 'mermaid' },
  },
  __demo_drawio__: {
    display: '用 drawio 泳道图展示模块间的交接产物',
    reply: { role: 'assistant', content: drawioReply, render: 'drawio' },
  },
  __demo_history__: {
    display: '接着上次那次分析继续往下追',
    reply: { role: 'assistant', content: historyReply, render: 'markdown' },
  },
  __demo_table__: {
    display: '列一下待审核的任务，顺便给条 SQL',
    reply: { role: 'assistant', content: tableReply, render: 'markdown' },
  },
  __demo_plain__: {
    display: '先简单说说你能做什么',
    reply: { role: 'assistant', content: plainReply, render: 'text' },
  },
}

function replyFor(text: string, preset?: { display: string; reply: ChatMessage }): ChatMessage {
  if (preset) return preset.reply
  if (/PERF-\d{4}/i.test(text)) {
    return {
      role: 'assistant',
      content: `### 已受理 ${(text.match(/PERF-\d{4}/i)?.[0] ?? '').toUpperCase()} 的模拟编排

已关联 **JIRA 快照、问题机 / 对比机 Trace、3 条知识库参考项**。当前结论为：初始化任务存在串行阻塞风险，建议审核后回帖。

\`\`\`text
用户请求 → 意图识别 → JIRA Agent → Trace 校验 → Knowledge Agent → SmartPerfetto → 人工审核
\`\`\`

| 项目 | 值 |
| --- | --- |
| 来源置信度 | 91% |
| 案例级置信度 | 86% |
| 当前门禁 | 等待人工审核 |

> 这是本地模拟编排，未连接 JIRA、知识库或 SmartPerfetto。`,
    }
  }
  if (text.includes('待审核')) return { role: 'assistant', content: tableReply, render: 'markdown' }
  if (/trace/i.test(text) || text.includes('Trace')) {
    return {
      role: 'assistant',
      content: `### Trace 校验建议

已识别出常见检查项：

- 问题机与对比机是否为同一场景
- 采集时长、目标进程和关键线程是否完整
- 版本、网络与硬件条件是否可对比
- 是否存在重复 Trace

若缺少对比 Trace，系统会进入 **待补资料**，而不是输出确定性根因。`,
    }
  }
  if (text.includes('mermaid') || text.includes('流程图') || text.includes('画出来')) return { role: 'assistant', content: mermaidReply, render: 'mermaid' }
  if (text.includes('drawio')) return { role: 'assistant', content: drawioReply, render: 'drawio' }
  if (text.includes('你好') || text.includes('天气') || text.length < 4) {
    return { role: 'assistant', content: `我需要更具体的信息才能触发分析流程。可以这样告诉我：

- 直接给出单号：\`PERF-2048\`
- 或给出范围：项目 / 人员 / 状态 / 标签 / 时间范围
- 或直接提供 JQL 语句

（对应无关输入会被筛除，缺少信息时会提示补充。）` }
  }
  return { role: 'assistant', content: `### 模拟编排计划

我会先判断你的意图，再决定调用哪个 subAgent：

1. **自然语言 → JQL**：把范围类描述转成查询语句
2. **确认问题集**（2.1）：展示命中的问题单供你确认
3. **编排 subAgent**：固定流水线或灵活选路

> 当前为展示环境，所有流程、数据与结果均为模拟。` }
}

export { initialMessages }
