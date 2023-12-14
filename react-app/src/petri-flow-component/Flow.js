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
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';


const rfStyle = {
  backgroundColor: 'none',
};

const PlaceStyle = {
  backgroundColor: '#D3D3D3',
  borderRadius: '50%', 
  width: '130px', 
  height: '130px',
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center',
};

const transitionStyle = {
    width: '150px', 
    height: '100px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'column', 
    backgroundColor: '#D3D3D3',
}


const barborNodes = [];


const initialEdges = [];


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
  const [step, setStep] = useState(1); // made default step to 1
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false); // marked as true when simulation start
  const [openAlert, setOpen] = useState(false);
  const [snackPack, setSnackPack] = useState([]);
  const [messageInfo, setMessageInfo] = useState(undefined);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false)
  };

  const arcAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && openAlert) {
      // Close an active snack when a new one is added
      setOpen(false);
    }

  }, [snackPack, messageInfo, openAlert]);

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  
function extractColorFromEdgeLabel(edge) {
  const labelPattern = /\{color:(.+?)\}/g;
  let match;
  let colorCount = {};

  while ((match = labelPattern.exec(edge.data.label)) !== null) {
    const color = match[1];
    colorCount[color] = (colorCount[color] || 0) + 1;
  }

  // Convert the color count into a string representation.
  const colorCountStr = Object.entries(colorCount)
    .map(([color, count]) => `{color:${color}}${count > 1 ? `:${count}` : ''}`)
    .join(' && ');

  return colorCountStr;
}

function updateTransitionNodeLabels(nodes, edges) {
  const updatedNodes = nodes.map(node => {
    if (node.type === 'transition') {
      const connectedEdges = edges.filter(edge => edge.target === node.id);
      let labelParts = [];

      connectedEdges.forEach(edge => {
        // If the edge label has boolean logic, we process it directly
        if (edge.data.label.includes('||') || edge.data.label.includes('&&')) {
          // Process each boolean part separately
          const booleanParts = edge.data.label.split(/(\|\||&&)/);
          const processedParts = booleanParts.map(part => {
            if (part === '||' || part === '&&') {
              return part;
            }
            return extractColorFromEdgeLabel({ data: { label: part } });
          });
          labelParts.push(`(${processedParts.join(' ')})`);
        } else {
          // If the edge label is a simple color, we use the extractColorFromEdgeLabel function
          labelParts.push(extractColorFromEdgeLabel(edge));
        }
      });

      // Combine all parts into one string
      const finalLabel = labelParts.join(' && ')
        .replace(/\{color:(.+?)\}/g, '$1') 
        .replace(/(\w+):\1/g, '$1:2') 
        .replace(/1 &&/g, '') 
        .replace(/&& 1/g, '');

      const updatedNode = { ...node, data: { ...node.data, transitions: finalLabel }};
      saveNodeToDB(updatedNode, userInfo.email);
      return updatedNode;
    }
    return node;
  });

  return updatedNodes;
}


  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    if (sourceNode && targetNode && 
        ((sourceNode.type === 'place' && targetNode.type === 'transition') || 
         (sourceNode.type === 'transition' && targetNode.type === 'place'))) {
        console.log("at onconnect ",edges)
        // case to prevent double edge
        const existingEdge = edges.find(e => (e.source === sourceNode.id && e.target === targetNode.id) || (e.source === targetNode.id && e.target === sourceNode.id));
        if (!existingEdge) {
          const newEdge = {...params, animated: false, type: 'arrow', id: sourceNode.id + targetNode.id, data: { label: '{color:red}', updateEdgeLabel }};
          setEdges(eds => {
            const updatedEdges = addEdge(newEdge, eds);
            setNodes(nds => updateTransitionNodeLabels(nds, updatedEdges));
            return updatedEdges;
          });
          saveEdgeToDB(newEdge, userInfo.email);
        } else {
          let message = 'An edge already exists between these nodes!';
          setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }]);
        }
    } else {
      let message = "Only connect Place node to Transition node!";
      setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }]);
    }
  }, [nodes, setEdges, edges]);

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
    //console.log("Clicked edge:", edge);
    setSelectedNode(null);
    setSelectedEdge(edge);
    //console.log(selectedEdge);
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


  const onEdgesDelete = async (edgesToDeletes) => {
    console.log("edgesToDeletes", edgesToDeletes);
    try {
        for (const edge of edgesToDeletes) {
            const response = await deleteEdgeFromDB(edge.id, userInfo.email);
            if (response.status === 200) {
                console.log(`edge ${edge.id} deleted successfully.`);
                setEdges(prevEdges => {
                  const updatedEdges = prevEdges.filter(n => n.id !== edge.id);
                  setNodes(nds => updateTransitionNodeLabels(nds, updatedEdges));// update transition's summary
                  return updatedEdges;
                });
                console.log("edge after deletion", edges);
                if (selectedEdge) {
                    setSelectedEdge(null);
                }
            }
        }
    } catch (error) {
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
      await axios.post('http://localhost:5001/insert_edges', {...edge, customer_email:email});
    } catch (error) {
      console.error('Error saving edge:', error);
    }
  };



const updateLabel = (nodeId, newLabel) => {
  let updateNode = null; 
  setNodes((nodes) =>
    nodes.map((node) => {
      if (node.id === nodeId) {
        const updatedNode = { ...node, data: { ...node.data, label: newLabel } };
        updateNode = updatedNode;
        return updatedNode;
      }
      return node;
    })
  );

  if (updateNode) {
    saveNodeToDB(updateNode, userInfo.email); 
    setSelectedNode(updateNode);
  }
};



const updateEdgeLabel = (edgeId, newLabel) => {
  setEdges((edges) => {
    let updatedEdge = null;

    const updatedEdges = edges.map((edge) => {
      if (edge.id === edgeId) {
        updatedEdge = { ...edge, data: { ...edge.data, label: newLabel } };
        return updatedEdge;
      }
      return edge;
    });

    // save updated edge to db
    if (updatedEdge) {
      saveEdgeToDB(updatedEdge, userInfo.email);
    }
    // update the transition node after label change
    setNodes((nodes) => updateTransitionNodeLabels(nodes, updatedEdges));

    return updatedEdges;
  });
};

       
 const addPlaceNode = (position) => {
    const newNode = {
        id: uuidv4(),
        type: 'place',
        position: position,
        data: { label: 'Place Node', tokens: [], transitions:'', updateLabel},
        style: PlaceStyle,
    };
    setNodes(nodes => [...nodes, newNode]);
    saveNodeToDB(newNode, userInfo.email);
};

const addTransitionNode = (position) => {
    const newNode = {
        id: uuidv4(),
        type: 'transition',
        position: position,
        data: { label: 'Transition Node', tokens:[], transitions:'', updateLabel},
        style: transitionStyle,
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

          setNodes(updatedNodes);
          setEdges(updatedEdges);
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
  if (isSimulating) return; // check if it simulating

  if (step <= 0){
    alert("Step should be greater than 0 to simulate");
    return
  }

  setIsSimulating(true);

  for (let currentStep = 0; currentStep < getMaxSteps(); currentStep++) {

    setTimeout(() => {
      resetTransitionColors();

      const fireableTransitions = getFireableTransitions();
      const allTransitions = nodes.filter(node => node.type === 'transition');

      allTransitions.forEach(transitionNode => {
        if (!fireableTransitions.includes(transitionNode.id)) {
          transitionNode.style = { ...transitionNode.style, backgroundColor: '#B6BBC4' };
        } else {
          fireTransition(transitionNode);
        }
        const outgoingEdges = edges.filter(edge => edge.source === transitionNode.id);
        if (outgoingEdges.length === 0) {
          transitionNode.style = { ...transitionNode.style, backgroundColor: '#FF8080' };
          let message = 'There is no output place node for this transition!';
          setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }]);
        }
      });


      setNodes([...nodes]);
      if (currentStep === getMaxSteps() - 1) {
        setIsSimulating(false); // marked as false when simulation is down
      }
    }, 1000 * currentStep);
  }

  //save node status after simulation to db
  setTimeout(() => {
    const savePromises = nodes.map(node => saveNodeToDB(node, userInfo.email))
      .concat(edges.map(edge => saveEdgeToDB(edge, userInfo.email)));

    Promise.all(savePromises)
      .then(() => {
        console.log('All nodes and edges have been saved to the database.');
      })
      .catch(error => {
        console.error('An error occurred while saving to the database:', error);
      });
  }, 1000 * getMaxSteps());
};

const resetTransitionColors = () => {
  nodes.forEach(node => {
    if (node.type === 'transition') {
      node.style = { ...node.style, backgroundColor: '#B0D9B1' };
    }
  });
};

const fireTransition = (transitionNode) => {
  // Check if the transition node has any outgoing edges
  const outgoingEdges = edges.filter(edge => edge.source === transitionNode.id);
  const hasOutgoingEdges = outgoingEdges.length > 0;

  // If there are no outgoing edges, mark the transition as not fireable
  if (!hasOutgoingEdges) {
     return; // Do not fire this transition
  }

  // If there are outgoing edges, consume and produce tokens as usual
  const incomingEdges = edges.filter(edge => edge.target === transitionNode.id);
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode) {
      consumeTokenBasedOnExpression(edge.data.label, sourceNode);
    }
  });

  outgoingEdges.forEach(edge => {
    const targetNode = nodes.find(node => node.id === edge.target);
    if (targetNode && targetNode.type === 'place') {
      produceTokenBasedOnExpression(edge.data.label, targetNode);
    }
  });
};

const getFireableTransitions = () => {
  return nodes.filter(node => {
    if (node.type !== 'transition') return false;

    const incomingEdges = edges.filter(edge => edge.target === node.id);
    return incomingEdges.every(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      return evaluateExpression(edge.data.label, sourceNode);
    });
  }).map(node => node.id);
};


// boolean expression to fetch the boolean expression
const evaluateExpression = (expression, sourceNode) => {
  expression = expression.replace(/\s+/g, '');

  if (expression.includes('(')) {
    const innerExpressionMatch = expression.match(/\(([^()]+)\)/);
    if (innerExpressionMatch) {
      const innerExpression = innerExpressionMatch[1];
      const evaluatedInner = evaluateExpression(innerExpression, sourceNode);
      expression = expression.replace(`(${innerExpression})`, evaluatedInner ? 'true' : 'false');
    }
  }

  if (expression.includes('&&')) {
    const conditions = getColorsFromExpression(expression);
    const tokenMap = sourceNode.data.tokens.reduce((acc, token) => {
      acc[token.color] = (acc[token.color] || 0) + 1;
      return acc;
    }, {});

    return conditions.every(color => {
      if (tokenMap[color]) {
        tokenMap[color]--;
        return true;
      }
      return false;
    });
  } else if (expression.includes('||')) {
    const conditions = getColorsFromExpression(expression);
    return conditions.some(color => {
      return sourceNode.data.tokens.some(token => token.color === color);
    });
  }

  return parseBasicExpression(expression, sourceNode);
};

// base case -> {color:red}
const parseBasicExpression = (expression, sourceNode) => {
  const match = expression.match(/\{color:(\w+)\}/);
  const color = match ? match[1] : null;
  return sourceNode.data.tokens.some(token => token.color === color);
};

const consumeTokenBasedOnExpression = (expression, sourceNode) => {
  const conditions = getColorsFromExpression(expression);

  if (expression.includes('&&')) {
    // check tokens number with all color
    const tokenMap = sourceNode.data.tokens.reduce((acc, token) => {
      acc[token.color] = (acc[token.color] || 0) + 1;
      return acc;
    }, {});

    // make sure there is enough token
    const allConditionsSatisfied = conditions.every(condition => {
      if (tokenMap[condition]) {
        tokenMap[condition]--; // -1, to check if it is enough
        return true;
      }
      return false;
    });

    if (allConditionsSatisfied) {
      // satisfied, consume
      conditions.forEach(condition => consumeToken(sourceNode, condition));
      return true;
    }
    return false;
  } else {
    // or case
    for (const condition of conditions) {
      if (consumeToken(sourceNode, condition)) {
        return true; // consume the first token and stop
      }
    }
  }
  return false;
};


const produceTokenBasedOnExpression = (expression, targetNode) => {
  const colors = getColorsFromExpression(expression);
  if (colors.length > 0) {
    targetNode.data.tokens.push({ color: colors[0] }); 
  }
};

const getColorsFromExpression = (expression) => {
  const matches = expression.match(/\{color:(\w+)\}/g) || [];
  return matches.map(match => {
    const colorMatch = match.match(/\{color:(\w+)\}/);
    return colorMatch ? colorMatch[1] : null;
  }).filter(color => color !== null);
};

const consumeToken = (node, color) => {
  const tokenIndex = node.data.tokens.findIndex(token => token.color === color);
  if (tokenIndex !== -1) {
    node.data.tokens.splice(tokenIndex, 1); // delete the first found token
    return true;
  }
  return false;
};


const getMaxSteps = () => {
  return step;
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
          const updatedNode = {
            ...node,
            data: { ...node.data, tokens: [...node.data.tokens, token] },
          };
          saveNodeToDB(updatedNode, userInfo.email);
          setSelectedNode(updatedNode);
          return updatedNode;
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
          <LeftSidebar selectedNode={selectedNode} onDragStart={onDragStart}/>       
        </div>

        <div className="flex-grow-1" style={{ height: '90vh' }}>
        <Toolbar />
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
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={openAlert}
        autoHideDuration={3000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        message={messageInfo ? messageInfo.message : undefined}
        key={messageInfo ? messageInfo.key : undefined}
        action={arcAction}
        ContentProps={{
          sx: {
            background: "#ba000d",
            fontWeight: 'medium',
            fontSize: 16
          }
        }}
      />
    </div>
  );
}

export default Flow;
