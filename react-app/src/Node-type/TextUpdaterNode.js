import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import styles from './inputnode.module.css';
import { useTextUpdater } from "./TextUpdaterContext";

const handleStyle = { left: 10 };

function TextUpdaterNode({ data }) {
  const { inputText, handleInputChange } = useTextUpdater();

  const onChange = useCallback((evt) => {
    const newText = evt.target.value;
    handleInputChange(newText); 
  }, [handleInputChange]);

  return (
    <div className={styles["text-updater-node"]}>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">customer:</label>
        <input
          id="text"
          name="text"
          value={inputText}
          onChange={onChange}
          className="nodrag"
        />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
}

export default TextUpdaterNode;
