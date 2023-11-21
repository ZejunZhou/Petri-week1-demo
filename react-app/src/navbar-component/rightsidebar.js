import React from 'react';

const RightSidebar = ({ selectedNode, selectedEdge }) => {
    const calculateColorCounts = (tokens) => {
        const colorCounts = {};
        tokens.forEach(token => {
            colorCounts[token.color] = (colorCounts[token.color] || 0) + 1;
        });
        return colorCounts;
    };

    const renderNodeDetails = () => {
        if (!selectedNode) return null;

        const renderColorCounts = () => {
            const colorCounts = calculateColorCounts(selectedNode.data.tokens || []);
            return Object.entries(colorCounts).map(([color, count], index) => (
                <li key={index}>{color}: {count}</li>
            ));
        };

        return (
            <>
                <div className="bg-light p-3 border">
                    <h5>{selectedNode.type === 'place' ? 'Token' : 'Transition'}</h5>
                    <ul>{selectedNode.data.tokens && selectedNode.data.tokens.length > 0 ? renderColorCounts() : <li>No token</li>}</ul>
                </div>
                <div className="bg-light p-3 border flex-fill">
                    <h5>Node ID</h5>
                    <p>{selectedNode.id}</p>
                </div>
                <div className="bg-light p-3 border">
                    <h5>Position</h5>
                    <p>x: {selectedNode.position.x}</p>
                    <p>y: {selectedNode.position.y}</p>
                </div>
                <div className="bg-light p-3 border">
                    <h5>Label</h5>
                    <p>{selectedNode.data.label}</p>
                </div>
                {/* 添加其他节点信息的渲染逻辑 */}
            </>
        );
    };

    const renderEdgeDetails = () => {
        if (!selectedEdge) return null;

        console.log(selectedEdge)

        return (
            <>
                <div className="bg-light p-3 border">
                    <h5>Edge ID</h5>
                    <p>{selectedEdge.id}</p>
                </div>
                <div className="bg-light p-3 border flex-fill">
                    <h5>Edge Type</h5>
                    <p>{selectedEdge.type}</p>
                </div>
                <div className="bg-light p-3 border">
                    <h5>Source</h5>
                    <p>{selectedEdge.source}</p>
                </div>
                <div className="bg-light p-3 border">
                    <h5>Target</h5>
                    <p>{selectedEdge.target}</p>
                </div>
            </>
        );
    };

    const renderEmptyState = () => {
        return <div className="bg-light p-3 border h-100"></div>;
    };

    return (
        <div className="d-flex flex-column h-100">
            {selectedNode ? renderNodeDetails() : selectedEdge ? renderEdgeDetails() : renderEmptyState()}
        </div>
    );
};

export default RightSidebar;
