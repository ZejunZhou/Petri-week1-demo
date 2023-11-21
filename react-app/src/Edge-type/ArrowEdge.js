import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, NodeToolbar } from 'reactflow';


const calculateControlOffset = (id) => {
  let offset = 0;
  for (let i = 0; i < id.length; i++) {
    offset += id.charCodeAt(i);
  }
  return offset % 20; 
};

const ArrowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style}) => {

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
  
  const offset = calculateControlOffset(id);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: targetX,
    targetY: targetY,
    targetPosition,
  });

  const handleInputChange = (event) => {
    data.updateEdgeLabel(id, event.target.value);
  };

  const handleMouseDown = (e) => {
   e.stopPropagation();
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
          >
            {data.label}
            <input type="text" value={data.label} onChange={handleInputChange} />
          </div>
       </EdgeLabelRenderer>
      </>
  );

  
};

export default ArrowEdge