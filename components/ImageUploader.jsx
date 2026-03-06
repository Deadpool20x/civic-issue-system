'use client';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
export default function ImageUploader({ onImagesChange, onVideosChange, maxImages = 3 }) {
    const [mode, setMode] = useState('photo'); // 'photo' or 'video'
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState([]);

    const toggleMode = (newMode) => {
        if (newMode === mode) return;
        if ((mode === 'photo' && images.length > 0) || (mode === 'video' && videos.length > 0)) {
            if (!confirm('Switching modes will clear your current uploads. Continue?')) return;
        }
        setImages([]);
        setVideos([]);
        onImagesChange?.([]);
        onVideosChange?.([]);
        setMode(newMode);
        setErrors([]);
    };

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/jpeg',
        };
        return await imageCompression(file, options);
    };

    const uploadToCloudinary = async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(prev => ({ ...prev, [index]: percent }));
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response); // returns { url, publicId, thumbnailUrl }
                } else reject(new Error('Upload failed'));
            });

            xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            xhr.open('POST', '/api/upload');
            xhr.send(formData);
        });
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setErrors([]);
        setUploading(true);

        try {
            if (mode === 'photo') {
                const allowed = files.slice(0, maxImages - images.length);
                const uploaded = await Promise.all(allowed.map(async (file, i) => {
                    const compressed = await compressImage(file);
                    const res = await uploadToCloudinary(compressed, images.length + i);
                    return { url: res.url, name: file.name, size: compressed.size };
                }));
                const newImages = [...images, ...uploaded];
                setImages(newImages);
                onImagesChange?.(newImages.map(img => img.url));
            } else {
                const file = files[0];
                if (file.size > 50 * 1024 * 1024) throw new Error('Video must be under 50MB');
                const res = await uploadToCloudinary(file, 0);
                const newVideos = [{ url: res.url, thumbnailUrl: res.thumbnailUrl, publicId: res.publicId }];
                setVideos(newVideos);
                onVideosChange?.(newVideos);
            }
            setTimeout(() => setUploadProgress({}), 1000);
        } catch (err) {
            setErrors([err.message || 'Failed to upload.']);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        if (mode === 'photo') {
            const newImages = images.filter((_, i) => i !== index);
            setImages(newImages);
            onImagesChange?.(newImages.map(img => img.url));
        } else {
            setVideos([]);
            onVideosChange?.([]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex bg-page-input p-1 rounded-2xl w-fit border border-border">
                <button
                    type="button"
                    onClick={() => toggleMode('photo')}
                    className={`px-6 py-1.5 rounded-xl text-xs font-bold transition-all ${mode === 'photo' ? 'bg-gold text-page-bg shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                    PHOTOS
                </button>
                <button
                    type="button"
                    onClick={() => toggleMode('video')}
                    className={`px-6 py-1.5 rounded-xl text-xs font-bold transition-all ${mode === 'video' ? 'bg-gold text-page-bg shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                    VIDEO
                </button>
            </div>

            {((mode === 'photo' && images.length < maxImages) || (mode === 'video' && videos.length === 0)) && (
                <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${uploading ? 'border-border bg-white/5 cursor-wait' : 'border-gold/30 bg-gold/5 hover:bg-gold/10'}`}>
                    <div className="flex flex-col items-center justify-center py-5">
                        <span className="text-4xl mb-3">{mode === 'photo' ? '📸' : '🎥'}</span>
                        <p className="text-sm text-white font-black tracking-tight">{uploading ? 'UPLOADING...' : `UPLOAD ${mode.toUpperCase()}`}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mt-2">
                            {mode === 'photo' ? `Up to ${maxImages} photos • 500KB each` : '1 Video • Max 50MB • MP4/MOV'}
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={mode === 'photo' ? "image/*" : "video/*"}
                        multiple={mode === 'photo'}
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
            )}

            {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-medium animate-shake">
                    {errors[0]}
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {mode === 'photo' && images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-xl">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {uploadProgress[i] !== undefined && uploadProgress[i] < 100 && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-xs font-black text-gold">
                                {uploadProgress[i]}%
                            </div>
                        )}
                    </div>
                ))}

                {mode === 'video' && videos.map((vid, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-xl bg-black">
                        <img src={vid.thumbnailUrl || vid.url} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                        </div>
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {uploadProgress[0] !== undefined && uploadProgress[0] < 100 && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-xs font-black text-gold">
                                {uploadProgress[0]}%
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
