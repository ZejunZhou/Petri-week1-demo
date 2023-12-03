import React, { memo, useState} from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);

    const toggleEditing = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (e) => {
    e.stopPropagation(); 
    data.updateLabel(id, inputValue);
    setIsEditing(false); 
  };

  return (
    <>
    <div style={{
      border: `${selected ? '1px solid black': '1px'}`,
      borderRadius: '50%', 
      width: '130px', 
      height: '130px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      flexDirection: 'column', 
    }}
    onClick={toggleEditing}
    >
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
      {isEditing ? (
            <>
              <input type="text" value={inputValue} onChange={handleInputChange} />
              <button onClick={handleSubmit}>Submit</button>
            </>
          ) : (
            <span>{data.label}</span>
          )}
      <div>
         <strong>{data.transitions}</strong>
      </div>
      {data.tokens.map((token, index) => (
            <Token key={index}  color={token.color} />
      ))}
    </div>
    </>
  );
}

export default TransitionNode