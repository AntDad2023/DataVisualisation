import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import {
  BarChart, LineChart, ScatterChart, PieChart,
  HeatmapChart, BoxplotChart, RadarChart, FunnelChart,
  TreemapChart, SunburstChart, SankeyChart, ParallelChart,
  GraphChart,
} from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, VisualMapComponent, ParallelComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import ChordChart from './ChordChart'
import type { ChordRenderData } from '../utils/chartConfigs/chord'

// chord 图表用 __renderer 标记走自研 SVG 组件，不走 ECharts
// 与 Generator.tsx 保持同一判断逻辑，避免两处分别维护
export type ChordOption = { __renderer: 'chord-svg'; chordData: ChordRenderData }
export function isChordOption(opt: object | null): opt is ChordOption {
  return !!opt && (opt as { __renderer?: string }).__renderer === 'chord-svg'
}

// 注册 ECharts 组件（与 Generator.tsx 保持一致的注册集合）
// echarts.use 是幂等的，多次调用同一组件不会重复注册
echarts.use([
  BarChart, LineChart, ScatterChart, PieChart,
  HeatmapChart, BoxplotChart, RadarChart, FunnelChart,
  TreemapChart, SunburstChart, SankeyChart, ParallelChart,
  GraphChart,
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, VisualMapComponent, ParallelComponent,
  CanvasRenderer,
])

interface Props {
  option: object
  height?: number
}

/**
 * 通用图表渲染组件，供 ChartDetail 预览区块和 Generator 预览面板复用。
 *
 * 职责：根据 option 的 __renderer 标记决定走 ECharts 还是自研 SVG 组件。
 * 高度通过 height prop 传入（默认 400px），由调用方决定展示尺寸。
 */
export default function ChartPreview({ option, height = 400 }: Props) {
  if (isChordOption(option)) {
    return (
      // 用 style 固定高度，保证 ChordChart 内部 SVG viewBox 有确定的容器尺寸
      <div style={{ height, width: '100%' }}>
        <ChordChart data={option.chordData} />
      </div>
    )
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height, width: '100%' }}
      notMerge={true}
    />
  )
}
