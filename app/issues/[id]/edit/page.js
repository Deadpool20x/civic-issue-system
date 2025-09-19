'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function EditIssuePage() {
    const { user } = useUser();
    const router = useRouter();
    const params = useParams();
    const issueId = params.id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: {
            address: '',
            coordinates: [0, 0]
        }
    });
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        fetchIssue();
    }, [issueId]);

    const fetchIssue = async () => {
        try {
            const response = await fetch(`/api/issues/${issueId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch issue');
            }
            const issue = await response.json();
            
            // Check if user can edit this issue
            if (user.role === 'citizen' && issue.reportedBy._id !== user.userId) {
                toast.error('You can only edit your own issues');
                router.back();
                return;
            }

            setFormData({
                title: issue.title,
                description: issue.description,
                category: issue.category,
                priority: issue.priority,
                location: issue.location
            });
            setImages(issue.images || []);
        } catch (error) {
            toast.error('Failed to load issue');
            console.error('Error fetching issue:', error);
            router.back();
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'address') {
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    address: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedImages = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const result = await response.json();
                uploadedImages.push(result);
            }

            setImages(prev => [...prev, ...uploadedImages]);
            toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
        } catch (error) {
            toast.error('Failed to upload images');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async (index) => {
        const imageToRemove = images[index];

        try {
            await fetch('/api/upload', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicId: imageToRemove.publicId }),
            });

            setImages(prev => prev.filter((_, i) => i !== index));
            toast.success('Image removed successfully');
        } catch (error) {
            toast.error('Failed to remove image');
            console.error('Remove error:', error);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by this browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        coordinates: [longitude, latitude]
                    }
                }));
                toast.success('Location updated successfully');
            },
            (error) => {
                toast.error('Failed to get current location');
                console.error('Geolocation error:', error);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const updateData = {
                ...formData,
                images
            };

            const response = await fetch(`/api/issues/${issueId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Failed to update issue');
            }

            toast.success('Issue updated successfully!');
            router.back();
        } catch (error) {
            toast.error('Failed to update issue');
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading issue...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Issue</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief description of the issue"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Detailed description of the issue"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a category</option>
                                    <option value="water">Water Supply</option>
                                    <option value="electricity">Electricity</option>
                                    <option value="roads">Roads</option>
                                    <option value="garbage">Garbage Collection</option>
                                    <option value="parks">Parks & Recreation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.location.address}
                                    onChange={handleChange}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter the location address"
                                />
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Use Current Location
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    {uploading ? 'Uploading...' : 'Select multiple images (optional)'}
                                </p>
                            </div>

                            {images.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image.url}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-24 object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Issue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}