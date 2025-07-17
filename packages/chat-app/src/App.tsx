import { ChatInterface } from './components/ChatInterface';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ChatInterface />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App; 