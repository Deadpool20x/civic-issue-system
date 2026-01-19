'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import PrimaryButton from '@/components/ui/PrimaryButton';
import toast from 'react-hot-toast';
import { CATEGORIES } from '@/lib/schemas';
import ImageUploader from '@/components/ImageUploader';
import DuplicateModal from '@/components/DuplicateModal';

// Dynamic import to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-neutral-bg rounded-xl flex items-center justify-center">
      <p className="text-contrast-secondary">Loading map...</p>
    </div>
  ),
});

export default function ReportIssuePage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        priority: 'medium',
    });
    const [locationData, setLocationData] = useState({
        address: '',
        coordinates: null,
        city: '',
        state: '',
        pincode: '',
    });
    const [manualAddress, setManualAddress] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState([]);
    const [pendingSubmission, setPendingSubmission] = useState(null);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            // When category changes, reset subcategory
            setFormData(prev => ({
                ...prev,
                category: value,
                subcategory: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // LocationPicker handles geolocation and reverse geocoding

    // Check for duplicates before submitting
    const checkForDuplicates = async (formData) => {
        try {
            const response = await fetch('/api/issues/check-duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: formData.category,
                    coordinates: formData.location.coordinates
                })
            });

            const data = await response.json();
            
            if (data.duplicates && data.duplicates.length > 0) {
                setDuplicates(data.duplicates);
                setPendingSubmission(formData);
                setShowDuplicateModal(true);
                return true; // Duplicates found
            }
            
            return false; // No duplicates
        } catch (error) {
            console.error('Duplicate check error:', error);
            return false; // Continue with submission if check fails
        }
    };

    // Submit issue to API
    const submitIssue = async (formData) => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Issue created:', result);
            toast.success(`Report ${result.reportId} submitted successfully!`);
            router.push('/citizen/dashboard');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(`Failed to report issue: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category || !formData.subcategory) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!locationData.address && !manualAddress) {
            toast.error('Please provide a location');
            return;
        }

        const issueData = {
            ...formData,
            location: {
                address: locationData.address || manualAddress,
                coordinates: locationData.coordinates,
                city: locationData.city,
                state: locationData.state,
                pincode: locationData.pincode,
            },
            images: imageUrls
        };

        // Check for duplicates first
        const hasDuplicates = await checkForDuplicates(issueData);
        
        if (hasDuplicates) {
            return; // Show modal, wait for user decision
        }
        
        // No duplicates, submit directly
        await submitIssue(issueData);
    };

    // Handle upvote from modal
    const handleUpvote = async (duplicate) => {
        try {
            const response = await fetch(`/api/issues/${duplicate._id}/upvote`, {
                method: 'POST'
            });
            
            if (response.ok) {
                toast.success(`You upvoted report ${duplicate.reportId}`);
                setShowDuplicateModal(false);
                // Redirect to dashboard
                router.push('/citizen/dashboard');
            } else {
                toast.error('Failed to upvote');
            }
        } catch (error) {
            toast.error('Error upvoting report');
        }
    };

    // Handle submit anyway
    const handleSubmitAnyway = async () => {
        setShowDuplicateModal(false);
        await submitIssue(pendingSubmission);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pt-0">
                {/* Header Section */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-contrast-primary mb-2">Report a New Issue</h1>
                            <p className="text-slate-600">Help improve your community by reporting civic issues</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-16 h-16 bg-brand-soft rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Form Section */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Issue Details</h2>
                        <p className="text-sm text-slate-600 mt-1">Please provide detailed information about the issue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Basic Information */}
                        <div className="bg-brand-soft/20 rounded-xl p-6 border border-brand-primary/20">
                            <h3 className="text-lg font-medium text-contrast-primary mb-4 flex items-center">
                                <svg className="w-5 h-5 text-brand-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Basic Information
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Issue Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        maxLength={200}
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900 placeholder-slate-400"
                                        placeholder="Brief description of the issue"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={6}
                                        maxLength={2000}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900 placeholder-slate-400 resize-none"
                                        placeholder="Detailed description of the issue"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category and Priority */}
                        <div className="bg-brand-soft/20 rounded-xl p-6 border border-brand-primary/20">
                            <h3 className="text-lg font-medium text-contrast-primary mb-4 flex items-center">
                                <svg className="w-5 h-5 text-status-warning mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Classification
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900"
                                    >
                                        <option value="" className="text-slate-400">Select Category</option>
                                        {Object.entries(CATEGORIES).map(([key, value]) => (
                                            <option key={key} value={key}>{value.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="subcategory" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Subcategory *
                                    </label>
                                    <select
                                        id="subcategory"
                                        name="subcategory"
                                        required
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        disabled={!formData.category}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="" className="text-slate-400">
                                            {formData.category ? 'Select Subcategory' : 'Select Category First'}
                                        </option>
                                        {formData.category && CATEGORIES[formData.category]?.subcategories.map((sub) => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label htmlFor="priority" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Priority Level
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900"
                                >
                                    <option value="low">🟢 Low</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="high">🟠 High</option>
                                    <option value="urgent">🔴 Urgent</option>
                                </select>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-brand-soft/20 rounded-xl p-6 border border-brand-primary/20">
                            <h3 className="text-lg font-medium text-contrast-primary mb-4 flex items-center">
                                <svg className="w-5 h-5 text-brand-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Location
                            </h3>

                            <LocationPicker
                                onLocationSelect={setLocationData}
                                initialLocation={locationData.coordinates}
                            />

                            {/* Manual address input (fallback) */}
                            <div className="mt-4">
                                <label htmlFor="manualAddress" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Or enter address manually:
                                </label>
                                <input
                                    type="text"
                                    id="manualAddress"
                                    value={manualAddress || locationData.address}
                                    onChange={(e) => {
                                        setManualAddress(e.target.value);
                                        setLocationData(prev => ({ ...prev, address: e.target.value }));
                                    }}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors bg-white text-slate-900"
                                    placeholder="Enter street address"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="bg-brand-soft/20 rounded-xl p-6 border border-brand-primary/20">
                            <h3 className="text-lg font-medium text-contrast-primary mb-4 flex items-center">
                                <svg className="w-5 h-5 text-accent-lavender mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Evidence Photos (Optional)
                            </h3>
                            
                            <p className="text-sm text-contrast-secondary mb-4">
                                Add up to 3 photos to help us understand the issue better. Images are optional but recommended.
                            </p>
                            
                            <ImageUploader onImagesChange={setImageUrls} maxImages={3} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 text-contrast-secondary bg-white rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors font-medium border border-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 shadow-md"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
            
            {/* Duplicate Modal */}
            {showDuplicateModal && (
                <DuplicateModal
                    duplicates={duplicates}
                    onSubmitAnyway={handleSubmitAnyway}
                    onUpvote={handleUpvote}
                    onClose={() => setShowDuplicateModal(false)}
                />
            )}
        </DashboardLayout>
    );
}