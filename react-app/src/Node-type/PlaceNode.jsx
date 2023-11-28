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

function PlaceNode({ data, id, isConnectable, selected, }) {
  const handleInputChange = (event) => {
    data.updateLabel(id, event.target.value);
  };

  return (
    <>
      
      <div
        data-nodeid={id} 
        style={{
          border: `${selected ? '2px solid grey' : '1px'}`,
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
        <div>
          {/* <p>{data.label}</p> */}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {
            selected? <input type="text" value={data.label} onChange={handleInputChange} style={{width: 120}}/> : <h5><b>{data.label}</b></h5>
          }
          <div style={{borderRadius: '50%', 
              width: ' 150px', 
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
      </div>
    </>
  );
}

export default PlaceNode;

//<NodeResizer color="#ff0071" isVisible={selected} minWidth={200} minHeight={100} />