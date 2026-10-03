import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

/**
 * Bearbeitbares Feld fuer die taegliche Fokus-Absicht.
 * Der Text wird unter 'heroclock:intention' gespeichert und bleibt ueber
 * Seiten-Neuladen erhalten. Im Ruhezustand zeigt die Komponente den
 * gespeicherten Text (oder einen sanften Hinweis), beim Antippen wechselt
 * sie in einen Eingabemodus.
 */
function FocusIntention() {
  const [intention, setIntention] = useLocalStorage<string>('intention', '')
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(intention)

  const startEditing = () => {
    setDraft(intention)
    setIsEditing(true)
  }

  const commit = () => {
    setIntention(draft.trim())
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft(intention)
    setIsEditing(false)
  }

  return (
    <section className="focus-intention" aria-label="Fokus-Absicht">
      <p className="focus-intention__label">Worauf konzentrierst du dich heute?</p>

      {isEditing ? (
        <input
          className="focus-intention__input"
          type="text"
          value={draft}
          autoFocus
          placeholder="Deine Absicht fuer heute ..."
          aria-label="Fokus-Absicht bearbeiten"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commit()
            } else if (event.key === 'Escape') {
              cancel()
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={
            intention
              ? 'focus-intention__value'
              : 'focus-intention__value focus-intention__value--empty'
          }
          onClick={startEditing}
        >
          {intention || 'Tippe hier, um deinen heutigen Fokus zu setzen.'}
        </button>
      )}
    </section>
  )
}

export default FocusIntention
