'use client';

import { useState, useEffect } from 'react';
import { useUser } from 'lib/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/PageHeader';
import toast from 'react-hot-toast';
import { CATEGORIES } from '@/lib/categories';
import ImageUploader from '@/components/ImageUploader';
import DuplicateModal from '@/components/DuplicateModal';
import { useTranslation } from '@/lib/useStaticTranslation';
import VoiceInput from '@/components/VoiceInput';
import DashboardLayout from '@/components/DashboardLayout';
import LottiePlayer from '@/components/LottiePlayer';
import DisclaimerModal from '@/components/DisclaimerModal';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => (
        <div className="h-72 bg-input rounded-card flex items-center justify-center border border-border animate-pulse">
            <span className="text-text-secondary">Loading map systems...</span>
        </div>
    ),
});

export default function ReportIssuePage() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { user, loading: authLoading, initialized } = useUser();
    const [formData, setFormData] = useState({
        title: '', description: '', category: '', subcategory: '', priority: 'medium',
    });
    const [locationData, setLocationData] = useState({
        address: '', coordinates: null, city: '', state: '', pincode: '',
    });
    const [manualAddress, setManualAddress] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [videoData, setVideoData] = useState([]);

    // Detection source tracking (AI preprocessing removed)
    const [detectionSource, setDetectionSource] = useState('manual');

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState([]);
    const [pendingSubmission, setPendingSubmission] = useState(null);



    // Auto-derive ward label from category + coordinates
    function getWardLabel(category, coordinates) {
        if (!category || !coordinates) return 'Unknown Ward'

        const CATEGORY_TO_DEPT = {
            'roads-infrastructure':  'roads',
            'street-lighting':       'lighting',
            'waste-management':      'waste',
            'water-drainage':        'water',
            'parks-public-spaces':   'parks',
            'traffic-signage':       'traffic',
            'public-health-safety':  'health',
            'other':                 'other',
        }

        const DEPT_WARD_MAP = {
            north: {
                roads: 'Ward 1 — North Zone · Roads',
                lighting: 'Ward 2 — North Zone · Street Lighting',
                waste: 'Ward 3 — North Zone · Waste Management',
                water: 'Ward 4 — North Zone · Water & Drainage',
                parks: 'Ward 5 — North Zone · Parks & Public Spaces',
                traffic: 'Ward 6 — North Zone · Traffic & Signage',
                health: 'Ward 7 — North Zone · Public Health',
                other: 'Ward 8 — North Zone · General',
            },
            south: {
                roads: 'Ward 9 — South Zone · Roads',
                lighting: 'Ward 10 — South Zone · Street Lighting',
                waste: 'Ward 11 — South Zone · Waste Management',
                water: 'Ward 12 — South Zone · Water & Drainage',
                parks: 'Ward 13 — South Zone · Parks & Public Spaces',
                traffic: 'Ward 14 — South Zone · Traffic & Signage',
                health: 'Ward 15 — South Zone · Public Health',
                other: 'Ward 16 — South Zone · General',
            }
        }

        const BOUNDARY = 22.55
        const lat = parseFloat(coordinates.lat)
        const zone = !isNaN(lat) && lat >= BOUNDARY ? 'north' : 'south'
        const dept = CATEGORY_TO_DEPT[category] || 'other'
        return DEPT_WARD_MAP[zone][dept]
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Auth check - redirect to login if not authenticated
    useEffect(() => {
        if (initialized && !user) {
            router.push('/login');
        }
    }, [user, initialized, router]);

    const handleImagesChange = (urls) => {
        setImageUrls(urls);
        // Images upload directly without AI preprocessing
    };

    const checkForDuplicates = async (issueData) => {
        try {
            const res = await fetch('/api/issues/check-duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: issueData.category, coordinates: issueData.location.coordinates }),
            });
            const data = await res.json();
            if (data.duplicates?.length > 0) {
                setDuplicates(data.duplicates);
                setPendingSubmission(issueData);
                setShowDuplicateModal(true);
                return true;
            }
            return false;
        } catch { return false; }
    };

    const submitIssue = async (issueData) => {
        try {
            setLoading(true);
            const res = await fetch('/api/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(issueData),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to submit');

            setShowSuccess(true);
            setTimeout(() => {
                toast.success(`Report ${result.reportId} submitted successfully!`);
                router.push('/citizen/dashboard');
            }, 3000);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const issueData = {
            ...formData,
            location: {
                address: manualAddress || locationData.address,
                coordinates: locationData.coordinates,
                city: locationData.city,
                state: locationData.state,
                pincode: locationData.pincode,
            },
            images: imageUrls,
            videos: videoData,
            detectionSource
        };

        const hasDups = await checkForDuplicates(issueData);
        if (!hasDups) await submitIssue(issueData);
    };

    const handleVideosChange = (vids) => {
        setVideoData(vids);
        if (vids.length > 0) {
            setDetectionSource('manual'); // Potential AI video logic later
        }
    };

    const handleUpvote = async (dup) => {
        try {
            const res = await fetch(`/api/issues/${dup._id}/upvote`, { method: 'POST' });
            if (res.ok) {
                toast.success(t('report.upvoteSuccess'));
                router.push('/citizen/dashboard');
            }
        } catch { toast.error(t('report.upvoteError')); }
    };

    const handleVoiceTranscript = (text) => {
        setFormData(prev => ({
            ...prev,
            description: prev.description ? `${prev.description} ${text}` : text
        }));
        toast.success(t('report.voiceInputReceived'));
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-[100] bg-page flex flex-col items-center justify-center p-6 text-center">
                <LottiePlayer
                    src="https://lottie.host/df660b94-8798-468b-90f9-293674d89a62/n696wN809P.json"
                    style={{ width: '300px', height: '300px' }}
                    loop={false}
                />
                <h2 className="text-3xl font-black text-white mb-2 animate-fade-in mt-4">
                    {t('report.submitSuccessTitle') || 'Submission Successful!'}
                </h2>
                <p className="text-text-secondary animate-fade-in delay-100">
                    {t('report.submitSuccessText') || 'Your report has been received and will be processed shortly.'}
                </p>
                <div className="mt-8 text-gold font-bold flex items-center gap-2 animate-pulse">
                    <span>{t('report.redirecting')}</span>
                </div>
            </div>
        );
    }

    // Show loading while checking authentication
    if (authLoading || !initialized) {
        return (
            <div className="fixed inset-0 z-[100] bg-page flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
                <PageHeader
                    title={t('report.title')}
                    subtitle={t('report.subtitle')}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── PHOTOS ── */}
                    <div className="card">
                        <h3 className="section-header mb-4">{t('report.photos')} / {t('report.video')}</h3>
                        <ImageUploader
                            onImagesChange={handleImagesChange}
                            onVideosChange={handleVideosChange}
                            maxImages={3}
                        />
                    </div>

                    {/* ── DETAILS ── */}
                    <div className="card space-y-5">
                        <h3 className="section-header">{t('report.issueDetails')}</h3>
                        <div>
                            <label>{t('report.issueTitle')}</label>
                            <input name="title" required value={formData.title} onChange={handleChange} placeholder={t('report.titlePlaceholder')} />
                        </div>
                        <div>
                            <label>{t('report.description')}</label>
                            <div className="relative">
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder={t('report.descriptionPlaceholder')}
                                    className="bg-[#222222] border border-[#333333] rounded-[12px]
                                               text-white placeholder:text-[#666666]
                                               px-4 py-3 w-full min-h-[120px] resize-y
                                               focus:border-[#F5A623] focus:outline-none pr-12"
                                />
                                <VoiceInput
                                    language={i18n.language === 'en' ? 'en-IN' : i18n.language === 'hi' ? 'hi-IN' : 'gu-IN'}
                                    onTranscript={handleVoiceTranscript}
                                />
                            </div>
                            <p className="text-[#666666] text-xs mt-1">
                                🎤 {t('report.voiceInstruction', 'Tap mic to describe by voice in English or Hindi')}
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label>{t('report.category')}</label>
                                <select name="category" required value={formData.category} onChange={handleChange}>
                                    <option value="">{t('report.selectCategory')}</option>
                                    {Object.entries(CATEGORIES).map(([k, v]) => (
                                        <option key={k} value={k}>{t(`report.categories.${k}.label`)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>{t('report.subcategory')}</label>
                                <select name="subcategory" required value={formData.subcategory} onChange={handleChange} disabled={!formData.category}>
                                    <option value="">{t('report.selectSubcategory')}</option>
                                    {formData.category && CATEGORIES[formData.category].subcategories.map(s => (
                                        <option key={s} value={s}>{t(`report.categories.${formData.category}.subcategories.${s}`, s)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label>{t('report.urgencyLevel')}</label>
                                <select name="priority" value={formData.priority} onChange={handleChange}>
                                    <option value="low">{t('priority.low')}</option>
                                    <option value="medium">{t('priority.medium')}</option>
                                    <option value="high">{t('priority.high')}</option>
                                    <option value="urgent">{t('priority.urgent')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[#AAAAAA] text-sm font-medium block mb-2">
                                    Assigned Ward (Auto-detected)
                                </label>
                                {formData.category && locationData.coordinates ? (
                                    <div className="bg-[#222222] border border-[#F5A623]/30
                                                    rounded-[12px] px-4 py-3 flex items-center gap-2">
                                        <span className="text-[#F5A623]">📍</span>
                                        <span className="text-white text-sm">
                                            {getWardLabel(formData.category, locationData.coordinates)}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-[#222222] border border-[#333333]
                                                    rounded-[12px] px-4 py-3">
                                        <span className="text-[#666666] text-sm">
                                            Select category and pin location to auto-detect ward
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── LOCATION ── */}
                    <div className="card space-y-4">
                        <h3 className="section-header">{t('report.location')}</h3>
                        <LocationPicker onLocationSelect={setLocationData} />
                        <div>
                            <label>{t('report.landmarkAddress')}</label>
                            <input
                                value={manualAddress || locationData.address}
                                onChange={(e) => setManualAddress(e.target.value)}
                                placeholder={t('report.locationPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => router.back()} className="btn-outline flex-1 py-4">{t('common.cancel')}</button>
                        <button type="submit" disabled={loading} className="btn-gold flex-[2] py-4 h-14">
                            {loading ? t('common.loading') : t('report.submit')}
                        </button>
                    </div>
                </form>

                {showDuplicateModal && (
                    <DuplicateModal
                        duplicates={duplicates}
                        onSubmitAnyway={() => { setShowDuplicateModal(false); submitIssue(pendingSubmission); }}
                        onUpvote={handleUpvote}
                        onClose={() => setShowDuplicateModal(false)}
                    />
                )}
                <DisclaimerModal />
            </div>
        </DashboardLayout>
    );
}
