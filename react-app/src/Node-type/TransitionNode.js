import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function TransitionNode({ data, id, isConnectable}) {
  const handleInputChange = (event) => {
    data.updateLabel(id, event.target.value);
  };

  return (
    <>
        <Handle
            type="target"
            position={Position.Right}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
         <Handle
            type="source"
            position={Position.Left}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
      <div>
         Transition Node Label: <strong>{data.label}</strong>
      </div>
      <input type="text" value={data.label} onChange={handleInputChange} />
    </>
  );
}

export default TransitionNode