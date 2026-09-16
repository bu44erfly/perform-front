import { useState } from 'react'
import {
  CircleHelp, ShieldCheck, UserPlus, UsersRound,
} from 'lucide-react'
import { people, permissionMatrix, roles } from '../data/mockData'
import type { Person } from '../data/types'
import { DataTable, Panel, SectionHeader, StatTile } from './Ui'

interface Props {
  onNotify: (message: string) => void
}

/** 账号管理 */
export function Accounts({ onNotify }: Props) {
  const [selected, setSelected] = useState<Person>(people[0])

  return <section className="page">
    <div className="page-hero">
      <div>
        <p className="eyebrow">账号管理（暂定方案）</p>
        <h1>账号与角色权限</h1>
        <p className="hero-copy">在“游客还是每人独立账号”上仍是待定项，本页给出可讨论的演示方案：账号、角色与权限矩阵。</p>
      </div>
      <div className="hero-actions">
        <button className="secondary-button" onClick={() => onNotify('已模拟跳转到 Confluence 授权页面（演示不跳转）')}><ShieldCheck size={16} /> 账号信息授权</button>
        <button className="primary-button" onClick={() => onNotify('已模拟发起新账号申请流程')}><UserPlus size={16} /> 新建账号</button>
      </div>
    </div>

    <Panel eyebrow="账号登录与授权" title="TCL 内部账号 · Confluence 鉴权">
      <div className="gate-row"><span className="gate-dot ok" /><div><b>统一账号</b><small>每个用户使用 TCL 内部账号登录，不另建一套账号体系</small></div></div>
      <div className="gate-row"><span className="gate-dot ok" /><div><b>账号信息授权</b><small>账号与权限信息转到 Confluence 相关鉴权登录，前端不存储密码与密钥</small></div></div>
      <div className="gate-row"><span className="gate-dot warn" /><div><b>服务账号受限</b><small>内部使用的 JIRA / SmartPerfetto 服务账号操作范围受限，由配置控制可写范围</small></div></div>
      <p className="card-footnote">演示环境未接入真实鉴权，以上为界面形态示意；接入后由 Confluence 统一完成身份校验。</p>
    </Panel>

    <div className="stat-row">
      <StatTile label="在岗账号" value={String(people.filter((person) => person.status === '在职').length)} unit=" 个" tone="blue" hint="含 1 个演示访客" />
      <StatTile label="角色类型" value={String(roles.length)} unit=" 种" tone="purple" hint="访客 / 工程师 / 审核人 / 管理员" />
      <StatTile label="审核人" value={String(people.filter((person) => person.role === '审核人').length)} unit=" 人" tone="orange" hint="负责审核与发布" />
      <StatTile label="服务账号" value="2" unit=" 个" tone="green" hint="JIRA / SmartPerfetto 受限" />
    </div>

    <div className="stat-row two">
      <Panel eyebrow="演示方案 A（推荐）" title="每人独立账号 + 角色权限" footnote="理由：人工操作需要记录操作人，审核与发布需要可追溯的责任边界，也要求记录填写人。">
        <ul className="bullet-list">
          <li>账号由管理员维护，角色决定可见范围与可执行动作</li>
          <li>访客可保留只读入口，用于跨部门查看脱敏摘要</li>
          <li>审核权限沿用知识库平台权限配置，前端不另建角色体系</li>
        </ul>
      </Panel>
      <Panel eyebrow="演示方案 B" title="统一访客模式 + 操作留痕" footnote="适用场景：仅做内部演示与轻量查询，不承担正式审核与回帖职责。">
        <ul className="bullet-list">
          <li>不区分账号，所有操作记录为“访客”</li>
          <li>无法满足“审核人必须是具体责任人”的要求</li>
          <li>并发只能按会话限流，跨用户取消权限无法界定</li>
        </ul>
      </Panel>
    </div>

    <SectionHeader eyebrow="账号清单" title="账号清单" action={<span className="subtle-label">演示数据 · 不接身份服务</span>} />
    <div className="account-layout">
      <DataTable columns={['姓名', '账号', '角色', '所属范围', '状态', '最近活跃']} minWidth={760}>
        {people.map((person) => <tr key={person.account} className={person.account === selected.account ? 'selected-row' : ''} onClick={() => setSelected(person)}>
          <td><b>{person.name}</b><span>{person.org}</span></td>
          <td><span className="mono">{person.account}</span></td>
          <td><span className={`role-pill r${roleIndex(person.role)}`}>{person.role}</span></td>
          <td>{person.scope}</td>
          <td><span className={`simple-status ${person.status === '在职' ? 'ok' : 'bad'}`}>{person.status}</span></td>
          <td className="muted">{person.lastActive}</td>
        </tr>)}
      </DataTable>
      <aside className="account-detail">
        <p className="eyebrow">账号详情</p>
        <h3>{selected.name}</h3>
        <p className="mono muted">{selected.account}</p>
        <div className="field-grid single">
          <div className="field-cell"><small>角色</small><b>{selected.role}</b></div>
          <div className="field-cell"><small>数据范围</small><b>{selected.scope}</b></div>
          <div className="field-cell"><small>状态</small><b>{selected.status}</b></div>
        </div>
        <button className="secondary-button full" onClick={() => onNotify(`已模拟调整 ${selected.name} 的角色与范围`)}>调整角色与范围</button>
        <button className="secondary-button full" onClick={() => onNotify(`已模拟停用 ${selected.name} 的账号`)}>停用账号</button>
        <p className="card-footnote">停用后其未完成任务转交管理员，由人工重新指派。</p>
      </aside>
    </div>

    <SectionHeader eyebrow="角色与权限" title="角色与权限矩阵" />
    <div className="role-grid">
      {roles.map((role) => <div className="role-card" key={role.name}>
        <span className={`role-icon r${roleIndex(role.name)}`}><UsersRound size={17} /></span>
        <b>{role.name}</b>
        <small>{role.scope}</small>
        <p>{role.capabilities.join(' · ')}</p>
      </div>)}
    </div>
    <DataTable columns={['能力', '访客', '工程师', '审核人', '管理员']} minWidth={620}>
      {permissionMatrix.map((row) => <tr key={row.capability}>
        <td><b>{row.capability}</b></td>
        {[row.guest, row.engineer, row.reviewer, row.admin].map((cell, index) => <td key={index}>
          <span className={`simple-status ${cell === '可操作' ? 'ok' : cell === '只读' ? 'neutral' : 'muted-cell'}`}>{cell}</span>
        </td>)}
      </tr>)}
    </DataTable>

    <Panel eyebrow="待确认事项" title="仍待确认的问题" footnote="本页把待定项显式列出，避免演示时被误认为已定稿方案。">
      <div className="open-questions">
        {[
          ['账号模型', '游客可写还是只读？是否需要每人独立账号？（暂定项）'],
          ['审核人范围', '审核权限完全沿用知识库平台配置，还是前端单独维护一份？'],
          ['服务账号范围', 'JIRA / SmartPerfetto 服务账号的可写范围如何配置与回收？'],
        ].map(([title, question]) => <div className="open-question" key={title}>
          <span className="question-icon"><CircleHelp size={16} /></span>
          <div><b>{title}</b><p>{question}</p></div>
        </div>)}
      </div>
    </Panel>
  </section>
}

function roleIndex(role: string) {
  const order = ['访客', '工程师', '审核人', '管理员']
  const index = order.indexOf(role)
  return index < 0 ? 0 : index
}
