import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, Loader2, CheckCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClaimBusinessModalProps {
  open: boolean;
  onClose: () => void;
  businessName: string;
  businessId: string;
  businessProfileId?: string;
}

export const ClaimBusinessModal = ({ open, onClose, businessName, businessId, businessProfileId }: ClaimBusinessModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `claims/${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('review-attachments')
      .upload(path, file);

    if (error) {
      toast.error('Failed to upload document');
      console.error(error);
    } else {
      const { data } = supabase.storage.from('review-attachments').getPublicUrl(path);
      setDocumentUrl(data.publicUrl);
      toast.success('Document uploaded');
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('business_claims' as any)
      .insert({
        user_id: user.id,
        business_name: businessName,
        business_mock_id: businessId,
        business_profile_id: businessProfileId || null,
        document_url: documentUrl || null,
        status: 'pending',
      } as any);

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already submitted a claim for this business');
      } else {
        toast.error('Failed to submit claim');
        console.error(error);
      }
    } else {
      setSubmitted(true);
      toast.success('Claim submitted for review');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setSubmitted(false);
    setDocumentUrl('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {submitted ? 'Claim Submitted' : 'Claim This Business'}
          </DialogTitle>
          <DialogDescription>
            {submitted 
              ? 'Your claim is being reviewed by our team.'
              : `Verify your ownership of "${businessName}" to manage its profile.`
            }
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Claim Under Review</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We'll verify your documents and notify you once your claim is approved. This usually takes 1-2 business days.
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Building2 className="w-3 h-3" />
              {businessName}
            </Badge>
            <Button onClick={handleClose} className="w-full mt-4">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                To claim this business, upload a document proving ownership (trade license, registration certificate, or official letter).
              </p>
            </div>

            <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <div className="text-center">
                {documentUrl ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-sm text-green-600 font-medium">Document uploaded</p>
                    <Button variant="outline" size="sm" onClick={() => setDocumentUrl('')}>
                      Replace
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {uploading ? 'Uploading...' : 'Click to upload verification document'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 10MB)</p>
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Additional notes (optional)</label>
              <Textarea
                placeholder="Any additional information to help verify your claim..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !documentUrl}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              Submit Claim
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Claims are reviewed within 1-2 business days. You'll be notified of the result.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
