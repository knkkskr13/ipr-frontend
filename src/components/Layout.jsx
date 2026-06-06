import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 px-6 py-2 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Government of Tripura &mdash; National Informatics Centre. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
