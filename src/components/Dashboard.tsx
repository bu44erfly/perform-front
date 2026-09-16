import { Download, FileArchive, FileCheck2, FolderTree, ShieldCheck } from 'lucide-react'
import { agentStages, tasks } from '../data/mockData'
import type { Task, TaskStatus } from '../data/types'
import { statusClass, statusIcon } from '../status'
import { DataTable, Panel, SectionHeader, StatTile } from './Ui'
import { ActionIcon, type TaskAction } from './actions'

interface Props {
  filteredTasks: Task[]
  statusFilter: TaskStatus | '全部'
  query: string
  projectFilter: string
  traceFilter: string
  projects: string[]
  onStatus: (status: TaskStatus | '全部') => void
  onQuery: (value: string) => void
  onProject: (value: string) => void
  onTrace: (value: string) => void
  onReset: () => void
  onOpenTask: (task: Task) => void
  onAction: (task: Task, action: TaskAction) => void
}

export function Dashboard({
  filteredTasks, statusFilter, query, projectFilter, traceFilter, projects,
  onStatus, onQuery, onProject, onTrace, onReset, onOpenTask, onAction,
}: Props) {
  const traceOptions = ['全部', '通过', '校验中', '待补充', '异常']
  return <section className="page">
    <div className="page-hero">
      <div>
        <p className="eyebrow">交互式看板</p>
        <h1>性能问题分析控制中心</h1>
        <p className="hero-copy">查看待处理、处理中、待补资料、待审核、已完成和失败的分析任务，并按字段与范围查询问题单。</p>
      </div>
      <div className="hero-actions">
        <button className="secondary-button" onClick={() => onAction(filteredTasks[0] ?? tasks[0], '批量下载附件')}><Download size={16} /> 批量下载附件</button>
        <button className="primary-button" onClick={() => onAction(filteredTasks[0] ?? tasks[0], '发起分析任务')}><FileArchive size={16} /> 发起分析任务</button>
      </div>
    </div>

    <div className="status-grid">
      {(['待处理', '分析中', '待补资料', '待审核', '已完成', '失败 / 人工介入'] as TaskStatus[]).map((status) => {
        const count = tasks.filter((item) => item.status === status).length
        return <button className={`status-card ${statusClass(status)} ${statusFilter === status ? 'selected' : ''}`} onClick={() => onStatus(statusFilter === status ? '全部' : status)} key={status}>
          <span className="status-card-icon">{statusIcon(status)}</span>
          <span><b>{count}</b><small>{status}</small></span>
        </button>
      })}
    </div>

    <Panel eyebrow="知识库 / JIRA / 分析协作 · 固定自动化流水线" title="功能 Agent 协作态势"
      action={<span className="subtle-label"><span className="dot" /> 6 个功能 Agent 全部来自 Mock 数据</span>}
      footnote="自动化轮询触发时，后台按固定流程以流水线形式调度各 subAgent；对话触发的请求只调用相关 subAgent。">
      <div className="pipeline-card">
        {agentStages.map((stage, index) => <div className="pipeline-step" key={stage.name} data-state={stage.state}>
          <div className="pipeline-number">{index + 1}</div>
          <div><b>{stage.name}</b><small>{stage.shortName}</small></div>
          <span className="agent-state" data-state={stage.state}>{stage.count} 项 · {stage.state}</span>
          <p>{stage.output}</p>
        </div>)}
      </div>
    </Panel>

    <div className="stat-row">
      <StatTile label="当前问题单" value={String(tasks.length)} unit=" 单" tone="blue" hint="全部来自本地 Mock" />
      <StatTile label="待人工审核" value={String(tasks.filter((task) => task.status === '待审核').length)} unit=" 单" tone="purple" hint="审核是正式发布唯一入口" />
      <StatTile label="需补充资料" value={String(tasks.filter((task) => task.status === '待补资料').length)} unit=" 单" tone="orange" hint="已生成补充资料模板" />
      <StatTile label="失败 / 人工介入" value={String(tasks.filter((task) => task.status === '失败 / 人工介入').length)} unit=" 单" tone="red" hint="服务异常需上报开发人员" />
    </div>

    <SectionHeader eyebrow="任务总览与查询" title="当前分析任务"
      action={<button className="text-button" onClick={onReset}>重置筛选</button>} />

    <div className="filter-bar">
      <div className="search-box"><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="搜索 JIRA 编号、标题、项目、人员、机型…" /></div>
      <label className="filter-field">项目
        <select value={projectFilter} onChange={(event) => onProject(event.target.value)}>
          {['全部', ...projects].map((project) => <option key={project} value={project}>{project}</option>)}
        </select>
      </label>
      <label className="filter-field">Trace
        <select value={traceFilter} onChange={(event) => onTrace(event.target.value)}>
          {traceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <span className="result-count">{filteredTasks.length} / {tasks.length} 条结果</span>
    </div>

    <DataTable columns={['问题单', '项目 / 设备', '问题类别', '当前环节', 'Trace', '审核状态', '更新时间', '任务状态', '操作']} minWidth={1180}>
      {filteredTasks.map((task) => <tr key={task.id}>
        <td className="cell-main" onClick={() => onOpenTask(task)}><b className="jira-key">{task.id}</b><span>{task.title}</span></td>
        <td onClick={() => onOpenTask(task)}><b>{task.project}</b><span>{task.device}</span></td>
        <td onClick={() => onOpenTask(task)}>{task.category}</td>
        <td onClick={() => onOpenTask(task)}><span className="stage-pill">{task.stage}</span></td>
        <td onClick={() => onOpenTask(task)}><span className={`simple-status ${task.traceStatus === '通过' ? 'ok' : task.traceStatus === '异常' ? 'bad' : 'warn'}`}>{task.traceStatus}</span></td>
        <td onClick={() => onOpenTask(task)}>{task.reviewStatus}</td>
        <td className="muted" onClick={() => onOpenTask(task)}>{task.updatedAt}</td>
        <td onClick={() => onOpenTask(task)}><span className={`status-badge ${statusClass(task.status)}`}>{statusIcon(task.status)} {task.status}</span></td>
        <td className="row-actions">
          <ActionIcon label="重试当前环节" action="重试" onClick={() => onAction(task, '重试')} />
          <ActionIcon label="人工确认" action="人工确认" onClick={() => onAction(task, '人工确认')} />
          <ActionIcon label="查看详情" action="查看" onClick={() => onOpenTask(task)} />
        </td>
      </tr>)}
    </DataTable>
    {filteredTasks.length === 0 && <div className="empty-state">没有匹配的模拟任务，请调整筛选条件。</div>}

    <div className="hint-grid">
      <Panel eyebrow="文件下载接口" title="附件与 Trace 下载">
        <div className="download-row"><IconTile icon={<FileCheck2 />} /><div><b>perf-2048-problem.trace</b><small>126 MB · 问题机 · 已通过校验</small></div><button className="secondary-button" onClick={() => onAction(tasks[0], '下载 Trace')}><Download size={15} /> 下载</button></div>
        <div className="download-row"><IconTile icon={<FileCheck2 />} /><div><b>perf-2048-reference.trace</b><small>119 MB · 对比机 · 已通过校验</small></div><button className="secondary-button" onClick={() => onAction(tasks[0], '下载 Trace')}><Download size={15} /> 下载</button></div>
        <div className="download-row"><IconTile icon={<FolderTree />} /><div><b>诊断报告 PERF-2048 v2.1.md</b><small>Markdown 产物 · 含置信度与证据分级</small></div><button className="secondary-button" onClick={() => onAction(tasks[0], '导出报告')}><Download size={15} /> 导出</button></div>
        <p className="card-footnote">演示环境不会真实下载大文件，仅提示接口形态；原始 Trace / 日志不入知识库，只存链接或编号。</p>
      </Panel>
      <Panel eyebrow="质量门禁" title="交接产物检查">
        {[['JIRA 采集产物', '字段齐全，保留原始定位', 'ok'], ['知识库查询产物', '输入-输出成对保存', 'ok'], ['分析报告产物', '与任务、冻结输入三者绑定', 'ok'], ['置信度门禁', '低于门槛不输出确定性根因', 'warn'], ['人工接入标记', '被标注的产物直接阻断', 'bad']].map(([name, rule, tone]) => (
          <div className="gate-row" key={name}><span className={`gate-dot ${tone}`} /><div><b>{name}</b><small>{rule}</small></div></div>
        ))}
        <p className="card-footnote"><ShieldCheck size={14} /> 任何环节未通过门禁都不会进入下一步骤，而是按模板输出错误报告。</p>
      </Panel>
    </div>
  </section>
}

function IconTile({ icon }: { icon: React.ReactNode }) {
  return <span className="icon-tile">{icon}</span>
}
