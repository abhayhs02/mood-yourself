import { useState } from "react";
import LoginComponent from "./components/LoginComponent";
import MoodInputScreen from "./pages/MoodInputScreen";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    setUser({
      name: "Abhay",
      email: "abhayhs002@gmail.com",
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginComponent onLogin={handleLogin} />;
  }

  return (
    <MoodInputScreen
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;