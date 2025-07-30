import './globals.css'; // Add this line
import '../styles/code.css'; // Add this line
import 'highlight.js/styles/github.css'


export const metadata = {
    title: 'The Catalyst',
    description: 'Personal Knowledge System',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            {/* Add a dark theme and smoother font rendering */}
            <body className="bg-zinc-900 text-zinc-100 antialiased">{children}</body>
        </html>
    );
}