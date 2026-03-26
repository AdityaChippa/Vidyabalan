import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function StudyTimeChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const values = data && data.length ? data : [0, 0, 0, 0, 0, 0, 0]

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Study Hours',
          data: values,
          backgroundColor: '#e8601c',
          borderRadius: 6,
          barPercentage: 0.5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(14,14,14,0.05)' }, ticks: { font: { family: 'DM Sans', size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 } } },
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [data])

  return <div style={{ height: 200 }}><canvas ref={canvasRef} /></div>
}
