import { Activity, AlertCircle, CheckCircle2, Clock3, FileCheck2, PauseCircle } from 'lucide-react'
import type { TaskStatus } from './data/types'

export const statusOrder: TaskStatus[] = ['待处理', '分析中', '待补资料', '待审核', '已完成', '失败 / 人工介入']

export function statusIcon(status: TaskStatus) {
  if (status === '已完成') return <CheckCircle2 />
  if (status === '待审核') return <FileCheck2 />
  if (status === '待补资料') return <AlertCircle />
  if (status === '失败 / 人工介入') return <AlertCircle />
  if (status === '分析中') return <Activity />
  if (status === '已暂停') return <PauseCircle />
  return <Clock3 />
}

export function statusClass(status: TaskStatus) {
  if (status === '已完成') return 'success'
  if (status === '待审核') return 'review'
  if (status === '待补资料') return 'warning'
  if (status === '失败 / 人工介入') return 'danger'
  if (status === '分析中') return 'progress'
  if (status === '已暂停') return 'neutral'
  return 'neutral'
}

export function confidenceLevel(value: number) {
  if (value === 0) return { label: '不可计算', tone: 'neutral' }
  if (value >= 85) return { label: '达标', tone: 'success' }
  if (value >= 70) return { label: '临界', tone: 'warning' }
  return { label: '低于门槛', tone: 'danger' }
}
