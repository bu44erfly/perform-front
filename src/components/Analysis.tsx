import { useState } from 'react'
import {
  Activity, Bot, Boxes, FileOutput, Gauge, PackageCheck, RotateCcw, Scaling,
} from 'lucide-react'
import {
  confidenceFactors, confidencePolicy, diagnosticCases, handoffChecks, handoffPackage,
  perfettoTasks, reanalysisRounds, reportTemplates, writebackRows,
} from '../data/moduleData'
import type { CaseRow } from '../data/moduleData'
import { DataTable, Panel, SectionHeader, StatTile } from './Ui'

interface Props {
  onNotify: (message: string) => void
}

const caseStates: CaseRow['state'][] = ['已受理', '分析中', '报告生成中', '报告可用', '失败', '需人工处理']

/** 智能分析与诊断 —— 前端展示位，功能由 SmartPerfetto subAgent 后续实现 */
export function Analysis({ onNotify }: Props) {
  const [selected, setSelected] = useState<CaseRow>(diagnosticCases[0])

  return <section className="page">
    <div className="page-hero">
      <div>
        <p className="eyebrow">智能分析与诊断 · 前端展示位</p>
        <h1>智能分析与诊断</h1>
        <p className="hero-copy">从交接包受理、案例分析编排，到 SmartPerfetto 对接、置信度评估、报告输出与案例写回知识库。本页把每个环节的产物与门禁先摆出来，功能由 SmartPerfetto subAgent 实现。</p>
      </div>
      <div className="hero-actions">
        <button className="secondary-button" onClick={() => onNotify('已模拟导出诊断报告 Markdown（演示不落盘）')}><FileOutput size={16} /> 导出诊断报告</button>
        <button className="primary-button" onClick={() => onNotify('已模拟驳回并触发第 3 轮重新分析（上限 5 轮）')}><RotateCcw size={16} /> 触发重新分析</button>
      </div>
    </div>

    <div className="stat-row">
      <StatTile label="进行中案例" value={String(diagnosticCases.filter((item) => item.state === '分析中' || item.state === '报告生成中').length)} unit=" 个" tone="blue" hint="状态实时回传 JIRA" />
      <StatTile label="报告可用" value={String(diagnosticCases.filter((item) => item.state === '报告可用').length)} unit=" 个" tone="green" hint="等待人工审核后回帖" />
      <StatTile label="转人工 / 失败" value={String(diagnosticCases.filter((item) => item.state === '失败' || item.state === '需人工处理').length)} unit=" 个" tone="red" hint="保留上下文便于接手" />
      <StatTile label="当前策略版本" value="v3" unit=" · 已评审" tone="purple" hint="只有已批准策略可用于对外结果" />
    </div>

    <SectionHeader eyebrow="案例编排与状态管理" title="案例状态流转"
      hint={<span className="subtle-label">每一步都有明确流转规则 · 超时或重试耗尽则转人工</span>} />
    <div className="state-rail">
      {caseStates.map((state, index) => <div className={`state-node ${state === selected.state ? 'active' : ''}`} key={state}>
        <span className="state-index">{index + 1}</span>
        <b>{state}</b>
        <small>{stateHint(state)}</small>
      </div>)}
    </div>

    <SectionHeader eyebrow="概览" title="案例清单与交接包"
      action={<span className="simple-status neutral">选中 {selected.id}</span>} />
    <div className="account-layout">
      <DataTable columns={['案例标识', 'JIRA', '状态', '轮次', '案例置信度', '结论分级', '分析版本', '更新时间']} minWidth={900}>
        {diagnosticCases.map((item) => <tr key={item.id} className={item.id === selected.id ? 'selected-row' : ''} onClick={() => setSelected(item)}>
          <td><b className="mono">{item.id}</b></td>
          <td><b className="jira-key">{item.jira}</b></td>
          <td><span className={`simple-status ${caseTone(item.state)}`}>{item.state}</span></td>
          <td>第 {item.round} 轮 / 上限 5 轮</td>
          <td>{item.confidence ? `${item.confidence}%` : '不可计算'}</td>
          <td>{item.conclusion}</td>
          <td><span className="stage-pill">{item.version}</span></td>
          <td className="muted">{item.updatedAt}</td>
        </tr>)}
      </DataTable>

      <aside className="account-detail">
        <p className="eyebrow">交接包受理 · </p>
        <h3 className="detail-title">{selected.id}</h3>
        <p className="muted">标识受理：以 JIRA 单号为唯一标识，重复提交直接返回已生成的案例标识。</p>
        <div className="field-grid single">
          {handoffPackage.map(([label, value]) => <div className="field-cell" key={label}><small>{label}</small><b>{value}</b></div>)}
        </div>
        <p className="card-footnote">只有受理成功后才把本次分析要用的所有输入固定为快照并记录版本号；后续分析、置信度计算、报告与写回都只认这个版本。</p>
      </aside>
    </div>

    <div className="stat-row two">
      <Panel eyebrow="准入校验" title="交接包检查项"
        action={<span className="stage-pill"><PackageCheck size={13} /> 通过后冻结输入 v1.3</span>}>
        {handoffChecks.map((check) => <div className="gate-row" key={check.rule}>
          <span className={`gate-dot ${check.tone}`} />
          <div><b>{check.rule}</b><small>结果：{check.result}</small></div>
        </div>)}
        <p className="card-footnote">结构不完整、必填项缺失、引用文件不存在或场景描述不可识别时，明确告知对方问题所在并退回。</p>
      </Panel>

      <Panel eyebrow="知识库信息使用" title="交接包带入的知识引用（无需自行检索）">
        {[['METHOD-012', '冷启动时序与关键路径分析', '按方法步骤定位首帧关键路径'],
          ['CASE-087', 'P5 视频应用初始化串行阻塞', '对比验证同类案例结论'],
          ['EXP-021', 'P5 平台媒体服务启动特征', '作为平台基线参考'],
          ['CASE-102', 'P4 首页滑动掉帧与合成耗时', '跨项目思路参考（草稿，仅供参考）']].map(([no, title, usage]) => <div className="gate-row" key={no}>
          <span className="gate-dot ok" />
          <div><b><span className="mono">{no}</span> · {title}</b><small>{usage}</small></div>
        </div>)}
        <div className="auth-note"><Boxes size={16} /><span>知识作为辅助判断与对比参考，跨项目引用不照搬；参考权重由大 Agent / PerfettoAgent 按场景差异判断。</span></div>
      </Panel>
    </div>

    <SectionHeader eyebrow="SmartPerfetto 分析对接" title="分析任务提交与结果获取" />
    <DataTable columns={['外部任务号', '案例标识', '目标场景', '分析配置版本', '轮次', '状态', '耗时']} minWidth={900}>
      {perfettoTasks.map((task) => <tr key={task.task}>
        <td><b className="mono">{task.task}</b></td>
        <td>{task.caseId}</td>
        <td>{task.scene}</td>
        <td><span className="stage-pill">{task.config}</span></td>
        <td>{task.round}</td>
        <td><span className={`simple-status ${task.state.includes('成功') ? 'ok' : task.state.includes('失败') ? 'bad' : task.state.includes('取消') ? 'warn' : 'neutral'}`}>{task.state}</span></td>
        <td className="muted">{task.cost}</td>
      </tr>)}
    </DataTable>
    <div className="stat-row two">
      <Panel eyebrow="概览" title="状态判定、限流与报告固化">
        <div className="gate-row"><span className="gate-dot ok" /><div><b>状态与错误分类</b><small>按约定方式判断进行中 / 成功 / 失败，并对失败原因分类决定是否重试</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>并发与限流</b><small>遵守引擎并发与速率限制（当前全局 1 并发），支持取消操作</small></div></div>
        <div className="gate-row"><span className="gate-dot warn" /><div><b>迟到结果隔离</b><small>本地已判定超时或终止的任务，其外部返回结果不再进入诊断流程</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>报告绑定校验</b><small>只接收同时满足「外部任务标识 + 案例 + 冻结输入」三者绑定并通过来源、完整性、版本与权限检查的报告</small></div></div>
        <div className="gate-row"><span className="gate-dot ok" /><div><b>结论保真</b><small>原封不动保留结论、根因候选、证据、限制、建议与来源置信度，不做补充改写，也不把疑似根因升级为已证实</small></div></div>
      </Panel>

      <Panel eyebrow="策略治理" title="置信度策略版本" action={<span className="status-badge review">{confidencePolicy.version}</span>}>
        <div className="field-grid">
          <div className="field-cell"><small>策略版本</small><b>{confidencePolicy.version}</b></div>
          <div className="field-cell"><small>评审状态</small><b>{confidencePolicy.approved}</b></div>
          <div className="field-cell"><small>输出门槛</small><b>{confidencePolicy.threshold}%</b></div>
          <div className="field-cell"><small>适用案例</small><b>CASE-2048-v2 等 3 个</b></div>
        </div>
        <DataTable columns={['策略输入映射', '权重']} minWidth={0}>
          {confidencePolicy.inputs.map((input, index) => <tr key={input}>
            <td><b>{input}</b></td>
            <td><span className="capacity-cell"><span className="bar"><i style={{ width: confidencePolicy.weights[index] }} /></span>{confidencePolicy.weights[index]}</span></td>
          </tr>)}
        </DataTable>
        <p className="card-footnote">SmartPerfetto 自带的来源置信度与本模块计算的案例级置信度分开存储、分开展示，不混用也不互相替代。</p>
      </Panel>
    </div>

    <div className="stat-row two">
      <Panel eyebrow="概览" title="置信度影响因素排序与缺失证据">
        {confidenceFactors.map((factor) => <div className="gate-row" key={factor.factor}>
          <span className={`gate-dot ${factor.tone}`} />
          <div><b>{factor.factor}<span className="count-pill">权重 {factor.weight}%</span></b><small>{factor.hit}</small></div>
        </div>)}
        <div className="metric-row">
          <div className="metric blue"><small>来源置信度（引擎）</small><b>91%</b></div>
          <div className="metric purple"><small>案例级置信度（本模块）</small><b>86%</b></div>
          <div className="metric orange"><small>结论分级</small><b>高度怀疑</b></div>
        </div>
        <div className="recommendation"><Scaling size={18} /><span><b>结论拦截：</b>置信度低于门槛或不可计算时，不输出确定根因，只给出受限疑似结论与待验证项。</span></div>
      </Panel>

      <Panel eyebrow="置信度不足时的重新分析" title="重新分析轮次（上限 5 轮）">
        <div className="timeline">
          {reanalysisRounds.map((round) => <div className={`timeline-row ${round.tone === 'ok' ? 'done' : 'current'}`} key={round.round}>
            <span className="timeline-marker" />
            <div><b>第 {round.round} 轮 · {round.focus}</b><p>案例置信度 {round.confidence}% · {round.result}</p></div>
            <small>{round.time}</small>
          </div>)}
          <div className="timeline-row">
            <span className="timeline-marker" />
            <div><b>第 3 ~ 5 轮</b><p className="muted">未使用；达到 5 轮上限仍不达标则转人工处理，并保留全部轮次的报告与置信度计算过程。</p></div>
            <small>—</small>
          </div>
        </div>
        <div className="auth-note"><Gauge size={16} /><span>每一轮都会基于上一轮的结论、缺失证据与待验证项调整侧重点，再提交分析并重新计算置信度。</span></div>
      </Panel>
    </div>

    <SectionHeader eyebrow="诊断报告输出" title="报告模板版本与发布控制" />
    <DataTable columns={['模板名称', '版本', '适用问题类型', '状态', '本期使用']} minWidth={720}>
      {reportTemplates.map((template) => <tr key={template.name}>
        <td><b>{template.name}</b></td>
        <td><span className="stage-pill">{template.version}</span></td>
        <td>{template.scope}</td>
        <td><span className={`simple-status ${template.state === '生效' ? 'ok' : 'warn'}`}>{template.state}</span></td>
        <td className="muted">{template.used}</td>
      </tr>)}
    </DataTable>

    <div className="stat-row two">
      <Panel eyebrow="概览" title="结构化报告包含区块">
        <ul className="bullet-list">
          <li>问题基本信息汇总（编号、标题、设备、系统版本、复现步骤、测试条件）</li>
          <li>Trace 分析结果汇总（关键时间区间、关键指标、异常点）</li>
          <li>对比分析结果汇总（测试机 vs 对比机条件、指标、差异值与结论）</li>
          <li>结论、建议、置信度与限制贴附（受控方式呈现，固定展示案例置信度与证据分级）</li>
          <li>渲染前校验：来源、校验状态、置信度状态与必填区块不满足则不生成正式报告</li>
        </ul>
        <p className="card-footnote">报告导出为 Markdown 并保存修改历史；报告、输入引用与下载入口不超出交接包中 JIRA / Trace / 原始报告允许的访问范围。</p>
      </Panel>

      <Panel eyebrow="案例写回知识库" title="草稿提交与审核跟踪"
        action={<span className="stage-pill"><Activity size={13} /> 知识库入口</span>}>
        <DataTable columns={['步骤', '内容', '状态']} minWidth={0}>
          {writebackRows.map((row) => <tr key={row.step}>
            <td><b>{row.step}</b></td>
            <td>{row.detail}</td>
            <td><span className={`simple-status ${row.state === '完成' ? 'ok' : row.state === '待审核' ? 'neutral' : 'warn'}`}>{row.state}</span></td>
          </tr>)}
        </DataTable>
        <div className="recommendation"><Bot size={18} /><span>所有 Agent 生成的案例只能以草稿状态提交，不能直接发布；只有人工审核合并后才会变成正式。</span></div>
      </Panel>
    </div>
  </section>
}

function stateHint(state: CaseRow['state']) {
  if (state === '已受理') return '交接包通过准入校验，冻结输入快照'
  if (state === '分析中') return '已提交 SmartPerfetto，等待报告'
  if (state === '报告生成中') return '报告模板渲染与门禁校验'
  if (state === '报告可用') return '回传结论摘要给 JIRA，等待审核'
  if (state === '失败') return '重试或超时上限耗尽，保留上下文'
  return '超过 5 轮重新分析上限，转人工接手'
}

function caseTone(state: CaseRow['state']) {
  if (state === '报告可用') return 'ok'
  if (state === '分析中' || state === '报告生成中') return 'neutral'
  if (state === '已受理') return 'neutral'
  return 'bad'
}
