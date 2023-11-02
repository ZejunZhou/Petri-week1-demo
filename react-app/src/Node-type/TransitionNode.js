import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function Token({ color }) {
  return (
    <div style={{
      backgroundColor: color,
      border: '1px solid',
      borderColor: color,
      borderRadius: '50%',
      width: '15px',
      height: '15px',
      textAlign: 'center',
      lineHeight: '30px', 
      margin: '5px',
      fontSize: '15px'
    }}>
    </div>
  );
}

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
            style={{ background: 'red'}}
        />
      <div>
         Transition Node Label: <strong>{data.label}</strong>
      </div>
      <input type="text" value={data.label} onChange={handleInputChange} />
      {data.tokens.map((token, index) => (
            <Token key={index}  color={token.color} />
      ))}
    </div>
  );
}

export default TransitionNode