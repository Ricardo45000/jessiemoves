import React, { useCallback } from 'react';

const FileUpload = ({ onFileSelect }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            onFileSelect({ url, type, file }); // Pass file object just in case we need it later
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
            <h2>Upload your Pilates Content</h2>
            <p>Select an image or video to analyze your form.</p>

            <label htmlFor="file-upload" className="custom-file-upload" style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'inline-block',
                marginTop: '10px'
            }}>
                Choose File
            </label>
            <input
                id="file-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default FileUpload;
