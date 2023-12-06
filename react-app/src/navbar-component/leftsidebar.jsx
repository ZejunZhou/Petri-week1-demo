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

const LeftSidebar = ({ selectedNode, onDragStart}) => {
    const [token, setToken] = useState({ color: 'red' }); 

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setToken({ ...token, [name]: value });
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
                        <NatOutlinedIcon sx={{mx: 2, color: 'warning.main'}}/>
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
               
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
            </Box>
        </Box>
    );
};

export default LeftSidebar;
