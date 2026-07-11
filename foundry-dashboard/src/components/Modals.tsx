import { X, Check, AlertTriangle, Info } from 'lucide-react';
import type { Platform, NewAccountForm } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { getPlatformLabel } from '../utils/format';
import { useState } from 'react';

interface AddAccountModalProps {
  groupName: string;
  onClose: () => void;
  onSubmit: (form: NewAccountForm) => void;
}

const platforms: { id: Platform; label: string; description: string }[] = [
  { id: 'tiktok', label: 'TikTok Shop', description: 'Connect your TikTok Shop seller account' },
  { id: 'amazon', label: 'Amazon', description: 'Link Amazon Seller Central credentials' },
  { id: 'ebay', label: 'eBay', description: 'Connect your eBay seller account' },
];

export function AddAccountModal({ groupName, onClose, onSubmit }: AddAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [form, setForm] = useState({ name: '', handle: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) return;
    onSubmit({ platform, ...form });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Connect Account</h2>
            <p className="modal-subtitle">Add to {groupName}</p>
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
                  className={`platform-card ${platform === p.id ? 'selected' : ''}`}
                  onClick={() => setPlatform(p.id)}
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
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={!platform}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && platform && (
          <form className="modal-body" onSubmit={handleSubmit}>
            <p className="step-label">
              Step 2 — {getPlatformLabel(platform)} Credentials
            </p>
            <div className="form-notice">
              <Info size={16} />
              <span>
                Credentials are encrypted and stored securely. Foundry Labs uses OAuth where
                available — this mockup simulates the connection flow.
              </span>
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
                placeholder={platform === 'tiktok' ? '@username' : 'store-id'}
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Login Email</label>
              <input
                id="email"
                type="email"
                placeholder="seller@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password / API Key</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            <h2>New Client Group</h2>
            <p className="modal-subtitle">Organise accounts by client</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Client Name</label>
            <input
              id="groupName"
              type="text"
              placeholder="e.g. Acme Corporation"
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
              placeholder="Brief description of the client"
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
              Create Group
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
