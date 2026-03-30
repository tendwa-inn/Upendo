import React from 'react';
import { Card, Title, Text, Metric, Col, Grid } from '@tremor/react';
import { Users, Ticket, Flag, UserX } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Placeholder data for demonstration
  const stats = {
    totalUsers: 1200,
    activeUsers: 850,
    newUsersToday: 50,
    totalPromos: 15,
    activePromos: 8,
    totalReports: 72,
    pendingReports: 12,
    dormantAccounts: 150,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Grid numItemsLg={3} className="gap-6">
        <Col>
          <Card decoration="top" decorationColor="indigo">
            <Text>Total Users</Text>
            <Metric>{stats.totalUsers}</Metric>
            <Text className="mt-2">Active: {stats.activeUsers}</Text>
            <Text>New today: {stats.newUsersToday}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="emerald">
            <Text>Promo Codes</Text>
            <Metric>{stats.totalPromos}</Metric>
            <Text className="mt-2">Active: {stats.activePromos}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="rose">
            <Text>User Reports</Text>
            <Metric>{stats.totalReports}</Metric>
            <Text className="mt-2">Pending: {stats.pendingReports}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="yellow">
            <Text>Dormant Accounts</Text>
            <Metric>{stats.dormantAccounts}</Metric>
          </Card>
        </Col>
      </Grid>

      {/* Further sections for recent activities, charts, etc. */}
    </div>
  );
};

export default AdminDashboard;
