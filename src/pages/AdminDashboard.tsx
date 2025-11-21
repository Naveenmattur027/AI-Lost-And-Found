import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Package, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { ClaimRequest } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AddItemForm from '@/components/AddItemForm';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'claims' | 'add'>('claims');

  // Fetch claims from backend
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/claims');
        const data = await response.json();
        setClaims(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching claims:', error);
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const handleApprove = async (claimId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/claims/${claimId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      
      if (response.ok) {
        setClaims(claims.map(claim => 
          claim.id === claimId ? { ...claim, status: 'approved' } : claim
        ));
        toast.success('Claim approved successfully');
      } else {
        toast.error('Failed to approve claim');
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      toast.error('Failed to approve claim');
    }
  };

  const handleReject = async (claimId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/claims/${claimId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      
      if (response.ok) {
        setClaims(claims.map(claim => 
          claim.id === claimId ? { ...claim, status: 'rejected' } : claim
        ));
        toast.error('Claim rejected');
      } else {
        toast.error('Failed to reject claim');
      }
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error('Failed to reject claim');
    }
  };

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const approvedClaims = claims.filter(c => c.status === 'approved');
  const rejectedClaims = claims.filter(c => c.status === 'rejected');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleItemAdded = () => {
    toast.success('Item added successfully!');
    // Refresh claims if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage claim requests</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'claims' ? 'default' : 'outline'}
            onClick={() => setActiveTab('claims')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Manage Claims
          </Button>
          <Button
            variant={activeTab === 'add' ? 'default' : 'outline'}
            onClick={() => setActiveTab('add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </div>

        {activeTab === 'claims' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingClaims.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedClaims.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedClaims.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Claim Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Requests</CardTitle>
                <CardDescription>Review and manage student claims</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claims.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No claim requests yet
                    </div>
                  ) : (
                    claims.map((claim) => (
                      <Card key={claim.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <img
                              src={claim.itemImage}
                              alt={claim.itemTitle}
                              className="w-full md:w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{claim.itemTitle}</h3>
                                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                    <p><span className="font-medium">Student:</span> {claim.studentName}</p>
                                    <p><span className="font-medium">ID:</span> {claim.studentId}</p>
                                    <p><span className="font-medium">Submitted:</span> {new Date(claim.submittedDate).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    claim.status === 'approved' ? 'default' :
                                    claim.status === 'rejected' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {claim.status}
                                </Badge>
                              </div>
                              <p className="text-sm bg-muted p-3 rounded-lg">
                                <span className="font-medium">Description:</span> {claim.description}
                              </p>
                              {claim.status === 'pending' && (
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(claim.id)}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(claim.id)}
                                    className="flex-1"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Add New Item Form */
          <Card>
            <CardHeader>
              <CardTitle>Add New Item</CardTitle>
              <CardDescription>Add a found item to the Lost & Found system</CardDescription>
            </CardHeader>
            <CardContent>
              <AddItemForm onItemAdded={handleItemAdded} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;