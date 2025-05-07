import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";

function App() {
  return (
    <div className="App">
      <Router>
        {" "}
        {/* <-- You forgot this Router */}
        <Switch>
          <Route path="/" component={Homepage} exact />
          <Route path="/chats" component={ChatPage} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
