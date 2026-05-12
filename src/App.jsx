import { useEffect, useState, useRef } from "react"
import { supabase } from "./supabase"

import canopy from "./assets/canopy.png"
import trunk from "./assets/trunk.png"
import roots from "./assets/roots.png"
import titleImg from "./assets/text.png"

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)

  // Console-based admin (temporary session only)
  const [_, forceUpdate] = useState(0)

  const isAdmin = window.__IS_ADMIN__ === true

  const offsetMap = useRef({})
  const colorMap = useRef({})

  const trunkRef = useRef(null)
  const messagesRef = useRef(null)

  const [trunkCount, setTrunkCount] = useState(3)

  const colors = [
    "bg-pink-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-orange-200"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(x => x + 1)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Expose admin controls to browser console
  useEffect(() => {
    window.enableAdmin = () => {
      window.__IS_ADMIN__ = true
      console.log("Admin mode enabled")
    }

    window.disableAdmin = () => {
      window.__IS_ADMIN__ = false
      console.log("Admin mode disabled")
    }
  }, [])

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("id", { ascending: false })

    setMessages(data || [])
  }

  async function addMessage() {
    if (!input.trim()) return

    const MAX_CHARS = 15 * 6 // 90 chars total

    if (input.length > MAX_CHARS) {
      alert("Message must be 90 characters or less.")
      return
    }

    await supabase.from("messages").insert({
      text: input
    })

    setInput("")
    setOpen(false)
    loadMessages()
  }

  async function deleteMessage(id) {
    await supabase
      .from("messages")
      .delete()
      .eq("id", id)

    loadMessages()
  }

  function getOffset(id) {
    if (offsetMap.current[id] === undefined) {
      offsetMap.current[id] = Math.floor(Math.random() * 60) - 30
    }
    return offsetMap.current[id]
  }

  function getColor(id) {
    if (!colorMap.current[id]) {
      const randomIndex = Math.floor(Math.random() * colors.length)
      colorMap.current[id] = colors[randomIndex]
    }
    return colorMap.current[id]
  }

  function checkTreeHeight() {
    const messagesEl = messagesRef.current
    const trunkEl = trunkRef.current

    if (!messagesEl || !trunkEl) return

    const messagesBottom = messagesEl.getBoundingClientRect().bottom
    const trunkBottom = trunkEl.getBoundingClientRect().bottom

    const trunkHeight = trunkCount * 200

    // if messages go below trunk → add more trunk
    if (messagesBottom > trunkBottom) {
      setTrunkCount((prev) => prev + 1)
    }
  }

  useEffect(() => {
    checkTreeHeight()
  }, [messages])

  useEffect(() => {
    loadMessages()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative overflow-x-hidden">
      {/* TREE BACKGROUND */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-0 flex flex-col items-center pointer-events-none">

        <div className="relative w-[90vw] max-w-[900px]">
          <img src={titleImg} className="absolute top-50 left-1/2 -translate-x-1/2 w-[100%]" />

          {/* canopy */}
          <img src={canopy} className="w-[900px] -mb-2" />
        </div>

        {/* TRUNKS */}
        {Array.from({ length: trunkCount }).map((_, i) => (
          <img
            key={i}
            src={trunk}
            className="w-[900px] h-[400px] -mb-2"
          />
        ))}

        {/* roots */}
        <img src={roots} className="w-[900px] -mb-2" />

      </div>
      <div ref={trunkRef} className="absolute top-0 left-1/2 -translate-x-1/2 z-0 flex flex-col items-center pointer-events-none"></div>
      {/* ALL UI*/ }
      <div className="relative z-10">

          {/* grid */}
          <div ref={messagesRef} className="flex flex-col gap-6 pt-[600px]">
            {messages.map((msg, i) => {
              const isLeft = i % 2 === 0
              const offset = getOffset(msg.id)

              return (
                <div
                  key={msg.id}
                  className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
                  style={{ transform: `translateY(${offset}px)` }}
                >
                <div
                  className={`
                    ${getColor(msg.id)}
                    relative
                    shadow-lg
                    rounded-2xl
                    w-[20vw]
                    aspect-square
                    p-4
                    flex
                    items-center
                    justify-center
                    text-center
                    border border-white/40
                    backdrop-blur-sm
                    transition-transform duration-200
                    hover:scale-105
                    hover:shadow-2xl
                  `}
                >
                  
                    <p className="text-[1.5vw] sm:text-[1.7vw] md:text-[1.9vw] lg:text-[2.2vw] font-semibold leading-tight break-words text-center flex items-center justify-center h-full">
                      {msg.text}
                    </p>

                    {isAdmin && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-red-500 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* plus button */}
          <button
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white text-3xl"
          >
            +
          </button>

          {/* popup */}
          {open && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">

              <div className="bg-white/90 border border-white/40 shadow-2xl rounded-2xl w-[90vw] max-w-md p-5">

                {/* title */}
                <h2 className="text-lg font-semibold mb-3 text-center">
                  Add a Stereotype
                </h2>

                {/* textarea */}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-32 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  placeholder="Write something..."
                />

                {/* footer */}
                <div className="flex justify-between items-center mt-4">

                  <p className="text-xs text-gray-500">
                    {input.length}/90
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={addMessage}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Post
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>
  )
}

export default App