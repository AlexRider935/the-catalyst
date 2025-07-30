"use client"

import React, { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import "highlight.js/styles/github.css" // 👈 IMPORT CSS THEME HERE

// Lowlight setup
const lowlight = createLowlight()
Object.entries(common).forEach(([lang, def]) => lowlight.register(lang, def))

// Upload helper
const uploadImage = async (file) => URL.createObjectURL(file)

const Editor = ({ page, handleUpdate }) => {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: "plaintext",
            }),
        ],
        content: "<p>Select a page to start writing...</p>",
        editorProps: {
            attributes: {
                class: "prose prose-invert focus:outline-none max-w-full min-h-[80vh] p-4",
            },
            handleDOMEvents: {
                paste: (view, event) => {
                    const clipboard = event.clipboardData
                    const items = clipboard?.items
                    const text = clipboard?.getData("text/plain")

                    // Paste image
                    if (items) {
                        for (const item of items) {
                            if (item.type.startsWith("image/")) {
                                const file = item.getAsFile()
                                if (file) {
                                    event.preventDefault()
                                    uploadImage(file).then((url) => {
                                        const { state } = view
                                        const node = state.schema.nodes.image.create({ src: url })
                                        const tr = state.tr.replaceSelectionWith(node)
                                        view.dispatch(tr)
                                    })
                                    return true
                                }
                            }
                        }
                    }

                    // Paste code
                    if (text && text.includes("\n")) {
                        event.preventDefault()
                        const highlighted = lowlight.highlightAuto(text)
                        const language = highlighted.language || "plaintext"

                        const { schema } = view.state
                        const codeBlock = schema.nodes.codeBlock.create(
                            { language },
                            schema.text(text)
                        )
                        const tr = view.state.tr.replaceSelectionWith(codeBlock)
                        view.dispatch(tr)
                        return true
                    }

                    return false
                },
            },
        },
        onUpdate: ({ editor }) => {
            const content = editor.getJSON()
            if (typeof handleUpdate === "function") {
                handleUpdate(content)
            } else if (page?.id) {
                const pageRef = doc(db, "pages", page.id)
                updateDoc(pageRef, { content }).catch((err) =>
                    console.warn("Firestore update failed:", err)
                )
            }
        },
        immediatelyRender:false,
    })

    useEffect(() => {
        if (editor && page?.content) {
            editor.commands.setContent(page.content)
        }
    }, [editor, page])

    if (!isClient || !editor) return <div>Loading editor...</div>

    return <EditorContent editor={editor} />
}

export default Editor