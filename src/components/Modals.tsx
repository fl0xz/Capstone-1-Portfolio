import { X, Check, AlertTriangle, Info, ExternalLink, Loader } from 'lucide-react';
import type { Platform, NewAccountForm } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { getPlatformLabel } from '../utils/format';
import { getAmazonAuthorizeUrl } from '../lib/api';
import { useState } from 'react';

interface AddAccountModalProps {
  brandId: string;
  brandName: string;
  onClose: () => void;
  onSubmit: (form: NewAccountForm) => void;
}

const platforms: { id: Platform; label: string; description: string; available: boolean }[] = [
  {
    id: 'amazon',
    label: 'Amazon UK',
    description: 'Connect via Seller Central — one click, no API keys per client',
    available: true,
  },
  {
    id: 'tiktok',
    label: 'TikTok Shop',
    description: 'OAuth connect — coming in Phase 2',
    available: false,
  },
  {
    id: 'ebay',
    label: 'eBay UK',
    description: 'OAuth connect — coming in Phase 2',
    available: false,
  },
  {
    id: 'etsy',
    label: 'Etsy',
    description: 'OAuth connect — coming in Phase 2',
    available: false,
  },
];

export function AddAccountModal({ brandId, brandName, onClose, onSubmit }: AddAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [form, setForm] = useState({ name: '', handle: '', email: '', password: '' });
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) return;
    onSubmit({ platform, ...form });
    onClose();
  };

  const handleAmazonConnect = async () => {
    setConnecting(true);
    setConnectError('');

    const result = await getAmazonAuthorizeUrl(brandId);

    if (result.setupRequired) {
      setConnectError(
        'Amazon SP-API needs to be configured in Vercel first. See Settings → Integrations for setup steps.'
      );
      setConnecting(false);
      return;
    }

    if (result.error || !result.url) {
      setConnectError(result.error || 'Could not start Amazon connection');
      setConnecting(false);
      return;
    }

    window.location.href = result.url;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Connect Account</h2>
            <p className="modal-subtitle">Add to {brandName}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <div className="modal-body">
            <p className="step-label">Step 1 — Select Platform</p>
            <div className="platform-grid">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  className={`platform-card ${platform === p.id ? 'selected' : ''} ${!p.available ? 'disabled' : ''}`}
                  onClick={() => p.available && setPlatform(p.id)}
                  disabled={!p.available}
                >
                  <div className={`platform-icon-wrap platform-${p.id}`}>
                    <PlatformIcon platform={p.id} size={24} />
                  </div>
                  <div className="platform-info">
                    <span className="platform-name">{p.label}</span>
                    <span className="platform-desc">{p.description}</span>
                  </div>
                  {platform === p.id && (
                    <div className="platform-check">
                      <Check size={16} />
                    </div>
                  )}
                  {!p.available && <span className="platform-soon">Soon</span>}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" disabled={!platform} onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && platform === 'amazon' && (
          <div className="modal-body">
            <p className="step-label">Step 2 — Connect Amazon UK</p>
            <div className="oauth-connect-card">
              <div className={`platform-icon-wrap platform-amazon oauth-icon`}>
                <PlatformIcon platform="amazon" size={32} />
              </div>
              <h3>Authorise via Seller Central</h3>
              <p>
                You&apos;ll be redirected to Amazon Seller Central UK. Log in with the seller
                account for <strong>{brandName}</strong> and click Allow. No passwords are stored
                in Foundry Labs.
              </p>
              <ul className="oauth-steps">
                <li>Opens Amazon&apos;s secure login page</li>
                <li>One-time authorisation per brand</li>
                <li>Works for your clients too — just send them the link</li>
              </ul>
              {connectError && <p className="login-error">{connectError}</p>}
              <button
                className="btn-primary oauth-connect-btn"
                onClick={handleAmazonConnect}
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader size={16} className="spin" /> Connecting…
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    Connect Amazon UK
                  </>
                )}
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
            </div>
          </div>
        )}

        {step === 2 && platform && platform !== 'amazon' && (
          <form className="modal-body" onSubmit={handleSubmit}>
            <p className="step-label">Step 2 — {getPlatformLabel(platform)} Credentials</p>
            <div className="form-notice">
              <Info size={16} />
              <span>OAuth connect for this platform is coming soon.</span>
            </div>
            <div className="form-group">
              <label htmlFor="name">Account Name</label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Nova Fashion Official"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="handle">Handle / Store ID</label>
              <input
                id="handle"
                type="text"
                placeholder="store-id"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" className="btn-primary">
                Connect Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

interface AddGroupModalProps {
  onClose: () => void;
  onSubmit: (name: string, description: string, size: 'enterprise' | 'mid-market' | 'small-business') => void;
}

export function AddGroupModal({ onClose, onSubmit }: AddGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState<'enterprise' | 'mid-market' | 'small-business'>('mid-market');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description, size);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>New Brand</h2>
            <p className="modal-subtitle">Group accounts by brand</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Brand Name</label>
            <input
              id="groupName"
              type="text"
              placeholder="e.g. Nova Fashion"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="groupDesc">Description</label>
            <input
              id="groupDesc"
              type="text"
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Business Size</label>
            <div className="size-options">
              {(['enterprise', 'mid-market', 'small-business'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`size-option ${size === s ? 'selected' : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s === 'enterprise' ? 'Enterprise' : s === 'mid-market' ? 'Mid-Market' : 'Small Business'}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              Create Brand
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Toast({ message, type }: { message: string; type: 'success' | 'warning' }) {
  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
      <span>{message}</span>
    </div>
  );
}
