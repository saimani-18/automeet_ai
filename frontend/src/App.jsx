import LoginForm from './components/LoginForm';
import FeaturesSection from './components/FeaturesSection.jsx';

function App() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#141b2d'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoginForm />
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FeaturesSection />
      </div>
    </div>
  );
}

export default App;
