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

  const width = 120;
  const height = 120;

  return (
    <>
      
       <div
        data-nodeid={id} 
        style={{
          border: `${selected ? '1px solid black' : '1px'}`,
          padding: '10px',
          position: "relative"
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
          <svg width={width} height={height+10} >
            <ellipse cx={width/2} cy={height/2 +5} rx={width / 2} ry={height / 2} style={{fill: "#f5f5f5", strokeWidth: 2, stroke: '#000'}} /> ;
          </svg>
          <div></div>
          {
              data.tokens.map((token, index) => (
                <Token key={index}  color={token.color} />
                ))
          }
        </div>
      </div>
    </>
  );
}

export default PlaceNode;

//<NodeResizer color="#ff0071" isVisible={selected} minWidth={200} minHeight={100} />