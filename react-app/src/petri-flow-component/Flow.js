import React, { useCallback, useEffect, useState, useContext, useRef } from "react";
import 'reactflow/dist/style.css';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge} from 'reactflow';
import TextUpdaterNode from '../Node-type/TextUpdaterNode';
import {useTextUpdater } from '../Node-type/TextUpdaterContext';
import PlaceNode from "../Node-type/PlaceNode";
import TransitionNode from "../Node-type/TransitionNode";
import Navbar from "../navbar-component/navbar";
import LeftSidebar from "../navbar-component/leftsidebar";
import RightSidebar from "../navbar-component/rightsidebar";
import throttle from 'lodash/throttle';
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
  // { id: 'enter', position: { x: 0, y: 300 }, data: { label: 'enter' }, style: nodeStylefree },
  // { id: 'waiting', position: { x: 200, y: 300 }, data: { label: 'waiting' }, style: nodeStylefree },
  // { id: 'serve', position: { x: 400, y: 300 }, data: { label: 'serve' }, style: nodeStylefree },
  // { id: 'busy', position: { x: 500, y: 200 }, data: { label: 'busy' }, style: nodeStylefree },
  // { id: 'done', position: { x: 600, y: 300 }, data: { label: 'done' }, style: nodeStylefree },
  // { id: 'idle', position: { x: 500, y: 400 }, data: { label: 'idle' }, style: nodeStylefree },
  // { id: 'end', position: { x: 600, y: 600 }, data: { label: 'end' }, style: nodeStylefree },
];

const nodeTypes = { textUpdater: TextUpdaterNode, place:PlaceNode, transition:TransitionNode};

const initialEdges = [
  // { id: 'customer-enter', source: 'customer', target: 'enter', animated: true },
  // { id: 'enter-waiting', source: 'enter', target: 'waiting', animated: true },
  // { id: 'waiting-serve', source: 'waiting', target: 'serve', animated: true },
  // { id: 'serve-busy', source: 'serve', target: 'busy', animated: true },
  // { id: 'busy-done', source: 'busy', target: 'done', animated: true },
  // { id: 'done-idle', source: 'done', target: 'idle', animated: true },
  // { id: 'idle', source: 'idle', target: 'end', animated: true },
];

function Flow({userInfo}) {
  const { inputText } = useTextUpdater(); 

  const [nodes, setNodes, onNodesChange] = useNodesState(barborNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [userImage, setUserImage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [startNodeId, setStartNodeId] = useState("");
  const [endNodeId, setEndNodeId] = useState("");

  const onConnect = useCallback((params) => {
      const newEdge = {...params, animated: true };
      setEdges((eds) => addEdge(newEdge, eds));
      saveEdgeToDB(newEdge, userInfo.email);
  },[setEdges]);

  
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
};

  //console.log(selectedNode)

  const onPaneClick = (event) => {
    if (selectedNode) {
      saveNodeToDB(selectedNode, userInfo.email)
    }
    setSelectedNode(null);
  };

  const onNodesDelete = async (nodesToDelete) => {
    try {
        nodesToDelete.forEach(async (node) => {
            const response = await deleteNodeFromDB(node.id, userInfo.email);
            if (response.status === 200) {
                // console.log(`Node ${node.id} deleted successfully.`);
                setNodes(prevNodes => prevNodes.filter(n => n.id !== node.id));
                if (selectedNode) {
                  setSelectedNode(null);
                }
                return;
            } else {
                // console.error(`Error during the deletion of node ${node.id}:`, response.data.message);
            }
        });
    } catch (error) {
        console.error('db error occurred while deleting nodes:', error);
    }
  };


  const onNodeDragStop = (event, node) => {
      saveNodeToDB(node, userInfo.email)
      setSelectedNode(node);
   }

  
  const throttledSaveNodeToDB = useRef(throttle((node, email) => {
    saveNodeToDB(node, email);
  }, 500)).current;


  const saveNodeToDB = async (node, email) => {
    try {
      await axios.post('http://localhost:5001/insert_nodes', {...node, customer_email:email});
    } catch (error) {
      console.error('Error saving node:', error);
    }
  };

  const deleteNodeFromDB = async (nodeId, email) => {
    //console.log(nodeId, email);
    try {
        const response = await axios.delete('http://localhost:5001/delete_node', {params: {id:nodeId, customer_email:email}});
        return response;
    } catch (error) {
        console.error('Error during the node deletion:', error);
        return error.response;
    }
  };


  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(el => 
            el.id === selectedNode.id 
                ? { ...el, style: { ...el.style, backgroundColor: newColor } } 
                : el
        );
        // Find the updated node
        const nodeToUpdate = updatedNodes.find(n => n.id === selectedNode.id);
        if (nodeToUpdate) {
            throttledSaveNodeToDB(nodeToUpdate, userInfo.email); // delay save to database
        }
        return updatedNodes; // return updated nodes state
    });
    setSelectedNode(prev => ({
    ...prev, 
    style: { 
        ...prev.style, 
        backgroundColor: newColor 
    }
    }));
    // console.log(selectedNode, newColor)
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

 const handleAddToken = (color, pairs) => {
    if (!selectedNode) return;
    setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
            if (node.id === selectedNode.id) {
                const newToken = pairs.reduce((acc, pair) => {
                    acc[pair.key] = pair.value;
                    return acc;
                }, { color });

                let updateNode = {
                    ...node,
                    data: {
                        ...node.data,
                        tokens: [...node.data.tokens, newToken],
                    },
                };
                saveNodeToDB(updateNode, userInfo.email)
                return updateNode
            }
            return node;
        });
        return updatedNodes;
    });
};

  const addPlaceNode = () => {
    const newNode = {
      id: 'place' + (nodes.length + 1),
      type: 'place',
      position: { x: 100, y: 100 },
      data: { label: 'Place Node', tokens: [{color:'red'}, {color:'red'}], updateLabel},
      style: nodeStylefree,
    };
    setNodes(nodes => [...nodes, newNode]);
    saveNodeToDB(newNode, userInfo.email);
  };

   const addTransitionNode = ()=> {
      const newNode = {
        id: 'transition' + (nodes.length + 1),
        type: 'transition',
        position: { x: 200, y: 100 },
        data: { label: 'this is a test {red:1}', tokens:[], updateLabel},
        style: nodeStylefree,
      };
      setNodes(nodes => [...nodes, newNode]);
      saveNodeToDB(newNode, userInfo.email);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
          const nodesResponse = await axios.get('http://localhost:5001/get_nodes', { params: {email: userInfo.email}});
          const edgesResponse = await axios.get('http://localhost:5001/get_edges', { params: {email: userInfo.email}});
          
          let updatedNodes = [];
          for (const node of nodesResponse.data) {
              if (!nodes.some(prevNode => prevNode.id === node.id)) {
                  updatedNodes.push({
                      ...node,
                      data: {
                          ...node.data,
                          updateLabel,
                      },
                  });
              }
          }

          let updatedEdges = [];
          for (const edge of edgesResponse.data) {
              if (!edges.some(prevEdge => prevEdge.id === edge.id)) {
                  updatedEdges.push(edge);
              }
          }

          setNodes((prevNodes) => prevNodes.concat(updatedNodes));
          setEdges((prevEdges) => prevEdges.concat(updatedEdges));
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
      const response = await axios.get('https://ulsum.com/static/img/unlogin-icon.ce0192e1.png');
      setUserImage(response.data);
      console.error('Error fetching image:', error);
    }
  }
    fetchImage();
    fetchData();
}, [userInfo.email]);

  const nodeColor = (node) => {
    return node.style && node.style.backgroundColor ? node.style.backgroundColor : '#eeeee2';
  };

  
  const runSimulation = () => {
    const path = findPath(edges, startNodeId, endNodeId);
    if (path) {
        moveTokensAlongPath(path, nodes, setNodes);
    } else {
        alert(`no path found between ${startNodeId} and ${endNodeId}`)
    }
  };


  const findPath = (edges, startNodeId, endNodeId) => {
    const findPathRecursive = (currentNodeId, visitedNodes) => {
        if (currentNodeId === endNodeId) { // check if reach out the end of the target
            return [currentNodeId];
        }
        visitedNodes.add(currentNodeId); // mark as visited
        const childrenEdges = edges.filter(edge => edge.source === currentNodeId); // use edges to find all neighbor nodes
        for (const childEdge of childrenEdges) {
            if (!visitedNodes.has(childEdge.target)) { // if not visited 
                const path = findPathRecursive(childEdge.target, visitedNodes); // DFS recursion
                if (path) {
                    return [currentNodeId, ...path];
                }
            }
        }
        visitedNodes.delete(currentNodeId);
        return null;
    };
    return findPathRecursive(startNodeId, new Set());
 };

 
 const moveTokensAlongPath = (path, nodes, setNodes) => {
    let delay = 1000;
    for (let i = 0; i < path.length - 1; i++) {
        setTimeout(() => {
            const sourceNode = nodes.find(node => node.id === path[i]);
            const targetNode = nodes.find(node => node.id === path[i+1]);
            if (sourceNode && targetNode && sourceNode.data.tokens.length > -1) {
                if (sourceNode.type === 'transition') {
                    const consumePattern = /\{([^}]+)\}/; // Regular expression to find the {} pattern in the label
                    const match = consumePattern.exec(sourceNode.data.label);
                    if (match) {
                        const [color, number] = match[1].split(':'); // Extract color and number
                        let consumeNumber = parseInt(number, 10);
                        // Filter the tokens based on the specified color and ensure there are enough tokens to consume
                        let tokensToConsume = sourceNode.data.tokens.filter(token => token.color === color);
                        if (tokensToConsume.length < consumeNumber) {
                            alert('Not enough tokens to consume.');
                            return;
                        }
                        // Consume the tokens
                        console.log(sourceNode.data.tokens, consumeNumber)
                        sourceNode.data.tokens = sourceNode.data.tokens.filter(token => {
                            if (token.color === color && consumeNumber > 0) {
                                consumeNumber--; 
                                return false; 
                            }
                            return true;
                        });
                        console.log(sourceNode.data.tokens, consumeNumber)
                    }
                }
                targetNode.data.tokens = targetNode.data.tokens.concat(sourceNode.data.tokens);
                sourceNode.data.tokens = [];
                setNodes([...nodes]);
            }
        }, delay);
        delay += 1000;
    }
};





  return (
    <div>
      <Navbar userImage={userImage}/>
      <div className="d-flex">
        <div className="flex-column flex-shrink-0" style={{ width: '13%'}}>
          <LeftSidebar selectedNode={selectedNode} handleColorChange={handleColorChange} handleAddToken={handleAddToken}/>
        </div>
        <div className="flex-grow-1" style={{ height: '90vh' }}>
          {/* <h1>Hello, {userInfo.email}, Your name is {userInfo.name.toLowerCase()}</h1> */}
          {/* <button onClick={handleRunning}>Start Running</button> */}
          <button className={`btn btn-outline-dark`} onClick={addPlaceNode}>Add Place Node</button>
          <button className={`btn btn-outline-dark`} onClick={addTransitionNode}>Add Transition Node</button>
          <button className={`btn btn-outline-dark`} onClick={runSimulation}>Run Simulation</button>
          <input 
              type="text" 
              value={startNodeId} 
              onChange={(e) => setStartNodeId(e.target.value)} 
              placeholder="Start Node ID"
          />
          <input 
              type="text" 
              value={endNodeId} 
              onChange={(e) => setEndNodeId(e.target.value)} 
              placeholder="End Node ID"
          />
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
            onNodesDelete={onNodesDelete}
            onPaneClick={onPaneClick}
          >
            <Controls />
            <MiniMap zoomable pannable nodeColor={nodeColor}/>
            <Background variant="dots" gap={12} size={2} />
          </ReactFlow>
        </div>
        <div className="flex-column flex-shrink-0" style={{ width: '13%' }}>
          <RightSidebar selectedNode={selectedNode}/>
        </div>
      </div>
    </div>
  );
}

export default Flow;