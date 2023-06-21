const NoteForm = (props) => {
  return (
    <div>
      <p>Welcome {props.username}</p>
      <form onSubmit={props.addNote}>
        <input value={props.newNote} onChange={props.handleNoteChange} />
        <button type='submit'>save</button>
      </form>
    </div>
  )

}

export default NoteForm