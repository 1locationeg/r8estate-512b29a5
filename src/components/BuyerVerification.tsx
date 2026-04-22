import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2, Shield, CheckCircle2, Clock, XCircle, ExternalLink, Camera, FileText,
  User, Receipt, Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { developers } from '@/data/mockData';
import { SecureContractUpload } from '@/components/SecureContractUpload';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

const BuyerVerification = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Tier 1 – Identity
  const [identityStatus, setIdentityStatus] = useState<VerificationStatus>('none');
  const [identityVerification, setIdentityVerification] = useState<any>(null);

  // Tier 2 – Receipts
  const [receiptSubmissions, setReceiptSubmissions] = useState<any[]>([]);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const receiptRef = useRef<HTMLInputElement>(null);

  // Tier 3 – KYC
  const [kycStatus, setKycStatus] = useState<VerificationStatus>('none');
  const [kycVerification, setKycVerification] = useState<any>(null);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [idDocUrl, setIdDocUrl] = useState('');
  const [uploading, setUploading] = useState<'selfie' | 'id' | null>(null);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const selfieRef = useRef<HTMLInputElement>(null);
  const idDocRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      const [verRes, receiptRes] = await Promise.all([
        supabase.from('reviewer_verifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('receipt_submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      const verifications = (verRes.data as any[]) || [];
      const socialVer = verifications.find(v => v.verification_type === 'social');
      const kycVer = verifications.find(v => v.verification_type === 'kyc');

      if (socialVer) {
        setIdentityStatus(socialVer.status as VerificationStatus);
        setIdentityVerification(socialVer);
      } else if (profile?.identity_verified) {
        setIdentityStatus('approved');
      }

      if (kycVer) {
        setKycStatus(kycVer.status as VerificationStatus);
        setKycVerification(kycVer);
      } else if ((profile as any)?.kyc_verified) {
        setKycStatus('approved');
      }

      setReceiptSubmissions((receiptRes.data as any[]) || []);
      setLoading(false);
    };
    fetchAll();
  }, [user, profile]);

  const hasApprovedReceipt = receiptSubmissions.some(r => r.status === 'approved');
  const hasSocialLinks = !!(profile?.facebook_url || profile?.linkedin_url);

  const handleUploadReceipt = async (file: File) => {
    if (!user || !selectedDeveloper) return;
    setUploadingReceipt(true);
    const ext = file.name.split('.').pop();
    const path = `receipts/${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('review-attachments').upload(path, file);
    if (upErr) {
      toast.error('Failed to upload receipt');
      setUploadingReceipt(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('review-attachments').getPublicUrl(path);
    const dev = developers.find(d => d.id === selectedDeveloper);
    const { error } = await supabase.from('receipt_submissions').insert({
      user_id: user.id,
      developer_id: selectedDeveloper,
      developer_name: dev?.name || selectedDeveloper,
      image_url: urlData.publicUrl,
      status: 'pending',
    });
    setUploadingReceipt(false);
    if (error) {
      toast.error('Failed to submit receipt');
    } else {
      toast.success('Receipt submitted for verification!');
      setSelectedDeveloper('');
      // Refresh
      const { data } = await supabase.from('receipt_submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setReceiptSubmissions((data as any[]) || []);
    }
  };

  const handleKycUpload = async (file: File, type: 'selfie' | 'id') => {
    if (!user) return;
    setUploading(type);
    const ext = file.name.split('.').pop();
    const path = `kyc/${user.id}/${type}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('review-attachments').upload(path, file);
    if (error) {
      toast.error(`Failed to upload ${type}`);
    } else {
      const { data } = supabase.storage.from('review-attachments').getPublicUrl(path);
      if (type === 'selfie') setSelfieUrl(data.publicUrl);
      else setIdDocUrl(data.publicUrl);
    }
    setUploading(null);
  };

  const handleSubmitKyc = async () => {
    if (!user || !selfieUrl || !idDocUrl) return;
    setSubmittingKyc(true);
    const { error } = await supabase.from('reviewer_verifications').insert({
      user_id: user.id,
      verification_type: 'kyc',
      selfie_url: selfieUrl,
      id_document_url: idDocUrl,
      status: 'pending',
    } as any);
    setSubmittingKyc(false);
    if (error) {
      if (error.code === '23505') toast.error('You already have a pending KYC request');
      else toast.error('Failed to submit KYC request');
    } else {
      toast.success('KYC verification submitted!');
      setKycStatus('pending');
      setSelfieUrl('');
      setIdDocUrl('');
    }
  };

  const statusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-trust-excellent" />;
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-destructive" />;
      default: return <Shield className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'approved': return <Badge className="bg-trust-excellent/10 text-trust-excellent border-0 text-[10px]">Verified</Badge>;
      case 'pending': return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">Not Started</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Verification Center
        </h2>
        <p className="text-sm text-muted-foreground">Build trust with higher verification levels</p>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Identity', tier: 1, status: identityStatus, color: 'text-blue-600', bgColor: 'bg-blue-500/5 border-blue-500/30' },
          { label: 'Verified Buyer', tier: 2, status: hasApprovedReceipt ? 'approved' as VerificationStatus : (receiptSubmissions.some(r => r.status === 'pending') ? 'pending' as VerificationStatus : 'none' as VerificationStatus), color: 'text-trust-excellent', bgColor: 'bg-green-500/5 border-green-500/30' },
          { label: 'KYC', tier: 3, status: kycStatus, color: 'text-[#7C3AED]', bgColor: 'bg-[#7C3AED]/5 border-[#7C3AED]/30' },
        ].map(t => (
          <Card key={t.tier} className={t.bgColor}>
            <CardContent className="p-4 text-center">
              {statusIcon(t.status)}
              <div className={`text-sm font-bold mt-1 ${t.color}`}>Tier {t.tier}</div>
              <div className="text-xs text-muted-foreground">{t.label}</div>
              <div className="mt-1">{statusBadge(t.status)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier 1: Identity Verification */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Tier 1: Identity Verification
                {statusBadge(identityStatus)}
              </h3>
              <p className="text-xs text-muted-foreground">Link your social profiles (Facebook/LinkedIn) so admins can verify your identity</p>
            </div>
          </div>

          {identityStatus === 'approved' ? (
            <div className="flex items-center gap-2 p-3 bg-trust-excellent/5 border border-trust-excellent/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-trust-excellent" />
              <span className="text-sm text-foreground">Your identity has been verified! You have the blue badge.</span>
            </div>
          ) : identityStatus === 'pending' ? (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-foreground">Your verification is under review by our team.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {hasSocialLinks ? (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-foreground">Social links added. Save your profile to submit for verification.</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add your Facebook or LinkedIn URL in your profile to get started.
                </p>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/buyer/settings')}>
                <User className="w-3.5 h-3.5 me-1.5" />
                {hasSocialLinks ? 'Update Profile' : 'Add Social Links'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier 2: Verified Buyer */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-trust-excellent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Tier 2: Verified Buyer
                {statusBadge(hasApprovedReceipt ? 'approved' : (receiptSubmissions.some(r => r.status === 'pending') ? 'pending' : 'none'))}
              </h3>
              <p className="text-xs text-muted-foreground">Upload a purchase receipt or contract to prove you're a real buyer</p>
            </div>
          </div>

          {/* Existing submissions */}
          {receiptSubmissions.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-muted-foreground">Your Submissions</p>
              {receiptSubmissions.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <a href={r.image_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <div className="w-10 h-10 rounded overflow-hidden border border-border">
                      <img src={r.image_url} alt="Receipt" className="w-full h-full object-cover" />
                    </div>
                  </a>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.developer_name || 'Developer'}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}
                    className="capitalize text-[10px]"
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Upload new receipt */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Submit New Receipt</p>
            <select
              value={selectedDeveloper}
              onChange={e => setSelectedDeveloper(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              <option value="">Select developer...</option>
              {developers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {selectedDeveloper ? (
              <SecureContractUpload
                developerId={selectedDeveloper}
                developerName={developers.find(d => d.id === selectedDeveloper)?.name}
                onSubmitted={async () => {
                  // Refresh submissions list after a successful submit
                  if (!user) return;
                  const { data } = await supabase
                    .from('receipt_submissions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                  setReceiptSubmissions((data as any[]) || []);
                  setSelectedDeveloper('');
                }}
              />
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Select a developer above to start the secure upload.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tier 3: KYC */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Tier 3: KYC Verification
                <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-0 text-[10px]">Highest Trust</Badge>
                {statusBadge(kycStatus)}
              </h3>
              <p className="text-xs text-muted-foreground">Upload a selfie and national ID for the highest trust badge</p>
            </div>
          </div>

          {kycStatus === 'approved' ? (
            <div className="flex items-center gap-2 p-3 bg-[#7C3AED]/5 border border-[#7C3AED]/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" />
              <span className="text-sm text-foreground">KYC verified! You have the purple trust badge.</span>
            </div>
          ) : kycStatus === 'pending' ? (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-foreground">Your KYC is under review.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Selfie */}
                <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                  <input ref={selfieRef} type="file" className="hidden" accept="image/*" capture="user"
                    onChange={e => e.target.files?.[0] && handleKycUpload(e.target.files[0], 'selfie')} />
                  {selfieUrl ? (
                    <div className="space-y-2">
                      <img src={selfieUrl} alt="Selfie" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#7C3AED]/30" />
                      <p className="text-xs text-[#7C3AED] font-medium">Selfie uploaded</p>
                      <Button variant="outline" size="sm" onClick={() => { setSelfieUrl(''); selfieRef.current?.click(); }}>Replace</Button>
                    </div>
                  ) : (
                    <button onClick={() => selfieRef.current?.click()} disabled={uploading === 'selfie'} className="w-full">
                      {uploading === 'selfie' ? <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" /> : <Camera className="w-8 h-8 text-muted-foreground mx-auto" />}
                      <p className="text-sm text-muted-foreground mt-2">{uploading === 'selfie' ? 'Uploading...' : 'Take / Upload Selfie'}</p>
                    </button>
                  )}
                </div>
                {/* ID */}
                <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                  <input ref={idDocRef} type="file" className="hidden" accept="image/*,.pdf"
                    onChange={e => e.target.files?.[0] && handleKycUpload(e.target.files[0], 'id')} />
                  {idDocUrl ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#7C3AED] mx-auto" />
                      <p className="text-xs text-[#7C3AED] font-medium">ID uploaded</p>
                      <Button variant="outline" size="sm" onClick={() => { setIdDocUrl(''); idDocRef.current?.click(); }}>Replace</Button>
                    </div>
                  ) : (
                    <button onClick={() => idDocRef.current?.click()} disabled={uploading === 'id'} className="w-full">
                      {uploading === 'id' ? <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" /> : <FileText className="w-8 h-8 text-muted-foreground mx-auto" />}
                      <p className="text-sm text-muted-foreground mt-2">{uploading === 'id' ? 'Uploading...' : 'Upload National ID'}</p>
                    </button>
                  )}
                </div>
              </div>
              <Button
                onClick={handleSubmitKyc}
                disabled={!selfieUrl || !idDocUrl || submittingKyc}
                className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white"
              >
                {submittingKyc ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Shield className="w-4 h-4 me-2" />}
                Submit KYC Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerVerification;
