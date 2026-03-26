import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function CostSavingsChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data?.length) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [
          {
            label: 'Baseline Cost (₹)',
            data: data.map(d => d.baseline_cost),
            backgroundColor: '#e0d8cc',
            borderRadius: 6,
            barPercentage: 0.6,
          },
          {
            label: 'VidyAI Cost (₹)',
            data: data.map(d => d.vidyai_cost),
            backgroundColor: '#e8601c',
            borderRadius: 6,
            barPercentage: 0.6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 12 }, padding: 20 } },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(14,14,14,0.05)' }, ticks: { font: { family: 'DM Sans', size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 } } },
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [data])

  return <div style={{ height: 280 }}><canvas ref={canvasRef} /></div>
}
