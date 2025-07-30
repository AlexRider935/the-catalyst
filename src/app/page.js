"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Editor = dynamic(() => import('../components/Editor'), {
    ssr: false,
    loading: () => <p>Loading Editor...</p>,
});

export default function HomePage() {
    const [notebooks, setNotebooks] = useState([]);
    const [pages, setPages] = useState([]);
    const [selectedNotebook, setSelectedNotebook] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null); // State for the selected page

    // Fetch notebooks
    useEffect(() => {
        const q = query(collection(db, 'notebooks'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notebooksData = [];
            querySnapshot.forEach((doc) => {
                notebooksData.push({ id: doc.id, ...doc.data() });
            });
            setNotebooks(notebooksData);
        });
        return () => unsubscribe();
    }, []);

    // Fetch pages for the selected notebook
    useEffect(() => {
        if (!selectedNotebook) {
            setPages([]);
            setSelectedPage(null); // Clear selected page if notebook changes
            return;
        }
        const q = query(collection(db, 'pages'), where('notebookId', '==', selectedNotebook.id));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const pagesData = [];
            querySnapshot.forEach((doc) => {
                pagesData.push({ id: doc.id, ...doc.data() });
            });
            setPages(pagesData);
        });
        return () => unsubscribe();
    }, [selectedNotebook]);

    return (
        <main className="flex h-screen w-full bg-zinc-900 text-zinc-100">
            {/* Panel 1: Notebooks List */}
            <div className="flex h-full w-1/5 flex-col border-r border-zinc-800">
                <div className="border-b border-zinc-800 p-4">
                    <h2 className="text-lg font-bold">Notebooks</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {notebooks.map((notebook) => (
                        <div
                            key={notebook.id}
                            className={`cursor-pointer rounded p-2 text-sm hover:bg-zinc-700 ${selectedNotebook?.id === notebook.id ? 'bg-zinc-800' : ''
                                }`}
                            onClick={() => setSelectedNotebook(notebook)}
                        >
                            <p>{notebook.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel 2: Pages List */}
            <div className="flex h-full w-1/5 flex-col border-r border-zinc-800">
                <div className="border-b border-zinc-800 p-4">
                    <h2 className="text-lg font-bold">Pages</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {pages.map((page) => (
                        <div
                            key={page.id}
                            className={`cursor-pointer rounded p-2 text-sm hover:bg-zinc-700 ${selectedPage?.id === page.id ? 'bg-zinc-800' : ''
                                }`}
                            onClick={() => setSelectedPage(page)}
                        >
                            <p>{page.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel 3: Editor */}
            <div className="flex h-full w-3/5 flex-col">
                <div className="border-b border-zinc-800 p-4">
                    <h1 className="text-2xl font-bold">{selectedPage?.title || 'Editor'}</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <Editor page={selectedPage} />
                </div>
            </div>
        </main>
    );
}