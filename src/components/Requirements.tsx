import { useMemo, useState } from 'react'
import {
  BookMarked, CheckCircle2, ClipboardList, Gauge, Layers3, ListChecks, Sparkles,
} from 'lucide-react'
import { coverageRows, moduleSummaries } from '../data/moduleData'
import type { CoverageRow } from '../data/moduleData'
import { DataTable, Panel, SectionHeader, StatTile } from './Ui'

interface Props {
  onNotify: (message: string) => void
  onGoTo: (view: 'dashboard' | 'jira' | 'analysis' | 'chat' | 'accounts') => void
}

const statuses: (CoverageRow['status'] | '全部')[] = ['全部', '已实现', '展示位', '演示方案', '待定']

/**
 * 需求矩阵「前端 UI」为模板，把矩阵里其他模块的功能逐条映射到前端界面。
 * 这一页是给评审 / 老板看的：界面已就位、能力可点、下一阶段接什么一目了然。
 */
export function Requirements({ onNotify, onGoTo }: Props) {
  const [module, setModule] = useState('全部')
  const [status, setStatus] = useState<CoverageRow['status'] | '全部'>('全部')

  const modules = ['全部', ...Array.from(new Set(coverageRows.map((row) => row.module)))]
  const rows = coverageRows.filter((row) =>
    (module === '全部' || row.module === module) && (status === '全部' || row.status === status))

  const counts = useMemo(() => ({
    total: coverageRows.length,
    front: coverageRows.filter((row) => row.module === '前端 UI').length,
    done: coverageRows.filter((row) => row.status === '已实现').length,
    slots: coverageRows.filter((row) => row.status === '展示位').length,
    pending: coverageRows.filter((row) => row.status === '待定').length,
  }), [])

  return <section className="page">
    <div className="page-hero">
      <div>
        <p className="eyebrow">需求矩阵 · 前端 UI 为模板 · 全模块对照</p>
        <h1>需求覆盖与演示说明</h1>
        <p className="hero-copy">以需求矩阵「前端 UI」为模板，把知识库 / JIRA / 智能分析及各 subAgent 的功能点逐条落到前端界面上。本轮不需要功能实现，只回答两个问题：<b>界面上能看到什么</b>、<b>哪些能力下一步接哪个 Agent</b>。</p>
      </div>
      <div className="hero-actions">
        <button className="secondary-button" onClick={() => onNotify('已模拟导出需求覆盖对照表（演示不落盘）')}><ClipboardList size={16} /> 导出对照表</button>
        <button className="primary-button" onClick={() => onGoTo('dashboard')}><Layers3 size={16} /> 返回任务看板</button>
      </div>
    </div>

    <div className="stat-row">
      <StatTile label="功能点" value={String(counts.total)} unit=" 条" tone="blue" hint="覆盖全部模块" />
      <StatTile label="前端本体" value={String(counts.front)} unit=" 条" tone="green" hint="模板功能，全部可点可用" />
      <StatTile label="其余模块展示位" value={String(counts.slots)} unit=" 条" tone="purple" hint="界面已就位，功能待 Agent 落地" />
      <StatTile label="仍待决策" value={String(counts.pending + 3)} unit=" 条" tone="orange" hint="含账号模型与并发归属" />
    </div>

    <SectionHeader eyebrow="总览" title="四个模块的建设状态"
      hint={<span className="subtle-label"><span className="dot" /> 数据全部来自本地 Mock</span>} />
    <div className="role-grid">
      {moduleSummaries.map((item, index) => <div className="role-card" key={item.id}>
        <span className={`role-icon r${index}`}>{index === 0 ? <BookMarked size={17} /> : index === 1 ? <Layers3 size={17} /> : index === 2 ? <Gauge size={17} /> : <Sparkles size={17} />}</span>
        <b>{item.name}</b>
        <small>{item.owner} · {item.count} 个功能点</small>
        <p><b>界面已展示：</b>{item.built}</p>
        <em>待接入：{item.pending}</em>
      </div>)}
    </div>

    <Panel eyebrow="怎么演示" title="给评审的三步走法"
      action={<span className="stage-pill"><ListChecks size={13} /> 建议顺序</span>}>
      <div className="demo-steps">
        {[
          { step: '先看前端本身的完整性', detail: '任务看板 → 任务详情六个标签页 → 人工操作；对话页看 Markdown / mermaid / drawio 渲染', view: 'dashboard' as const, label: '打开任务看板' },
          { step: '再看 JIRA / 分析的界面形态', detail: 'JIRA 页看范围确认与信息抽取；分析页看置信度策略与写回', view: 'jira' as const, label: '打开 JIRA 页' },
          { step: '最后看账号与门禁', detail: '账号页看角色权限与鉴权说明；门禁规则在任务详情与覆盖说明中体现', view: 'accounts' as const, label: '打开账号页' },
        ].map((item, index) => <div className="demo-step" key={item.step}>
          <span className="pipeline-number">{index + 1}</span>
          <div><b>{item.step}</b><p>{item.detail}</p></div>
          <button className="secondary-button tiny" onClick={() => onGoTo(item.view)}>{item.label}</button>
        </div>)}
      </div>
      <p className="card-footnote">全部页面共享同一套状态卡、表格与门禁组件，切换页面即切换业务视角，不额外引入新的交互范式。</p>
    </Panel>

    <SectionHeader eyebrow="逐条对照" title="功能点 → 界面对应位置"
      action={<div className="filter-bar compact">
        <label className="filter-field">模块
          <select value={module} onChange={(event) => setModule(event.target.value)}>
            {modules.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="filter-field">状态
          <select value={status} onChange={(event) => setStatus(event.target.value as CoverageRow['status'] | '全部')}>
            {statuses.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>} />

    <DataTable columns={['编号', '功能要点', '说明', '界面对应位置', '归属模块', '演示状态']} minWidth={1180}>
      {rows.map((row, index) => <tr key={`${row.code}-${index}`} onClick={() => onNotify(`${row.code} · ${row.feature} → ${row.surface}`)}>
        <td><b className="jira-key">{row.code}</b></td>
        <td><b>{row.feature}</b></td>
        <td>{row.detail}</td>
        <td><span className="stage-pill">{row.surface}</span></td>
        <td>{row.module}</td>
        <td><span className={`simple-status ${coverageTone(row.status)}`}>{row.status}</span></td>
      </tr>)}
    </DataTable>
    <p className="card-footnote"><CheckCircle2 size={14} /> 「已实现」= 前端本体可直接演示；「展示位」= 界面形态已固定，功能由对应 subAgent 后续实现；「演示方案」= 需求仍为待定项，本页给出可讨论的方案；「待定」= 需与上下游确认后再填写。</p>

    <div className="stat-row two">
      <Panel eyebrow="演示边界" title="本轮做到什么、没做什么">
        <div className="two-column">
          <ul className="bullet-list">
            <li><b>已做</b>：全部页面的界面与交互、Mock 数据、状态流转提示、渲染能力（Markdown / mermaid / drawio）</li>
            <li><b>已做</b>：知识库 / JIRA / 分析的字段模型、状态机、门禁规则在前端的可视化形态</li>
          </ul>
          <ul className="bullet-list">
            <li><b>未做</b>：不连接 JIRA / SmartWiki / SmartPerfetto，不产生真实工单与报告</li>
            <li><b>未做</b>：不接身份认证，账号与权限为演示数据；并发为展示值</li>
          </ul>
        </div>
        <div className="recommendation"><Sparkles size={18} /><span>各功能 Agent 的开发不在本轮范围：前端已按它们的职责预留展示位，接口确定后逐个替换为真实调用即可。</span></div>
      </Panel>

      <Panel eyebrow="下一步" title="需要确认的关键问题">
        <div className="open-questions">
          {[
            ['账号模型', '游客可写还是只读？是否需要每人独立账号？（暂定项）'],
            ['并发归属', '并发上限按账号还是按项目计算？多问题单同时触发时如何排队？'],
            ['交接产物形式', 'JIRA / 知识库 / SmartPerfetto 三方交接产物的字段与格式尚未约定'],
            ['知识库接口', '知识库 subAgent 提供何种查询接口？输入-输出如何保存？'],
          ].map(([title, question]) => <div className="open-question" key={title}>
            <span className="question-icon">?</span>
            <div><b>{title}</b><p>{question}</p></div>
          </div>)}
        </div>
        <div className="auth-note"><Gauge size={16} /><span>以上问题不阻塞前端演示，但会影响后续 Agent 的接口设计与并发策略。</span></div>
      </Panel>
    </div>
  </section>
}

function coverageTone(status: CoverageRow['status']) {
  if (status === '已实现') return 'ok'
  if (status === '展示位') return 'neutral'
  if (status === '演示方案') return 'warn'
  return 'bad'
}
