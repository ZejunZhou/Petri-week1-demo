import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Add from '@mui/icons-material/Add';
import { ListItemSecondaryAction } from '@mui/material';

//const pages =["File", "Edit", "View", "Run"];

const pages =[]

const drawerWidth = 240;

const Navbar = ({onDragStart}) => {

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        letterSpacing: '.35rem',
                        color: 'inherit',
                        textDecoration: 'none',
                        mx: 2
                        }}
                    >
                        Statewise
                    </Typography>
                </Toolbar>
            </AppBar>
            
        </Box>
    );
};

export default Navbar;

/*<Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
            <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                }}
            >
                Statewise
            </Typography>
                {pages.map((page) => (
                    <Button
                        key={page}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                        {page}
                    </Button>
                ))}
            </Toolbar>
        </AppBar>
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
                <ListItem
                    </List>secondaryAction={
                        <IconButton edge="end" aria-label="add" onClick={handleClick} aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}>
                        <AddIcon />
                        </IconButton>
                    }
                    >
                    <ListItemAvatar />
                    <ListItemText
                        primary="Add"
                    />
                </ListItem>
                <ListItemButton onClick={handleToken}>
                    <ListItemIcon>
                        {openToken ? <ExpandLess /> : <ExpandMore />}
                    </ListItemIcon>
                    <ListItemText primary="Tokens" />
                </ListItemButton>
                <Collapse in={openToken} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{"& .hidden-button": {
                        display: "none"
                        },
                        "&:hover .hidden-button": {
                        display: "flex"
                    }}}>
                        <ListItemButton>
                            <ListItemAvatar />
                            <ListItemText primary="Token1" />
                            <ListItemSecondaryAction edge="end" className='hidden-button'>
                                <IconButton edge="end" size="small">
                                    <AddIcon fontSize="small"/>
                                </IconButton>
                                <IconButton edge="end" size="small">
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                                <IconButton edge="end" size="small">
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton onClick={handlePlace}>
                    <ListItemIcon>
                        {openPlace ? <ExpandLess /> : <ExpandMore />}
                    </ListItemIcon>
                    <ListItemText primary="Places" />
                </ListItemButton>
                <Collapse in={openPlace} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{"& .hidden-button": {
                        display: "none"
                        },
                        "&:hover .hidden-button": {
                        display: "flex"
                    }}}>
                        <ListItemButton draggable onDragStart={(event) => onDragStart(event, 'place')}>
                            <ListItemIcon />
                            <ListItemText primary="Place1" />
                            <ListItemSecondaryAction edge="end" className='hidden-button'>
                                <IconButton edge="end" size="small">
                                    <AddIcon fontSize="small"/>
                                </IconButton>
                                <IconButton edge="end" size="small">
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                                <IconButton edge="end" size="small">
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    </List>
                </Collapse>
                <ListItemButton onClick={handleTransition}>
                    <ListItemIcon>
                        {openTransition ? <ExpandLess /> : <ExpandMore />}
                    </ListItemIcon>
                    <ListItemText primary="Transitions" />
                </ListItemButton>
                <Collapse in={openTransition} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{"& .hidden-button": {
                        display: "none"
                        },
                        "&:hover .hidden-button": {
                        display: "flex"
                    }}}>
                        <ListItemButton draggable onDragStart={(event) => onDragStart(event, 'transition')}>
                            <ListItemIcon />
                            <ListItemText primary="Transition1" />
                            <ListItemSecondaryAction edge="end" className='hidden-button'>
                                <IconButton edge="end" size="small">
                                    <AddIcon fontSize="small"/>
                                </IconButton>
                                <IconButton edge="end" size="small">
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                                <IconButton edge="end" size="small">
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    </List>
                </Collapse>
            </List>
            </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
        </Box>
        <Menu
            anchorEl={anchorEl}
            id="create"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
            elevation: 0,
            sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
                },
                '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                },
            },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={handleClose}>
            Token Type
            </MenuItem>
            <MenuItem onClick={handleClose}>
            Place Type
            </MenuItem>
            <MenuItem onClick={handleClose}>
            Transition Type
            </MenuItem>
        </Menu>
        </Box> */
