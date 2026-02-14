import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Upload = ({ setAnalysisResult }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setFileName(file.name);
        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        try {
            const response = await axios.post('http://localhost:5001/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Mock result for demo
            const mockResult = {
                atsScore: 78,
                matchedKeywords: ['React', 'Node.js', 'MongoDB', 'Python'],
                missingKeywords: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'TypeScript'],
                suggestions: [
                    'Add measurable achievements',
                    'Include more keywords',
                    'Improve summary section'
                ],
                resumeId: response.data.resumeId
            };

            setAnalysisResult(mockResult);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Make sure backend is running on port 5001.');
        } finally {
            setUploading(false);
        }
    }, [setAnalysisResult]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl py-24 px-12 text-center transition cursor-pointer ${isDragActive
                    ? 'border-indigo-400 bg-slate-800/50'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-800/20'
                }`}
        >
            <input {...getInputProps()} />

            <UploadCloud className="mx-auto mb-6 text-white" size={48} strokeWidth={1.5} />

            {uploading ? (
                <div className="text-indigo-400 font-semibold">
                    <p className="text-lg mb-2">Processing...</p>
                    <p className="text-sm text-slate-400">Analyzing your resume with AI</p>
                </div>
            ) : (
                <div>
                    <p className="mb-6 text-lg text-slate-200">
                        {fileName || 'Drag & drop your resume PDF'}
                    </p>
                    <button className="bg-indigo-500 hover:bg-indigo-600 px-8 py-3 rounded-lg font-medium transition text-white">
                        Choose File
                    </button>

                    {fileName && (
                        <p className="mt-6 text-green-400 flex items-center justify-center gap-2">
                            <CheckCircle size={18} /> {fileName} uploaded
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Upload;
