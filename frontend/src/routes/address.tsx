import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  MapPin,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Check,
  Star,
  Home,
  Briefcase,
  Building,
  Tag,
  Phone,
  User,
  Sparkles,
} from 'lucide-react';
import { pageHead } from '@/lib/page-head';
import { useCustomer } from '@/components/bamas/auth-context';
import { api } from '@/lib/api';

export const Route = createFileRoute('/address')({
  head: () =>
    pageHead(
      'Saved Delivery Addresses | Bamas Collection',
      'Manage your royal patron shipping and delivery addresses for handloom pure silk saree dispatches.'
    ),
  component: AddressPage,
});

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  tag: 'Home' | 'Work' | 'Boutique' | 'Other';
  isDefault: boolean;
}

function AddressPage() {
  const { user } = useCustomer();
  const navigate = useNavigate();

  // Hide top navbar and mobile footer via body lifecycle class
  useEffect(() => {
    document.body.classList.add('address-view-open');
    return () => {
      document.body.classList.remove('address-view-open');
    };
  }, []);

  // Storage key
  const storageKey = user ? `bamas_addresses_${user.id}` : 'bamas_addresses_guest';

  // Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }

    // Seed from user profile if available
    if (user?.address?.street) {
      return [
        {
          id: 'addr_initial',
          fullName: user.name || 'Valued Patron',
          phone: user.phone || '',
          street: user.address.street,
          city: user.address.city || '',
          state: user.address.state || '',
          pincode: (user.address as any).pincode || user.address.postalCode || '',
          country: user.address.country || 'India',
          tag: 'Home',
          isDefault: true,
        },
      ];
    }
    return [];
  });

  // Form View State: 'none' | 'add' | 'edit'
  const [formMode, setFormMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [tag, setTag] = useState<'Home' | 'Work' | 'Boutique' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Sync state to localStorage & API
  const persistAddresses = async (newList: SavedAddress[]) => {
    setAddresses(newList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newList));
    }

    // Sync primary address with backend
    const defaultAddr = newList.find((a) => a.isDefault) || newList[0];
    if (defaultAddr && user) {
      try {
        const res = await api.auth.updateProfile({
          phone: defaultAddr.phone || user.phone,
          addresses: newList,
          address: {
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.pincode,
            pincode: defaultAddr.pincode,
            country: defaultAddr.country || 'India',
          },
        });
        if (res.data) {
          localStorage.setItem('bamas_user', JSON.stringify(res.data));
          window.dispatchEvent(new Event('bamas_auth_changed'));
        }
      } catch (err) {
        console.warn('Backend address sync notice:', err);
      }
    }
  };

  // Open Add Form
  const openAddForm = () => {
    setEditingId(null);
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setStreet('');
    setCity('');
    setStateName('');
    setPincode('');
    setTag('Home');
    setIsDefault(addresses.length === 0);
    setFormMode('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Form
  const openEditForm = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setTag(addr.tag);
    setIsDefault(addr.isDefault);
    setFormMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Form
  const cancelForm = () => {
    setFormMode('none');
    setEditingId(null);
  };

  // Handle Form Submit (CREATE / UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (formMode === 'add') {
        const newAddress: SavedAddress = {
          id: `addr_${Date.now()}`,
          fullName,
          phone,
          street,
          city,
          state: stateName,
          pincode,
          country: 'India',
          tag,
          isDefault: isDefault || addresses.length === 0,
        };

        let updatedList = [...addresses];
        if (newAddress.isDefault) {
          updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
        }
        updatedList.push(newAddress);
        await persistAddresses(updatedList);
        setFeedbackMsg('New delivery address added successfully!');
      } else if (formMode === 'edit' && editingId) {
        let updatedList = addresses.map((a) => {
          if (a.id === editingId) {
            return {
              ...a,
              fullName,
              phone,
              street,
              city,
              state: stateName,
              pincode,
              tag,
              isDefault,
            };
          }
          if (isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });

        // Ensure at least one default
        if (!updatedList.some((a) => a.isDefault) && updatedList.length > 0) {
          updatedList[0].isDefault = true;
        }

        await persistAddresses(updatedList);
        setFeedbackMsg('Delivery address updated successfully!');
      }

      setFormMode('none');
      setEditingId(null);
      setTimeout(() => setFeedbackMsg(''), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  // Handle DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    await persistAddresses(remaining);
    setFeedbackMsg('Address removed successfully');
    setTimeout(() => setFeedbackMsg(''), 2000);
  };

  // Handle SET AS DEFAULT
  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await persistAddresses(updated);
    setFeedbackMsg('Primary delivery address updated!');
    setTimeout(() => setFeedbackMsg(''), 2000);
  };

  return (
    <div
      className="address-page-container"
      style={{
        minHeight: '100vh',
        background: '#f8fafb',
        padding: '1.25rem 1rem calc(80px + env(safe-area-inset-bottom, 16px))',
        maxWidth: '680px',
        margin: '0 auto',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Top Header with Back to Profile & Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Link
          to="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#092330',
            padding: '0.45rem 0.85rem',
            borderRadius: '0.55rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Profile</span>
        </Link>

        {formMode === 'none' && (
          <button
            type="button"
            onClick={openAddForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#092330',
              color: '#d4af37',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              padding: '0.45rem 0.95rem',
              borderRadius: '0.55rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(9, 35, 48, 0.1)',
            }}
          >
            <Plus size={15} />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {/* Page Title & Philosophy */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1
          style={{
            margin: '0 0 4px',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.65rem',
            fontWeight: 700,
            color: '#092330',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
          }}
        >
          <MapPin size={24} style={{ color: '#d4af37' }} />
          Saved Delivery Addresses
        </h1>
        <p style={{ margin: 0, fontSize: '0.84rem', color: '#688c99' }}>
          Manage your verified delivery destinations for royal handloom saree dispatches.
        </p>
      </div>

      {/* Success Notification Banner */}
      {feedbackMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: '10px',
            color: '#15803d',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT FORM (CREATE & UPDATE)
          ========================================================================= */}
      {formMode !== 'none' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 12px 30px rgba(9, 35, 48, 0.08)',
            padding: '1.25rem 1.35rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#092330' }}>
              {formMode === 'add' ? '➕ Add New Delivery Address' : '✏️ Edit Delivery Address'}
            </h3>
            <button
              type="button"
              onClick={cancelForm}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              {/* Recipient Full Name */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '4px' }}>
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Naveen Kumar"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '4px' }}>
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '4px' }}>
                Street Address / Door No. / Landmark *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Door No, Street name, Apartment / Area"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {/* City */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '4px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* State */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '4px' }}>
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* PIN Code */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '4px' }}>
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="600001"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Address Tag Selector */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#092330', display: 'block', marginBottom: '6px' }}>
                Address Type / Tag
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['Home', 'Work', 'Boutique', 'Other'] as const).map((t) => {
                  const active = tag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        border: active ? '1.5px solid #d4af37' : '1px solid #cbd5e1',
                        background: active ? 'rgba(212, 175, 55, 0.15)' : '#ffffff',
                        color: active ? '#092330' : '#64748b',
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {t === 'Home' && <Home size={13} />}
                      {t === 'Work' && <Briefcase size={13} />}
                      {t === 'Boutique' && <Building size={13} />}
                      {t === 'Other' && <Tag size={13} />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Address Checkbox */}
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#092330',
                marginTop: '0.25rem',
              }}
            >
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#d4af37' }}
              />
              <span>Set as primary / default delivery address</span>
            </label>

            {/* Form Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  height: '44px',
                  background: '#d4af37',
                  color: '#092330',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                }}
              >
                {saving ? 'Saving...' : formMode === 'add' ? 'Save New Address' : 'Update Address'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: '0 1.25rem',
                  height: '44px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          ADDRESS CARDS LIST (READ, EDIT, DELETE)
          ========================================================================= */}
      {addresses.length === 0 && formMode === 'none' ? (
        /* Empty State */
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed rgba(212, 175, 55, 0.4)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 14px rgba(9, 35, 48, 0.04)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#d4af37',
            }}
          >
            <MapPin size={26} />
          </div>

          <h3
            style={{
              margin: '0 0 0.4rem',
              fontSize: '1.25rem',
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 700,
              color: '#092330',
            }}
          >
            No Delivery Address Saved Yet
          </h3>
          <p
            style={{
              margin: '0 auto 1.5rem',
              fontSize: '0.84rem',
              color: '#688c99',
              maxWidth: '360px',
              lineHeight: 1.5,
            }}
          >
            Save your primary destination to enjoy seamless checkout and priority insured saree deliveries.
          </p>

          <button
            type="button"
            onClick={openAddForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#d4af37',
              color: '#092330',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>Add Delivery Address</span>
          </button>
        </div>
      ) : (
        /* Address Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {addresses.map((addr) => {
            return (
              <div
                key={addr.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: addr.isDefault
                    ? '1.5px solid #d4af37'
                    : '1px solid rgba(212, 175, 55, 0.25)',
                  boxShadow: addr.isDefault
                    ? '0 6px 20px rgba(212, 175, 55, 0.12)'
                    : '0 2px 8px rgba(9, 35, 48, 0.04)',
                  padding: '1.15rem 1.25rem',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Header Row: Tag & Default Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.65rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#092330',
                      }}
                    >
                      {addr.tag === 'Home' && <Home size={12} />}
                      {addr.tag === 'Work' && <Briefcase size={12} />}
                      {addr.tag === 'Boutique' && <Building size={12} />}
                      {addr.tag === 'Other' && <Tag size={12} />}
                      {addr.tag}
                    </span>

                    {addr.isDefault && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          background: 'rgba(212, 175, 55, 0.18)',
                          color: '#b89015',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                        }}
                      >
                        <Sparkles size={11} color="#d4af37" />
                        Primary Delivery Address
                      </span>
                    )}
                  </div>

                  {/* Actions: Edit, Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => openEditForm(addr)}
                      title="Edit this address"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#092330',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      title="Delete this address"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        background: '#fef2f2',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Recipient Details */}
                <h3
                  style={{
                    margin: '0 0 2px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#092330',
                  }}
                >
                  {addr.fullName}
                </h3>

                <p
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.8rem',
                    color: '#092330',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Phone size={13} style={{ color: '#d4af37' }} />
                  <span>{addr.phone}</span>
                </p>

                {/* Formatted Postal Address */}
                <p
                  style={{
                    margin: '0 0 0.85rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    color: '#475569',
                  }}
                >
                  {addr.street}, {addr.city}, {addr.state} -{' '}
                  <strong style={{ color: '#092330' }}>{addr.pincode}</strong>, {addr.country || 'India'}
                </p>

                {/* Bottom Bar: Set as default if not default */}
                {!addr.isDefault && (
                  <div style={{ paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#d4af37',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Star size={13} />
                      <span>Make this my primary delivery address</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
