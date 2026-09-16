import type { ReactNode } from 'react'
import {
  ChevronRight, X,
} from 'lucide-react'

/** 页面标题 + 右侧操作区 */
export function SectionHeader({ eyebrow, title, action, hint }: { eyebrow: string; title: string; action?: ReactNode; hint?: ReactNode }) {
  return <div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{hint}{action}</div>
}

export function Panel({ eyebrow, title, footnote, action, children }: { eyebrow?: string; title?: string; footnote?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="panel-card">
    {(eyebrow || title || action) && <div className="panel-head">{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h2>{title}</h2>}{action && <div className="panel-action">{action}</div>}</div>}
    {children}
    {footnote && <p className="card-footnote">{footnote}</p>}
  </section>
}

export function DemoTag({ children }: { children: ReactNode }) {
  return <span className="demo-tag">{children}</span>
}

export function StatTile({ label, value, unit, tone, hint }: { label: string; value: string; unit?: string; tone?: 'blue' | 'purple' | 'green' | 'orange' | 'red'; hint?: string }) {
  return <div className={`stat-tile ${tone ?? ''}`}>
    <small>{label}</small>
    <b>{value}{unit && <span>{unit}</span>}</b>
    {hint && <em>{hint}</em>}
  </div>
}

export function Modal({ title, eyebrow, description, children, onClose, onConfirm, confirmLabel = '确认模拟操作' }: {
  title: string; eyebrow?: string; description?: string; children?: ReactNode
  onClose: () => void; onConfirm?: () => void; confirmLabel?: string
}) {
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p className="modal-copy">{description}</p>}
      {children}
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>取消</button>
        <button className="primary-button" onClick={onConfirm ?? onClose}>{confirmLabel}</button>
      </div>
    </div>
  </div>
}

export function RowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="operation-button" onClick={onClick}>{label}<ChevronRight size={16} /></button>
}

export function InfoList({ title, items, tone = 'green' }: { title: string; items: string[]; tone?: 'green' | 'blue' }) {
  return <div className="info-list"><h3>{title}</h3>{items.map((item) => <p key={item}><span className={`bullet ${tone}`} />{item}</p>)}</div>
}

export function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className={`metric ${tone}`}><small>{label}</small><b>{value}</b></div>
}

export function DataTable({ columns, children, minWidth }: { columns: string[]; children: ReactNode; minWidth?: number }) {
  return <div className="table-wrap">
    <table style={minWidth ? { minWidth } : undefined}>
      <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
}
