import React, { useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, NodeToolbar } from 'reactflow';


const ArrowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style}) => {

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  
  // parse label data for display edge's color
  function parseLabelData(label) {
    if (!label.startsWith('{') || !label.endsWith('}')) {
      return {};
    }

    const content = label.slice(1, -1); 
    const entries = content.split(',').map(entry => entry.split(':').map(part => part.trim()));
    
    return Object.fromEntries(entries);
  }

  const labelData = parseLabelData(data.label);
  const edgeStyle = labelData.color ? { ...style, stroke: labelData.color } : style;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: targetX,
    targetY: targetY,
    targetPosition,
  });

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
        d={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffcc00',
              padding: 10,
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
              pointerEvents: 'all' 
            }}
            className="nodrag nopan"
            onClick={toggleEditing}
          >
            {isEditing ? (
            <>
              <input type="text" value={inputValue} onChange={handleInputChange} />
              <button onClick={handleSubmit}>Submit</button>
            </>
          ) : (
            <span>{data.label}</span>
          )}
          </div>
       </EdgeLabelRenderer>
      </>
  );

  
};

export default ArrowEdge