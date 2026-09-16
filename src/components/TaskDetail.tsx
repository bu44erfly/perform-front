import { useState } from 'react'
import {
  Activity, AlertCircle, ArrowLeft, Bot, CheckCircle2, Download, FileCheck2, Link2,
  ShieldCheck, Sparkles,
} from 'lucide-react'
import { agentStages, flowHistory, gateChecks } from '../data/mockData'
import type { Task } from '../data/types'
import { confidenceLevel, statusClass, statusIcon } from '../status'
import { ActionButton, OperationRow, type TaskAction } from './actions'
import { DataTable, InfoList, Metric, Modal, Panel, SectionHeader } from './Ui'

export type DetailTab = 'snapshot' | 'trace' | 'analysis' | 'report' | 'review' | 'requirements'

const tabs: { id: DetailTab; label: string }[] = [
  { id: 'snapshot', label: '问题快照 / JIRA' },
  { id: 'trace', label: 'Trace 合规性校验' },
  { id: 'analysis', label: '分析与置信度' },
  { id: 'report', label: '诊断报告' },
  { id: 'review', label: '审核与 JIRA 回帖' },
  { id: 'requirements', label: '功能覆盖说明' },
]

/** 前端功能的逐条映射，用于向评审展示“界面即证据” */
export const requirementRows: { code: string; feature: string; surface: string; status: string }[] = [
  { code: '5.1.1', feature: '任务总览：待处理 / 处理中 / 待补资料 / 待审核 / 已完成 / 失败', surface: '看板状态卡 + 任务表 + 顶部统计磁贴', status: '已实现' },
  { code: '5.1.1', feature: '按字段、范围查询问题单能力', surface: '关键字搜索 + 项目/Trace 下拉筛选 + 状态卡联动', status: '已实现' },
  { code: '5.1.1', feature: '查看指定问题原始信息、分析数据、报告、审核意见与回帖记录', surface: '任务详情六个标签页', status: '已实现' },
  { code: '5.1.1', feature: '附件、Trace 等文件的下载接口', surface: '看板下载区 + 附件卡片 + 报告导出按钮', status: '已实现' },
  { code: '5.1.3', feature: '人工操作：重试、人工确认、暂停、排除等', surface: '任务行内操作 + 右侧人工介入面板', status: '已实现' },
  { code: '5.2.1', feature: '类 ChatGPT / ClaudeCode 的对话输入框，调度各 subAgent', surface: '智能对话工作区输入框与消息流', status: '已实现' },
  { code: '5.2.1', feature: '@ / slash 快捷输入命令与 skill', surface: '对话输入框快捷符号 + 命令 / skill 下拉菜单', status: '已实现' },
  { code: '5.2.1', feature: '长任务折叠为进度卡片', surface: '对话消息流中的编排进度卡片', status: '已实现' },
  { code: '5.2.2', feature: '查看历史对话记录和结果', surface: '对话左侧历史列表 + 新建对话', status: '已实现' },
  { code: '5.2.3', feature: '渲染 Markdown 答复内容', surface: 'marked + DOMPurify 渲染标题、列表、表格、代码块', status: '已实现' },
  { code: '5.2.3', feature: '渲染 drawio、mermaid 等格式', surface: 'mermaid 实时出图；drawio 解析 mxGraphModel 出图并可下载源文件', status: '已实现' },
  { code: '5.2.4', feature: '单条消息操作', surface: '复制 / 重新生成 / 引用追问 / 反馈 / 导出 / 跳转', status: '已实现' },
  { code: '5.3.1', feature: 'TCL 内部账号登录 + Confluence 鉴权', surface: '账号管理页：登录与授权说明卡', status: '演示方案' },
  { code: '5.3.2', feature: '权限与数据可见范围', surface: '账号管理页：角色边界、权限矩阵、服务账号受限', status: '演示方案' },
  { code: '5.3.2', feature: '并发处理：多用户输入与多问题单触发', surface: '账号管理页：Agent 槽位、排队策略、多问题单并发示意', status: '演示方案' },
]

interface Props {
  task: Task
  tab: DetailTab
  onTab: (tab: DetailTab) => void
  onBack: () => void
  onAction: (task: Task, action: TaskAction) => void
  onNotify: (message: string) => void
}

export function TaskDetail({ task, tab, onTab, onBack, onAction, onNotify }: Props) {
  const [modal, setModal] = useState<TaskAction | null>(null)

  const openModal = (action: TaskAction) => {
    // 只读类操作（下载 / 导出）直接反馈，其余操作走确认框，模拟记录操作人与原因
    if (action === '下载 Trace' || action === '导出报告' || action === '批量下载附件' || action === '发布 JIRA 回帖') return onAction(task, action)
    setModal(action)
  }

  const level = confidenceLevel(task.confidence)

  return <section className="page">
    <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> 返回任务看板</button>

    <div className="task-title-row">
      <div>
        <div className="title-tags">
          <b className="jira-key large">{task.id}</b>
          <span className={`status-badge ${statusClass(task.status)}`}>{statusIcon(task.status)} {task.status}</span>
          <span className="priority">{task.priority}</span>
          <span className="simple-status neutral">{task.category}</span>
        </div>
        <h1>{task.title}</h1>
        <p>{task.environment} · 输入快照 v1.3 · 分析运行 v2 · 报告 v2.1 · 负责人 {task.owner}</p>
      </div>
      <div className="hero-actions">
        <ActionButton action={task.status === '已暂停' ? '继续任务' : '暂停任务'} onClick={() => openModal(task.status === '已暂停' ? '继续任务' : '暂停任务')} />
        <ActionButton action="重试" onClick={() => openModal('重试')} />
        <ActionButton action="审核通过" variant="primary" onClick={() => openModal('审核通过')} />
      </div>
    </div>

    <div className="lifecycle">
      {['已受理', 'Trace 校验', '分析与编排', '报告生成', '人工审核', 'JIRA 回帖'].map((step, index) => (
        <span key={step} className={index < 4 ? 'done' : index === 4 ? 'current' : ''}>{step}</span>
      ))}
    </div>

    {task.blocker && <div className="blocker"><AlertCircle size={18} /><span><b>当前门禁：</b>{task.blocker}（未通过门禁不会进入下一步骤）</span><button onClick={() => openModal('请求补充资料')}>请求补充</button></div>}

    <div className="detail-layout">
      <div>
        <div className="tabs">{tabs.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => onTab(item.id)}>{item.label}</button>)}</div>
        <div className="artifact-card">
          {tab === 'snapshot' && <SnapshotTab task={task} />}
          {tab === 'trace' && <TraceTab />}
          {tab === 'analysis' && <AnalysisTab task={task} level={level} />}
          {tab === 'report' && <ReportTab task={task} onNotify={onNotify} />}
          {tab === 'review' && <ReviewTab onAction={openModal} />}
          {tab === 'requirements' && <RequirementsTab />}
        </div>
      </div>

      <aside className="operation-panel">
        <p className="eyebrow">人工操作</p>
        <h3>人工介入</h3>
        <p>所有操作只在当前浏览器内模拟记录，并写入本地审计轨迹，不会调用 JIRA 或外部服务。</p>
        <OperationRow action="人工确认" onClick={() => openModal('人工确认')} />
        <OperationRow action="请求补充资料" onClick={() => openModal('请求补充资料')} />
        <OperationRow action="暂停任务" onClick={() => openModal('暂停任务')} />
        <OperationRow action="取消任务" onClick={() => openModal('取消任务')} />
        <OperationRow action="重新发起分析" onClick={() => openModal('重新发起分析')} />
        <OperationRow action="排除任务" onClick={() => openModal('排除任务')} />
        <div className="audit">
          <b>最近操作</b>
          <div><span className="avatar small">王</span><p><b>王工</b> 查看了 Trace 合规性校验<br /><small>今天 10:44 · 模拟审计</small></p></div>
          <div><span className="timeline-dot" /><p>Report Agent 生成诊断报告 v2.1<br /><small>今天 10:42 · 模拟事件</small></p></div>
          <div><span className="timeline-dot" /><p>SmartPerfetto 第 2 轮分析返回<br /><small>今天 10:38 · 模拟事件</small></p></div>
        </div>
        <div className="panel-note">每次人工操作都会记录操作人与原因，对应流程历史化保存。</div>
      </aside>
    </div>

    {modal && <TaskActionModal task={task} action={modal} onClose={() => setModal(null)} onConfirm={() => { onAction(task, modal); setModal(null) }} />}
  </section>
}

function TaskActionModal({ task, action, onClose, onConfirm }: { task: Task; action: TaskAction; onClose: () => void; onConfirm: () => void }) {
  const [reason, setReason] = useState('')
  return <Modal
    eyebrow={`${task.id} · 模拟操作`}
    title={action}
    description="该操作只更新当前浏览器中的演示界面，不会创建 JIRA 工单、触发 Agent 或修改外部系统。"
    onClose={onClose}
    onConfirm={onConfirm}
  >
    <label className="field">操作人<input defaultValue="王工 · Reviewer" readOnly /></label>
    <label className="field">操作原因 / 备注<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：对比机 Trace 已补充，恢复流程继续分析" /></label>
    <p className="modal-note">演示环境下原因会写入任务审计轨迹，用于展示可追溯性。</p>
  </Modal>
}

/* ------------------------------ 各标签页 ------------------------------ */

function ArtifactHeader({ icon, title, sub, action }: { icon: React.ReactNode; title: string; sub: string; action?: React.ReactNode }) {
  return <div className="artifact-header"><div className="artifact-icon">{icon}</div><div><h2>{title}</h2><p>{sub}</p></div>{action && <div className="artifact-action">{action}</div>}</div>
}

function SnapshotTab({ task }: { task: Task }) {
  return <>
    <ArtifactHeader icon={<FileCheck2 />} title="原始问题快照（JIRA 固定输入版本）" sub="受理后冻结输入，后续环节只认该版本" />
    <div className="summary-box">
      <p className="eyebrow">问题描述</p>
      <h3>{task.title}</h3>
      <p>{task.summary}</p>
    </div>
    <div className="field-grid">
      {[['JIRA 编号', task.id], ['项目', task.project], ['问题类型', '性能缺陷'], ['优先级', task.priority],
        ['负责人', task.owner], ['报告人', '测试 · 周工'], ['状态', '重新打开'], ['组件', task.category],
        ['创建时间', '2026-09-08 14:20'], ['更新时间', task.updatedAt], ['标签', 'startup, latency, p5'], ['关联测项', 'cold_start_first_frame']].map(([label, value]) => (
        <div className="field-cell" key={label}><small>{label}</small><b>{value}</b></div>
      ))}
    </div>
    <SectionHeader eyebrow="概览" title="描述、评论与附件" />
    <div className="two-column">
      <InfoList title="复现与期望" items={['冷启动视频应用，重复 5 次', '问题机首帧 P95：3.86s；对比机：2.62s', '期望首帧不高于对比基线 10%']} />
      <InfoList title="环境线索" items={['问题机 / 对比机同平台同芯片', 'App 8.2.1 · Android 15 · 千兆有线', 'Trace 附件 2 个，评论 6 条']} />
    </div>
    <DataTable columns={['评论人', '评论摘要', '时间', '来源定位']} minWidth={620}>
      <tr><td><b>测试 · 周工</b></td><td>补充了对比机 Trace，场景与问题机一致</td><td className="muted">2026-09-13 09:40</td><td><span className="link-cell"><Link2 size={13} /> comment #4</span></td></tr>
      <tr><td><b>开发 · 李工</b></td><td>怀疑初始化任务串行执行，请分析确认</td><td className="muted">2026-09-14 11:16</td><td><span className="link-cell"><Link2 size={13} /> comment #5</span></td></tr>
      <tr><td><b>测试 · 郑工</b></td><td>已同步产品，暂按性能问题继续</td><td className="muted">2026-09-15 08:55</td><td><span className="link-cell"><Link2 size={13} /> comment #6</span></td></tr>
    </DataTable>
    <SectionHeader eyebrow="概览" title="附件与下载接口" />
    <div className="attachment-row">
      <Attachment name="perf-2048-problem.trace" meta="126 MB · 问题机 · 已校验" />
      <Attachment name="perf-2048-reference.trace" meta="119 MB · 对比机 · 已校验" />
    </div>
  </>
}

function Attachment({ name, meta }: { name: string; meta: string }) {
  return <div className="attachment"><FileCheck2 /><div><b>{name}</b><small>{meta}</small></div><Download size={17} /></div>
}

function TraceTab() {
  return <>
    <ArtifactHeader icon={<Activity />} title="Trace 合规性校验" sub="完整性、场景一致性、对比条件、多 Trace 规则" />
    <div className="trace-grid">
      <TraceCard title="问题机 Trace" device="P5 · 65X9" status="通过" note="120 min · 目标进程完整 · 首帧窗口已定位" />
      <TraceCard title="对比机 Trace" device="P5 · 65X9" status="通过" note="118 min · 同场景 · 版本与网络条件对齐" />
    </div>
    <h3 className="subheading">校验清单</h3>
    <div className="check-list">
      <CheckItem label="文件可加载，未发现截断或损坏" pass />
      <CheckItem label="采集时长、目标进程和关键线程满足分析条件" pass />
      <CheckItem label="JIRA 预期场景与 Trace 实际场景匹配" pass />
      <CheckItem label="对比条件：机型、系统与应用版本、网络、测试步骤已对齐" pass />
      <CheckItem label="重复 Trace 识别：未发现重复引用" pass />
    </div>
    <div className="recommendation"><Sparkles size={18} /><span><b>校验结论：</b>双 Trace 可用于对比分析，允许进入 SmartPerfetto 分析阶段。</span></div>
    <SectionHeader eyebrow="概览" title="Trace 角色与场景一致性" />
    <DataTable columns={['Trace', '角色', '实际场景', '与 JIRA 预期', '可比性']} minWidth={720}>
      <tr><td><b>perf-2048-problem.trace</b></td><td><span className="simple-status neutral">问题机</span></td><td>冷启动视频应用</td><td><span className="simple-status ok">一致</span></td><td>参考基线</td></tr>
      <tr><td><b>perf-2048-reference.trace</b></td><td><span className="simple-status neutral">对比机</span></td><td>冷启动视频应用</td><td><span className="simple-status ok">一致</span></td><td><span className="simple-status ok">可用</span></td></tr>
      <tr><td><b>perf-2048-old.trace</b></td><td><span className="simple-status warn">未归类</span></td><td>待识别</td><td>—</td><td><span className="simple-status warn">需人工确认</span></td></tr>
    </DataTable>
  </>
}

function TraceCard({ title, device, status, note }: { title: string; device: string; status: string; note: string }) {
  return <div className="trace-card"><div><p>{title}</p><h3>{device}</h3></div><span className="simple-status ok">{status}</span><small>{note}</small></div>
}

function CheckItem({ label, pass }: { label: string; pass: boolean }) {
  return <p><span className={pass ? 'check pass' : 'check'}>{pass ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}</span>{label}</p>
}

function AnalysisTab({ task, level }: { task: Task; level: { label: string; tone: string } }) {
  return <>
    <ArtifactHeader icon={<Bot />} title="分析与置信度" sub="保留来源结论，不将疑似根因升级为已证实" />
    <div className="confidence-grid">
      <Metric label="SmartPerfetto 来源置信度" value={task.sourceConfidence ? `${task.sourceConfidence}%` : '不可计算'} tone="blue" />
      <Metric label="案例级置信度（本模块计算）" value={task.confidence ? `${task.confidence}%` : '不可计算'} tone="purple" />
      <Metric label="结论分级" value={task.conclusion} tone="orange" />
    </div>
    <div className="evidence-card">
      <h3>关键发现</h3>
      <p>问题机在应用初始化阶段存在 1.24s 额外耗时。该时间窗内，媒体能力初始化、账户恢复和首屏预加载以串行形式执行，可能延长主线程关键路径。</p>
      <div className="metric-row">
        <Metric label="问题机首帧 P95" value="3.86s" tone="red" />
        <Metric label="对比机首帧 P95" value="2.62s" tone="blue" />
        <Metric label="差异" value="+1.24s" tone="orange" />
      </div>
    </div>
    <div className="two-column">
      <InfoList title="命中的知识库参考（交接包带入）" items={['METHOD-012 · 冷启动时序与关键路径分析', 'CASE-087 · P5 视频应用初始化阻塞', 'EXP-021 · P5 平台媒体服务启动特征']} />
      <InfoList title="证据限制与待验证项" items={['尚未验证低端内存配置下的表现', '初始化任务串并行策略需研发确认', '结论受限于当前两组 Trace 采集范围']} tone="blue" />
    </div>
    <SectionHeader eyebrow="置信度不足时的重新分析" title="重新分析轮次" action={<span className={`status-badge ${level.tone}`}>当前案例级置信度 {level.label}</span>} />
    <DataTable columns={['轮次', '侧重点', '案例置信度', '结果', '时间']} minWidth={680}>
      <tr><td><b>第 1 轮</b></td><td>冷启动关键路径整体扫描</td><td>71%</td><td><span className="simple-status warn">低于门槛</span></td><td className="muted">今天 09:02</td></tr>
      <tr><td><b>第 2 轮</b></td><td>聚焦初始化串行阻塞窗口</td><td><b>86%</b></td><td><span className="simple-status ok">达标</span></td><td className="muted">今天 10:38</td></tr>
      <tr><td>第 3 ~ 5 轮</td><td colSpan={4} className="muted">未使用（上限 5 轮，达到上限仍未达标则转人工处理）</td></tr>
    </DataTable>
    <div className="recommendation"><Sparkles size={18} /><span><b>门禁提示：</b>来源置信度与案例级置信度分开展示、不互相替代；低于门槛时只输出受限疑似结论。</span></div>
  </>
}

function ReportTab({ task, onNotify }: { task: Task; onNotify: (message: string) => void }) {
  return <>
    <ArtifactHeader icon={<FileCheck2 />} title="诊断报告 v2.1" sub="Markdown 产物，模板版本与分析配置版本均可追溯"
      action={<button className="secondary-button" onClick={() => onNotify('已模拟导出诊断报告 Markdown（演示不落盘）')}><Download size={16} /> 导出 Markdown</button>} />
    <article className="report">
      <h2>视频应用冷启动性能诊断</h2>
      <p className="report-meta">{task.id} · 报告版本 2.1 · 模板 v3 · 分析配置 2026.09 · 生成时间 今天 10:42</p>
      <h3>结论摘要</h3>
      <blockquote>当前证据表明，初始化任务的串行执行是首帧延迟的<strong>高度怀疑</strong>因素；建议通过并行化或延后非关键初始化验证改善幅度。</blockquote>
      <h3>关键指标</h3>
      <table>
        <thead><tr><th>指标</th><th>问题机</th><th>对比机</th><th>差异</th></tr></thead>
        <tbody>
          <tr><td>首帧 P95</td><td>3.86s</td><td>2.62s</td><td>+1.24s</td></tr>
          <tr><td>初始化关键路径</td><td>2.18s</td><td>0.97s</td><td>+1.21s</td></tr>
        </tbody>
      </table>
      <h3>处理流程</h3>
      <pre>JIRA 快照 → Trace 通过 → 知识参考命中 → 性能分析（2 轮）→ 人工审核</pre>
      <h3>建议</h3>
      <ul>
        <li>将账户恢复移出首帧关键路径。</li>
        <li>验证媒体能力初始化并行化的收益。</li>
        <li>变更后采集同环境双 Trace 做回归比对。</li>
      </ul>
      <h3>限制</h3>
      <p>本次结论仅覆盖 P5 平台、Android 15、App 8.2.1 与当前网络条件下的两组 Trace，不作为其他配置的结论。</p>
    </article>
  </>
}

function ReviewTab({ onAction }: { onAction: (action: TaskAction) => void }) {
  return <>
    <ArtifactHeader icon={<ShieldCheck />} title="审核与 JIRA 回帖" sub="人工审核是正式发布的唯一入口" />
    <div className="review-status">
      <FileCheck2 />
      <div><b>报告等待人工审核</b><p>报告、Trace 校验和置信度门禁均已满足；审核通过后才可发布 JIRA 回帖。</p></div>
      <span className="status-badge review">待审核</span>
    </div>
    <div className="comment">
      <span className="avatar">刘</span>
      <div><b>刘工 · 审核意见</b><p>请确认“串行阻塞”表述应保持为“高度怀疑”，并在回帖中补充复现条件与对比机信息。</p><small>今天 10:45 · 演示数据</small></div>
    </div>
    <div className="reply-preview">
      <p className="eyebrow">拟发布 JIRA 回帖 · 尚未实际发布</p>
      <p>已完成 {`PERF-2048`} 的 Trace 校验与初步性能诊断。问题机首帧 P95 为 3.86s，较对比机增加 1.24s。当前证据显示应用初始化阶段存在串行执行风险，结论分级为“高度怀疑”。建议按报告中的待验证项完成优化与回归采集。</p>
      <div>
        <button className="secondary-button" onClick={() => onAction('驳回并要求补充')}>驳回并要求补充</button>
        <button className="primary-button" onClick={() => onAction('发布 JIRA 回帖')}>发布回帖</button>
      </div>
    </div>
    <SectionHeader eyebrow="流程历史化保存" title="编排轨迹" />
    <div className="timeline">
      {flowHistory.map((step) => <div className={`timeline-row ${step.state}`} key={step.step}>
        <span className="timeline-marker" />
        <div><b>{step.step}</b><p>{step.detail}</p></div>
        <small>{step.actor}<br />{step.time}</small>
      </div>)}
    </div>
    <SectionHeader eyebrow="概览" title="质量门禁与错误报告" />
    <DataTable columns={['检查环节', '门禁规则', '结果']} minWidth={640}>
      {gateChecks.map((check) => <tr key={check.stage}>
        <td><b>{check.stage}</b></td>
        <td>{check.rule}</td>
        <td><span className={`simple-status ${check.state === '通过' ? 'ok' : check.state === '阻断' ? 'bad' : 'warn'}`}>{check.state === '阻断' ? '阻断' : check.state}</span></td>
      </tr>)}
    </DataTable>
    <div className="recommendation"><AlertCircle size={18} /><span><b>门禁未通过时：</b>按约定模板汇总各环节检查结果，生成错误报告用于 JIRA 回写或人工接入。</span></div>
  </>
}

function RequirementsTab() {
  return <>
    <ArtifactHeader icon={<Sparkles />} title="功能覆盖说明" sub="把前端 UI 的功能逐条映射到界面位置" />
    <DataTable columns={['编号', '功能要点', '界面对应位置', '演示状态']} minWidth={900}>
      {requirementRows.map((row, index) => <tr key={`${row.code}-${index}`}>
        <td><b className="jira-key">{row.code}</b></td>
        <td>{row.feature}</td>
        <td>{row.surface}</td>
        <td><span className={`simple-status ${row.status === '已实现' ? 'ok' : 'warn'}`}>{row.status}</span></td>
      </tr>)}
    </DataTable>
    <SectionHeader eyebrow="演示边界" title="本次前端演示的说明" />
    <div className="two-column">
      <InfoList title="已经可以展示" items={['看板、查询、任务详情、人工操作的完整交互', '对话界面与 Markdown / mermaid / drawio 渲染', '账号、角色、权限与并发的未来形态']} />
      <InfoList title="尚未接入（无后端）" items={['全部数据来自本地 Mock，不连接 JIRA / 知识库 / SmartPerfetto', '操作只写入浏览器内的模拟审计，不产生真实工单', '账号与权限未接身份认证服务']} tone="blue" />
    </div>
    <div className="recommendation"><Sparkles size={18} /><span><b>其他模块（知识库 / JIRA / 智能分析及各 subAgent）</b>本轮不需要功能实现，界面已按它们的职责预留展示位，后续替换为真实接口即可。</span></div>
  </>
}

export function StageRail() {
  return <div className="stage-rail">
    {agentStages.map((stage) => <span className="stage-chip" key={stage.name} data-state={stage.state}>{stage.shortName} · {stage.state}</span>)}
  </div>
}
