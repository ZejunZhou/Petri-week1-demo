import React from 'react';
import { useState } from 'react';
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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import NatOutlinedIcon from '@mui/icons-material/NatOutlined';
import TextField from '@mui/material/TextField';

const drawerWidth = 240;

const LeftSidebar = ({ selectedNode, handleColorChange, handleAddToken, onDragStart}) => {
    const [tokenPairs, setTokenPairs] = useState([{ key: '', value: '' }]);
    const [tokenColor, setTokenColor] = useState('#000000');
    const [token, setToken] = useState({ color: 'red' }); 

    const handleInputChange = (event) => {
    const { name, value } = event.target;
    setToken({ ...token, [name]: value });
    };

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
        <Box>
            <Drawer
                variant="permanent"
                sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                <List >
                    <ListItem divider={true}>
                        <NatOutlinedIcon sx={{mx: 2}}/>
                        <ListItemText
                            primary="Add Elements"
                            sx={{mx: 1}}
                        />
                    </ListItem>
                    
                    <ListItemButton draggable divider={true} sx={{paddingTop: 2, paddingBottom: 2}} 
                        onDragStart={(event) => onDragStart(event, 'place')}>
                        <ListItemText primary="Add Place"  sx={{mx: 4}}/>
                        <IconButton
                            className="btn btn-info mb-2"
                            draggable
                            onDragStart={(e) => onDragStart(e, 'place')}
                            edge="end"
                            >
                            <AddIcon />
                        </IconButton>
                    </ListItemButton>
                    
                    <ListItemButton draggable divider={true} sx={{paddingTop: 2, paddingBottom: 2}} 
                        onDragStart={(event) => onDragStart(event, 'transition')}>
                        <ListItemText primary="Add Transition"  sx={{mx: 4}}/>
                        <IconButton
                            className="btn btn-info mb-2"
                            draggable
                            onDragStart={(e) => onDragStart(e, 'transition')}
                            edge="end"
                            >
                            <AddIcon />
                        </IconButton>
                    </ListItemButton>

                    <ListItem>
                            <div>
                            <ListItemText primary="Create Token" sx={{mx: 4, my: 2}}/>
                            <TextField
                            type="text"
                            name="color"
                            value={token.color}
                            onChange={handleInputChange}
                            placeholder="Token Color"
                            sx={{width: 150, mx: 4}}
                            size="small"
                            />
                            <IconButton
                            className="btn btn-info mb-2"
                            draggable
                            onDragStart={(e) => onDragStart(e, 'token', token)}
                            edge="end"
                            sx={{mx: 4}}
                            >
                            <AddIcon />
                            </IconButton>
                            </div>
                    </ListItem>
                </List>
                {selectedNode && selectedNode.type === 'place' && <div className="bg-light p-3 border">
                {selectedNode.type === 'place' ? <h5>Create Token</h5> : <h5>Set Transition</h5>}
                <input type="color" value={tokenColor} onChange={(e) => setTokenColor(e.target.value)} />

                {tokenPairs.map((pair, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder='key'
                            value={pair.key}
                            onChange={(e) => handlePairChange(index, 'key', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="value"
                            value={pair.value}
                            onChange={(e) => handlePairChange(index, 'value', e.target.value)}
                        />
                        <button className={`btn btn-sm btn-outline-dark`} onClick={() => removePair(index)}>Remove</button>
                    </div>
                ))}
                
                <button className={`btn btn-sm btn-outline-dark`} onClick={addPair}>Add More</button>
                <button className={`btn btn-sm btn-outline-dark`} onClick={handleSubmit}>Submit</button>
                </div>}

                
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
            </Box>
        </Box>
    );
};

export default LeftSidebar;
