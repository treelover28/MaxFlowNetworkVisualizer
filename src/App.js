import './App.css';
import Board from './components/Board';
function App() {
  return (
    <div className="App">
      <h1 id="title">Grid-World Max Flow Network Visualizer</h1>
      <h3 id = "author">by Khai Lai</h3>
      <Board width={20} height={15}></Board>
    </div>
  );
}

export default App;
