import React, { useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, NodeToolbar, useNodes } from 'reactflow';
import { getSmartEdge } from '@tisoap/react-flow-smart-edge'

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { deepOrange, green } from '@mui/material/colors';

const ArrowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style}) => {

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  
  // parse label data for display edge's color (currently working with 1 color and "or")
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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: targetX,
    targetY: targetY,
    targetPosition,
  });

  const nodes = useNodes()

  const getSmartEdgeResponse = getSmartEdge({
		sourcePosition,
		targetPosition,
		sourceX,
		sourceY,
		targetX,
		targetY,
		nodes
	})

  const { edgeCenterX, edgeCenterY, svgPathString } = getSmartEdgeResponse

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
        d={svgPathString}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
          {isEditing ? (
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
          ) : (
            (labelData.length === 1 || labelData[1] === "||") ?
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
                    <circle cx='135' cy='150' r="10" fill={`${labelData[0]}`} />
                    <circle cx='145' cy='150' r="10" fill={`${labelData[2]}`} />
                  </svg>
                </div>
            
          )}
       </EdgeLabelRenderer>
      </>
  );

  
};

export default ArrowEdge