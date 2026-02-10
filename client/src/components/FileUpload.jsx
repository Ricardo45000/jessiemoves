import React from 'react';

const FileUpload = ({ onFileSelect }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            onFileSelect({ url, type, file });
        }
    };

    return (
        <div className="upload-screen">
            <label htmlFor="file-upload" className="upload-zone">
                <div className="upload-icon">📁</div>
                <h2 className="upload-title">Upload your Pilates Content</h2>
                <p className="upload-desc">Select an image or video to analyze your form</p>
                <span className="btn-upload">Choose File</span>
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
