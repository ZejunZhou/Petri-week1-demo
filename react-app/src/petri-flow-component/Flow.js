import React, { useCallback, useEffect, useState, useContext, useRef } from "react";
import 'reactflow/dist/style.css';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, ReactFlowProvider, MarkerType} from 'reactflow';
import TextUpdaterNode from '../Node-type/TextUpdaterNode';
import {useTextUpdater } from '../Node-type/TextUpdaterContext';
import PlaceNode from "../Node-type/PlaceNode";
import TransitionNode from "../Node-type/TransitionNode";
import Navbar from "../navbar-component/navbar";
import LeftSidebar from "../navbar-component/leftsidebar";
import RightSidebar from "../navbar-component/rightsidebar";
import throttle from 'lodash/throttle';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'
import styles from './Flow.module.css'
import ArrowEdge from "../Edge-type/ArrowEdge";

import Toolbar from '@mui/material/Toolbar';

const rfStyle = {
  backgroundColor: 'none',
};

const nodeStylefree = {
  backgroundColor: '#none',
};

const placeStyle = {
    borderRadius: '50%', 
    width: ' 150px', 
    height: '150px', 
    padding: '10px',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'column', 
    backgroundColor: '#none',
}

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


const initialEdges = [
  // { id: 'customer-enter', source: 'customer', target: 'enter', animated: true },
  // { id: 'enter-waiting', source: 'enter', target: 'waiting', animated: true },
  // { id: 'waiting-serve', source: 'waiting', target: 'serve', animated: true },
  // { id: 'serve-busy', source: 'serve', target: 'busy', animated: true },
  // { id: 'busy-done', source: 'busy', target: 'done', animated: true },
  // { id: 'done-idle', source: 'done', target: 'idle', animated: true },
  // { id: 'idle', source: 'idle', target: 'end', animated: true },
];


const nodeTypes = {
    textUpdater: TextUpdaterNode,
    place: PlaceNode,
    transition: TransitionNode,
};

const edgeTypes = {arrow: ArrowEdge};


function Flow({userInfo}) {
  const { inputText } = useTextUpdater(); 
  const [nodes, setNodes, onNodesChange] = useNodesState(barborNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [userImage, setUserImage] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [step, setStep] = useState(0);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    if (sourceNode && targetNode && 
        ((sourceNode.type === 'place' && targetNode.type === 'transition') || 
         (sourceNode.type === 'transition' && targetNode.type === 'place'))) {
        const newEdge = {...params, animated: false, type: 'arrow', id:uuidv4(), data: {label: '{color:red}', updateEdgeLabel}};
        console.log("newEdge is", newEdge)
        setEdges((eds) => [...eds, newEdge]); 
        saveEdgeToDB(newEdge, userInfo.email);
    } else {
        alert('You Can Only Connect Place node to Transition Node');
    }
  }, [nodes, setEdges]);

  const defaultEdgeOptions = {
    style: { strokeWidth: 3, stroke: 'black' },
    type: 'arrow',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'black',
    },
  };

  
  const onNodeClick = (event, node) => {
    setSelectedEdge(null);
    setSelectedNode(node);
};

  const onEdgeClick = (event, edge) => {
    console.log("Clicked edge:", edge);
    setSelectedNode(null);
    setSelectedEdge(edge);
    console.log(selectedEdge);
  };

  //console.log(selectedNode)

  const onPaneClick = (event) => {
    if (selectedNode) {
      saveNodeToDB(selectedNode, userInfo.email)
    }
    if (selectedEdge){
      saveEdgeToDB(selectedEdge, userInfo.email)
    }
    setSelectedEdge(null);
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


  const onEdgesDelete = async(edgesToDeletes) => {
    console.log("edgesToDeletes", edgesToDeletes)
    try{
       edgesToDeletes.forEach(async (edge) => {
          const response = await deleteEdgeFromDB(edge.id, userInfo.email);
          if (response.status === 200) {
              console.log(`edge ${edge.id} deleted successfully.`);
              setEdges(prevEdge => prevEdge.filter(n => n.id !== edge.id));
              if (selectedEdge) {
                setSelectedEdge(null);
              }
              return;
          }
      });
    }catch (error) {
        console.error('db error occurred while deleting edge:', error);
    }
  }


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

const deleteEdgeFromDB = async (edgeId, email) => {
  console.log(edgeId)
  try{
    const response = await axios.delete('http://localhost:5001/delete_edge', {params: {id:edgeId, customer_email:email}})
    return response;
  } catch(error){
      console.error('Error during the edge deletion', error);
      return error.response
  }
}

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(el => 
            el.id === selectedNode.id 
                ? { ...el, data: { ...el.data, color: newColor } } 
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
      await axios.post('http://localhost:5001/insert_edges', {...edge, customer_email:email});
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

 const updateEdgeLabel = (edgeId, newLabel) => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data, label: newLabel } } : edge
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

 const addPlaceNode = (position) => {
    const newNode = {
        id: uuidv4(),
        type: 'place',
        position: position,
        data: { label: 'Place Node', tokens: [], updateLabel, color: "#f5f5f5"},
        style: placeStyle,
    };
    setNodes(nodes => [...nodes, newNode]);
    saveNodeToDB(newNode, userInfo.email);
};

const addTransitionNode = (position) => {
    const newNode = {
        id: uuidv4(),
        type: 'transition',
        position: position,
        data: { label: 'Transition Node', tokens:[], updateLabel, color: "#f5f5f5"},
        style: nodeStylefree,
    };
    setNodes(nodes => [...nodes, newNode]);
    saveNodeToDB(newNode, userInfo.email);
};

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
                  updatedEdges.push({
                      ...edge,
                      data: {
                          ...edge.data,
                          updateEdgeLabel,
                      },
                  });;
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
    let delay = 1000;
    const transitions = nodes.filter(node => node.type === 'transition'); 

    for (let step = 0; step < getMaxSteps(); step++) { 
        setTimeout(() => {
            transitions.forEach(transitionNode => {
                const incomingEdges = edges.filter(edge => edge.target === transitionNode.id);  
                const canFire = incomingEdges.every(edge => {
                    const sourceNode = nodes.find(node => node.id === edge.source);
                    return sourceNode && hasEnoughTokens(transitionNode, sourceNode);
                });

                if (canFire && incomingEdges.length > 0) {
                    incomingEdges.forEach(edge => {
                        const sourceNode = nodes.find(node => node.id === edge.source); 
                        if (sourceNode) {
                            consumeTokens(transitionNode, sourceNode);
                        }
                    });
                    produceTokens(transitionNode); 
                } else{
                    alert(transitionNode.data.label + " cant be fired")
                }
                
            });
            setNodes([...nodes]); 
        }, delay);
        delay += 1000;
    }
};


const hasEnoughTokens = (transitionNode, sourceNode) => {
    const consumePattern = /\{([^}]+)\}/;
    const match = consumePattern.exec(transitionNode.data.label);
    if (match) {
        const [color, number] = match[1].split(':');
        let requiredTokens = parseInt(number, 10);
        let availableTokens = sourceNode.data.tokens.filter(token => token.color === color).length;
        return availableTokens >= requiredTokens;
    }
    return false;
};

const getMaxSteps = () => {
    return step
};

const consumeTokens = (transitionNode, sourceNode) => {
    const consumePattern = /\{([^}]+)\}/;
    const match = consumePattern.exec(transitionNode.data.label);
    if (match) {
        const [color, number] = match[1].split(':');
        let consumeNumber = parseInt(number, 10);
        let tokensToConsume = sourceNode.data.tokens.filter(token => token.color === color);
        if (tokensToConsume.length >= consumeNumber) {
            sourceNode.data.tokens = sourceNode.data.tokens.filter(token => {
                if (token.color === color && consumeNumber > 0) {
                    consumeNumber--;
                    return false;
                }
                return true;
            });
        }
    }
};

const produceTokens = (transitionNode) => {
    const connectedEdges = edges.filter(edge => edge.source === transitionNode.id);
    connectedEdges.forEach(edge => {
        const connectedNode = nodes.find(node => node.id === edge.target);
        if (connectedNode && connectedNode.type === 'place') {
            const producePattern = /\{([^}]+)\}/;
            const match = producePattern.exec(transitionNode.data.label);
            if (match) {
                const [color, number] = match[1].split(':');
                let produceNumber = parseInt(number, 10);
                for (let j = 0; j < produceNumber; j++) {
                    connectedNode.data.tokens.push({color: color});
                }
            }
        }
    });
};

const onDragStart = (event, dragType, data) => {
  if (dragType === 'token') {
    event.dataTransfer.setData('application/reactflowtoken', JSON.stringify(data));
  } else {
    event.dataTransfer.setData('application/reactflownode', dragType);
  }
  event.dataTransfer.effectAllowed = 'move';
};


const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};


const onDrop = (event) => {
  event.preventDefault();
  const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  const nodeType = event.dataTransfer.getData('application/reactflownode');
  const tokenData = event.dataTransfer.getData('application/reactflowtoken');
  const position = reactFlowInstance.project({
    x: event.clientX - reactFlowBounds.left,
    y: event.clientY - reactFlowBounds.top,
  });

  if (nodeType) {
     if (nodeType === 'place') {
        addPlaceNode(position);
    } else if (nodeType === 'transition') {
        addTransitionNode(position);
    } 
  } else if (tokenData) {
    const token = JSON.parse(tokenData);
    addTokenToNode(event, token);
  }
};

const addTokenToNode = (event, token) => {
  const nodeId = detectNodeIdFromEvent(event); 
  if (nodeId) {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === nodeId && node.type === 'place') {
          return {
            ...node,
            data: { ...node.data, tokens: [...node.data.tokens, token] },
          };
        }
        return node;
      })
    );
  }
};

const detectNodeIdFromEvent = (event) => {
  let target = event.target;
  while (target && !target.getAttribute('data-nodeid') && target !== reactFlowWrapper.current) {
    target = target.parentNode;
  }
  if (target && target.getAttribute('data-nodeid')) {
    return target.getAttribute('data-nodeid');
  }
  return null;

};

  return (
    <div>
      <div className="d-flex">
        <Navbar selectedNode={selectedNode} onDragStart={onDragStart}/>
        
        <div className="flex-column flex-shrink-0" style={{ width: '13%'}}>
          <LeftSidebar selectedNode={selectedNode} handleColorChange={handleColorChange} handleAddToken={handleAddToken} onDragStart={onDragStart}/>       
        </div>

        <div className="flex-grow-1" style={{ height: '90vh' }}>
        <Toolbar />
          {/* <h1>Hello, {userInfo.email}, Your name is {userInfo.name.toLowerCase()}</h1> */}
          {/* <button onClick={handleRunning}>Start Running</button> */}
          {/* <button className={`btn btn-outline-dark`} onClick={addPlaceNode}>Add Place Node</button>
          <button className={`btn btn-outline-dark`} onClick={addTransitionNode}>Add Transition Node</button> */}
          {/*<div className="btn btn-primary mb-2" draggable onDragStart={(event) => onDragStart(event, 'place')}>
            Drag Place Node
          </div>
          <div className="btn btn-secondary mb-2" draggable onDragStart={(event) => onDragStart(event, 'transition')}>
            Drag Transition Node
          </div>
          */}
          <button className={`btn btn-outline-dark`} onClick={runSimulation}>Run Simulation</button>
          <input 
              type="text" 
              value={step} 
              onChange={(e) => setStep(e.target.value)} 
              placeholder="Step to Simulation"
          />
          <ReactFlowProvider>
          <div className={styles["reactflow-wrapper"]} ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              style={rfStyle}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onNodeDragStop={onNodeDragStop}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onInit={setReactFlowInstance}
              defaultEdgeOptions={defaultEdgeOptions}
            >
              <Controls />
              <MiniMap zoomable pannable nodeColor={nodeColor}/>
              <Background variant="dots" gap={12} size={2} />
            </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>
        <div className="flex-column flex-shrink-0" style={{ width: '13%' }}>
          <RightSidebar selectedNode={selectedNode} selectedEdge={selectedEdge} handleColorChange={handleColorChange}/>
        </div>
      </div>
    </div>
  );
}

export default Flow;
