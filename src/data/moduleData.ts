/* ------------------------------------------------------------------ *
 * 模块一 / 二 / 三 功能 Agent 的演示数据
 * 需求说明：本轮不需要功能实现，只用于向评审展示「界面长什么样、有哪些能力」。
 * 数据全部为本地 Mock，不连接 JIRA、知识库或 SmartPerfetto。
 * ------------------------------------------------------------------ */

/* ------------------------------ 模块一 · 知识库 ------------------------------ */

export interface KnowledgeEntry {
  no: string
  title: string
  /** Agent 检索层：METHOD / CASE / EXP */
  agentType: 'METHOD' | 'CASE' | 'EXP'
  /** 树形大方向分类（单选） */
  direction: string
  /** 形态标签（多选） */
  forms: string[]
  testItems: string
  scope: string
  source: 'SOURCE_MANUAL' | 'SOURCE_AGENT_GENERATED'
  status: 'DRAFT' | 'PUBLISHED'
  owner: string
  related: string
  updatedAt: string
}

/** 知识条目：三套维度正交落在同一条 Wiki 上 */
export const knowledgeEntries: KnowledgeEntry[] = [
  {
    no: 'METHOD-012', title: '冷启动时序与关键路径分析', agentType: 'METHOD', direction: '启动性能 / 冷启动',
    forms: ['性能方案'], testItems: 'cold_start_first_frame', scope: 'TV P5 / Android 15 / 全机型',
    source: 'SOURCE_MANUAL', status: 'PUBLISHED', owner: '王工', related: 'CASE-087 / CASE-102', updatedAt: '2026-09-10',
  },
  {
    no: 'CASE-087', title: 'P5 视频应用初始化串行阻塞', agentType: 'CASE', direction: '启动性能 / 冷启动',
    forms: ['Jira 分析'], testItems: 'cold_start_first_frame', scope: 'TV P5 / 65X9 / App 8.2.1',
    source: 'SOURCE_AGENT_GENERATED', status: 'PUBLISHED', owner: '李工', related: 'METHOD-012', updatedAt: '2026-09-14',
  },
  {
    no: 'CASE-102', title: 'P4 首页滑动掉帧与合成耗时', agentType: 'CASE', direction: '流畅性 / 滑动',
    forms: ['Jira 分析'], testItems: 'launcher_scroll_jank', scope: 'TV P4 / 55A8 / Android 14',
    source: 'SOURCE_AGENT_GENERATED', status: 'DRAFT', owner: '王工', related: 'METHOD-023', updatedAt: '2026-09-15',
  },
  {
    no: 'EXP-021', title: 'P5 平台媒体服务启动特征', agentType: 'EXP', direction: '基础知识 / 平台特征',
    forms: ['FAQ/经验总结'], testItems: 'cold_start_first_frame', scope: 'TV P5 / MT9653 / Android 15',
    source: 'SOURCE_MANUAL', status: 'PUBLISHED', owner: '陈工', related: 'METHOD-012', updatedAt: '2026-08-28',
  },
  {
    no: 'METHOD-023', title: '滑动掉帧的帧时间轴对比方法', agentType: 'METHOD', direction: '流畅性 / 滑动',
    forms: ['性能方案'], testItems: 'launcher_scroll_jank', scope: '全部 TV 产品',
    source: 'SOURCE_MANUAL', status: 'PUBLISHED', owner: '刘工', related: 'CASE-102', updatedAt: '2026-09-02',
  },
  {
    no: 'EXP-034', title: '待机功耗窗口对齐经验', agentType: 'EXP', direction: '功耗 / 待机',
    forms: ['基础知识'], testItems: 'standby_power_baseline', scope: 'TV P5 / Android 15',
    source: 'SOURCE_AGENT_GENERATED', status: 'DRAFT', owner: '陈工', related: 'METHOD-031', updatedAt: '2026-09-15',
  },
]

/** 三套正交维度（前端只做展示，不实现互相转换） */
export const knowledgeDimensions = [
  { name: '① Wiki · 大方向', kind: '树形分类 · 单选', purpose: '给人浏览的层级目录', values: '启动性能 / 流畅性 / 功耗 / 显示 …', note: '平台三层分类配置见附录 A.3' },
  { name: '② Wiki · 形态', kind: '多选标签', purpose: '给人浏览的来源形态', values: '性能方案 / Jira 分析 / FAQ 经验 / 基础知识 / 博客', note: '形态到 Agent 类型的映射仅为录入建议' },
  { name: '③ Agent · 类型', kind: '互斥枚举 + test_items + scope', purpose: 'Agent 检索只看这一层', values: 'METHOD / CASE / EXP', note: '三套落在同一条 Wiki 上，互不绑定' },
]

/** 知识状态只有草稿与正式两级 */
export const knowledgeStatusFlow = [
  { step: '人工提交', detail: 'SOURCE_MANUAL · 记录填写人与原始出处', path: '有合并权限者审核 → PUBLISHED' },
  { step: 'Agent 产出', detail: 'SOURCE_AGENT_GENERATED · 一律存为 DRAFT 且无合并权限', path: '必须人工审核后才可 PUBLISHED' },
  { step: '影响后续分析的修改', detail: '阈值 / SQL / 判断方法 / 验证环境 / 根因 / 结论', path: '修改后降回 DRAFT 重新审核' },
  { step: '描述性内容修改', detail: '标题、摘要等可直接提交', path: '平台记录历史版本' },
]

/** 方法条目的字段与本地预检 */
export const methodChecklist = [
  { field: '需要的输入', value: '双 Trace（问题机 / 对比机）· 目标窗口', state: 'ok' },
  { field: 'Trace 前置条件', value: '同场景、同平台、时长 ≥ 60min', state: 'ok' },
  { field: '分析步骤', value: '定位首帧 → 拆解关键路径 → 逐段对比', state: 'ok' },
  { field: 'SQL（sql/ 草稿目录）', value: 'sql/cold_start_first_frame.sql', state: 'ok' },
  { field: '指标 / 阈值 / 判断方法', value: '首帧 P95 差异 > 10% 判为异常', state: 'ok' },
  { field: '已知限制', value: '未覆盖低端内存配置', state: 'warn' },
  { field: '对比条件', value: '必须相同：机型 / 系统 / 网络；可不同：采集时间', state: 'ok' },
]

export const precheckRows = [
  { rule: '必填字段齐全', scope: '条目 / 方法 / 案例', state: '通过' as const },
  { rule: '字段值符合约束（枚举、范围写法）', scope: 'scope / agent_type', state: '通过' as const },
  { rule: '关联条目存在（related / test_items）', scope: 'METHOD-012 等', state: '通过' as const },
  { rule: '引用的 SQL 文件存在', scope: 'sql/*.sql', state: '通过' as const },
  { rule: '已知限制未填写完整', scope: 'CASE-102', state: '待补充' as const },
]

/* ------------------------------ 模块二 · JIRA ------------------------------ */

export interface JiraIssue {
  key: string
  summary: string
  project: string
  type: string
  status: string
  labels: string
  components: string
  assignee: string
  reporter: string
  created: string
  updated: string
  /** 是否已分析，用于历史问题人工筛选 */
  analyzed: boolean
}

/** 问题集范围确认（人工筛选 / 指定单号 / 定时增量） */
export const jiraIssues: JiraIssue[] = [
  { key: 'PERF-2052', summary: '开机后首次打开应用商店耗时偏长', project: 'TV Core', type: '性能缺陷', status: '重新打开', labels: 'startup, latency', components: 'AppStore', assignee: '李工', reporter: '测试 · 周工', created: '2026-09-14', updated: '2026-09-15 08:12', analyzed: false },
  { key: 'PERF-2051', summary: '视频播放中偶发音频卡顿', project: 'Media', type: '性能缺陷', status: '待办', labels: 'audio, jank', components: 'MediaPlayer', assignee: '郑工', reporter: '测试 · 孙工', created: '2026-09-14', updated: '2026-09-15 08:12', analyzed: false },
  { key: 'PERF-2049', summary: '系统升级后回忆录页面滚动掉帧', project: 'Launcher', type: '性能缺陷', status: '处理中', labels: 'scroll, jank', components: 'Memory', assignee: '王工', reporter: '测试 · 郑工', created: '2026-09-12', updated: '2026-09-15 07:58', analyzed: false },
  { key: 'PERF-2048', summary: '视频应用冷启动耗时异常', project: 'TV Core', type: '性能缺陷', status: '重新打开', labels: 'startup, latency', components: 'VideoApp', assignee: '李工', reporter: '测试 · 周工', created: '2026-09-08', updated: '2026-09-15 10:42', analyzed: true },
  { key: 'PERF-2045', summary: '遥控器按键响应延迟超过 200ms', project: 'System UI', type: '性能缺陷', status: '已关闭', labels: 'input, latency', components: 'KeyInput', assignee: '赵工', reporter: '测试 · 孙工', created: '2026-09-05', updated: '2026-09-13 16:20', analyzed: true },
  { key: 'PERF-2040', summary: '文档中心打开大文件时内存上涨明显', project: 'TV Core', type: '性能缺陷', status: '待办', labels: 'memory', components: 'DocCenter', assignee: '陈工', reporter: '测试 · 王工', created: '2026-09-03', updated: '2026-09-12 09:30', analyzed: true },
]

/** 问题集确认记录（可追溯） */
export const issueSetRecords = [
  { source: '定时轮询增量', filter: 'project = TV Core AND created >= -1d AND status != Closed', trigger: 'Scheduler', time: '今天 08:10', result: '命中 3 单，排除 1 单重复' },
  { source: '人工对话式确认', filter: '人员=李工 · 状态=重新打开 · 时间=近 7 天', trigger: '王工', time: '今天 09:31', result: '命中 2 单，确认进入流水线' },
  { source: '指定单号人工触发', filter: 'key = PERF-2042（重新发起）', trigger: '刘工', time: '昨天 09:20', result: '重新发起分析，生成新分析版本' },
]

/** 问题信息抽取字段与任务快照 */
export const extractGroups = [
  { group: '问题基础信息', fields: ['JIRA 编号', '标题', '项目', '问题类型', '状态', '优先级', '标签', '组件', '负责人', '报告人', '创建时间', '更新时间'], count: 12, state: 'ok' as const },
  { group: '描述、评论与状态信息', fields: ['问题描述', '复现步骤', '预期结果', '实际结果', '评论', '状态变化'], count: 6, state: 'ok' as const },
  { group: '附件与 Trace 线索', fields: ['附件名称', '类型', '大小', '上传时间', '下载地址', 'Trace 线索'], count: 6, state: 'ok' as const },
  { group: '场景与环境信息', fields: ['测试场景', '设备', '机型', '芯片', '系统版本', '应用版本', '网络', '对比机', '测试条件'], count: 9, state: 'warn' as const },
]

/* ------------------------------ 模块三 · 智能分析 ------------------------------ */

export interface CaseRow {
  id: string
  jira: string
  state: '已受理' | '分析中' | '报告生成中' | '报告可用' | '失败' | '需人工处理'
  round: number
  confidence: number
  conclusion: '已证实' | '高度怀疑' | '待验证' | '不可计算'
  version: string
  updatedAt: string
}

/** 案例状态机与状态回传 */
export const diagnosticCases: CaseRow[] = [
  { id: 'CASE-2048-v2', jira: 'PERF-2048', state: '报告可用', round: 2, confidence: 86, conclusion: '高度怀疑', version: 'v2', updatedAt: '今天 10:42' },
  { id: 'CASE-2049-v1', jira: 'PERF-2049', state: '分析中', round: 1, confidence: 0, conclusion: '不可计算', version: 'v1', updatedAt: '今天 10:31' },
  { id: 'CASE-2042-v2', jira: 'PERF-2042', state: '需人工处理', round: 1, confidence: 0, conclusion: '不可计算', version: 'v2', updatedAt: '今天 09:16' },
  { id: 'CASE-2026-v1', jira: 'PERF-2026', state: '失败', round: 3, confidence: 0, conclusion: '不可计算', version: 'v1', updatedAt: '昨天 14:06' },
  { id: 'CASE-2031-v1', jira: 'PERF-2031', state: '报告可用', round: 1, confidence: 93, conclusion: '已证实', version: 'v1', updatedAt: '昨天 16:28' },
]

/** 交接包受理与准入校验 */
export const handoffChecks = [
  { rule: '包结构完整（必需区块齐全）', result: '通过', tone: 'ok' as const },
  { rule: '必填项齐全（单号 / 案例标识 / 场景描述）', result: '通过', tone: 'ok' as const },
  { rule: '所引用文件真实存在（双 Trace 可访问）', result: '通过', tone: 'ok' as const },
  { rule: '场景描述可识别（可映射到目标场景枚举）', result: '通过', tone: 'ok' as const },
  { rule: '重复提交检测（同一单号只受理一次）', result: '未重复', tone: 'ok' as const },
]

export const handoffPackage = [
  ['交接包标识', 'HO-PERF-2048-20260915'],
  ['JIRA 单号', 'PERF-2048'],
  ['JIRA 带入的知识库内容', 'METHOD-012 · CASE-087 · EXP-021'],
  ['引用的 Trace 文件', '2 个（问题机 / 对比机）'],
  ['场景描述', '冷启动视频应用，目标窗口首帧'],
  ['输入快照版本', 'v1.3（受理后冻结）'],
  ['受理结论', '通过准入校验，进入案例编排'],
]

/** SmartPerfetto 分析对接 */
export const perfettoTasks = [
  { task: 'SPF-88231', caseId: 'CASE-2048-v2', scene: '冷启动视频应用', config: '2026.09', state: '成功', cost: '18m 12s', round: '第 2 轮' },
  { task: 'SPF-88240', caseId: 'CASE-2049-v1', scene: '首页滑动', config: '2026.09', state: '进行中', cost: '—', round: '第 1 轮' },
  { task: 'SPF-88190', caseId: 'CASE-2026-v1', scene: '游戏模式切换', config: '2026.08', state: '失败 · 服务异常', cost: '—', round: '第 1 轮' },
  { task: 'SPF-88201', caseId: 'CASE-2042-v2', scene: '首页滑动', config: '2026.09', state: '已取消（本地超时隔离）', cost: '—', round: '第 1 轮' },
]

/** 置信度规则与分离展示 */
export const confidencePolicy = {
  version: 'POLICY-2026.09-v3',
  approved: '已评审通过（2026-09-01）',
  threshold: 80,
  inputs: ['报告证据完整度', '场景匹配度', '对比条件一致性', '证据链覆盖根因比例'],
  weights: ['35%', '25%', '20%', '20%'],
}

export const confidenceFactors = [
  { factor: '证据链覆盖根因比例', weight: 35, hit: '命中 R2 · 覆盖率 0.82', impact: '正向', tone: 'ok' as const },
  { factor: '对比条件一致性', weight: 25, hit: '机型 / 系统 / 网络完全对齐', impact: '正向', tone: 'ok' as const },
  { factor: '报告证据完整度', weight: 20, hit: '缺少低端内存配置样本', impact: '负向', tone: 'warn' as const },
  { factor: '场景匹配度', weight: 20, hit: 'Trace 实际场景与 JIRA 预期一致', impact: '正向', tone: 'ok' as const },
]

/** 报告模板版本 */
export const reportTemplates = [
  { name: '启动类 · 冷启动模板', version: 'v3', scope: '启动性能', state: '生效', used: '12 份' },
  { name: '滑动类 · 掉帧模板', version: 'v2', scope: '流畅性', state: '生效', used: '7 份' },
  { name: '停顿类 · 卡顿模板', version: 'v1', scope: '流畅性', state: '评审中', used: '0 份' },
  { name: '功耗类 · 待机模板', version: 'v2', scope: '功耗', state: '生效', used: '5 份' },
]

/** 重新分析（上限 5 轮） */
export const reanalysisRounds = [
  { round: 1, focus: '冷启动关键路径整体扫描', confidence: 71, result: '低于门槛', tone: 'warn' as const, time: '今天 09:02' },
  { round: 2, focus: '聚焦初始化串行阻塞窗口', confidence: 86, result: '达标，转报告生成', tone: 'ok' as const, time: '今天 10:38' },
]

/** 案例写回知识库 */
export const writebackRows = [
  { step: '案例条目构造', detail: '生成 CASE 类型草稿，填入结果 / 结论 / 证据引用 / 验证环境', state: '完成' as const },
  { step: '原始出处与关联记录', detail: 'JIRA 链接 + Trace 编号 + 命中 METHOD-012 的编号与版本', state: '完成' as const },
  { step: '提交前格式校验', detail: '必填字段校验通过，校验不通过则不可提交', state: '完成' as const },
  { step: '以草稿状态提交（走模块一入口）', detail: 'Agent 产出无合并权限，只能提交 DRAFT', state: '进行中' as const },
  { step: '去重保护', detail: '按案例标识 + 输入快照识别，同一分析版本只写入一次', state: '完成' as const },
  { step: '审核结果反馈', detail: '通过 / 驳回 / 要求修改 → 更新写回状态并回传 JIRA', state: '待审核' as const },
]

/* ------------------------------ 需求覆盖矩阵 ------------------------------ */

export interface CoverageRow {
  code: string
  feature: string
  detail: string
  surface: string
  module: string
  status: '已实现' | '展示位' | '演示方案' | '待定'
}

/**
 * 需求矩阵「前端 UI」为模板的逐条对照。
 * 前端 UI 是模板功能：本表把矩阵中其他模块（知识库 / JIRA / 智能分析及各 subAgent）
 * 的功能点映射到前端已预留的展示位，向评审说明「界面已就位，功能待各 Agent 落地」。
 */
export const coverageRows: CoverageRow[] = [
  // 前端本体（模板功能）
  { code: '5.1.1', feature: '任务总览与查询', detail: '待处理 / 处理中 / 待补资料 / 待审核 / 已完成 / 失败 + 按字段范围查询', surface: '任务看板：状态卡 + 查询条 + 任务表', module: '前端 UI', status: '已实现' },
  { code: '5.1.1', feature: '具体任务查看', detail: '原始信息、分析数据、报告、审核意见、JIRA 回帖记录、附件与 Trace 下载', surface: '任务详情六个标签页 + 下载区', module: '前端 UI', status: '已实现' },
  { code: '5.1.3', feature: '人工操作', detail: '重试、人工确认、暂停、排除、重新发起等', surface: '任务行内操作 + 右侧人工介入面板', module: '前端 UI', status: '已实现' },
  { code: '5.2.1', feature: '接收用户输入', detail: '类 ChatGPT / ClaudeCode 的对话输入框，调度各 subAgent', surface: '智能对话工作区输入框与消息流', module: '前端 UI', status: '已实现' },
  { code: '5.2.1', feature: '@ / slash 快捷输入', detail: '用 @、slash 加载特定命令与 skill', surface: '对话输入框快捷符号 + 命令 / skill 下拉菜单', module: '前端 UI', status: '已实现' },
  { code: '5.2.1', feature: '编排过程实时展示', detail: '展示调用了哪个 subAgent、执行到哪一步；长任务折叠为进度卡片', surface: '对话消息流编排进度卡片', module: '前端 UI', status: '已实现' },
  { code: '5.2.2', feature: '查看历史对话', detail: '历史对话记录与结果', surface: '对话左侧历史列表 + 新建对话', module: '前端 UI', status: '已实现' },
  { code: '5.2.3', feature: '渲染 Markdown / mermaid / drawio', detail: 'Markdown 表格代码块，mermaid 实时出图，drawio 解析出图并可下载源文件', surface: '对话消息渲染矩阵', module: '前端 UI', status: '已实现' },
  { code: '5.2.4', feature: '消息级操作', detail: '复制、重新生成、引用追问、反馈（有用 / 有误）、导出 Markdown、跳转底层报告或原始 JIRA', surface: '对话单条消息操作栏', module: '前端 UI', status: '已实现' },
  { code: '5.3.1', feature: '账号登录与授权', detail: 'TCL 内部账号 + Confluence 鉴权登录', surface: '账号与并发页：登录与授权说明卡', module: '前端 UI', status: '演示方案' },
  { code: '5.3.2', feature: '权限与数据可见范围', detail: '内部 JIRA / SmartPerfetto 服务账号操作范围受限', surface: '账号与并发页：角色 / 权限矩阵', module: '前端 UI', status: '演示方案' },
  { code: '5.3.2', feature: '并发处理', detail: '多用户输入与多 JIRA 单同时触发如何处理', surface: '账号与并发页：槽位容量 / 排队策略 / 多单并发示意', module: '前端 UI', status: '演示方案' },

  // 知识库管理系统
  { code: '1.1.1', feature: '承载平台', detail: '自建平台 + GitLab 版本管理（现场已确认可手动建条目）', surface: '知识库页：平台与三套维度说明卡', module: '知识库', status: '展示位' },
  { code: '1.1.2', feature: '知识分类与基本信息', detail: 'METHOD / CASE / EXP 互斥枚举 + test_items + scope；三套维度正交', surface: '知识库页：条目表 + 三套维度对照卡', module: '知识库', status: '展示位' },
  { code: '1.1.3', feature: '分析方法信息', detail: '输入、前置条件、步骤、SQL、指标阈值、判断方法、限制、对比条件', surface: '知识库页：方法条目字段清单 + SQL 文件引用', module: '知识库', status: '展示位' },
  { code: '1.2.1', feature: '知识来源与追溯', detail: '人工 / Agent 产出两个入口；记录填写人与 Jira、Trace、文档出处', surface: '知识库页：来源列 + 出处追溯卡', module: '知识库', status: '展示位' },
  { code: '1.2.2', feature: '知识状态与生效路径', detail: '只有 DRAFT / PUBLISHED 两级；Agent 产出必须人工审核', surface: '知识库页：生效路径四步卡', module: '知识库', status: '展示位' },
  { code: '1.2.3', feature: '修改与删除', detail: '描述性内容可直接提交；历史版本由平台留痕可恢复', surface: '知识库页：条目操作与版本列', module: '知识库', status: '展示位' },
  { code: '1.2.4', feature: '格式校验', detail: '本地预检脚本 + 平台发布检查双层兜底', surface: '知识库页：预检结果表', module: '知识库', status: '展示位' },
  { code: '1.3.1', feature: '验证环境记录', detail: 'scope 记录产品、平台、机芯、机型、芯片、软硬件版本、场景', surface: '知识库页：scope 列与筛选', module: '知识库', status: '展示位' },

  // JIRA 集成与流程管理
  { code: '2.1.1', feature: '问题集范围确认与触发', detail: '对话式范围确认 / 历史问题筛选 / 指定单号触发 / 定时增量', surface: 'JIRA 集成页：范围确认面板 + 触发路径 + 确认记录', module: 'JIRA', status: '展示位' },
  { code: '2.2.1', feature: 'JIRA 问题信息抽取', detail: '基础信息、描述评论、附件与 Trace 线索、场景与环境信息', surface: 'JIRA 集成页：抽取分组卡', module: 'JIRA', status: '展示位' },
  { code: '2.2.2', feature: '信息总表与任务快照', detail: '信息总表供看板查询；每个进入流程的问题生成任务快照', surface: 'JIRA 集成页：信息总表 + 快照侧栏', module: 'JIRA', status: '展示位' },
  { code: '2.3.1', feature: '性能问题过滤与排除标记', detail: '按项目、类型、标签、关键字判断；非性能问题标记排除原因', surface: 'JIRA 集成页：过滤规则表', module: 'JIRA', status: '展示位' },
  { code: '2.3.2', feature: '任务状态与去重判定', detail: '避免同一问题重复进入；已分析与失败任务判定', surface: 'JIRA 集成页：去重判定卡', module: 'JIRA', status: '展示位' },
  { code: '2.4', feature: '交互式看板（Dashboard）', detail: '任务总览、筛选查询、详情查看、人工操作', surface: '任务看板页（与前端 5.1.1 同一界面）', module: 'JIRA', status: '已实现' },
  { code: '2.5', feature: 'Trace 合规性校验', detail: '查找下载、格式解压、完整性、场景一致性、对比机配对、多 Trace 规则', surface: '任务详情：Trace 合规性校验标签页', module: 'JIRA', status: '展示位' },
  { code: '2.6', feature: '自动回复与反馈', detail: '缺失资料检查、补充模板、回帖模板、审核后发布与去重', surface: '任务详情：审核与 JIRA 回帖标签页', module: 'JIRA', status: '展示位' },

  // 智能分析与诊断
  { code: '3.1', feature: '分析任务受理与编排', detail: '交接包受理与准入校验、标识受理、输入快照冻结、案例状态与回传', surface: '智能分析页：交接包受理 + 案例状态机', module: '智能分析', status: '展示位' },
  { code: '3.2', feature: '知识库信息使用', detail: '直接读取交接包带入的知识库内容，作为辅助判断与对比参考', surface: '智能分析页：知识引用卡', module: '智能分析', status: '展示位' },
  { code: '3.3', feature: 'SmartPerfetto 分析对接', detail: '分析请求提交与回执、任务状态与错误分类、并发限流与取消、报告接收固化', surface: '智能分析页：分析任务表', module: '智能分析', status: '展示位' },
  { code: '3.4', feature: '置信度评估与决策', detail: '策略版本化、数值计算、影响因素排序、缺失证据链、结论分级与拦截', surface: '智能分析页：置信度策略卡 + 因素排序表', module: '智能分析', status: '展示位' },
  { code: '3.5', feature: '诊断报告输出', detail: '模板版本与发布控制、结构化报告生成、渲染前校验、导出与访问控制', surface: '智能分析页：模板表 + 任务详情诊断报告标签页', module: '智能分析', status: '展示位' },
  { code: '3.6', feature: '置信度不足时的重新分析', detail: '不达标触发重分析、最多 5 轮、超限转人工并保留上下文', surface: '智能分析页：重新分析轮次卡', module: '智能分析', status: '展示位' },
  { code: '3.7', feature: '案例写回知识库', detail: '构造 CASE 草稿、记录出处关联、提交前校验、草稿提交与去重、审核反馈', surface: '智能分析页：写回流程表', module: '智能分析', status: '展示位' },

  // 业务编排与交互（前端本体之外的编排层）
  { code: '4.1.1', feature: 'Agent 触发条件', detail: '定时轮询增量、用户对话手动触发、无关输入筛除与完整性检查', surface: '编排与门禁页 + 对话页输入检查表', module: '编排层', status: '展示位' },
  { code: '4.1.2', feature: '编排调度各 subAgent', detail: '自动化流水线固定流程；用户输入触发灵活编排', surface: '编排与门禁页：三条触发路径 + 槽位容量', module: '编排层', status: '展示位' },
  { code: '4.1.3', feature: '子任务识别与调用', detail: '自然语言转 JQL、用户意图识别、选择 subAgent 与工具', surface: '编排与门禁页 + 看板功能 Agent 协作态势', module: '编排层', status: '展示位' },
  { code: '4.1.4', feature: '流程历史化保存', detail: '以问题单为粒度保存流程与中间结果，Agent 自主检查合理性', surface: '编排与门禁页：编排轨迹时间线', module: '编排层', status: '展示位' },
  { code: '4.1.5', feature: '暂停与取消', detail: '允许用户暂停或取消某个问题单的分析流程', surface: '编排与门禁页：运行中工作项 + 任务详情人工操作', module: '编排层', status: '展示位' },
  { code: '4.1.6', feature: '异常处理与恢复', detail: '上游 AI 服务 / 外部服务异常提示开发人员，超时重试，断点恢复', surface: '编排与门禁页：异常与重试策略', module: '编排层', status: '展示位' },
  { code: '4.2.1', feature: '约定各 subAgent 交接产物', detail: 'JIRA / 知识库 / SmartPerfetto 三方的产物形式仍待与各 Agent 确认', surface: '编排与门禁页：产物形式卡（显式标注待确认）', module: '编排层', status: '待定' },
  { code: '4.2.2', feature: '质量门禁检查各环节产物', detail: '格式错误、置信度过低、标注人工接入均无法通过', surface: '编排与门禁页：门禁检查表 + 看板门禁卡', module: '编排层', status: '展示位' },
  { code: '4.2.3', feature: '未通过时输出错误报告', detail: '约定模板、汇总遍历检查结果、输出并保存错误报告', surface: '编排与门禁页：错误报告模板 + 生成按钮', module: '编排层', status: '展示位' },
]

export const moduleSummaries = [
  { id: 'module1', name: '知识库管理', owner: 'Knowledge Base subAgent', count: 8, built: '条目模型 / 三套维度 / 生效路径 / 本地预检', pending: '与 SmartWiki 平台接口对接' },
  { id: 'module2', name: 'JIRA 集成与流程管理', owner: 'JIRA subAgent', count: 8, built: '范围确认 / 信息抽取 / 过滤去重 / Trace 校验 / 回帖', pending: 'JIRA MCP Server 接入' },
  { id: 'module3', name: '智能分析与诊断', owner: 'SmartPerfetto subAgent', count: 7, built: '交接包受理 / 置信度策略 / 报告输出 / 重新分析 / 写回', pending: 'SmartPerfetto 接口与报告格式确认' },
  { id: 'module4', name: '前端 UI 与编排', owner: '前端 UI + 编排层', count: 14, built: '看板 / 对话 / 账号并发 / 编排门禁 / 覆盖说明', pending: '账号模型与并发归属待决策' },
]
