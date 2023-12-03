import { Handle, Position, NodeResizer} from 'reactflow';
import { useState } from 'react';

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

function PlaceNode({ data, id, isConnectable, selected }) {
  
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
       <div
        data-nodeid={id} 
        style={{
          border: `${selected ? '1px solid black' : '1px'}`,
          width: '150px', 
          height: '100px',
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

export default PlaceNode