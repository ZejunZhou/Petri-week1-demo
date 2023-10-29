import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function TransitionNode({ data, id, isConnectable, selected}) {
  const handleInputChange = (event) => {
    data.updateLabel(id, event.target.value);
  };

  return (
    <div style={{
      border: `${selected ? '1px solid black': '1px'}`,
      padding: '10px'
    }}>
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
    </div>
  );
}

export default TransitionNode