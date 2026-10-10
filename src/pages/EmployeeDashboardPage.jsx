import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import Navbar from '../components/Navbar';
import {
  User, Clock, Calendar, IndianRupee, Bell, CheckCircle, XCircle, LogIn, LogOut,
  Plus, AlertCircle, RefreshCw, Briefcase, Mail, Phone, Shield, FileText, Check
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const { user, role } = useAuth();

  // State
  const [profile, setProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Apply Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [leaveModalError, setLeaveModalError] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [
        profileData,
        todayAtt,
        attSummary,
        attHist,
        lSummary,
        pHistory,
        notifs,
      ] = await Promise.all([
        dashboardService.getMyProfile().catch(() => null),
        dashboardService.getTodayAttendance().catch(() => null),
        dashboardService.getAttendanceSummary().catch(() => null),
        dashboardService.getAttendanceHistory().catch(() => []),
        dashboardService.getLeaveSummary().catch(() => null),
        dashboardService.getPayrollHistory().catch(() => []),
        dashboardService.getNotifications().catch(() => []),
      ]);

      setProfile(profileData);
      setTodayAttendance(todayAtt);
      setAttendanceSummary(attSummary);
      setAttendanceHistory(attHist);
      setLeaveSummary(lSummary);
      setPayrolls(pHistory);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load employee dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Attendance Actions
  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    try {
      const att = await dashboardService.checkIn();
      setTodayAttendance(att);
      showToast('Successfully checked in for today!');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError('');
    try {
      const att = await dashboardService.checkOut();
      setTodayAttendance(att);
      showToast('Successfully checked out for today!');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Leave Actions
  const handleOpenLeaveModal = () => {
    setLeaveForm({
      leaveType: 'CASUAL',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setLeaveModalError('');
    setIsLeaveModalOpen(true);
  };

  const handleApplyLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveModalError('');

    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) {
      setLeaveModalError('Please fill in all required fields.');
      return;
    }

    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      setLeaveModalError('Start date cannot be after end date.');
      return;
    }

    setIsSubmittingLeave(true);
    try {
      await dashboardService.applyLeave(leaveForm);
      showToast('Leave request submitted successfully!');
      setIsLeaveModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setLeaveModalError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      await dashboardService.cancelLeave(leaveId);
      showToast('Leave request cancelled.');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel leave request.');
    }
  };

  // Notification Actions
  const handleMarkNotificationRead = async (notifId) => {
    try {
      await dashboardService.markNotificationAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatSalary = (amt) => {
    if (amt === undefined || amt === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        {/* Top Header */}
        <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Welcome back, {profile ? `${profile.firstName} ${profile.lastName}` : user?.username} 👋
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Here is your personal employee summary, attendance tracker, and leave portal.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={fetchDashboardData} className="btn btn-secondary" title="Refresh dashboard data">
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {toast && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle size={18} />
            <span>{toast}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading employee dashboard...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. MY PROFILE CARD */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px', color: '#818cf8' }}>
                  <User size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Profile</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Personal and employment details</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Employee ID</span>
                  <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#818cf8' }}>#{profile?.id || '-'}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Full Name</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile ? `${profile.firstName} ${profile.lastName}` : '-'}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Email</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="var(--text-muted)" />
                    {profile?.email || '-'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Phone</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--text-muted)" />
                    {profile?.phone || '-'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Department</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.department || '-'}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Designation</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.designation || 'Software Engineer'}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Joining Date</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    {profile?.joiningDate || '-'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Employment Status</span>
                  <div>
                    <span className="role-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', marginTop: '4px' }}>
                      {profile?.employmentStatus || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ATTENDANCE CARD */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="flex-between" style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px', color: '#34d399' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Attendance & Time Tracker</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Check in/out and view monthly summary</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={handleCheckIn}
                    className="btn btn-primary"
                    disabled={actionLoading || Boolean(todayAttendance?.checkInTime)}
                    style={{ background: 'var(--success-gradient)' }}
                  >
                    <LogIn size={16} />
                    <span>{todayAttendance?.checkInTime ? 'Checked In' : 'Check In'}</span>
                  </button>

                  <button
                    onClick={handleCheckOut}
                    className="btn btn-secondary"
                    disabled={actionLoading || !todayAttendance?.checkInTime || Boolean(todayAttendance?.checkOutTime)}
                  >
                    <LogOut size={16} />
                    <span>{todayAttendance?.checkOutTime ? 'Checked Out' : 'Check Out'}</span>
                  </button>
                </div>
              </div>

              {/* Today's Status Banner & Monthly Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Status</span>
                  <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700, color: todayAttendance?.status === 'PRESENT' ? '#34d399' : '#fde68a' }}>
                    {todayAttendance ? todayAttendance.status : 'NOT CHECKED IN'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Check-In Time</span>
                  <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {todayAttendance?.checkInTime ? todayAttendance.checkInTime : '--:--'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Check-Out Time</span>
                  <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {todayAttendance?.checkOutTime ? todayAttendance.checkOutTime : '--:--'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Present Days</span>
                  <div style={{ marginTop: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#818cf8' }}>
                    {attendanceSummary ? `${attendanceSummary.presentDays} / ${attendanceSummary.totalWorkingDays} days` : '0 days'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. LEAVE MANAGEMENT CARD */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="flex-between" style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '12px', color: '#fde68a' }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Leave Management</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>View leave balances and apply for time off</p>
                  </div>
                </div>

                <button onClick={handleOpenLeaveModal} className="btn btn-primary">
                  <Plus size={16} />
                  <span>Apply for Leave</span>
                </button>
              </div>

              {/* Leave Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #34d399' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available Balance</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                    {leaveSummary?.availableBalance ?? 24} Days
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #fde68a' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Requests</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fde68a', marginTop: '4px' }}>
                    {leaveSummary?.pendingCount ?? 0}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #60a5fa' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Approved Leaves</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                    {leaveSummary?.approvedCount ?? 0}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #f87171' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rejected Leaves</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                    {leaveSummary?.rejectedCount ?? 0}
                  </div>
                </div>
              </div>

              {/* Recent Leave Requests Table */}
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Recent Leave Requests
              </h4>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!leaveSummary?.recentRequests || leaveSummary.recentRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No leave requests found.
                        </td>
                      </tr>
                    ) : (
                      leaveSummary.recentRequests.map((req) => (
                        <tr key={req.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.leaveType}</td>
                          <td>{req.startDate} to {req.endDate}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{req.reason}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{req.appliedOn}</td>
                          <td>
                            <span className="role-badge" style={{
                              background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : req.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: req.status === 'APPROVED' ? '#34d399' : req.status === 'PENDING' ? '#fde68a' : '#fca5a5'
                            }}>
                              {req.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {req.status === 'PENDING' && (
                              <button
                                onClick={() => handleCancelLeave(req.id)}
                                className="btn btn-danger"
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. PAYROLL CARD */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '12px', color: '#60a5fa' }}>
                  <IndianRupee size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Payroll & Salary History</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>View your latest salary and payment statements</p>
                </div>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Pay Period</th>
                      <th>Basic Salary</th>
                      <th>Net Pay</th>
                      <th>Payment Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No payroll records available.
                        </td>
                      </tr>
                    ) : (
                      payrolls.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.payPeriod}</td>
                          <td>{formatSalary(p.basicSalary)}</td>
                          <td style={{ fontWeight: 700, color: '#34d399' }}>{formatSalary(p.netSalary)}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{p.paymentDate}</td>
                          <td>
                            <span className="role-badge ADMIN" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. NOTIFICATIONS CARD */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: '12px', color: '#c084fc' }}>
                  <Bell size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications & Announcements</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Company updates and status alerts</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="glass-card"
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                        opacity: n.read ? 0.7 : 1,
                        borderLeft: n.read ? '1px solid var(--border-color)' : '4px solid #818cf8',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{n.title}</span>
                          <span className="role-badge EMPLOYEE" style={{ fontSize: '0.65rem' }}>{n.type}</span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                      </div>

                      {!n.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(n.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', flexShrink: 0 }}
                          title="Mark as Read"
                        >
                          <Check size={14} />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* APPLY LEAVE MODAL */}
      {isLeaveModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Apply for Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
                ×
              </button>
            </div>

            {leaveModalError && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{leaveModalError}</span>
              </div>
            )}

            <form onSubmit={handleApplyLeaveSubmit}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select
                  className="input-field"
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                >
                  <option value="CASUAL" style={{ background: '#1e293b' }}>Casual Leave</option>
                  <option value="SICK" style={{ background: '#1e293b' }}>Sick Leave</option>
                  <option value="ANNUAL" style={{ background: '#1e293b' }}>Annual Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Provide reason for leave application..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="btn btn-secondary" disabled={isSubmittingLeave}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingLeave}>
                  {isSubmittingLeave ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
