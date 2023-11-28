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

function TransitionNode({ data, id, isConnectable, selected, color}) {
  const handleInputChange = (event) => {
    data.updateLabel(id, event.target.value);
  };

  return (
    <>
    {
      //<NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
    }
    <div style={{
      border: `${selected ? '2px solid grey': '1px'}`,
      padding: '10px',
      position: "relative"
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
      <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative'
        }}>

        <div style={{
            borderRadius: '10%', 
            width: ' 100px', 
            height: '150px', 
            padding: '10px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            border: 'solid #787878',}}>
        {
          data.tokens.map((token, index) => (
              <Token key={index}  color={token.color} />
            ))
        }
        </div>
      </div>
      <div style={{display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative', paddingTop: "10px"}}>
      {
          selected? <input type="text" value={data.label} onChange={handleInputChange} style={{width: 120}}/> : <h5><b>{data.label}</b></h5>
      }
      </div>
    </div>
    </>
  );
}

export default TransitionNode