import React, { memo } from 'react';
import { Handle, Position, NodeResizer} from 'reactflow';

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
    <>
    <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
    <div style={{
      border: `${selected ? '1px solid black': '2px solid darkgrey'}`,
      padding: '10px'
    }}>
        <Handle
            type="target"
            position={Position.Left}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
         <Handle
            type="source"
            position={Position.Right}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
            style={{ background: 'red'}}
        />
      {/* <div>
         Transition Node Label: <strong>{data.label}</strong>
      </div> */}
      <input type="text" value={data.label} onChange={handleInputChange} />
      {data.tokens.map((token, index) => (
            <Token key={index}  color={token.color} />
      ))}
    </div>
    </>
  );
}

export default TransitionNode