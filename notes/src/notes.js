import { useState, useEffect } from 'react'
import Note from './components/Note'
import Notification from './components/Notification'
import Footer from './components/Footer'
import LoginForm from './components/LoginForm'
import NoteForm from './components/NoteForm'
import Togglable from './components/Toggable'
import noteService from './services/notes'
import loginService from './services/login'
import './index.css'

const App = () => {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState('some error happened...')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  // const hook = () => {
  //     console.log('effect')
  //     axios
  //         .get('http://localhost:3001/notes')
  //         .then(response => {
  //             console.log('promise fulfilled')
  //             setNotes(response.data)
  //         })
  // }

  //https://fullstackopen.com/en/part2/getting_data_from_server#effect-hooks

  // useEffect(hook, [])

  useEffect(() => {   // get data from database
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
    console.log('logging in with', username, password)
  }

  const handleLogOut = (e) => {
    console.log('Local Storage erased')
    return window.localStorage.removeItem('loggedNoteappUser')
  }

  const addNote = (noteObject) => {
    // post note in the database
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }

  const notesToShow = showAll ? notes : notes.filter(note => note.important)

  // https://fullstackopen.com/en/part2/altering_data_in_server#changing-the-importance-of-notes
  const toggleImportanceOf = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(n => n.id !== id ? n : returnedNote))
      })
      .catch(error => {
        setErrorMessage(
          `Note "${note.content}" was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  return (  
    <div>
      <h1>Notes</h1>

      <Notification message={errorMessage} />

      {
        user === null 
        ? <Togglable buttonLabel='Login'>
            <LoginForm
              handleLogin = {handleLogin}    
              username = {username}
              setUsername = {setUsername}
              password = {password}
              setPassword = {setPassword}
            />
          </Togglable>
        : <Togglable buttonLabel={'New Note'}>
            <NoteForm createNote={addNote} />
          </Togglable>
      }
  
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note =>
          <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)} />
        )}
      </ul>
      <button onClick={() => handleLogOut()}>Log Out</button>
      <Footer />
    </div>
  )
}

export default App