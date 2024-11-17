import { useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase.js";

const CATEGORIES = [
  { name: "All", color: "#d946ef" },
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [fact, setFacts] = useState([]);
  const [showForm, setshowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getfacts() {
        setIsLoading(true);
        const query = supabase.from("facts").select("*");
        if (currentCategory !== "all") {
          query.eq("category", currentCategory);
        }
        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);
        if (!error) {
          setFacts(facts);
        } else alert("There was a problem getting data");

        setIsLoading(false);
      }
      getfacts();
    },
    [currentCategory]
  );
  return (
    // <> - fragment

    <div>
      <Header showForm={showForm} setshowForm={setshowForm} />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setshowForm={setshowForm} />
      ) : null}
      <main className="main">
        <CategoryList setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <IsLoading />
        ) : (
          <FactList fact={fact} setFacts={setFacts} />
        )}
      </main>
    </div>
  );
}

function Header({ showForm, setshowForm }) {
  const appName = "FactHub";
  return (
    <header className="header">
      <div className="logo">
        <img src="icon.png" alt="message icon" height="68" width="68" />
        <h1>{appName}</h1>
      </div>

      <button
        className="btn share-button"
        onClick={() => setshowForm((show) => !show)}
      >
        {showForm ? "close" : "Share a Fact"}
      </button>
    </header>
  );
}

function IsLoading() {
  return <p className="message">Loading....</p>;
}
function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setshowForm, setFacts }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const textLength = text.length;

  async function handleSubmit(e) {
    // Prevent browser reload
    e.preventDefault();

    // check data is valid if so, create a new fact
    if (text && textLength <= 200 && isValidHttpUrl(source) && category) {
      setIsUploading(true);
      const { data: newFacts, error } = await supabase
        .from("facts")

        .insert([{ text, source, category }])
        .select();
      // Add new fact to the UI: add the fact to state
      if (!error) {
        setFacts((fact) => [newFacts[0], ...fact]);
        setIsUploading(false);
      }

      // reset input field
      setText("");
      setSource("");
      setCategory("");

      // close the form
      setshowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a facts with world"
        value={text}
        disabled={isUploading}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{textLength <= 200 ? 200 - textLength : 0}</span>
      <input
        type="text"
        placeholder="http://example.com"
        disabled={isUploading}
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option>Choose category</option>
        {CATEGORIES.map((cat) => (
          <Options key={cat.name} name={cat.name} />
        ))}
      </select>
      <button
        className="btn post-button"
        disabled={isUploading}
        onClick={() => handleSubmit}
      >
        Post
      </button>
    </form>
  );
}

function Options({ name }) {
  return (
    <option key={name} value={name}>
      {name}
    </option>
  );
}

function CategoryList({ setCurrentCategory }) {
  return (
    <aside>
      <ul className="category">
        {CATEGORIES.map((cat) => (
          <CatList
            key={cat.name}
            name={cat.name}
            color={cat.color}
            setCurrentCategory={setCurrentCategory}
          />
        ))}
      </ul>
    </aside>
  );
}

function CatList({ key, name, color, setCurrentCategory }) {
  return name === "All" ? (
    <li>
      <button
        className="btn all"
        onClick={() => setCurrentCategory("all")}
        style={{ backgroundColor: color }}
      >
        {name}
      </button>
    </li>
  ) : (
    <li key={key}>
      <button
        className="btn category-button "
        onClick={() => setCurrentCategory(name)}
        style={{ backgroundColor: color }}
      >
        {name}
      </button>
    </li>
  );
}

function FactList({ fact, setFacts }) {
  if (fact.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create the first one.
      </p>
    );
  }
  return (
    <section>
      <ul>
        {fact.map((fact) => (
          <List fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

function List({ fact, setFacts }) {
  const [isUploading, setIsUploading] = useState(false);
  async function handleVote(name) {
    setIsUploading(true);
    const { data: updateFacts, error } = await supabase
      .from("facts")
      .update({ [name]: fact[name] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUploading(false);
    if (!error) {
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updateFacts[0] : f))
      );
    }
  }
  // Find the category object based on the category name
  const categoryObject = CATEGORIES.find((cat) => cat.name === fact.category);

  return (
    <li key={fact.id} className="fact">
      <p>
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          {"(Source)"}
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: categoryObject ? categoryObject.color : "",
        }}
      >
        {fact.category}
      </span>
      <div className="vote-button-container">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUploading}
        >
          👍 {fact.votesInteresting}{" "}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUploading}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("voteFalse")} disabled={isUploading}>
          ⛔ {fact.voteFalse}
        </button>
      </div>
    </li>
  );
}
export default App;
