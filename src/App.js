import './App.css';
import Board from './components/Board';
function App() {
  return (
    <div className="App">
      <h1>Grid-World Max Flow Network Visualizer</h1>
      <h3>by Khai Lai</h3>
      <Board width={20} height={15}></Board>
    </div>
  );
}

export default App;
