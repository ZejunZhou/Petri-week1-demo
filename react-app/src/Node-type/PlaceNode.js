import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';

function Token({ color }) {
  return (
    <div style={{
      backgroundColor: color,
      border: '1px solid',
      borderColor: color,
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      textAlign: 'center',
      lineHeight: '30px', 
      margin: '5px',
      fontSize: '15px'
    }}>
    </div>
  );
}


function PlaceNode({ data, id, isConnectable, selected }) {
  const handleInputChange = (event) => {
    data.updateLabel(id, event.target.value);
  };

  return (
    <>
      <div style={{
        border: `${selected ? '1px solid black' : '1px'}`,
        padding: '10px'
      }}>
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
          {/* <p>{data.label}</p> */}
        </div>
        <input type="text" value={data.label} onChange={handleInputChange} />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {data.tokens.map((token, index) => (
            <Token key={index}  color={token.color} />
          ))}
        </div>
      </div>
    </>
  );
}

export default PlaceNode;
