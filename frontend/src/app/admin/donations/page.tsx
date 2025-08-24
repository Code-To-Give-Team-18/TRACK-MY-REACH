'use client';

import { useState, useEffect } from 'react';
import { donationService, type DonationResponse } from '@/services/donation.service';
import { regionService } from '@/services/region.service';
import { childrenService } from '@/services/children.service';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function DonationManagementPage() {
  const [donations, setDonations] = useState<DonationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Quick' | 'Guest' | 'Standard'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [regions, setRegions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationResponse | null>(null);
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    loadDonations();
    loadRegions();
    loadStats();
    loadTopDonors();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await donationService.getRecentDonations(100);
      setDonations(data);
    } catch (error) {
      console.error('Failed to load donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      const data = await regionService.getAllRegions();
      setRegions(data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await donationService.getDonationStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadTopDonors = async () => {
    try {
      const data = await donationService.getTopDonors(5);
      setTopDonors(data);
    } catch (error) {
      console.error('Failed to load top donors:', error);
    }
  };

  const handleDeleteDonation = async () => {
    if (!selectedDonation) return;

    try {
      await donationService.deleteDonation(selectedDonation.id);
      toast.success('Donation deleted successfully');
      setShowDeleteModal(false);
      setSelectedDonation(null);
      await loadDonations();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete donation:', error);
      toast.error('Failed to delete donation');
    }
  };

  const handleStatusUpdate = async (donationId: string, newStatus: string) => {
    try {
      await donationService.updateDonationStatus(donationId, newStatus);
      toast.success('Donation status updated');
      await loadDonations();
      await loadStats();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update donation status');
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || donation.donation_type === filterType;
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    const matchesRegion = filterRegion === 'all' || donation.region_id === filterRegion;
    
    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  });

  const formatCurrency = (amount: number, currency: string = 'HKD') => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Donation Management
        </h1>
        <p className="text-gray-600">
          Manage and monitor all donations across the platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {stats && formatCurrency(stats.total_amount)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Raised</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {stats?.total_donations || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Donations</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {stats?.unique_donors || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Unique Donors</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={() => setShowStatsModal(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Detailed Stats →
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by donor, child, ID, or transaction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Standard">Standard</option>
            <option value="Guest">Guest</option>
            <option value="Quick">Quick</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Regions</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child / Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {donation.created_at ? (
                      <div>
                        <div>{new Date(donation.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donation.is_anonymous ? (
                        <span className="text-gray-500 italic">Anonymous</span>
                      ) : (
                        donation.user_name || 'Guest'
                      )}
                    </div>
                    {donation.user_id && (
                      <div className="text-xs text-gray-500">
                        ID: {donation.user_id.slice(0, 8)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {donation.child_name || 'General'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {donation.region_name || 'All Regions'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(donation.amount, donation.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      donation.donation_type === 'Standard' ? 'bg-blue-100 text-blue-800' :
                      donation.donation_type === 'Guest' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {donation.donation_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={donation.status}
                      onChange={(e) => handleStatusUpdate(donation.id, e.target.value)}
                      className={`text-xs rounded px-2 py-1 ${
                        donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.referral_code || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedDonation(donation);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDonations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No donations found matching your filters
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Delete Donation
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this donation of{' '}
              <strong>{formatCurrency(selectedDonation.amount, selectedDonation.currency)}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDonation(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDonation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Donation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Donation Statistics
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Overall Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-xl font-bold text-green-600">
                      {stats && formatCurrency(stats.total_amount)}
                    </div>
                    <div className="text-sm text-gray-600">Total Raised</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-xl font-bold text-blue-600">
                      {stats?.total_donations || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Donations</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-xl font-bold text-purple-600">
                      {stats?.unique_donors || 0}
                    </div>
                    <div className="text-sm text-gray-600">Unique Donors</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Top Donors</h3>
                <div className="space-y-2">
                  {topDonors.map((donor, index) => (
                    <div key={donor.user_id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-600 mr-3">#{index + 1}</span>
                        <span className="font-medium">{donor.user_name || 'Anonymous'}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(donor.total_amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {donor.donation_count} donation{donor.donation_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Donation Types Distribution</h3>
                <div className="space-y-2">
                  {['Standard', 'Guest', 'Quick'].map(type => {
                    const typeCount = donations.filter(d => d.donation_type === type).length;
                    const percentage = donations.length > 0 ? (typeCount / donations.length) * 100 : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{type}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                type === 'Standard' ? 'bg-blue-600' :
                                type === 'Guest' ? 'bg-purple-600' :
                                'bg-gray-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700 w-12 text-right">
                            {typeCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}