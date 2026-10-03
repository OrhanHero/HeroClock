import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

/** Ein einzelner Aufgaben-Eintrag. */
interface Todo {
  id: string
  text: string
  done: boolean
}

/** Erzeugt eine eindeutige ID fuer eine neue Aufgabe. */
function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Einfache, dauerhaft gespeicherte Aufgabenliste.
 *
 * Aufgaben lassen sich hinzufuegen, als erledigt markieren (Durchstreichen)
 * und loeschen. Die vollstaendige Liste wird unter 'heroclock:todos' gesichert.
 */
function TodoList() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (text.length === 0) {
      return
    }
    setTodos((previous) => [
      ...previous,
      { id: createId(), text, done: false },
    ])
    setDraft('')
  }

  const toggleTodo = (id: string) => {
    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((previous) => previous.filter((todo) => todo.id !== id))
  }

  const openCount = todos.filter((todo) => !todo.done).length

  return (
    <div className="todo">
      <form className="todo__form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="todo__input"
          value={draft}
          placeholder="Neue Aufgabe ..."
          aria-label="Neue Aufgabe"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="todo__add">
          Aufgabe hinzufuegen
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="todo__empty">Noch keine Aufgaben. Leg einfach los!</p>
      ) : (
        <ul className="todo__list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo__item${todo.done ? ' todo__item--done' : ''}`}
            >
              <label className="todo__label">
                <input
                  type="checkbox"
                  className="todo__checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="todo__text">{todo.text}</span>
              </label>
              <button
                type="button"
                className="todo__delete"
                aria-label={`Aufgabe "${todo.text}" loeschen`}
                onClick={() => deleteTodo(todo.id)}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="todo__count">Offen: {openCount}</p>
      )}
    </div>
  )
}

export default TodoList
