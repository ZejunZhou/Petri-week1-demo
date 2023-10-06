import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function PlaceNode({ data, id, isConnectable }) {
  const handleInputChange = (event) => {
    data.updateLabel(id, event.target.value);
  };

  return (
    <>
      <Handle
            type="target"
            position={Position.Top}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
         <Handle
            type="source"
            position={Position.Bottom}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
      <div>
        Place Node Label: <strong>{data.label}</strong>
      </div>
      <input type="text" value={data.label} onChange={handleInputChange} />
    </>
  );
}

export default PlaceNode