const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const notesList = document.querySelector("#notes-list");

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return { data, status: response.status };
}

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

function renderEmptyState() {
  const item = document.createElement("li");
  item.textContent = "No notes to show.";
  item.className = "empty-state";
  notesList.replaceChildren(item);
}

function renderNote(note) {
  const item = document.createElement("li");
  item.className = "note";
  item.dataset.noteId = note.id;

  const title = document.createElement("h3");
  title.textContent = note.title || "Untitled note";

  const body = document.createElement("p");
  body.textContent = note.body || "";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteNote(note.id, item));

  item.append(title, body, deleteButton);
  return item;
}

async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");

  try {
    const { data: notes } = await request(`${API_URL}?_limit=10`);

    notesList.replaceChildren();

    if (notes.length === 0) {
      renderEmptyState();
      showStatus("No notes were found.", "success");
      return;
    }

    notes.forEach((note) => {
      notesList.appendChild(renderNote(note));
    });

    showStatus(`Loaded ${notes.length} notes from the server.`, "success");
  } catch (error) {
    showStatus("Could not load notes. Please try again.", "error");
    console.error(error);
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...");

  try {
    const { data: newNote, status } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });

    notesList.querySelector(".empty-state")?.remove();
    notesList.prepend(renderNote(newNote));
    noteForm.reset();

    showStatus(
      `Note created (status ${status}, id ${newNote.id}).`,
      "success"
    );
  } catch (error) {
    showStatus("Could not create the note. Please try again.", "error");
    console.error(error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(noteId, noteElement) {
  const deleteButton = noteElement.querySelector("button");
  deleteButton.disabled = true;
  showStatus("Deleting note...");

  try {
    await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
      method: "DELETE",
    });

    // JSONPlaceholder simulates DELETE but does not persist changes; remove it locally for this page session.
    noteElement.remove();

    if (notesList.children.length === 0) {
      renderEmptyState();
    }

    showStatus("Note deleted.", "success");
  } catch (error) {
    deleteButton.disabled = false;
    showStatus("Could not delete the note. Please try again.", "error");
    console.error(error);
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);