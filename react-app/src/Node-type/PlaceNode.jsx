import { Handle, Position, NodeResizer} from 'reactflow';
import { useState } from 'react';
import './style.css'

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
    <div style={{ position: 'relative', display: 'inline-block', textAlign:'center'}}>
    <span style={{
      width:'150px',
      position: 'absolute', 
      top: '-30px', 
      left: '50%',
      transform: 'translateX(-50%)', 
    }}>
      {data.label}
    </span>
    <div
      data-nodeid={id} 
      style={{
        border: `${selected ? '1px solid black' : '1px'}`,
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
               <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                style={{
                  maxWidth: '120px', 
                  margin: '0 auto',  
                  display: 'block'   
                }}
              />
              <button onClick={handleSubmit}>Submit</button>
            </>
          ) : (
            <span>{}</span>
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
    </div>
  );
}

export default PlaceNode