import type {
  AgentStage, Capacity, PermissionRow, Person, QueueRow, RoleDefinition, Task,
} from './types'

export const tasks: Task[] = [
  {
    id: 'PERF-2048',
    title: '视频应用冷启动耗时异常',
    project: 'TV Core',
    owner: '李工',
    device: 'P5 · MT9653',
    category: '启动性能',
    status: '待审核',
    stage: '人工审核',
    traceStatus: '通过',
    reviewStatus: '待审核',
    updatedAt: '今天 10:42',
    priority: 'P0',
    summary: '视频应用首帧出现时间较对比机增加 1.24s，已定位到初始化任务串行阻塞风险。',
    environment: 'TV P5 · 65X9 · Android 15 · App 8.2.1',
    confidence: 86,
    sourceConfidence: 91,
    conclusion: '高度怀疑',
  },
  {
    id: 'PERF-2042', title: '首页滑动偶发掉帧', project: 'Launcher', owner: '王工', device: 'P4 · MT9638', category: '滑动卡顿', status: '待补资料', stage: 'Trace 校验', traceStatus: '待补充', reviewStatus: '不适用', updatedAt: '今天 09:16', priority: 'P1', summary: '缺少同环境对比机 Trace，暂无法形成可靠差异结论。', environment: 'TV P4 · 55A8 · Android 14', confidence: 0, sourceConfidence: 0, conclusion: '待验证', blocker: '等待补充对比机 Trace',
  },
  {
    id: 'PERF-2037', title: '待机功耗超过基线', project: 'Power', owner: '陈工', device: 'P5 · MT9653', category: '功耗', status: '分析中', stage: 'SmartPerfetto 分析', traceStatus: '通过', reviewStatus: '不适用', updatedAt: '今天 10:31', priority: 'P0', summary: '已提交功耗窗口对齐分析，正在等待引擎报告。', environment: 'TV P5 · 75X10 · Android 15', confidence: 0, sourceConfidence: 0, conclusion: '待验证',
  },
  {
    id: 'PERF-2031', title: '遥控器唤醒响应延迟', project: 'System UI', owner: '赵工', device: 'P3 · MT9618', category: '响应延迟', status: '已完成', stage: 'JIRA 回帖', traceStatus: '通过', reviewStatus: '已通过', updatedAt: '昨天 16:28', priority: 'P1', summary: '已确认后台唤醒广播竞争导致 P95 延迟升高，报告与回帖已归档。', environment: 'TV P3 · 50S6 · Android 13', confidence: 93, sourceConfidence: 95, conclusion: '已证实',
  },
  {
    id: 'PERF-2026', title: '游戏模式切换卡顿', project: 'Gaming', owner: '孙工', device: 'P5 · MT9653', category: '模式切换', status: '失败 / 人工介入', stage: '服务异常', traceStatus: '异常', reviewStatus: '需人工处理', updatedAt: '昨天 14:06', priority: 'P0', summary: '外部分析服务返回异常，自动重试上限已达，需要工程师人工接手。', environment: 'TV P5 · 65G7 · Android 15', confidence: 0, sourceConfidence: 0, conclusion: '待验证', blocker: 'SmartPerfetto 服务异常',
  },
  {
    id: 'PERF-2020', title: '开机动画与声音不同步', project: 'Experience', owner: '周工', device: 'P4 · MT9638', category: '启动体验', status: '已暂停', stage: '人工确认', traceStatus: '通过', reviewStatus: '需人工处理', updatedAt: '昨天 11:32', priority: 'P2', summary: '等待产品确认目标测试场景，再继续分析。', environment: 'TV P4 · 43A7 · Android 14', confidence: 58, sourceConfidence: 72, conclusion: '待验证', blocker: '等待场景确认',
  },
  {
    id: 'PERF-2018', title: '投屏首帧显示慢', project: 'Cast', owner: '郑工', device: 'P5 · MT9653', category: '首帧性能', status: '待处理', stage: 'JIRA 采集', traceStatus: '校验中', reviewStatus: '不适用', updatedAt: '昨天 09:42', priority: 'P1', summary: '已进入增量问题集，等待 Trace 采集与场景识别。', environment: 'TV P5 · 55X9 · Android 15', confidence: 0, sourceConfidence: 0, conclusion: '待验证',
  },
]

export const agentStages: AgentStage[] = [
  { name: 'JIRA 采集', shortName: 'JIRA Agent', state: '正常', count: 2, output: '已生成问题快照' },
  { name: 'Trace 校验', shortName: 'Trace Validator', state: '等待输入', count: 1, output: '等待对比机数据' },
  { name: '知识检索', shortName: 'Knowledge Agent', state: '正常', count: 3, output: '命中 12 条参考知识' },
  { name: 'SmartPerfetto 分析', shortName: 'Perfetto Agent', state: '正常', count: 1, output: '功耗窗口分析中' },
  { name: '报告生成', shortName: 'Report Agent', state: '正常', count: 1, output: '诊断报告 v2.1' },
  { name: '人工审核 / 回帖', shortName: 'Review Agent', state: '阻塞', count: 2, output: '等待审核意见' },
]

export const capacities: Capacity[] = [
  { name: 'JIRA Agent', active: 1, total: 2, queue: 1 },
  { name: 'Trace Validator', active: 2, total: 2, queue: 1 },
  { name: 'SmartPerfetto', active: 1, total: 1, queue: 2 },
  { name: 'Report Agent', active: 0, total: 2, queue: 0 },
]

/** 账号管理 · 演示用户清单 */
export const people: Person[] = [
  { name: '王工', account: 'wang.gong', role: '审核人', org: '产品软件部 · 性能组', scope: 'TV Core / Launcher', status: '在职', lastActive: '今天 10:44', concurrency: '审核 3 项' },
  { name: '李工', account: 'li.gong', role: '工程师', org: '产品软件部 · 性能组', scope: 'TV Core', status: '在职', lastActive: '今天 10:31', concurrency: '分析 2 项' },
  { name: '刘工', account: 'liu.gong', role: '审核人', org: '产品软件部 · 质量组', scope: '全部 TV 产品', status: '在职', lastActive: '今天 09:58', concurrency: '审核 2 项' },
  { name: '陈工', account: 'chen.gong', role: '工程师', org: '产品软件部 · 功耗组', scope: 'Power', status: '在职', lastActive: '今天 09:12', concurrency: '分析 2 项' },
  { name: '赵工', account: 'zhao.gong', role: '工程师', org: '产品软件部 · 系统 UI 组', scope: 'System UI', status: '在职', lastActive: '昨天 16:28', concurrency: '分析 1 项' },
  { name: '演示访客', account: 'demo.guest', role: '访客', org: '—', scope: '脱敏任务摘要', status: '在职', lastActive: '昨天 15:02', concurrency: '只读' },
  { name: '离职账号示例', account: 'former.user', role: '工程师', org: '产品软件部 · 性能组', scope: '已回收', status: '已停用', lastActive: '2026-07-30', concurrency: '—' },
]

/** 账号管理 · 角色边界（待决策，当前为演示方案） */
export const roles: RoleDefinition[] = [
  { name: '访客', scope: '未登录 / 外部访客', capabilities: ['查看脱敏任务摘要', '查看公开知识引用'], concurrency: '只读，不占用分析槽位', note: '是否需要游客身份仍为待确认项，当前按“只读”演示。' },
  { name: '工程师', scope: '性能组在岗人员', capabilities: ['发起 / 取消分析任务', '补充资料与重试', '查询知识库与 Trace'], concurrency: '分析并发 2 项 / 人', note: '按待定，当前按“每人独立账号”演示。' },
  { name: '审核人', scope: '有合并权限的人员', capabilities: ['审核报告与结论分级', '确认 JIRA 回帖', '驳回并要求补充'], concurrency: '审核 3 项 / 人，不占分析槽位', note: '知识库发布权限由 SmartWiki 平台权限配置决定，前端不另建角色体系。' },
  { name: '管理员', scope: '系统负责人', capabilities: ['账号与范围管理', '并发与队列策略', '审计与异常处置'], concurrency: '不限制（受审计）', note: '异常上报开发人员的入口归此角色。' },
]

/** 账号管理 · 权限矩阵 */
export const permissionMatrix: PermissionRow[] = [
  { capability: '查看任务看板', guest: '只读', engineer: '可操作', reviewer: '可操作', admin: '可操作' },
  { capability: '发起 / 取消分析任务', guest: '—', engineer: '可操作', reviewer: '可操作', admin: '可操作' },
  { capability: '人工确认与补资料', guest: '—', engineer: '可操作', reviewer: '可操作', admin: '可操作' },
  { capability: '审核报告 / 发布 JIRA 回帖', guest: '—', engineer: '只读', reviewer: '可操作', admin: '可操作' },
  { capability: '知识库写入与提交审核', guest: '—', engineer: '只读', reviewer: '可操作', admin: '可操作' },
  { capability: '账号与并发策略管理', guest: '—', engineer: '—', reviewer: '—', admin: '可操作' },
]

/** 并发处理 · 容量与排队策略 */
export const queueRows: QueueRow[] = [
  { name: 'JIRA 采集', total: 6, running: 1, waiting: 1, avgWait: '12s', avgCost: '40s', policy: '每账号 1 并发' },
  { name: 'Trace 校验', total: 4, running: 2, waiting: 1, avgWait: '1m 05s', avgCost: '3m 20s', policy: '每账号 1 并发' },
  { name: '知识库检索', total: 6, running: 3, waiting: 0, avgWait: '5s', avgCost: '18s', policy: '不限并发，仅限速率' },
  { name: 'SmartPerfetto 分析', total: 2, running: 1, waiting: 2, avgWait: '6m 40s', avgCost: '21m', policy: '全局 1 并发（引擎限制）' },
  { name: '报告生成', total: 4, running: 1, waiting: 0, avgWait: '20s', avgCost: '1m 30s', policy: '每账号 2 并发' },
  { name: '人工审核', total: 4, running: 0, waiting: 2, avgWait: '—', avgCost: '—', policy: '不占分析槽位，按人工节奏' },
]

/** 流程编排 · 编排策略 */
export const orchestrationFlows = [
  { trigger: '定时轮询触发', intent: '增量问题集批量分析', pipeline: '固定流水线：JIRA → Trace → 知识 → SmartPerfetto → 报告 → 审核回帖', running: '后台串行，受并发上限约束' },
  { trigger: '用户对话框触发', intent: '指定单号 / JQL 范围', pipeline: '按意图动态选路：先自然语言转 JQL，再编排所需 subAgent', running: '交互优先，创建受限工作项' },
  { trigger: '子任务识别', intent: '只下载附件 / 只查知识库 / 只看评论', pipeline: '不进入完整流水线，仅调用相关 subAgent 与工具', running: '轻量工作项，不占用分析槽位' },
]

/** 4.3 质量门禁 · 交接产物检查项 */
export const gateChecks = [
  { stage: 'JIRA 交接产物', rule: '字段齐全、无未定义字段、保留原始定位', state: '通过' as const },
  { stage: '知识库交接产物', rule: '输入-输出成对保存，引用条目存在且为正式状态', state: '通过' as const },
  { stage: 'SmartPerfetto 交接产物', rule: '报告与任务标识、案例、冻结输入三者绑定', state: '通过' as const },
  { stage: '置信度门禁', rule: '案例级置信度低于门槛不得输出确定性根因', state: '阻断' as const },
  { stage: '人工接入标记', rule: '任何被标注“需要人工介入”的产物无法通过', state: '阻断' as const },
  { stage: '错误报告输出', rule: '未通过时按模板汇总并保存，用于回写或人工接入', state: '待补充' as const },
]

/** 流程历史 · 单个问题单的编排快照 */
export const flowHistory = [
  { step: '触发', detail: '定时轮询命中增量问题集', actor: 'Scheduler', time: '今天 08:10', state: 'done' as const },
  { step: 'JIRA 采集', detail: '快照 v1.3 · 附件 2 · 评论 6', actor: 'JIRA Agent', time: '今天 08:11', state: 'done' as const },
  { step: 'Trace 校验', detail: '双 Trace 通过完整性、场景一致性校验', actor: 'Trace Validator', time: '今天 08:20', state: 'done' as const },
  { step: '知识检索', detail: '命中 METHOD-012 / CASE-087 / EXP-021', actor: 'Knowledge Agent', time: '今天 08:21', state: 'done' as const },
  { step: '性能分析', detail: '第 2 轮重分析，差异收敛到 1.24s', actor: 'SmartPerfetto', time: '今天 10:38', state: 'done' as const },
  { step: '报告生成', detail: '诊断报告 v2.1 · 置信度 86%', actor: 'Report Agent', time: '今天 10:42', state: 'done' as const },
  { step: '审核与回帖', detail: '等待人工审核意见', actor: 'Review Agent', time: '—', state: 'current' as const },
]

/** 对话接续示例 · 展示历史对话参与后续编排 */
export const historyReply = `### 接续上一轮对话

已读取历史对话 **「分析 PERF-2048 启动卡顿」** 的上下文（输入快照 v1.3、双 Trace 校验结论、2 轮分析记录），本轮不需要重新采集。

| 轮次 | 侧重点 | 案例置信度 | 结果 |
| --- | --- | --- | --- |
| 第 1 轮 | 冷启动关键路径 | 71% | 未达门槛 |
| 第 2 轮 | 初始化串行阻塞 | 86% | 达标，转报告 |

\`\`\`text
历史对话 → 冻结输入复用 → 差异点收窄 → 正式报告 v2.1
\`\`\`

> 历史对话参与后续编排时，仍只认当初冻结的输入版本，避免结果对不上。`

/** 对话中的 mermaid 渲染示例 */
export const mermaidReply = `下面把当前流水线画成流程图（mermaid 语法，前端渲染为图形）：

\`\`\`mermaid
flowchart TD
  A[用户对话 / 定时轮询] --> B{意图识别}
  B -->|指定单号| C[JIRA Agent 采集]
  B -->|自然语言范围| D[自然语言转 JQL]
  D --> C
  C --> E[Trace 合规性校验]
  E -->|通过| F[知识库检索]
  E -->|缺对比机| G[待补资料 + 回复模板]
  F --> H[SmartPerfetto 分析]
  H --> I{置信度门槛}
  I -->|达标| J[生成诊断报告]
  I -->|不达标, 小于5轮| H
  I -->|超5轮| K[转人工处理]
  J --> L[人工审核]
  L -->|通过| M[JIRA 回帖 + 写回知识库草稿]
  L -->|驳回| G
\`\`\`

图中 **E → G** 与 **I → K** 是两条需要人工介入的兜底路径。`

/** 对话中的 drawio 渲染示例 */
export const drawioReply = `这是 drawio 格式的泳道图（前端以图形方式渲染，可点击下载 \`.drawio\` 源文件）：

\`\`\`drawio
<mxfile host="app.diagrams.net">
  <diagram name="Performance Agent 泳道">
    <mxGraphModel dx="880" dy="560" grid="1">
      <root>
        <mxCell id="lane-1" value="知识库" style="swimlane" vertex="1" />
        <mxCell id="lane-2" value="JIRA" style="swimlane" vertex="1" />
        <mxCell id="lane-3" value="智能分析" style="swimlane" vertex="1" />
        <mxCell id="wb-1" value="案例草稿回写" style="rounded=0;fillColor=#f8cecc" vertex="1" />
        <mxCell id="jira-1" value="问题集与快照" style="rounded=1;fillColor=#dae8fc" vertex="1" />
        <mxCell id="ana-1" value="诊断报告" style="rounded=1;fillColor=#d5e8d4" vertex="1" />
        <mxCell id="edge-1" value="交接包" edge="1" source="jira-1" target="ana-1" />
        <mxCell id="edge-2" value="草稿提交" edge="1" source="ana-1" target="wb-1" />
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
\`\`\`

泳道自上而下为 **知识库 → JIRA → 智能分析**，交接产物由门禁检查后方可流转。`

/** 对话中的表格 + 代码渲染示例 */
export const tableReply = `### 当前待审核任务

| 单号 | 主题 | 置信度 | 门禁 |
| --- | --- | --- | --- |
| PERF-2048 | 视频应用冷启动耗时异常 | 86% | 等待人工审核 |

\`\`\`sql
-- 冷启动首帧窗口（SQL 独立维护于 sql/ 草稿目录）
SELECT process_name, ts, dur
FROM slice
WHERE name = 'first_frame_display'
  AND ts BETWEEN 1000000000 AND 1200000000;
\`\`\`

确认结论措辞后即可发布 JIRA 回帖。`

/** 对话中的普通文本渲染示例 */
export const plainReply = `已收到，本条为纯文本答复（渲染模式：text）。

三个可以继续的动作：
1. 指定单号 → 我按固定流水线跑一遍完整分析
2. 只给范围 → 我先把它转成 JQL，再确认问题集
3. 只想看某一步 → 例如“只看 PERF-2042 的评论”，不进入完整流水线`
