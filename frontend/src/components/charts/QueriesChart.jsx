import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export function QueriesPerHourChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data?.length) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Queries',
          data: data.map(d => d.count),
          borderColor: '#e8601c',
          backgroundColor: 'rgba(232,96,28,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(14,14,14,0.05)' }, ticks: { font: { family: 'DM Sans', size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 }, maxTicksLimit: 12 } },
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [data])

  return <div style={{ height: 220 }}><canvas ref={canvasRef} /></div>
}

export function LanguageDonutChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data?.length) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.language),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: ['#e8601c', '#1a6b3c', '#4f6ef5', '#b8860b'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 12 }, padding: 16 } },
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [data])

  return <div style={{ height: 220 }}><canvas ref={canvasRef} /></div>
}
