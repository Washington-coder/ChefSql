import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { tokenizeSql } from './sqlSyntax'
import './SqlEditor.css'

interface SqlEditorProps {
  onSubmit: (sql: string) => void
  placeholder?: string
}

function SqlEditor({ onSubmit, placeholder = 'Escreva sua consulta SQL...' }: SqlEditorProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)

  const tokens = tokenizeSql(value)

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value)
  }

  function handleScroll() {
    const input = inputRef.current
    const highlight = highlightRef.current
    if (input === null || highlight === null) {
      return
    }
    highlight.scrollTop = input.scrollTop
    highlight.scrollLeft = input.scrollLeft
  }

  function handleSubmit() {
    if (value.trim().length === 0) {
      return
    }
    onSubmit(value)
  }

  function handleClear() {
    setValue('')
    inputRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <section className="sql-editor" aria-label="Editor de SQL">
      <div className="sql-editor__header">
        <label className="sql-editor__label" htmlFor="sql-editor-input">
          Editor SQL
        </label>
        <span className="sql-editor__hint">Ctrl+Enter para confirmar</span>
      </div>
      <div className="sql-editor__body">
        <pre ref={highlightRef} className="sql-editor__highlight" aria-hidden="true">
          <code>
            {tokens.map((token, index) => (
              <span
                key={index}
                className={token.type === 'plain' ? undefined : `sql-token--${token.type}`}
              >
                {token.value}
              </span>
            ))}
            {'\n'}
          </code>
        </pre>
        <textarea
          ref={inputRef}
          id="sql-editor-input"
          className="sql-editor__input"
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
      <div className="sql-editor__actions">
        <button type="button" className="pixel-button" onClick={handleClear}>
          Limpar
        </button>
        <button type="button" className="pixel-button pixel-button--primary" onClick={handleSubmit}>
          Confirmar
        </button>
      </div>
    </section>
  )
}

export default SqlEditor
