import React from 'react';

const RightSidebar = ({selectedNode}) => {
    const calculateColorCounts = (tokens) => {
        const colorCounts = {};

        tokens.forEach(token => {
        if (colorCounts[token.color]) {
            colorCounts[token.color] += 1;
        } else {
            colorCounts[token.color] = 1;
        }
        });

        return colorCounts;
    };

    const renderColorCounts = () => {
        if (selectedNode && selectedNode.data.tokens) {
            const colorCounts = calculateColorCounts(selectedNode.data.tokens);
            
            return Object.entries(colorCounts).map(([color, count], index) => (
                <li key={index}>
                    {color}:{count}
                </li>
            ));
        }
        return <p>No token</p>;
    };


    return (
        <div className="d-flex flex-column h-100">
            <div className="bg-light p-3 border">
                {selectedNode && selectedNode.type == 'place' && <h5>Token</h5>}
                {selectedNode && selectedNode.type == 'transition' && <h5>Transition</h5>}
                {selectedNode && selectedNode.data.tokens && (
                    selectedNode.data.tokens.length > 0 ? (
                        <ul>
                           {renderColorCounts()}
                        </ul>
                    ) : (
                        <p>No token</p>
                    )
                )}
            </div>

            <div className="bg-light p-3 border flex-fill">
                <h5>Node ID</h5>
                {selectedNode && <p>{selectedNode.id}</p>}
                
            </div>

            <div className="bg-light p-3 border flex-fill">
                <h5>Fill</h5>
                
            </div>

            <div className="bg-light p-3 border">
                <h5>Position</h5>
                {selectedNode && selectedNode.position && <div>
                    <p>x : {selectedNode.position.x}</p>
                    <p>y : {selectedNode.position.y}</p>
                    </div>}
            </div>

            <div className="bg-light p-3 border">
                <h5>label</h5>
            {selectedNode && selectedNode.data.label && <p>{selectedNode.data.label}</p>}
            </div>

            <div className="bg-light p-3 border">
                <h5>Status</h5>
            
            </div>

            <div className="bg-light p-3 border">
                <h5>Type</h5>
                 {selectedNode && selectedNode.type && <p>{selectedNode.type}</p>}
            
            </div>
        </div>
    );
};

export default RightSidebar;
