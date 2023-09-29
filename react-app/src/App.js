import React, { useCallback, useEffect, useState, useContext } from "react";
import 'reactflow/dist/style.css';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow';
import TextUpdaterNode from './Node-type/TextUpdaterNode';
import { TextUpdaterProvider, useTextUpdater } from './TextUpdaterContext';
import axios from 'axios';

const rfStyle = {
  backgroundColor: 'none',
};

const nodeStylefree = {
  backgroundColor: '#B0D9B1',
};

const nodeStylebusy = {
  backgroundColor: '#FF6969',
}

const barborNodes = [
  { id: 'customer', position: { x: 0, y: 0 }, type: 'textUpdater', data: { label: 'customer' } },
  { id: 'enter', position: { x: 0, y: 300 }, data: { label: 'enter' }, style: nodeStylefree },
  { id: 'waiting', position: { x: 200, y: 300 }, data: { label: 'waiting' }, style: nodeStylefree },
  { id: 'serve', position: { x: 400, y: 300 }, data: { label: 'serve' }, style: nodeStylefree },
  { id: 'busy', position: { x: 500, y: 200 }, data: { label: 'busy' }, style: nodeStylefree },
  { id: 'done', position: { x: 600, y: 300 }, data: { label: 'done' }, style: nodeStylefree },
  { id: 'idle', position: { x: 500, y: 400 }, data: { label: 'idle' }, style: nodeStylefree },
  { id: 'end', position: { x: 600, y: 600 }, data: { label: 'end' }, style: nodeStylefree },
];

const nodeTypes = { textUpdater: TextUpdaterNode };

const initialEdges = [
  { id: 'customer-enter', source: 'customer', target: 'enter', animated: true },
  { id: 'enter-waiting', source: 'enter', target: 'waiting', animated: true },
  { id: 'waiting-serve', source: 'waiting', target: 'serve', animated: true },
  { id: 'serve-busy', source: 'serve', target: 'busy', animated: true },
  { id: 'busy-done', source: 'busy', target: 'done', animated: true },
  { id: 'done-idle', source: 'done', target: 'idle', animated: true },
  { id: 'idle', source: 'idle', target: 'end', animated: true },
];

function App() {
  const { inputText } = useTextUpdater(); 

  const [nodes, setNodes, onNodesChange] = useNodesState(barborNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const [redNodeId, setRedNodeId] = useState(null);

   const sendDataToCassandra = async (customerName, currentLabel, previousLabel) => {
    try {
      await axios.post('http://localhost:5001/create_event', {
        customer_name: customerName,
        current_node_label: currentLabel,
        previous_node_label: previousLabel,
      });
    } catch (error) {
      console.error('Error sending data to server:', error);
    }
  };


  const changeNodeColors = useCallback(() => {
  let index = 0;
  const changeColor = () => {
    if (index < initialEdges.length) {
      let previous_node_label = index === 0 ? null : initialEdges[index - 1].source;
      let current_node_label = initialEdges[index].source;
      
      sendDataToCassandra(inputText, current_node_label, previous_node_label || 'start node');
      
      setRedNodeId(initialEdges[index].target);
      index += 1;
      if (index < initialEdges.length) {
        setTimeout(changeColor, 1000);
      }
    }
  };
  changeColor();
}, [inputText]);

  // useEffect(() => {
  //   if (inputText) {
  //     changeNodeColors(inputText);
  //   }
  // }, [inputText]);

  const handleRunning = (inputText) => {
    if (inputText){
      changeNodeColors(inputText);
    }
  }

  return (
    <div>
      <div style={{ width: '100%', height: '100vh' }}>
        <h1>Hello, this is the test from react-flow</h1>
        <button onClick={handleRunning}>Start Running</button>
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            style: node.id === redNodeId ? nodeStylebusy : nodeStylefree,
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          style={rfStyle}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={2} />
        </ReactFlow>
        <h1>this is the end</h1>
      </div>
    </div>
  );
}

export default App;
