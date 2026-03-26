export default function QuizCard({ question, index, total, selectedAnswer, onSelect, showResult, isCorrect }) {
  const isMultiChoice = question.question_type === 'mcq'
  return (
    <div className="card animate-fadeUp" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{ background: 'var(--saffron-pale)', color: 'var(--saffron)' }}>
          Q{index + 1} of {total}
        </span>
        <span className="text-[12px] px-3 py-1 rounded-full capitalize"
              style={{ background: 'var(--paper2)', color: 'var(--ink3)' }}>
          {question.question_type === 'mcq' ? 'Multiple Choice' : 'Short Answer'} · {question.difficulty}
        </span>
      </div>
      <h3 className="text-base font-medium mb-5 leading-relaxed" style={{ color: 'var(--ink)' }}>
        {question.question}
      </h3>
      {isMultiChoice && question.options ? (
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selectedAnswer === opt
            const isCorrectOpt = showResult && opt === question.correct_answer
            const isWrong = showResult && isSelected && !isCorrectOpt
            let bg = 'var(--paper)'
            let border = 'var(--border)'
            if (isSelected && !showResult) { bg = 'var(--saffron-pale)'; border = 'var(--saffron)' }
            if (isCorrectOpt) { bg = 'var(--green-pale)'; border = 'var(--green)' }
            if (isWrong) { bg = '#fde8e8'; border = '#e74c3c' }
            return (
              <button key={i} onClick={() => !showResult && onSelect(opt)}
                className="w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer"
                style={{ background: bg, border: `1.5px solid ${border}`, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                {opt}
              </button>
            )
          })}
        </div>
      ) : (
        <textarea className="input-field" rows={3} placeholder="Type your answer..."
          value={selectedAnswer || ''} onChange={e => onSelect(e.target.value)}
          disabled={showResult} />
      )}
      {showResult && question.explanation && (
        <div className="mt-4 p-3.5 rounded-xl text-[13px] leading-relaxed"
             style={{ background: 'var(--paper2)', color: 'var(--ink2)' }}>
          <strong>Explanation:</strong> {question.explanation}
          {question.source_text && (
            <div className="mt-2 text-[12px]" style={{ color: 'var(--saffron)' }}>📖 {question.source_text}</div>
          )}
        </div>
      )}
    </div>
  )
}
