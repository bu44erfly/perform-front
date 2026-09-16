import { useEffect, useId, useMemo, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { ChatRender } from '../data/types'

/* ------------------------------------------------------------------ *
 * Markdown 渲染
 * 对 Agent 返回的 Markdown 在网页端渲染
 * ------------------------------------------------------------------ */

marked.setOptions({ gfm: true, breaks: true })

export function renderMarkdown(content: string): string {
  const raw = marked.parse(content, { async: false }) as string
  return DOMPurify.sanitize(raw)
}

export function Markdown({ content }: { content: string }) {
  const html = useMemo(() => renderMarkdown(content), [content])
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
}

/* ------------------------------------------------------------------ *
 * mermaid 图表渲染
 * Agent 回答中的 mermaid 格式需在网页中渲染展示
 * ------------------------------------------------------------------ */

let mermaidReady: Promise<typeof import('mermaid').default> | null = null

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then((module) => {
      const mermaid = module.default
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        fontFamily: '"Noto Sans SC", Arial, sans-serif',
        themeVariables: {
          primaryColor: '#eef3ff',
          primaryBorderColor: '#93afef',
          primaryTextColor: '#1f2d3d',
          lineColor: '#9aa8ba',
          secondaryColor: '#f1edff',
          tertiaryColor: '#f6f8fb',
          fontSize: '13px',
        },
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
      })
      return mermaid
    })
  }
  return mermaidReady
}

type DiagramState =
  | { status: 'loading' }
  | { status: 'ok'; svg: string }
  | { status: 'error'; message: string }

export function MermaidDiagram({ code }: { code: string }) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [state, setState] = useState<DiagramState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    loadMermaid()
      .then((mermaid) => mermaid.render(`mermaid-${reactId}`, code.trim()))
      .then(({ svg }) => {
        if (!cancelled) setState({ status: 'ok', svg: DOMPurify.sanitize(svg, { ADD_TAGS: ['foreignObject'] }) })
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : '渲染失败' })
      })
    return () => { cancelled = true }
  }, [code, reactId])

  if (state.status === 'loading') return <div className="diagram-loading">正在渲染 mermaid 流程图…</div>
  if (state.status === 'error') {
    return <DiagramFallback title="mermaid 流程图渲染失败，已回退为源码" code={code} note={state.message} kind="mermaid" />
  }
  return <div className="diagram-frame"><div className="diagram-badge">mermaid</div><div className="mermaid-target" dangerouslySetInnerHTML={{ __html: state.svg }} /></div>
}

/* ------------------------------------------------------------------ *
 * drawio 图形渲染
 * drawio 格式同样需要在网页中渲染
 * 解析 mxGraphModel 的节点与连线，用 SVG 还原泳道/方框/箭头
 * ------------------------------------------------------------------ */

interface DrawioNode { id: string; value: string; swimlane: boolean; x: number; y: number; w: number; h: number }
interface DrawioEdge { id: string; value: string; source: string; target: string }

interface DrawioModel { nodes: DrawioNode[]; edges: DrawioEdge[]; title: string }

export function parseDrawio(xml: string): DrawioModel {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')
  if (doc.querySelector('parsererror')) {
    // 容错：尝试把裸 mxCell 片段包进可解析结构
    const wrapped = parser.parseFromString(`<root>${xml}</root>`, 'text/xml')
    if (wrapped.querySelector('parsererror')) return { nodes: [], edges: [], title: '' }
    return collectDrawio(wrapped)
  }
  return collectDrawio(doc)
}

function collectDrawio(doc: Document): DrawioModel {
  const cells = Array.from(doc.querySelectorAll('mxCell'))
  const nodes: DrawioNode[] = []
  const edges: DrawioEdge[] = []
  let index = 0
  const laneWidth = 210
  const laneHeight = 96

  for (const cell of cells) {
    const id = cell.getAttribute('id') ?? `cell-${index}`
    const value = cell.getAttribute('value') ?? ''
    const style = cell.getAttribute('style') ?? ''
    const isSwimlane = style.includes('swimlane')
    if (cell.getAttribute('edge') === '1') {
      edges.push({ id, value, source: cell.getAttribute('source') ?? '', target: cell.getAttribute('target') ?? '' })
      continue
    }
    if (cell.getAttribute('vertex') !== '1') continue
    const geometry = cell.querySelector('mxGeometry')
    const parsedX = Number(geometry?.getAttribute('x') ?? NaN)
    const parsedY = Number(geometry?.getAttribute('y') ?? NaN)
    // 演示数据一般不写坐标，按泳道自动布局
    nodes.push({
      id, value, swimlane: isSwimlane,
      x: Number.isFinite(parsedX) ? parsedX : 24,
      y: Number.isFinite(parsedY) ? parsedY : 24 + nodes.length * laneHeight,
      w: isSwimlane ? laneWidth : 168,
      h: isSwimlane ? laneHeight : 44,
    })
    index += 1
  }

  // 泳道在左、节点在右，避免重叠
  const lanes = nodes.filter((node) => node.swimlane)
  const boxes = nodes.filter((node) => !node.swimlane)
  lanes.forEach((lane, i) => { lane.x = 20; lane.y = 20 + i * laneHeight; lane.w = laneWidth; lane.h = laneHeight - 12 })
  boxes.forEach((box, i) => {
    box.x = laneWidth + 70
    box.y = 32 + i * 62
    box.w = 210
    box.h = 46
  })

  // 给未绑定泳道的连线补一条竖向关系，保证图形可读
  const decorated = edges.length
    ? edges
    : boxes.slice(0, -1).map((box, i) => ({ id: `auto-${i}`, value: '', source: box.id, target: boxes[i + 1].id }))

  return { nodes, edges: decorated, title: doc.querySelector('diagram')?.getAttribute('name') ?? '' }
}

export function DrawioDiagram({ code }: { code: string }) {
  const model = useMemo(() => parseDrawio(code), [code])
  const nodes = model.nodes
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const width = Math.max(560, 300 + nodes.filter((node) => !node.swimlane).length * 0)
  const rows = nodes.filter((node) => !node.swimlane).length
  const height = Math.max(240, 60 + Math.max(rows * 62, nodes.filter((node) => node.swimlane).length * 96))

  if (!nodes.length) return <DiagramFallback title="drawio 图形渲染失败，已回退为源码" code={code} note="未解析到 mcCell 节点" kind="drawio" />

  const download = () => {
    const blob = new Blob([code], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${model.title || 'performance-agent'}.drawio`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="diagram-frame">
      <div className="diagram-badge">drawio</div>
      <button className="diagram-download" onClick={download}>下载 .drawio 源文件</button>
      <svg className="drawio-canvas" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={model.title || 'drawio 图'}>
        <defs>
          <marker id="drawio-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8794a6" />
          </marker>
        </defs>
        {nodes.filter((node) => node.swimlane).map((lane) => (
          <g key={lane.id}>
            <rect x={lane.x} y={lane.y} width={lane.w} height={lane.h} rx="8" fill="#f5f8fd" stroke="#cfdcee" strokeWidth="1" />
            <text x={lane.x + 12} y={lane.y + 24} className="drawio-lane-label">{lane.value}</text>
          </g>
        ))}
        {model.edges.map((edge) => {
          const from = byId.get(edge.source)
          const to = byId.get(edge.target)
          if (!from || !to) return null
          const x1 = from.x + from.w, y1 = from.y + from.h / 2
          const x2 = to.x, y2 = to.y + to.h / 2
          const midX = (x1 + x2) / 2
          return (
            <g key={edge.id}>
              <path d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`} fill="none" stroke="#8794a6" strokeWidth="1.3" markerEnd="url(#drawio-arrow)" />
              {edge.value && <text x={midX} y={(y1 + y2) / 2 - 6} textAnchor="middle" className="drawio-edge-label">{edge.value}</text>}
            </g>
          )
        })}
        {nodes.filter((node) => !node.swimlane).map((node) => {
          const tone = node.value.includes('草稿') ? '#fde8e8' : node.value.includes('报告') ? '#e4f4e9' : '#e6efff'
          return (
            <g key={node.id}>
              <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="9" fill={tone} stroke="#b9c8dd" strokeWidth="1.1" />
              <text x={node.x + node.w / 2} y={node.y + node.h / 2 + 5} textAnchor="middle" className="drawio-node-label">{node.value}</text>
            </g>
          )
        })}
      </svg>
      <p className="diagram-note">前端按 mxGraphModel 还原节点与连线；<code>.drawio</code> 源文件可下载后用 app.diagrams.net 打开。</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function DiagramFallback({ title, code, note, kind }: { title: string; code: string; note: string; kind: string }) {
  return (
    <div className="diagram-frame">
      <div className="diagram-badge">{kind}</div>
      <p className="diagram-note">{title}（{note}）</p>
      <pre className="diagram-source">{code}</pre>
    </div>
  )
}

/** 按 render 模式分发：文本 / Markdown / mermaid / drawio */
export function ChatRenderer({ content, render = 'markdown' }: { content: string; render?: ChatRender }) {
  if (render === 'text') return <div className="markdown-body plain-body">{content.split('\n').map((line, index) => <p key={index}>{line || ' '}</p>)}</div>

  if (render === 'mermaid') {
    const blocks = splitFenced(content, 'mermaid')
    return <div className="markdown-body">{blocks.map((block, index) => isDiagram(block)
      ? <MermaidDiagram key={index} code={block.code} />
      : <Markdown key={index} content={block.text} />)}</div>
  }

  if (render === 'drawio') {
    const blocks = splitFenced(content, 'drawio')
    return <div className="markdown-body">{blocks.map((block, index) => isDiagram(block)
      ? <DrawioDiagram key={index} code={block.code} />
      : <Markdown key={index} content={block.text} />)}</div>
  }

  // 默认 markdown：正文里的 mermaid / drawio 代码块也一并渲染
  const blocks = splitFenced(content, 'mermaid', 'drawio')
  if (!blocks.some((block) => isDiagram(block))) return <Markdown content={content} />
  return <div className="markdown-body">{blocks.map((block, index) => {
    if (!isDiagram(block)) return <Markdown key={index} content={block.text} />
    if (block.format === 'drawio') return <DrawioDiagram key={index} code={block.code} />
    return <MermaidDiagram key={index} code={block.code} />
  })}</div>
}

type Segment = { kind: 'text'; text: string } | { kind: 'diagram'; format: 'mermaid' | 'drawio'; code: string }
type DiagramSegment = Extract<Segment, { kind: 'diagram' }>

function isDiagram(segment: Segment): segment is DiagramSegment {
  return segment.kind === 'diagram'
}

function splitFenced(content: string, ...kinds: string[]): Segment[] {
  const pattern = new RegExp('```(' + kinds.join('|') + ')\\s*\\n([\\s\\S]*?)```', 'g')
  const segments: Segment[] = []
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(content)) !== null) {
    if (match.index > cursor) segments.push({ kind: 'text', text: content.slice(cursor, match.index) })
    segments.push({ kind: 'diagram', format: match[1] as 'mermaid' | 'drawio', code: match[2] })
    cursor = match.index + match[0].length
  }
  if (cursor < content.length) segments.push({ kind: 'text', text: content.slice(cursor) })
  return segments
}
