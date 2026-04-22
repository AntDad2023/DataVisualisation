import { useState } from 'react'
import { arc as d3Arc } from 'd3-shape'
import { ribbon as d3Ribbon } from 'd3-chord'
import type { ChordRenderData } from '../utils/chartConfigs/chord'

/**
 * 弦图 SVG 组件。
 *
 * 架构决策：chord 不走 ECharts，而是独立的 React + d3-shape SVG 组件。
 * 原因：ECharts 原生无 chord 类型，且"带宽度可不等的带状弦"需要自画贝塞尔带子，
 * 用 d3-shape.ribbon 现成生成器最直接。布局角度由 `generateChordData`（用
 * d3-chord）计算好后传入，此组件只负责渲染 + 交互（hover 高亮相邻）。
 *
 * SVG 用 viewBox 天然响应式，容器多大图就画多大；保持 1:1 比例。
 */

interface Props {
  data: ChordRenderData
}

// 与 ECharts 默认调色板一致，保证跨图表视觉一致
const COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666',
  '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc',
]

export default function ChordChart({ data }: Props) {
  const [hoveredGroup, setHoveredGroup] = useState<number | null>(null)
  const [hoveredChord, setHoveredChord] = useState<number | null>(null)

  const size = 560
  const outerRadius = size / 2 - 90   // 留 90 px 给外侧标签
  const innerRadius = outerRadius - 22 // 节点扇形带宽 22 px

  // d3-shape 生成器：arc 画外圈节点扇形；ribbon 画内圈弦带
  // 注意：d3 的角度约定 0=12 点方向、顺时针；传入 datum 必须带 startAngle/endAngle/index
  const arcGen = d3Arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

  const ribbonGen = d3Ribbon().radius(innerRadius)

  const { chords, labels } = data
  const groups = chords.groups

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        style={{ width: '100%', maxWidth: size, height: 'auto', display: 'block' }}
      >
        {/* 外圈：节点扇形区段 */}
        {groups.map((g, i) => {
          const isHovered = hoveredGroup === i
          const hoveredChordObj = hoveredChord !== null ? chords[hoveredChord] : null
          const relatedByChord =
            hoveredChordObj !== null &&
            (hoveredChordObj.source.index === i || hoveredChordObj.target.index === i)
          const dim =
            (hoveredGroup !== null && !isHovered) ||
            (hoveredChordObj !== null && !relatedByChord)
          const color = COLORS[i % COLORS.length]
          const mid = (g.startAngle + g.endAngle) / 2
          // SVG 坐标：x 向右，y 向下；d3 角度 0 在 12 点，顺时针
          const labelRadius = outerRadius + 10
          const lx = Math.sin(mid) * labelRadius
          const ly = -Math.cos(mid) * labelRadius
          // 标签锚点：左半圆 right-align，右半圆 left-align
          const anchor = mid < Math.PI ? 'start' : 'end'
          return (
            <g key={`group-${i}`}>
              <path
                d={arcGen(g as { startAngle: number; endAngle: number }) ?? undefined}
                fill={color}
                opacity={dim ? 0.3 : 1}
                stroke="#fff"
                strokeWidth={1}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={() => setHoveredGroup(i)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                <title>{`${labels[i]}\n总流量（出+入）: ${g.value.toFixed(0)}`}</title>
              </path>
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={13}
                fontWeight={isHovered ? 700 : 500}
                fill="#374151"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {labels[i]}
              </text>
            </g>
          )
        })}

        {/* 内圈：弦带。每条弦两端的 source.value / target.value 独立，
            由 d3-chord 根据 matrix[i][j] 和 matrix[j][i] 分别计算，
            这正是"弦两端宽度可以不一样"的定义特征 */}
        {chords.map((c, i) => {
          const matchHover = hoveredChord === i
          const relatedByGroup =
            hoveredGroup === null ||
            hoveredGroup === c.source.index ||
            hoveredGroup === c.target.index
          const dim =
            !relatedByGroup || (hoveredChord !== null && !matchHover)
          const color = COLORS[c.source.index % COLORS.length]
          const sLabel = labels[c.source.index]
          const tLabel = labels[c.target.index]
          return (
            <path
              key={`chord-${i}`}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              d={(ribbonGen as any)(c) ?? undefined}
              fill={color}
              opacity={dim ? 0.08 : matchHover ? 0.95 : 0.7}
              stroke="#fff"
              strokeWidth={0.5}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={() => setHoveredChord(i)}
              onMouseLeave={() => setHoveredChord(null)}
            >
              <title>
                {`${sLabel} → ${tLabel}: ${c.source.value.toFixed(0)}\n` +
                  `${tLabel} → ${sLabel}: ${c.target.value.toFixed(0)}`}
              </title>
            </path>
          )
        })}
      </svg>
    </div>
  )
}
