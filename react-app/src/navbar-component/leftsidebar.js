import React from 'react';

const LeftSidebar = ({ selectedNode, handleColorChange }) => {
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
                    value={selectedNode ? selectedNode.backgroundColor : '#FFFFFF'}
                    onChange={handleColorChange}
                />
            </div>

            <div className="bg-light p-3 border">
                <h5>Local Token</h5>
            </div>
        </div>
    );
};

export default LeftSidebar;
