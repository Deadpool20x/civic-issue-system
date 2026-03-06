'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/PageHeader';
import toast from 'react-hot-toast';
import { CATEGORIES } from '@/lib/categories';
import ImageUploader from '@/components/ImageUploader';
import DuplicateModal from '@/components/DuplicateModal';
import { useTranslation } from 'react-i18next';
import VoiceInput from '@/components/VoiceInput';
import i18n from '@/lib/i18n';
import DashboardLayout from '@/components/DashboardLayout';

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
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '', description: '', category: '', subcategory: '', priority: 'medium', wardId: '',
    });
    const [locationData, setLocationData] = useState({
        address: '', coordinates: null, city: '', state: '', pincode: '',
    });
    const [manualAddress, setManualAddress] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [videoData, setVideoData] = useState([]);

    // AI State
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [detectionSource, setDetectionSource] = useState('manual');
    const [cvModelResults, setCvModelResults] = useState(null);

    const [loading, setLoading] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState([]);
    const [pendingSubmission, setPendingSubmission] = useState(null);

    const [wardData, setWardData] = useState({ northZone: [], southZone: [] });

    useEffect(() => {
        fetch('/api/wards')
            .then(r => r.json())
            .then(data => setWardData(data))
            .catch(err => console.error('Failed to fetch wards:', err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImagesChange = async (urls) => {
        setImageUrls(urls);

        if (urls.length > 0 && detectionSource === 'manual' && !aiLoading && !aiResult) {
            setAiLoading(true);
            try {
                const res = await fetch('/api/issues/detect-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: urls[0] })
                });
                const data = await res.json();

                if (data.success && data.detection && data.detection.category && data.detection.category !== 'other') {
                    setAiResult(data.detection);
                    setCvModelResults(data.detection.raw);
                }
            } catch (err) {
                console.error('AI detection error:', err);
            } finally {
                setAiLoading(false);
            }
        }
    };

    const confirmAi = () => {
        setFormData(prev => ({
            ...prev,
            category: aiResult.category,
            subcategory: aiResult.subcategory || ''
        }));
        setDetectionSource('AI_CONFIRMED');
        setAiResult(null);
        toast.success('AI classification applied');
    };

    const rejectAi = () => {
        setDetectionSource('AI_OVERRIDDEN');
        setAiResult(null);
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

            toast.success(`Report ${result.reportId} submitted successfully!`);
            router.push('/citizen/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (aiResult) {
            toast.error('Please confirm or change the AI suggestion first.');
            return;
        }

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
            detectionSource,
            cvModelResults
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
        toast.success('Voice input received');
    };

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
                        {aiLoading && (
                            <div className="mt-4 flex items-center gap-3 text-gold text-sm font-medium animate-pulse">
                                <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                                {t('common.loading')}
                            </div>
                        )}
                        {aiResult && (
                            <div className="mt-4 p-4 rounded-xl bg-gold/10 border border-gold/30 animate-fade-in">
                                <p className="text-gold font-bold text-sm mb-3">✨ {t('report.aiDetected')}: {CATEGORIES[aiResult.category]?.label} — {aiResult.subcategory}</p>
                                <div className="flex gap-2">
                                    <button type="button" onClick={confirmAi} className="btn-gold px-4 py-1.5 text-xs">{t('report.confirm')}</button>
                                    <button type="button" onClick={rejectAi} className="btn-outline px-4 py-1.5 text-xs border-gold/20 text-gold hover:bg-gold/5">{t('report.change')}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── DETAILS ── */}
                    <div className="card space-y-5">
                        <h3 className="section-header">{t('report.issueDetails')}</h3>
                        <div>
                            <label>{t('report.issueTitle')}</label>
                            <input name="title" required value={formData.title} onChange={handleChange} placeholder={t('report.titlePlaceholder')} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label>{t('report.description')}</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{t('report.voiceHint')}</span>
                                    <VoiceInput
                                        locale={i18n.language}
                                        onTranscript={handleVoiceTranscript}
                                    />
                                </div>
                            </div>
                            <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} placeholder={t('report.descriptionPlaceholder')} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label>{t('report.category')}</label>
                                <select name="category" required value={formData.category} onChange={handleChange}>
                                    <option value="">{t('report.selectCategory')}</option>
                                    {Object.entries(CATEGORIES).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>{t('report.subcategory')}</label>
                                <select name="subcategory" required value={formData.subcategory} onChange={handleChange} disabled={!formData.category}>
                                    <option value="">{t('report.selectSubcategory')}</option>
                                    {formData.category && CATEGORIES[formData.category].subcategories.map(s => (
                                        <option key={s} value={s}>{s}</option>
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
                                <label>{t('report.ward')}</label>
                                <select name="wardId" required value={formData.wardId} onChange={handleChange}>
                                    <option value="">{t('report.selectWard')}</option>
                                    <optgroup label="North Zone">
                                        {wardData.northZone?.map(w => <option key={w.wardId} value={w.wardId}>{w.wardName}</option>)}
                                    </optgroup>
                                    <optgroup label="South Zone">
                                        {wardData.southZone?.map(w => <option key={w.wardId} value={w.wardId}>{w.wardName}</option>)}
                                    </optgroup>
                                </select>
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
                                placeholder="Enter specific landmark or street name"
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
            </div>
        </DashboardLayout>
    );
}