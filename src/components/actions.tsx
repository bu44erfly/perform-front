import {
  ChevronRight, Download, FileCheck2, Pause, Play, RefreshCw, RotateCcw, ShieldCheck, Trash2,
} from 'lucide-react'

/** 人工可执行的模拟操作（人工操作 / 暂停取消） */
export type TaskAction =
  | '重试' | '人工确认' | '暂停任务' | '继续任务' | '取消任务' | '重新发起分析'
  | '请求补充资料' | '排除任务' | '审核通过' | '驳回并要求补充'
  | '发起分析任务' | '批量下载附件' | '下载 Trace' | '导出报告' | '发布 JIRA 回帖' | '查看'

interface ActionMeta {
  icon: React.ReactNode
  tone: 'default' | 'primary' | 'danger'
  /** 该操作在演示中产生的说明文案 */
  toast: string
}

export const actionMeta: Record<TaskAction, ActionMeta> = {
  重试: { icon: <RefreshCw size={16} />, tone: 'default', toast: '已模拟重试当前环节，任务回到分析中' },
  人工确认: { icon: <ShieldCheck size={16} />, tone: 'default', toast: '已记录人工确认，等待后续环节' },
  暂停任务: { icon: <Pause size={16} />, tone: 'default', toast: '已模拟暂停，任务状态变为已暂停' },
  继续任务: { icon: <Play size={16} />, tone: 'default', toast: '已模拟恢复，任务继续后续步骤' },
  取消任务: { icon: <Trash2 size={16} />, tone: 'danger', toast: '已模拟取消，任务不再进入后续流程' },
  重新发起分析: { icon: <RotateCcw size={16} />, tone: 'default', toast: '已模拟重新发起，将生成新的分析版本' },
  请求补充资料: { icon: <FileCheck2 size={16} />, tone: 'default', toast: '已模拟生成补充资料模板' },
  排除任务: { icon: <Trash2 size={16} />, tone: 'danger', toast: '已模拟排除任务，并记录排除原因' },
  审核通过: { icon: <ShieldCheck size={16} />, tone: 'primary', toast: '已模拟审核通过，回帖待发布' },
  驳回并要求补充: { icon: <RotateCcw size={16} />, tone: 'default', toast: '已模拟驳回，案例转为待补资料' },
  发起分析任务: { icon: <Play size={16} />, tone: 'primary', toast: '已模拟发起分析任务，进入待处理队列' },
  批量下载附件: { icon: <Download size={16} />, tone: 'default', toast: '已模拟打包下载接口调用' },
  '下载 Trace': { icon: <Download size={16} />, tone: 'default', toast: '已模拟 Trace 下载接口调用' },
  导出报告: { icon: <Download size={16} />, tone: 'default', toast: '已模拟导出 Markdown 报告' },
  '发布 JIRA 回帖': { icon: <ShieldCheck size={16} />, tone: 'primary', toast: '已模拟发布 JIRA 回帖（演示不发请求）' },
  查看: { icon: <FileCheck2 size={16} />, tone: 'default', toast: '已打开任务详情（演示提示）' },
}

export function ActionButton({ action, onClick, variant = 'secondary' }: { action: TaskAction; onClick: () => void; variant?: 'primary' | 'secondary' }) {
  const meta = actionMeta[action]
  return <button className={variant === 'primary' ? 'primary-button' : 'secondary-button'} onClick={onClick}>{meta.icon} {action}</button>
}

export function ActionIcon({ label, action, onClick }: { label: string; action: TaskAction; onClick: () => void }) {
  return <button className={`icon-action ${actionMeta[action].tone}`} title={label} onClick={(event) => { event.stopPropagation(); onClick() }}>
    {actionMeta[action].icon}
  </button>
}

export function OperationRow({ action, onClick, reason }: { action: TaskAction; onClick: () => void; reason?: string }) {
  const meta = actionMeta[action]
  return <button className={`operation-button ${meta.tone}`} onClick={onClick}>
    <span>{meta.icon} {action}</span>
    {reason ? <small>{reason}</small> : <ChevronRight size={16} />}
  </button>
}
