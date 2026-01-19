'use client';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export default function ImageUploader({ onImagesChange, maxImages = 3 }) {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState([]);

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.5, // 500KB
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/jpeg', // Convert all to JPEG
        };

        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.error('Image compression error:', error);
            throw new Error('Failed to compress image');
        }
    };

    const uploadToCloudinary = async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Track upload progress
            setUploadProgress(prev => ({ ...prev, [index]: 0 }));

            const xhr = new XMLHttpRequest();

            return new Promise((resolve, reject) => {
                // Progress tracking
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        setUploadProgress(prev => ({ ...prev, [index]: percentComplete }));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.url);
                    } else {
                        reject(new Error('Upload failed'));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Upload failed')));

                xhr.open('POST', '/api/upload');
                xhr.send(formData);
            });
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        // Check max images limit
        if (images.length + files.length > maxImages) {
            setErrors([`Maximum ${maxImages} images allowed`]);
            return;
        }

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setErrors(['Only JPG, PNG, and HEIC images are allowed']);
            return;
        }

        setErrors([]);
        setUploading(true);

        try {
            const uploadPromises = files.map(async (file, index) => {
                // Compress image
                const compressedFile = await compressImage(file);

                // Upload to Cloudinary
                const url = await uploadToCloudinary(compressedFile, images.length + index);

                return {
                    url,
                    name: file.name,
                    size: compressedFile.size,
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const newImages = [...images, ...uploadedImages];

            setImages(newImages);
            onImagesChange(newImages.map(img => img.url));

            // Clear progress after success
            setTimeout(() => {
                setUploadProgress({});
            }, 1000);

        } catch (error) {
            console.error('Upload error:', error);
            setErrors(['Failed to upload images. Please try again.']);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages.map(img => img.url));
    };

    return (
        <div className="space-y-4">
            {/* Upload button */}
            {images.length < maxImages && (
                <div>
                    <label
                        htmlFor="image-upload"
                        className={`
              flex flex-col items-center justify-center w-full h-32 
              border-2 border-dashed rounded-xl cursor-pointer
              transition-all
              ${uploading
                                ? 'border-neutral-border bg-neutral-bg cursor-not-allowed'
                                : 'border-brand-primary bg-brand-soft/20 hover:bg-brand-soft/40'
                            }
            `}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                                className="w-10 h-10 mb-3 text-brand-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="mb-2 text-sm text-contrast-primary font-medium">
                                {uploading ? 'Uploading...' : 'Click to upload images (optional)'}
                            </p>
                            <p className="text-xs text-contrast-secondary">
                                JPG, PNG, or HEIC - Max 500KB each - Up to {maxImages} images
                            </p>
                        </div>
                        <input
                            id="image-upload"
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/heic"
                            multiple
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                    </label>
                </div>
            )}

            {/* Error messages */}
            {errors.length > 0 && (
                <div className="bg-status-error/10 border border-status-error/30 text-status-error px-4 py-3 rounded-xl text-sm">
                    {errors.map((error, i) => (
                        <p key={i}>{error}</p>
                    ))}
                </div>
            )}

            {/* Upload progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([index, progress]) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-contrast-secondary">
                                <span>Uploading image {parseInt(index) + 1}...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-neutral-bg rounded-full h-2">
                                <div
                                    className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image thumbnails */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-neutral-border bg-neutral-bg"
                        >
                            <img
                                src={image.url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-status-error text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-status-error/90"
                                title="Remove image"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Image info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="truncate">{image.name}</p>
                                <p>{(image.size / 1024).toFixed(0)} KB</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image count */}
            {images.length > 0 && (
                <p className="text-sm text-contrast-secondary text-center">
                    {images.length} / {maxImages} images uploaded
                </p>
            )}
        </div>
    );
}
