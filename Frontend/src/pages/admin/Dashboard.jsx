import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatTile } from '@/components/ui/StatTile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
const BRAND_COLORS = ['#014CA9', '#0080F8', '#28C840', '#FEBC2E', '#E02020'];
const Dashboard = () => {
    const revenueData = [
        { name: 'Jan', value: 4000000 },
        { name: 'Feb', value: 3000000 },
        { name: 'Mar', value: 2000000 },
        { name: 'Apr', value: 2780000 },
        { name: 'May', value: 1890000 },
        { name: 'Jun', value: 2390000 },
        { name: 'Jul', value: 3490000 },
        { name: 'Aug', value: 4000000 },
        { name: 'Sep', value: 3000000 },
        { name: 'Oct', value: 2000000 },
        { name: 'Nov', value: 2780000 },
        { name: 'Dec', value: 3890000 },
    ];
    const bookingData = [
        { name: 'Mon', bookings: 1200 },
        { name: 'Tue', bookings: 1300 },
        { name: 'Wed', bookings: 1100 },
        { name: 'Thu', bookings: 1400 },
        { name: 'Fri', bookings: 1800 },
        { name: 'Sat', bookings: 2100 },
        { name: 'Sun', bookings: 1900 },
    ];
    const occupancyData = [
        { name: '1A', value: 400 },
        { name: '2A', value: 300 },
        { name: '3A', value: 850 },
        { name: 'SL', value: 1200 },
        { name: 'CC', value: 350 },
    ];
    const routeData = [
        { name: 'NDLS - MMCT', value: 92 },
        { name: 'HWH - CSMT', value: 84 },
        { name: 'SBC - MAS', value: 96 },
        { name: 'PNBE - NDLS', value: 88 },
        { name: 'ADI - MMCT', value: 79 },
    ];
    const recentBookings = [
        { pnr: '2435678901', passenger: 'Rahul Sharma', train: '12951 - Rajdhani Exp', date: '15 Oct 2026', status: 'CONFIRMED', fare: '₹1,640' },
        { pnr: '2435678902', passenger: 'Priya Patel', train: '12009 - Shatabdi Exp', date: '16 Oct 2026', status: 'WAITLISTED', fare: '₹1,120' },
        { pnr: '2435678903', passenger: 'Amit Kumar', train: '12229 - Lucknow Mail', date: '15 Oct 2026', status: 'CONFIRMED', fare: '₹850' },
        { pnr: '2435678904', passenger: 'Sneha Gupta', train: '12627 - Karnataka Exp', date: '17 Oct 2026', status: 'CANCELLED', fare: '₹1,400' },
        { pnr: '2435678905', passenger: 'Vikram Singh', train: '12925 - Paschim Exp', date: '18 Oct 2026', status: 'RAC', fare: '₹980' },
    ];
    return (<div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-royal">
            Operations & Telemetry
          </span>
          <h1 className="text-h2 font-bold tracking-tight text-ink mt-0.5">
            Railway Management Dashboard
          </h1>
          <p className="text-caption text-ink-soft">
            Live national train schedules, reservation volumes, and route occupancy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 gap-1.5 py-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"/>
            Live Network Status
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatTile label="Active Trains" value="142" delta="+2"/>
        <StatTile label="Today's Bookings" value="1,247" delta="+12.5%"/>
        <StatTile label="Day's Revenue" value="₹18.4L" delta="+8.4%"/>
        <StatTile label="Network Occupancy" value="87.4%" delta="+3.1%"/>
        <StatTile label="Active Passengers" value="45,832" delta="+5.1%"/>
        <StatTile label="Cancellations" value="89" delta="-2.4%"/>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-line-mid shadow-card rounded-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-h4 font-bold text-ink flex items-center justify-between">
              <span>Annual Revenue Trajectory</span>
              <span className="text-caption font-normal text-ink-soft">FY 2026</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E6EE"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4E5A74', fontSize: 12 }}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4E5A74', fontSize: 12 }} tickFormatter={(val) => `₹${val / 100000}L`}/>
                <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ backgroundColor: '#02122C', borderRadius: '8px', color: '#fff', border: 'none' }}/>
                <Line type="monotone" dataKey="value" stroke="#014CA9" strokeWidth={3} dot={{ r: 3, fill: '#014CA9' }} activeDot={{ r: 6, fill: '#0080F8' }}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Bookings */}
        <Card className="border-line-mid shadow-card rounded-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-h4 font-bold text-ink flex items-center justify-between">
              <span>Daily Booking Velocity</span>
              <span className="text-caption font-normal text-ink-soft">Last 7 Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E6EE"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4E5A74', fontSize: 12 }}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4E5A74', fontSize: 12 }}/>
                <Tooltip contentStyle={{ backgroundColor: '#02122C', borderRadius: '8px', color: '#fff', border: 'none' }}/>
                <Bar dataKey="bookings" fill="#0080F8" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy by Class */}
        <Card className="border-line-mid shadow-card rounded-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-h4 font-bold text-ink">
              Seat Volume by Travel Class
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={3} dataKey="value">
                  {occupancyData.map((_, index) => (<Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]}/>))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#02122C', borderRadius: '8px', color: '#fff', border: 'none' }}/>
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Route Loads */}
        <Card className="border-line-mid shadow-card rounded-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-h4 font-bold text-ink">
              Top Corridor Occupancy (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3E6EE"/>
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#4E5A74', fontSize: 12 }}/>
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4E5A74', fontSize: 12 }}/>
                <Tooltip contentStyle={{ backgroundColor: '#02122C', borderRadius: '8px', color: '#fff', border: 'none' }}/>
                <Bar dataKey="value" fill="#014CA9" radius={[0, 4, 4, 0]} barSize={22}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card className="border-line-mid shadow-card rounded-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-line pb-4">
          <div>
            <CardTitle className="text-h4 font-bold text-ink">Recent Bookings</CardTitle>
            <span className="text-caption text-ink-soft">Latest real-time reservation transactions</span>
          </div>
          <Button variant="secondary" size="sm">Export CSV</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PNR</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Train</TableHead>
                  <TableHead>Journey Date</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (<TableRow key={booking.pnr}>
                    <TableCell className="num font-mono font-bold text-royal">
                      {booking.pnr}
                    </TableCell>
                    <TableCell className="font-semibold text-ink">{booking.passenger}</TableCell>
                    <TableCell className="text-ink-soft">{booking.train}</TableCell>
                    <TableCell className="num text-ink-soft">{booking.date}</TableCell>
                    <TableCell className="num font-bold text-ink">{booking.fare}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'CONFIRMED'
                ? 'success'
                : booking.status === 'CANCELLED'
                    ? 'error'
                    : booking.status === 'WAITLISTED'
                        ? 'warning'
                        : 'outline'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default Dashboard;
