export type TaskStatus = '待处理' | '分析中' | '待补资料' | '待审核' | '已完成' | '失败 / 人工介入' | '已暂停'

export type AgentState = '正常' | '等待输入' | '阻塞'

/** 对话消息渲染模式：纯文本 / Markdown / mermaid 图表 / drawio 图 */
export type ChatRender = 'text' | 'markdown' | 'mermaid' | 'drawio'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  /** 缺省按 markdown 渲染；mermaid / drawio 会用可视化占位图渲染 */
  render?: ChatRender
}

export interface ChatSession {
  id: string
  title: string
  updatedAt: string
  /** 触发入口，对应*/
  origin: '用户对话' | '定时轮询' | '手动指定'
  turns: number
  owner: string
  preview: string
}

/** 演示用的会话成员（多用户概念） */
export interface ChatMember {
  name: string
  role: string
  online: boolean
  tag?: string
}

export interface Task {
  id: string
  title: string
  project: string
  owner: string
  device: string
  category: string
  status: TaskStatus
  stage: string
  traceStatus: '通过' | '待补充' | '校验中' | '异常'
  reviewStatus: '待审核' | '已通过' | '不适用' | '需人工处理'
  updatedAt: string
  priority: 'P0' | 'P1' | 'P2'
  summary: string
  environment: string
  confidence: number
  sourceConfidence: number
  conclusion: '已证实' | '高度怀疑' | '待验证'
  blocker?: string
}

export interface AgentStage {
  name: string
  shortName: string
  state: AgentState
  count: number
  output: string
}

export interface Capacity {
  name: string
  active: number
  total: number
  queue?: number
}

export interface Person {
  name: string
  account: string
  role: string
  org: string
  scope: string
  status: '在职' | '已停用'
  lastActive: string
  concurrency: string
}

export interface RoleDefinition {
  name: string
  scope: string
  capabilities: string[]
  concurrency: string
  note: string
}

export interface PermissionRow {
  capability: string
  guest: '—' | '只读' | '可操作'
  engineer: '—' | '只读' | '可操作'
  reviewer: '—' | '只读' | '可操作'
  admin: '—' | '只读' | '可操作'
}

export interface QueueRow {
  name: string
  total: number
  running: number
  waiting: number
  avgWait: string
  avgCost: string
  policy: string
}
