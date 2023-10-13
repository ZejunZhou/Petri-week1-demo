import React, { useCallback, useEffect, useState, useContext } from "react";
import 'reactflow/dist/style.css';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge} from 'reactflow';
import TextUpdaterNode from '../Node-type/TextUpdaterNode';
import {useTextUpdater } from '../Node-type/TextUpdaterContext';
import PlaceNode from "../Node-type/PlaceNode";
import TransitionNode from "../Node-type/TransitionNode";
import Navbar from "../navbar-component/navbar";
import LeftSidebar from "../navbar-component/leftsidebar";
import RightSidebar from "../navbar-component/rightsidebar";
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

const nodeTypes = { textUpdater: TextUpdaterNode, place:PlaceNode, transition:TransitionNode};

const initialEdges = [
  { id: 'customer-enter', source: 'customer', target: 'enter', animated: true },
  { id: 'enter-waiting', source: 'enter', target: 'waiting', animated: true },
  { id: 'waiting-serve', source: 'waiting', target: 'serve', animated: true },
  { id: 'serve-busy', source: 'serve', target: 'busy', animated: true },
  { id: 'busy-done', source: 'busy', target: 'done', animated: true },
  { id: 'done-idle', source: 'done', target: 'idle', animated: true },
  { id: 'idle', source: 'idle', target: 'end', animated: true },
];

function Flow({userInfo}) {
  const { inputText } = useTextUpdater(); 

  const [nodes, setNodes, onNodesChange] = useNodesState(barborNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [userImage, setUserImage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback((params) => {
      const newEdge = {...params, animated: true };
      setEdges((eds) => addEdge(newEdge, eds));
      saveEdgeToDB(newEdge, userInfo.email);
  },[setEdges]);

  
  const onNodeClick = (event, node) => {
        setSelectedNode({
            id: node.id,
            backgroundColor: node.style?.backgroundColor || 'white'
        });
    };

  
  const onNodeDragStop = (event, node) => {
        saveNodeToDB(node, userInfo.email)
  }


  const handleColorChange = (event) => {
        const newColor = event.target.value;
        setNodes(prevNodes => 
            prevNodes.map(el => 
                el.id === selectedNode.id 
                    ? { ...el, style: { ...el.style, backgroundColor: newColor } } 
                    : el
            )
        );
        setSelectedNode(prev => ({ ...prev, backgroundColor: newColor }));
    };


  const [redNodeId, setRedNodeId] = useState(null);

   const sendDataToCassandra = async (customerName, currentLabel, previousLabel) => {
    try {
      await axios.post('http://localhost:5001/create_event', {
        customer_email: userInfo.email,
        customer_name: String(userInfo.name).toLowerCase(),
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


  const saveNodeToDB = async (node, email) => {
  try {
    await axios.post('http://localhost:5001/insert_nodes', {...node, customer_email:email});
  } catch (error) {
    console.error('Error saving node:', error);
  }
};

  const saveEdgeToDB = async (edge, email) => {
    try {
      await axios.post('http://localhost:5001/insert_edges', {...edge, customer_email:email, id: String(edge.source) + String(edge.target)});
    } catch (error) {
      console.error('Error saving edge:', error);
    }
  };

  const updateLabel = (nodeId, newLabel) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
 };


  const addPlaceNode = () => {
    const newNode = {
      id: 'place' + (nodes.length + 1),
      type: 'place',
      position: { x: 100, y: 100 },
      data: { label: 'Place Node', updateLabel },
      style: nodeStylefree
    };
    setNodes(nodes => [...nodes, newNode]);
    saveNodeToDB(newNode, userInfo.email);
  };

   const addTransitionNode = ()=> {
      const newNode = {
        id: 'transition' + (nodes.length + 1),
        type: 'transition',
        position: { x: 200, y: 100 },
        data: { label: 'Transition Node', updateLabel},
        style: nodeStylefree
      };
      setNodes(nodes => [...nodes, newNode]);
      saveNodeToDB(newNode, userInfo.email);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
          const nodesResponse = await axios.get('http://localhost:5001/get_nodes', { params: {email: userInfo.email}});
          const edgesResponse = await axios.get('http://localhost:5001/get_edges', { params: {email: userInfo.email}});
          
          const updatedNodes = nodesResponse.data.map(node => ({
              ...node,
              data: {
                  ...node.data,
                  updateLabel,
              },
          }));
          setNodes((prevNodes) => prevNodes.concat(updatedNodes));
          setEdges((prevEdges) => prevEdges.concat(edgesResponse.data));
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

   const fetchImage = async() => {
    try {
      if (userInfo) {
        setUserImage(userInfo.picture);
      } else {
        const response = await axios.get('https://ulsum.com/static/img/unlogin-icon.ce0192e1.png');
        setUserImage(response.data);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }

    fetchData();
    fetchImage();
}, [userInfo.email]);

  // console.log(nodes)
  // console.log(edges)

  return (
    <div>
      <Navbar userImage={userImage}/>
      <div className="d-flex">
        <div className="flex-column flex-shrink-0" style={{ width: '13%'}}>
          <LeftSidebar selectedNode={selectedNode} handleColorChange={handleColorChange}/>
        </div>
        <div className="flex-grow-1" style={{ height: '90vh' }}>
          {/* <h1>Hello, {userInfo.email}, Your name is {userInfo.name.toLowerCase()}</h1> */}
          <button onClick={handleRunning}>Start Running</button>
          <button onClick={addPlaceNode}>Add Place Node</button>
          <button onClick={addTransitionNode}>Add Transition Node</button>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            style={rfStyle}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={2} />
          </ReactFlow>
        </div>
        <div className="flex-column flex-shrink-0" style={{ width: '13%' }}>
          <RightSidebar/>
        </div>
      </div>
    </div>
  );
}

export default Flow;
