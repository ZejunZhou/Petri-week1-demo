import React, { useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, NodeToolbar, useNodes } from 'reactflow';
import { getSmartEdge } from '@tisoap/react-flow-smart-edge'

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { deepOrange, green } from '@mui/material/colors';
import { getEdgeParams } from './utils.js';
import { useCallback } from 'react';
import { useStore } from 'reactflow';

const ArrowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style, source, target}) => {

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  
  // parse label data for display edge's color (currently working with 1 color)
  function parseLabelData(label) {
    if (!label.startsWith('{') || !label.endsWith('}')) {
      return {};
    }

    const content = label.slice(1, -1);
    let req = content.split(/(\|\||&&)/);
    let single = req.map(r => {
      //if (r === "&&" || r === "||") return;
      r = r.replace("{", " ");
      r = r.replace("}", " ");
      r = r.replace("color:", "");
      r = r.replace(" ", "");
      return r
    })
    single = single.filter(e => {return e !== undefined});
    //const entries = content.split(',').map(entry => entry.split(':').map(part => part.trim()));
    
    return single;
  }

  const labelData = parseLabelData(data.label);
  const edgeStyle = style;
  let labelColor = labelData[0];
  // if the guard function is an "or"
  if (labelData[1] === "||") {
   labelColor = `linear-gradient(90deg, ${labelData[0]} 50%, ${labelData[2]} 50%)`
  }
  // if guard function is an "and"
  console.log(labelData[4])
  //console.log(labelColor)

  //floting edge section

  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [edgePath_floating, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });


  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: targetX,
    targetY: targetY,
    targetPosition,
  });

  // const nodes = useNodes()

  // const getSmartEdgeResponse = getSmartEdge({
	// 	sourcePosition,
	// 	targetPosition,
	// 	sourceX,
	// 	sourceY,
	// 	targetX,
	// 	targetY,
	// 	nodes
	// })

  // const { edgeCenterX, edgeCenterY, svgPathString } = getSmartEdgeResponse

  const toggleEditing = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (e) => {
    e.stopPropagation(); 
    data.updateEdgeLabel(id, inputValue);
    setIsEditing(false); 
  };


  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath_floating}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
          {isEditing ? (
            //if the edge is being edit
            <div style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${edgeCenterX}px,${edgeCenterY}px)`,
              background: '#FFCC00',
              padding: 10,
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
              pointerEvents: 'all' 
            }}
            className="nodrag nopan"
            onClick={toggleEditing}>
              <input type="text" value={inputValue} onChange={handleInputChange} />
              <button onClick={handleSubmit}>Submit</button>
            </div>
          ) : (labelColor === undefined? 
            // default edge label 
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${edgeCenterX}px,${edgeCenterY}px)`,
            background: `black`,
            padding: 10,
            borderRadius: '50%',
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: 'all' 
          }}
          className="nodrag nopan"
          onClick={toggleEditing}>
          </div> : 
          // if label color is defined
          (
            (labelData.length === 1 || (labelData.length === 3 && labelData[1] === "||")) ?
              <div style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${edgeCenterX}px,${edgeCenterY}px)`,
                background: `${labelColor}`,
                padding: 10,
                borderRadius: '50%',
                fontSize: 12,
                fontWeight: 700,
                pointerEvents: 'all' 
              }}
              className="nodrag nopan"
              onClick={toggleEditing}>
              </div> :
                <div style={{
                  position: 'absolute',
                  transform: `translate(-50%, -50%) translate(${edgeCenterX}px,${edgeCenterY}px)`,
                  fontSize: 12,
                  fontWeight: 700,
                  pointerEvents: 'all' 
                }}
                className="nodrag nopan"
                onClick={toggleEditing}>
                  <svg height="300" width="300">
                    <g>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={labelData[2]} Opacity="100%" />
                          <stop offset="50%" stopColor={labelData[2]} Opacity="100%"/>
                          <stop offset="50%" stopColor={labelData.length === 5? labelData[4] : labelData[2]} Opacity="100%"/>
                          <stop offset="100%" stopColor={labelData.length === 5? labelData[4] : labelData[2]} Opacity="100%"/>
                        </linearGradient>
                        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={labelData.length === 5 && labelData[1] === "||" ? labelData[0] : labelData[2]} Opacity="100%" />
                          <stop offset="50%" stopColor={labelData.length === 5 && labelData[1] === "||" ? labelData[0] : labelData[2]} Opacity="100%"/>
                          <stop offset="50%" stopColor={labelData[2]} Opacity="100%"/>
                          <stop offset="100%" stopColor={labelData[2]} Opacity="100%"/>
                        </linearGradient>
                      </g>
                    <circle cx='133' cy='150' r="10" fill={labelData[1] === "||"? "url(#grad2)" : `${labelData[0]}`} />
                    <circle cx='148' cy='150' r="10" fill={labelData[3] === "||" && labelData[1] === "&&"? "url(#grad1)" : 
                      labelData[3] === "&&" && labelData[1] === "||"? `${labelData[4]}`: `${labelData[2]}`} />
                  </svg>
                </div>
            
            )
          )}
       </EdgeLabelRenderer>
      </>
  );

  
};

export default ArrowEdge