import { useMemo, useState } from 'react'
import {
  CalendarClock, ClipboardList, Download, Filter, MessageSquareReply, Play, Search, ShieldAlert,
} from 'lucide-react'
import { extractGroups, issueSetRecords, jiraIssues } from '../data/moduleData'
import type { JiraIssue } from '../data/moduleData'
import { DataTable, Modal, Panel, SectionHeader, StatTile } from './Ui'

interface Props {
  onNotify: (message: string) => void
}

/** JIRA 集成与流程管理 —— 前端展示位，功能由 JIRA subAgent 后续实现 */
export function JiraBridge({ onNotify }: Props) {
  const [keyword, setKeyword] = useState('')
  const [project, setProject] = useState('全部')
  const [scope, setScope] = useState<'全部' | '未分析' | '已分析'>('全部')
  const [selected, setSelected] = useState<JiraIssue>(jiraIssues[0])
  const [jqlOpen, setJqlOpen] = useState(false)

  const projects = useMemo(() => Array.from(new Set(jiraIssues.map((issue) => issue.project))), [])

  const rows = jiraIssues.filter((issue) => {
    const matchKeyword = !keyword.trim() || [issue.key, issue.summary, issue.assignee, issue.labels, issue.components].join(' ').toLowerCase().includes(keyword.trim().toLowerCase())
    const matchProject = project === '全部' || issue.project === project
    const matchScope = scope === '全部' || (scope === '未分析' ? !issue.analyzed : issue.analyzed)
    return matchKeyword && matchProject && matchScope
  })

  return <section className="page">
    <div className="page-hero">
      <div>
        <p className="eyebrow">JIRA 集成与流程管理 · 前端展示位</p>
        <h1>JIRA 集成与流程管理</h1>
        <p className="hero-copy">问题集范围确认、信息抽取、性能过滤与去重、Trace 合规性校验、自动回帖，这些都是 JIRA subAgent 的职责；本页把它们的输入输出与界面形态先固定下来。</p>
      </div>
      <div className="hero-actions">
        <button className="secondary-button" onClick={() => setJqlOpen(true)}><Search size={16} /> 自然语言转 JQL</button>
        <button className="primary-button" onClick={() => onNotify('已模拟触发一次每日增量扫描（演示不访问 JIRA）')}><CalendarClock size={16} /> 立即触发增量扫描</button>
      </div>
    </div>

    <div className="stat-row">
      <StatTile label="候选问题单" value={String(jiraIssues.length)} unit=" 单" tone="blue" hint="范围：TV 相关项目" />
      <StatTile label="未分析" value={String(jiraIssues.filter((issue) => !issue.analyzed).length)} unit=" 单" tone="orange" hint="可进入分析流水线" />
      <StatTile label="已排除" value="1" unit=" 单" tone="purple" hint="非性能问题 / 重复，记录原因" />
      <StatTile label="任务快照" value="4" unit=" 份" tone="green" hint="单问题粒度，冻结后不可变" />
    </div>

    <SectionHeader eyebrow="问题集范围确认与触发" title="三条触发路径" />
    <div className="flow-grid">
      <div className="flow-card">
        <b>人工对话式范围确认</b>
        <p className="flow-intent">按人员 / 项目 / 状态 / 标签 / 组件 / 类型 / 时间范围 / 是否已分析</p>
        <p>在对话界面确认本次待处理的问题集，并展示确认结果供人工核对。</p>
        <small>对应对话框触发路径</small>
      </div>
      <div className="flow-card">
        <b>历史问题人工筛选 / 指定单号</b>
        <p className="flow-intent">从历史问题中挑选未分析或需再次分析的单</p>
        <p>不要求自动任务重复扫描全量历史；支持直接指定单个 JIRA 编号重新发起分析。</p>
        <small>轻量入口，不占用流水线槽位直到确认</small>
      </div>
      <div className="flow-card">
        <b>每日增量扫描</b>
        <p className="flow-intent">上次成功处理后新增或发生关键变更的问题</p>
        <p>定时任务形成待判定问题集，并记录来源、筛选条件、触发时间与确认结果。</p>
        <small>后台串行，受并发上限约束</small>
      </div>
    </div>

    <SectionHeader eyebrow="概览" title="问题集范围确认"
      action={<button className="text-button" onClick={() => onNotify(`已模拟按当前条件触发分析，命中 ${rows.length} 单`)}>按当前条件触发分析 →</button>} />

    <div className="filter-bar">
      <div className="search-box"><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索 JIRA 编号、标题、负责人、标签、组件…" /></div>
      <label className="filter-field">项目
        <select value={project} onChange={(event) => setProject(event.target.value)}>
          {['全部', ...projects].map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <label className="filter-field">分析状态
        <select value={scope} onChange={(event) => setScope(event.target.value as '全部' | '未分析' | '已分析')}>
          {['全部', '未分析', '已分析'].map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <span className="result-count">{rows.length} / {jiraIssues.length} 条结果</span>
    </div>

    <div className="account-layout">
      <DataTable columns={['问题单', '项目 / 组件', '状态', '负责人', '标签', '更新时间', '已分析', '操作']} minWidth={980}>
        {rows.map((issue) => <tr key={issue.key} className={issue.key === selected.key ? 'selected-row' : ''} onClick={() => setSelected(issue)}>
          <td className="cell-main"><b className="jira-key">{issue.key}</b><span>{issue.summary}</span></td>
          <td><b>{issue.project}</b><span>{issue.components}</span></td>
          <td><span className="stage-pill">{issue.status}</span></td>
          <td>{issue.assignee}</td>
          <td><span className="mono">{issue.labels}</span></td>
          <td className="muted">{issue.updated}</td>
          <td><span className={`simple-status ${issue.analyzed ? 'ok' : 'warn'}`}>{issue.analyzed ? '已分析' : '未分析'}</span></td>
          <td className="row-actions">
            <button className="secondary-button tiny" onClick={(event) => { event.stopPropagation(); onNotify(`已模拟为 ${issue.key} 创建任务快照`) }}>生成快照</button>
            <button className="secondary-button tiny" onClick={(event) => { event.stopPropagation(); onNotify(`已模拟将 ${issue.key} 标记为排除（记录排除原因）`) }}>排除</button>
          </td>
        </tr>)}
      </DataTable>
      {rows.length === 0 && <div className="empty-state">没有匹配的模拟问题单，请调整筛选条件。</div>}

      <aside className="account-detail">
        <p className="eyebrow">任务快照</p>
        <h3 className="detail-title">{selected.key}</h3>
        <p className="muted">{selected.summary}</p>
        <div className="field-grid single">
          <div className="field-cell"><small>快照标识</small><b>jira-snapshot@v1.3</b></div>
          <div className="field-cell"><small>项目 / 组件</small><b>{selected.project} / {selected.components}</b></div>
          <div className="field-cell"><small>负责人 / 报告人</small><b>{selected.assignee} / {selected.reporter}</b></div>
          <div className="field-cell"><small>创建 / 更新</small><b>{selected.created} / {selected.updated}</b></div>
          <div className="field-cell"><small>附件与 Trace 线索</small><b>2 个附件 · 识别到 2 条 Trace 线索</b></div>
        </div>
        <button className="secondary-button full" onClick={() => onNotify(`已模拟为 ${selected.key} 创建待分析任务`)}><Play size={15} /> 创建待分析任务</button>
        <button className="secondary-button full" onClick={() => onNotify(`已模拟下载 ${selected.key} 的附件清单`)}><Download size={15} /> 下载附件清单</button>
        <p className="card-footnote">快照为单问题粒度：保存该次分析所需的 JIRA 信息、附件与 Trace 线索，后续环节只认该版本。</p>
      </aside>
    </div>

    <SectionHeader eyebrow="概览" title="问题集确认记录（可追溯）" />
    <DataTable columns={['来源', '筛选条件', '触发方式', '触发时间', '确认结果']} minWidth={820}>
      {issueSetRecords.map((record) => <tr key={record.time}>
        <td><b>{record.source}</b></td>
        <td><span className="mono">{record.filter}</span></td>
        <td>{record.trigger}</td>
        <td className="muted">{record.time}</td>
        <td>{record.result}</td>
      </tr>)}
    </DataTable>

    <SectionHeader eyebrow="概览" title="问题信息抽取与总表" />
    <div className="stat-row two">
      <Panel title="抽取字段分组">
        {extractGroups.map((group) => <div className="gate-row" key={group.group}>
          <span className={`gate-dot ${group.state}`} />
          <div><b>{group.group}<span className="count-pill">{group.count} 个字段</span></b><small>{group.fields.join(' · ')}</small></div>
        </div>)}
        <p className="card-footnote">抽取结果写入问题信息总表，供 Dashboard 查询、问题筛选和任务管理使用；每个进入流程的问题再生成独立任务快照。</p>
      </Panel>

      <Panel eyebrow="过滤与任务判定" title="性能问题过滤、排除与去重">
        <div className="gate-row"><span className="gate-dot ok" /><div><b>性能问题识别</b><small>按项目、问题类型、标签、组件、标题关键字、描述与状态判断是否在可处理范围内</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>问题排除标记</b><small>非性能 / 重复 / 无效 / 暂不处理，均记录排除原因（本页 1 单已排除）</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>重复任务控制</b><small>创建任务前检查同一问题是否已有处理中、已完成或等待审核的有效任务</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>已分析与失败任务判定</b><small>根据任务历史判断跳过 / 继续 / 人工确认 / 重新发起</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>待分析任务创建</b><small>明确向 Trace 校验与 SmartPerfetto 阶段传递任务标识、快照、附件与 Trace 信息</small></div></div>
      </Panel>
    </div>

    <div className="stat-row two">
      <Panel eyebrow="Trace 合规性校验" title="校验环节" action={<span className="stage-pill"><Filter size={13} /> JIRA 主责</span>}>
        <DataTable columns={['环节', '检查内容']} minWidth={0}>
          <tr><td><b>Trace 查找与下载</b></td><td>从附件、描述、评论与约定存储位置查找并下载</td></tr>
          <tr><td><b>文件格式与解压</b></td><td>识别支持的格式，完成解压与 Trace 提取</td></tr>
          <tr><td><b>完整性校验</b></td><td>损坏 / 截断 / 无法加载，时长、进程、线程、时间段是否满足分析要求</td></tr>
          <tr><td><b>重复文件识别</b></td><td>避免重复下载与重复分析</td></tr>
          <tr><td><b>场景一致性</b></td><td>预期场景提取、实际场景识别与匹配、人工确认入口</td></tr>
          <tr><td><b>对比机 Trace 管理</b></td><td>角色归类、环境信息、对比条件与配对关系</td></tr>
          <tr><td><b>多 Trace 规则校验</b></td><td>按设备 / 场景 / 版本 / 角色 / 轮次整理并标记异常样本</td></tr>
        </DataTable>
        <p className="card-footnote">校验结果在「任务详情 · Trace 合规性校验」标签页中逐条展示。</p>
      </Panel>

      <Panel eyebrow="自动回复与反馈" title="回帖与补充建议">
        <div className="gate-row"><span className="gate-dot ok" /><div><b>缺失资料检查</b><small>按问题类型与 Trace 校验结果识别缺失的 Trace、设备信息、版本、复现步骤、对比数据与日志</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>补充资料模板生成</b><small>按维度维护统一模板，填入问题编号、检查结果与待补充内容</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>资料补充后续处理</b><small>JIRA 新增附件、评论或关键资料后重新进入检查与分析流程</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>回帖模板管理</b><small>资料补充 / 校验失败 / 分析结果 / 审核意见 / 系统异常五类模板</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>审核后发布与去重重试</b><small>回帖前检查前置条件，异常或超时不重复回帖并记录重试结果</small></div></div>
        <div className="auth-note"><ShieldAlert size={16} /><span>JIRA 状态更新开关与服务账号操作范围由配置控制，回帖内容仍需人工审核后发布。</span></div>
      </Panel>
    </div>

    <Panel eyebrow="概览" title="回帖模板预览"
      action={<span className="stage-pill"><MessageSquareReply size={13} /> 拟发布 · 未实际回帖</span>}>
      <pre className="error-report">{`【分析结果回帖 · 模板 v3】
问题单      : PERF-2048  视频应用冷启动耗时异常
Trace 检查  : 通过（问题机 / 对比机双 Trace，场景一致）
关键指标    : 首帧 P95 3.86s vs 对比机 2.62s（+1.24s）
结论        : 初始化任务串行执行，结论分级「高度怀疑」
证据与限制  : 证据链覆盖 0.82；未覆盖低端内存配置
下一步建议  : 并行化非关键初始化后回归采集同环境双 Trace
案例置信度  : 86%（策略 POLICY-2026.09-v3）
责任人      : 李工 · 审核人 王工`}</pre>
      <button className="secondary-button full" onClick={() => onNotify('已模拟生成回帖草稿并送入人工审核队列')}><ClipboardList size={16} /> 生成回帖草稿</button>
    </Panel>

    {jqlOpen && <Modal
      eyebrow="自然语言转 JQL"
      title="把范围描述转成 JQL"
      description="演示环境只做字符串拼接，不会真的访问 JIRA。"
      onClose={() => setJqlOpen(false)}
      onConfirm={() => { setJqlOpen(false); onNotify('已模拟用 JQL 确认问题集：命中 3 单') }}
    >
      <label className="field">自然语言描述<textarea defaultValue="TV Core 项目里近 3 天新提的、还没分析过的性能问题" /></label>
      <label className="field">生成的 JQL<textarea readOnly defaultValue={'project = "TV Core" AND type = 性能缺陷 AND created >= -3d AND status != Closed AND labels not in (analyzed)'} /></label>
      <p className="modal-note">用户输入不明确时（无法判断最终 JQL），会提示缺少关键信息并等待重新输入。</p>
    </Modal>}
  </section>
}
