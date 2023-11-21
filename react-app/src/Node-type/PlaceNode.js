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

function PlaceNode({ data, id, isConnectable, selected }) {
  const handleInputChange = (event) => {
    data.updateLabel(id, event.target.value);
  };

  return (
    <>
      <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
       <div
        data-nodeid={id} 
        style={{
          border: `${selected ? '1px solid black' : '1px'}`,
          padding: '10px'
        }}
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

export default PlaceNode