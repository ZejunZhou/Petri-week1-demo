import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';

const drawerWidth = 240;

const RightSidebar = ({ selectedNode, selectedEdge, handleColorChange }) => {
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
                    <h5>{selectedNode.type === 'place' ? 'Token' : 'Transition Summary'}</h5>
                    {
                        selectedNode.type === 'place'
                        ? (selectedNode.data.tokens && selectedNode.data.tokens.length > 0 
                            ? renderColorCounts() 
                            : <li>No token</li>)
                        : <div>{selectedNode.data.transitions}</div>
                    }
                </div>
                <div className="bg-light p-3 border">
                    <h5>Node ID</h5>
                    <p>{selectedNode.id}</p>
                </div>
                <div className="bg-light p-3 border">
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
                <div className="bg-light p-3 border">
                    <h5>Position</h5>
                    <p>x: {selectedNode.position.x}</p>
                    <p>y: {selectedNode.position.y}</p>
                </div>
                <div className="bg-light p-3 border">
                    <h5>Label</h5>
                    <p>{selectedNode.data.label}</p>
                </div>
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
                    <h5>Source ID</h5>
                    <p>{selectedEdge.source}</p>
                </div>
                <div className="bg-light p-3 border">
                    <h5>Target ID</h5>
                    <p>{selectedEdge.target}</p>
                </div>
            </>
        );
    };

    const renderEmptyState = () => {
        return <div className="bg-light p-3 border h-100"></div>;
    };

    return (
        <Box>
            <Drawer
                variant="permanent"
                sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
                anchor="right"
            >
                <Toolbar />
            <div className="d-flex flex-column h-100">
            {selectedNode ? renderNodeDetails() : selectedEdge ? renderEdgeDetails() : renderEmptyState()}
            </div>
            </Drawer>
        </Box>
        
    );
};

export default RightSidebar;
