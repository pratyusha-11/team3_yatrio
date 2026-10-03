import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Calendar, Shield, Edit2, LogOut, Check, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export function Profile() {
  const { user: authUser, getProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(authUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If we have an active session, fetch the latest user record from the database
    let isMounted = true;

    async function loadFreshProfile() {
      try {
        setIsLoading(true);
        const res = await getProfile();
        if (isMounted && res && res.user) {
          setProfileData(res.user);
        }
      } catch (err) {
        console.warn('Could not fetch fresh profile from server, using session data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFreshProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Prefer fresh database data, fallback to authUser from AuthContext / localStorage
  const currentUser = profileData || authUser;

  const displayName = currentUser?.name || currentUser?.full_name || 'Passenger';
  const displayEmail = currentUser?.email || 'No email provided';
  const rawPhone = currentUser?.phone || '';
  const displayPhone = rawPhone
    ? (rawPhone.startsWith('+91') ? rawPhone : `+91 ${rawPhone}`)
    : '+91 Not Provided';

  // Dynamic avatar initial
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  // Dynamic Member Since
  const createdAtRaw = currentUser?.createdAt || currentUser?.created_at;
  let memberSinceText = 'Member since recent';

  if (createdAtRaw) {
    const createdDate = new Date(createdAtRaw);
    if (!isNaN(createdDate.getTime())) {
      const monthName = createdDate.toLocaleDateString('en-US', { month: 'short' });
      const year = createdDate.getFullYear();
      memberSinceText = `Member since ${monthName} ${year}`;
    }
  }

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header Profile Section */}
      <Card className="p-6 md:p-8 mb-8 bg-gradient-to-r from-primary to-primary-dark text-surface border-none shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-4xl font-bold shadow-inner border-4 border-white/20 text-primary-dark">
            {avatarInitial}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
            <p className="text-blue-200 mb-4">{displayEmail}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm opacity-90">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {displayPhone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {memberSinceText}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-foreground bg-surface border-transparent hover:bg-gray-100 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Vertical Tabs / Nav */}
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-primary font-bold border-l-4 border-primary">
            Personal Info
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-muted hover:bg-gray-50 font-medium">
            Saved Passengers
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg text-muted hover:bg-gray-50 font-medium">
            Security & Login
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Personal Information</h2>
              <Button variant="ghost" size="sm" className="text-secondary">
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Full Name</label>
                  <Input value={displayName} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Email Address</label>
                  <Input value={displayEmail} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Mobile Number</label>
                  <Input value={rawPhone ? `+91 ${rawPhone.replace(/^\+91\s*/, '')}` : '+91 '} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Account Role</label>
                  <Input value={currentUser?.role ? currentUser.role.toUpperCase() : 'PASSENGER'} readOnly className="bg-gray-50 capitalize" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Address</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="No address provided yet"
                  defaultValue="Registered Passenger Address"
                  readOnly
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button disabled>Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 bg-blue-50/50 border-blue-100">
            <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Account Verification
            </h3>
            <p className="text-sm text-muted mb-4">
              Verified RailSetu account for seamless ticket booking and passenger management.
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Active Passenger Account
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
