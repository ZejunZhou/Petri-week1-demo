import React from 'react';

const RightSidebar = () => {
    return (
        <div className="d-flex flex-column h-100">

            <div className="bg-light p-3 border">
                <h5>Token</h5>

            </div>

            <div className="bg-light p-3 border flex-fill">
                <h5>Fill</h5>
                
            </div>

            <div className="bg-light p-3 border">
                <h5>Stroke</h5>
            
            </div>

            <div className="bg-light p-3 border">
                <h5>Status</h5>
            
            </div>

            <div className="bg-light p-3 border">
                <h5>Type</h5>
            
            </div>
        </div>
    );
};

export default RightSidebar;
