import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
export function PassengerLayout() {
    return (<div className="flex flex-col min-h-screen bg-paper text-body pb-16 md:pb-0 selection:bg-azure/20 selection:text-ink">
      <Header />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>);
}
