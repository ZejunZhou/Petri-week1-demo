import React from 'react';
import { useState } from 'react';

const LeftSidebar = ({ selectedNode, handleColorChange, handleAddToken}) => {
    const [tokenPairs, setTokenPairs] = useState([{ key: '', value: '' }]);
    const [tokenColor, setTokenColor] = useState('#000000');

    const handlePairChange = (index, field, value) => {
        const newPairs = [...tokenPairs];
        newPairs[index][field] = value;
        setTokenPairs(newPairs);
    };

    const addPair = () => {
        setTokenPairs([...tokenPairs, { key: '', value: '' }]);
    };

    const removePair = (index) => {
        const newPairs = [...tokenPairs];
        newPairs.splice(index, 1);
        setTokenPairs(newPairs);
    };

    const handleSubmit = () => {
        handleAddToken(tokenColor, tokenPairs);
        setTokenPairs([{ key: '', value: '' }]);
        setTokenColor('#000000');
    };

    return (
        <div className="d-flex flex-column h-100">
            <div className="bg-light p-3 border">
                <h5>Search</h5>
            </div>

            <div className="bg-light p-3 border flex-fill">
                <h5>Color Panel</h5>
                <label htmlFor="colorPicker">Change Node Color:</label>
                <input 
                    id="colorPicker"
                    type="color"
                    disabled={!selectedNode}  // when there is no select node
                    value={selectedNode ? selectedNode.style.backgroundColor : '#FFFFFF'}
                    onChange={handleColorChange}
                />
            </div>

            {selectedNode && <div className="bg-light p-3 border">
                <h5>Create Token</h5>
                <input type="color" value={tokenColor} onChange={(e) => setTokenColor(e.target.value)} />

                {tokenPairs.map((pair, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder="Key"
                            value={pair.key}
                            onChange={(e) => handlePairChange(index, 'key', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={pair.value}
                            onChange={(e) => handlePairChange(index, 'value', e.target.value)}
                        />
                        <button onClick={() => removePair(index)}>Remove</button>
                    </div>
                ))}
                
                <button onClick={addPair}>Add More</button>
                <button onClick={handleSubmit}>Submit</button>
             </div>}

            <div className="bg-light p-3 border">
                <h5>Local Token</h5>
            </div>
        </div>
    );
};

export default LeftSidebar;
